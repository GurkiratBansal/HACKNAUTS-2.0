// FRESH:FILE  App-wide demo state: users, donations and NGOs plus auth and the donation lifecycle (add, accept, advance status, report).
// FRESH:AREA  Donations

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { mockNgos } from '../data/mockNgos'
import { makeMockDonations } from '../data/mockDonations'
import { getUrgency } from '../utils/urgency'
import { haversineKm, nearestNgos } from '../utils/distance'
import { inIndiaBox } from '../utils/india'
import { useUserLocation } from './LocationContext'
import {
  demoDonations,
  demoNgos,
  isDemoPlaceActive,
} from '../data/demoLudhiana'

const AppContext = createContext(null)

const LS = {
  users: 'fresh_users_v1',
  donations: 'fresh_donations_v1',
  currentUser: 'fresh_current_user_v1',
  seedAt: 'fresh_seed_at_v1',
}

// FRESH:Auth  Ready-made demo accounts for the donor and NGO roles.
export const DEMO_USERS = {
  donor: {
    id: 'u-donor-demo',
    role: 'donor',
    name: 'Asha Sharma',
    orgName: 'Spice Route Kitchen',
    email: 'donor@fresh.demo',
    phone: '+91 98765 43210',
    city: 'New Delhi',
    location: { lat: 28.633, lng: 77.219 },
  },
  ngo: {
    id: 'u-ngo-demo',
    role: 'ngo',
    name: 'Priya Menon',
    orgName: 'Roti Bank Delhi',
    email: 'ngo@fresh.demo',
    phone: '+91 98100 11004',
    city: 'New Delhi',
    ngoId: 'ngo-4',
    location: { lat: 28.6448, lng: 77.2167 },
  },
}

// FRESH:Impact  Fixed starting totals so impact numbers are never zero.
export const BASELINE_IMPACT = {
  meals: 4820,
  completed: 312,
}

// FRESH:Data  Safe localStorage JSON read.
function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    try {
      localStorage.removeItem(key)
    } catch {
      // Ignore storage cleanup failures.
    }
    return fallback
  }
}

// FRESH:Data  Safe localStorage JSON write.
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function isValidUser(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.role === 'string' &&
    typeof value.email === 'string'
  )
}

function sanitizeUsers(stored) {
  if (!Array.isArray(stored)) return Object.values(DEMO_USERS)
  const valid = stored.filter(isValidUser)
  const byId = new Map(Object.values(DEMO_USERS).map((user) => [user.id, user]))
  for (const user of valid) byId.set(user.id, user)
  return Array.from(byId.values())
}

function sanitizeDonation(value) {
  if (!value || typeof value !== 'object' || typeof value.id !== 'string') return null
  const location =
    value.location &&
    typeof value.location === 'object' &&
    Number.isFinite(Number(value.location.lat)) &&
    Number.isFinite(Number(value.location.lng))
      ? { lat: Number(value.location.lat), lng: Number(value.location.lng) }
      : null

  const timeline = Array.isArray(value.timeline) ? value.timeline : []
  return {
    ...value,
    id: String(value.id),
    status: typeof value.status === 'string' ? value.status : 'available',
    quantity: Number.isFinite(Number(value.quantity)) ? Number(value.quantity) : 0,
    location,
    timeline,
    alertedNgoIds: Array.isArray(value.alertedNgoIds) ? value.alertedNgoIds : [],
    reports: Array.isArray(value.reports) ? value.reports : [],
  }
}

// FRESH:Donation  Loads listings; refreshes time-based seed data every 6h but keeps user-created donations.
function loadDonations() {
  const stored = read(LS.donations, null)
  if (!Array.isArray(stored) || stored.length === 0) return makeMockDonations()

  const seedAt = Number(read(LS.seedAt, 0)) || 0
  const stale = Date.now() - seedAt > 6 * 60 * 60 * 1000
  if (stale) {
    const userCreated = stored
      .map(sanitizeDonation)
      .filter(Boolean)
      .filter((d) => !d.isSeed)
    return [...makeMockDonations(), ...userCreated]
  }

  const sanitized = stored.map(sanitizeDonation).filter(Boolean)
  return sanitized.length ? sanitized : makeMockDonations()
}

