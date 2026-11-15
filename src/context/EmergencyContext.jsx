import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useUserLocation } from './LocationContext'
import { makeSampleNeeds, pledgeNeedAmount } from '../data/emergencyNeeds'
import { EMERGENCY_USE_MOCK } from '../config'

export const EMERGENCY_HAZARDS = [
  ['flood', 'Flood'],
  ['storm', 'Storm'],
  ['heatwave', 'Heatwave'],
  ['other', 'Other'],
]

// Base URL for optional backend integration. Kept local/sample by default.
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4010'

const EmergencyContext = createContext(null)

const isDemoVisible = () => {
  if (import.meta.env.DEV) return true
  if (EMERGENCY_USE_MOCK) return true
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('demo') === '1'
}

export function isEmergencyActive(alert, place, now = Date.now()) {
  if (!alert || !place?.state || alert.expiresAt <= now) return false
  return alert.state.toLowerCase() === place.state.toLowerCase()
}

function validAlert(alert) {
  return alert && alert.state && alert.expiresAt > Date.now()
}

const ALERT_STORAGE_KEY = 'fresh_emergency_alert_v1'

function getInitialAlert() {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(ALERT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (validAlert(parsed)) return parsed
    sessionStorage.removeItem(ALERT_STORAGE_KEY)
    return null
  } catch {
    return null
  }
}

export function EmergencyProvider({ children }) {
  const { place } = useUserLocation()
  const [alert, setAlertState] = useState(getInitialAlert)
  const [reportedConcerns, setReportedConcerns] = useState([])
  const [needs, setNeeds] = useState([])

  const setAlert = useCallback((val) => {
    setAlertState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val
      try {
        if (next && next.source === 'SIMULATED') {
          sessionStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(next))
        } else {
          sessionStorage.removeItem(ALERT_STORAGE_KEY)
        }
      } catch {
        // storage disabled or quota exceeded
      }
      return next
    })
  }, [])

  const simulate = useCallback(({ state, hazardType, severity = 'moderate', districts = [], durationMs = 2 * 60 * 60 * 1000, expiresAt }) => {
    const now = Date.now()
    setAlert({
      id: `simulated-${now}`,
      state,
      hazardType,
      severity,
      source: 'SIMULATED',
      issuedAt: now,
      expiresAt: expiresAt || (now + durationMs),
      districts,
    })
  }, [setAlert])

  const clear = useCallback(() => {
    try {
      sessionStorage.removeItem(ALERT_STORAGE_KEY)
    } catch {
      // storage disabled
    }
    setAlert(null)
  }, [setAlert])

  // Auto-clear active alert on expiry
  useEffect(() => {
    if (!alert?.expiresAt) return undefined
    const delay = alert.expiresAt - Date.now()
    if (delay <= 0) {
      clear()
      return undefined
    }
    const timer = setTimeout(() => {
      clear()
    }, delay)
    return () => clearTimeout(timer)
  }, [alert, clear])

  const reportConcern = useCallback((concern) => {
    setReportedConcerns((items) => [
      ...items,
      { ...concern, id: `concern-${Date.now()}`, createdAt: Date.now() },
    ])
  }, [])

  const postNeed = useCallback((need) => {
    const item = {
      ...need,
      id: `relief-need-${Date.now()}`,
      status: 'open',
      pledged: 0,
      createdAt: Date.now(),
    }
    setNeeds((items) => [item, ...items])
    return item
  }, [])

  const pledgeNeed = useCallback((id, amount) => {
    let result = { ok: false, message: 'Need not found.' }
    setNeeds((items) => items.map((need) => {
      if (need.id !== id) return need
      const update = pledgeNeedAmount(need, amount)
      if (!update.ok) {
        result = update
        return need
      }
      result = { ok: true }
      return update.need
    }))
    return result
  }, [])

  // Optional backend integration is disabled by default. When unavailable or
  // when USE_MOCK is enabled, keep local sample/simulated data without errors.
  useEffect(() => {
    if (EMERGENCY_USE_MOCK) return undefined
    if (!place?.state) {
      setAlert((current) => (current?.source === 'SIMULATED' ? current : null))
      return undefined
    }

    const controller = new AbortController()

    const fetchAlerts = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/emergency/alerts`, {
          signal: controller.signal,
        })
        if (!response.ok) return
        const data = await response.json()
        if (!Array.isArray(data)) return
        const activeAlerts = data.filter(
          (item) =>
            item?.isActive &&
            typeof item.state === 'string' &&
            item.state.toLowerCase() === place.state.toLowerCase(),
        )
        setAlert((current) =>
          activeAlerts.length ? activeAlerts[0] : current?.source === 'SIMULATED' ? current : null,
        )
      } catch {
        // Fail gracefully: keep local/simulated alert.
      }
    }

    fetchAlerts()
    return () => controller.abort()
  }, [place])

  useEffect(() => {
    if (!place) {
      setNeeds([])
      return undefined
    }
    if (EMERGENCY_USE_MOCK) {
      setNeeds(makeSampleNeeds(place))
      return undefined
    }

    const controller = new AbortController()

    const fetchNeeds = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/needs`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          setNeeds(makeSampleNeeds(place))
          return
        }
        const data = await response.json()
        if (!Array.isArray(data)) {
          setNeeds(makeSampleNeeds(place))
          return
        }
        const filtered = data.filter((need) => need?.state === place.state)
        setNeeds(filtered.length ? filtered : makeSampleNeeds(place))
      } catch {
        setNeeds(makeSampleNeeds(place))
      }
    }

    fetchNeeds()
    return () => controller.abort()
  }, [place])

  const value = useMemo(() => ({
    alert,
    activeAlert: (place) => {
      if (!validAlert(alert)) return null
      if (!isEmergencyActive(alert, place)) return null
      return alert
    },
    simulate,
    clear,
    reportConcern,
    reportedConcerns,
    needs,
    postNeed,
    pledgeNeed,
    simulatorVisible: isDemoVisible(),
  }), [alert, simulate, clear, reportConcern, reportedConcerns, needs, postNeed, pledgeNeed])

  return <EmergencyContext.Provider value={value}>{children}</EmergencyContext.Provider>
}

export function useEmergency() {
  const context = useContext(EmergencyContext)
  if (!context) throw new Error('useEmergency must be used inside EmergencyProvider')
  return context
}