// FRESH:Donation  Central state: users, donations, NGOs, toasts and every lifecycle action.
export function AppProvider({ children }) {
  const { place } = useUserLocation()
  const [users, setUsers] = useState(() => sanitizeUsers(read(LS.users, null)))
  const [donations, setDonations] = useState(loadDonations)
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = read(LS.currentUser, null)
    if (!isValidUser(stored)) return null
    const allUsers = sanitizeUsers(read(LS.users, null))
    return allUsers.find((u) => u.id === stored.id) || null
  })
  const [toasts, setToasts] = useState([])
  const demoActive = isDemoPlaceActive(place)
  const ngos = useMemo(
    () => (demoActive ? [...mockNgos, ...demoNgos] : mockNgos),
    [demoActive],
  )
  const toastTimers = useRef(new Map())

  // Demo records are mounted only while the active place is near Ludhiana.
  // They use the same state/update path as the existing seeded records, so
  // accept, status and report actions remain unchanged.
  useEffect(() => {
    setDonations((previous) => {
      const demoIds = new Set(demoDonations.map((donation) => donation.id))
      if (!demoActive) return previous.filter((donation) => !demoIds.has(donation.id))

      const existing = new Set(previous.map((donation) => donation.id))
      return [
        ...previous,
        ...demoDonations.filter((donation) => !existing.has(donation.id)),
      ]
    })
  }, [demoActive])

  useEffect(() => {
    write(LS.users, users)
  }, [users])

  useEffect(() => {
    const ok = write(LS.donations, donations)
    if (!ok) {
      // localStorage is small; large base64 photos are the usual culprit.
      console.warn('FRESH: could not persist donations to localStorage.')
    }
  }, [donations])

  useEffect(() => {
    write(LS.currentUser, currentUser)
  }, [currentUser])

  useEffect(() => {
    if (!read(LS.seedAt, 0)) write(LS.seedAt, Date.now())
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = toastTimers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      toastTimers.current.delete(id)
    }
  }, [])

  const addToast = useCallback(
    (message, type = 'success') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((prev) => [...prev, { id, message, type }])
      const timer = setTimeout(() => removeToast(id), 4500)
      toastTimers.current.set(id, timer)
    },
    [removeToast],
  )

  useEffect(() => {
    const timers = toastTimers.current
    return () => timers.forEach((t) => clearTimeout(t))
  }, [])

  // FRESH:Auth  Email + role login against the local demo user list.
  const login = useCallback(
    (email, role) => {
      const found = users.find(
        (u) =>
          u.email.toLowerCase() === email.trim().toLowerCase() &&
          (!role || u.role === role),
      )
      if (!found) {
        return {
          ok: false,
          message:
            'No account matches that email and role. Try a quick demo login or register.',
        }
      }
      setCurrentUser(found)
      addToast(`Welcome back, ${found.orgName || found.name}.`, 'success')
      return { ok: true }
    },
    [users, addToast],
  )

  // FRESH:Auth  One-tap demo login for a role.
  const quickLogin = useCallback(
    (role) => {
      const demo = DEMO_USERS[role]
      if (!demo) return
      setCurrentUser(demo)
      addToast(
        `Demo ${role === 'donor' ? 'donor' : 'NGO'} login: ${demo.orgName}.`,
        'success',
      )
    },
    [addToast],
  )

  // FRESH:Auth  Creates a local account; new NGOs are never silently mapped onto sample organisations.
  const register = useCallback(
    (payload) => {
      const email = payload.email.trim().toLowerCase()
      if (users.some((u) => u.email.toLowerCase() === email)) {
        return { ok: false, message: 'An account with this email already exists.' }
      }
      const matchedNgo =
        payload.role === 'ngo'
          ? ngos.find(
              (n) => n.name.toLowerCase() === payload.orgName?.trim().toLowerCase(),
            )
          : null
      const location =
        payload.location ||
        place ||
        (matchedNgo ? { lat: matchedNgo.lat, lng: matchedNgo.lng } : null)
      const userId = `u-${Date.now()}`
      const user = {
        id: userId,
        role: payload.role,
        name: payload.name.trim(),
        orgName: payload.orgName?.trim() || payload.name.trim(),
        email,
        phone: payload.phone.trim(),
        city: payload.city?.trim() || '',
        location,
        // A new NGO account is not silently mapped onto an existing sample
        // organisation. It gets its own account ID and stays "pending".
        ngoId:
          matchedNgo?.id ||
          (payload.role === 'ngo' ? `ngo-acct-${userId}` : undefined),
      }
      setUsers((prev) => [...prev, user])
      setCurrentUser(user)
      addToast(`Account created. Welcome to FRESH, ${user.orgName}.`, 'success')
      return { ok: true }
    },
    [users, ngos, place, addToast],
  )

  // FRESH:Auth  Clears the current user.
  const logout = useCallback(() => {
    setCurrentUser(null)
    addToast('Signed out.', 'info')
  }, [addToast])

  // FRESH:Donation  Publishes a listing and alerts the 3 nearest verified NGOs.
  const addDonation = useCallback(
    (data) => {
      const now = new Date().toISOString()
      const location = data.location || place || currentUser?.location || null
      const alerted = nearestNgos(ngos, location, 3).map((n) => n.id)
      const donation = {
        id: `don-${Date.now()}`,
        donorId: currentUser?.id || 'u-donor-demo',
        donorName:
          currentUser?.orgName || currentUser?.name || 'Anonymous donor',
        foodName: data.foodName.trim(),
        category: data.category,
        diet: data.diet,
        quantity: Number(data.quantity),
        cookedAt: new Date(data.cookedAt).toISOString(),
        storage: data.storage,
        deadline: new Date(data.deadline).toISOString(),
        address: data.address.trim(),
        location,
        photo: data.photo || '',
        contactPhone: data.contactPhone.trim(),
        notes: data.notes?.trim() || '',
        status: 'available',
        createdAt: now,
        timeline: [{ status: 'available', at: now }],
        alertedNgoIds: alerted,
        alertStage: 1,
        reports: [],
        isSeed: false,
      }
      setDonations((prev) => [donation, ...prev])
      addToast(
        'Donation listed. Alerting the 3 nearest verified NGOs.',
        'success',
      )
      return donation
    },
    [currentUser, ngos, place, addToast],
  )

  // FRESH:Accept  NGO-only accept; reveals donor contact and blocks expired listings.
  const acceptDonation = useCallback(
    (id) => {
      if (place && !inIndiaBox(place)) {
        const message = 'Pickups can only be accepted from locations within India.'
        addToast(message, 'warning')
        return { ok: false, message }
      }
      if (currentUser?.role !== 'ngo') {
        return { ok: false, message: 'Only an NGO account can accept a pickup.' }
      }
      const ngo =
        ngos.find((n) => n.id === currentUser.ngoId) ||
        ngos.find((n) => n.name === currentUser.orgName) || {
          id: currentUser.ngoId || `ngo-acct-${currentUser.id}`,
          name: currentUser.orgName || currentUser.name || 'Registered NGO',
          phone: currentUser.phone || '',
        }
      const target = donations.find((d) => d.id === id)
      if (!target) {
        return { ok: false, message: 'This listing could not be found.' }
      }
      const urgency = getUrgency(target.deadline)
      if (target.status !== 'available' || urgency.key === 'expired') {
        const message =
          urgency.key === 'expired'
            ? 'This listing has expired and cannot be accepted.'
            : 'This listing is no longer available.'
        addToast(message, 'error')
        return { ok: false, message }
      }
      const at = new Date().toISOString()
      setDonations((prev) =>
        prev.map((d) =>
          d.id === id && d.status === 'available'
            ? {
                ...d,
                status: 'accepted',
                acceptedBy: ngo.id,
                acceptedByName: ngo.name,
                acceptedByPhone: ngo.phone,
                acceptedAt: at,
                timeline: [...d.timeline, { status: 'accepted', at }],
              }
            : d,
        ),
      )
      addToast('Pickup accepted. Donor contact details are now visible.', 'success')
      return { ok: true }
    },
    [currentUser, ngos, donations, addToast, place],
  )

  // FRESH:Status  Moves accepted -> picked_up -> distributed; only the accepting NGO may advance.
  const advanceStatus = useCallback(
    (id) => {
      if (currentUser?.role !== 'ngo') {
        return { ok: false, message: 'Only the accepting NGO can update this pickup.' }
      }
      const target = donations.find((d) => d.id === id)
      if (!target) {
        return { ok: false, message: 'This listing could not be found.' }
      }
      const myNgoId = currentUser.ngoId || `ngo-acct-${currentUser.id}`
      const myNgoName = currentUser.orgName || currentUser.name
      const isAcceptingNgo =
        target.acceptedBy === myNgoId || target.acceptedByName === myNgoName
      if (!isAcceptingNgo) {
        const message = 'Only the NGO that accepted this pickup can update the status.'
        addToast(message, 'error')
        return { ok: false, message }
      }
      const next =
        target.status === 'accepted'
          ? 'picked_up'
          : target.status === 'picked_up'
            ? 'distributed'
            : null
      if (!next) {
        return { ok: false, message: 'This status cannot be advanced.' }
      }
      setDonations((prev) =>
        prev.map((d) =>
          d.id === id && d.status === target.status
            ? {
                ...d,
                status: next,
                timeline: [...d.timeline, { status: next, at: new Date().toISOString() }],
              }
            : d,
        ),
      )
      addToast(
        next === 'picked_up'
          ? 'Pickup marked as collected. The donor sees the change instantly.'
          : 'Distribution recorded. Impact numbers have increased.',
        'success',
      )
      return { ok: true }
    },
    [currentUser, donations, addToast],
  )

  // FRESH:Report  Appends a safety report to a listing.
  const reportDonation = useCallback(
    (id, report) => {
      setDonations((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                reports: [
                  ...(d.reports || []),
                  {
                    ...report,
                    id: `report-${Date.now()}`,
                    at: new Date().toISOString(),
                    by: currentUser?.orgName || currentUser?.name || 'Guest',
                  },
                ],
              }
            : d,
        ),
      )
      addToast('Report submitted. The safety team will review this listing.', 'warning')
      return { ok: true }
    },
    [currentUser, addToast],
  )

  // Smart alert simulation: after 60 seconds without acceptance, alert the
  // next three nearest verified NGOs. Runs globally so the donor does not
  // need to keep the detail page open.
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now()
      // Seeded listings are sample history, not live alerts. Only donations
      // published in this browser escalate after the 60-second demo window.
      const due = donations.filter(
        (d) =>
          d.status === 'available' &&
          !d.isSeed &&
          d.alertStage === 1 &&
          now - new Date(d.createdAt).getTime() >= 60000,
      )
      if (due.length === 0) return
      setDonations((prev) =>
        prev.map((d) => {
          if (!due.some((x) => x.id === d.id)) return d
          const already = new Set(d.alertedNgoIds || [])
          const next = nearestNgos(ngos, d.location, 6).filter(
            (n) => !already.has(n.id),
          )
          return {
            ...d,
            alertStage: 2,
            escalatedAt: new Date().toISOString(),
            alertedNgoIds: [
              ...(d.alertedNgoIds || []),
              ...next.slice(0, 3).map((n) => n.id),
            ],
          }
        }),
      )
      addToast(
        'No response yet — alerting the next nearest NGOs automatically.',
        'warning',
      )
    }, 5000)
    return () => clearInterval(timer)
  }, [donations, ngos, addToast])

  const impact = useMemo(() => {
    const distributed = donations.filter((d) => d.status === 'distributed')
    const meals = distributed.reduce((sum, d) => sum + Number(d.quantity || 0), 0)
    const totalMeals = BASELINE_IMPACT.meals + meals
    const kg = totalMeals * 0.4
    return {
      meals: totalMeals,
      kg,
      co2: kg * 2.5,
      activeNgos: ngos.filter((n) => n.verified).length,
      completed: BASELINE_IMPACT.completed + distributed.length,
      distributedDonations: distributed.length,
    }
  }, [donations, ngos])

  const exposedDonations = demoActive
    ? donations
    : donations.filter((donation) => !donation.isDemo)

  const value = {
    users,
    donations: exposedDonations,
    ngos,
    currentUser,
    toasts,
    impact,
    login,
    quickLogin,
    register,
    logout,
    addDonation,
    acceptDonation,
    advanceStatus,
    reportDonation,
    addToast,
    removeToast,
    haversineKm,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// FRESH:Donation  Hook: read app state and actions.
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
