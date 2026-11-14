import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { LOCATION_STORAGE_KEY } from '../config'
import { reversePlace } from '../services/geocode'
import { inIndiaBox } from '../utils/india'

const LocationContext = createContext(null)

function validCoordinate(point) {
  const lat = Number(point?.lat)
  const lng = Number(point?.lng)
  return Number.isFinite(lat) && Number.isFinite(lng) && inIndiaBox({ lat, lng })
}

export function validateStoredPlace(value) {
  if (!value || typeof value !== 'object') return null
  if (!validCoordinate(value)) return null

  const label =
    typeof value.label === 'string' && value.label.trim()
      ? value.label.trim()
      : 'Selected place'

  return {
    lat: Number(value.lat),
    lng: Number(value.lng),
    label,
    source: 'manual',
  }
}

function readManualPlace() {
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const place = validateStoredPlace(parsed)
    if (!place) localStorage.removeItem(LOCATION_STORAGE_KEY)
    return place
  } catch {
    try {
      localStorage.removeItem(LOCATION_STORAGE_KEY)
    } catch {
      // Storage can be unavailable; the app can still continue without it.
    }
    return null
  }
}

function writeManualPlace(place) {
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(place))
    return true
  } catch {
    return false
  }
}

function removeManualPlace() {
  try {
    localStorage.removeItem(LOCATION_STORAGE_KEY)
  } catch {
    // The in-memory place remains usable when storage is unavailable.
  }
}

function isSecureLocationPage() {
  if (typeof window === 'undefined') return false
  if (window.isSecureContext) return true
  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
}

export function LocationProvider({ children }) {
  const [place, setPlace] = useState(() => readManualPlace())
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const startedRef = useRef(false)
  const detectionRef = useRef(0)
  const reverseAbortRef = useRef(null)

  const detect = useCallback(() => {
    if (!isSecureLocationPage()) {
      setStatus('unavailable')
      setError('Type your area or pincode instead. Location needs a secure HTTPS page.')
      return
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable')
      setError('Type your area or pincode instead. Location is not available in this browser.')
      return
    }

    const detectionId = detectionRef.current + 1
    detectionRef.current = detectionId
    setStatus('detecting')
    setError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (detectionId !== detectionRef.current) return

        const lat = Number(position.coords.latitude)
        const lng = Number(position.coords.longitude)
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          setStatus('unavailable')
          setError('We could not read your location. Type your area or pincode instead.')
          return
        }

        // A fresh GPS result replaces any stale saved manual place. GPS is
        // deliberately kept in memory and is never written to localStorage.
        removeManualPlace()
        setPlace({ lat, lng, label: 'Your location', source: 'gps' })
        setStatus('idle')

        reverseAbortRef.current?.abort()
        const reverseController = new AbortController()
        reverseAbortRef.current = reverseController
        reversePlace(lat, lng, reverseController.signal)
          .then((label) => {
            if (detectionId !== detectionRef.current) return
            setPlace((current) =>
              current?.source === 'gps' && current.lat === lat && current.lng === lng
                ? { ...current, label: label || 'Your location' }
                : current,
            )
          })
          .catch((requestError) => {
            if (requestError?.name !== 'AbortError') {
              // The coordinates are still useful when reverse geocoding fails.
              setPlace((current) =>
                current?.source === 'gps'
                  ? { ...current, label: 'Your location' }
                  : current,
              )
            }
          })
      },
      (geoError) => {
        if (detectionId !== detectionRef.current) return
        if (geoError?.code === 1) {
          setStatus('denied')
          setError('Location permission was not given. Type your area or pincode instead.')
        } else {
          setStatus('unavailable')
          setError('Location is unavailable. Type your area or pincode instead.')
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )
  }, [])

  const setManual = useCallback((candidate) => {
    const next = validateStoredPlace(candidate)
    if (!next) {
      const message = 'Choose a valid place inside India.'
      setError(message)
      return { ok: false, message }
    }

    setPlace(next)
    setStatus('idle')
    setError('')
    writeManualPlace(next)
    return { ok: true, place: next }
  }, [])

  const clear = useCallback(() => {
    detectionRef.current += 1
    reverseAbortRef.current?.abort()
    removeManualPlace()
    setPlace(null)
    setStatus('idle')
    setError('')
  }, [])

  // Priority: saved manual place first. GPS is detected automatically only
  // when the browser already reports permission as granted.
  useEffect(() => {
    if (startedRef.current) return undefined
    startedRef.current = true
    if (place) return undefined
    if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
      return undefined
    }

    let cancelled = false
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((permission) => {
        if (cancelled) return
        if (permission.state === 'granted') {
          detect()
        } else if (permission.state === 'denied') {
          setStatus('denied')
          setError('Location permission was not given. Type your area or pincode instead.')
        }
      })
      .catch(() => {
        // Permission lookup is best-effort. Manual entry remains available.
      })

    return () => {
      cancelled = true
    }
  }, [detect, place])

  useEffect(() => {
    return () => {
      detectionRef.current += 1
      reverseAbortRef.current?.abort()
    }
  }, [])

  const openPicker = useCallback(() => setPickerOpen(true), [])
  const closePicker = useCallback(() => setPickerOpen(false), [])

  const value = useMemo(
    () => ({
      place,
      status,
      error,
      pickerOpen,
      detect,
      setManual,
      chooseManualPlace: setManual,
      clear,
      openPicker,
      closePicker,
    }),
    [place, status, error, pickerOpen, detect, setManual, clear, openPicker, closePicker],
  )

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}

export function useUserLocation() {
  const context = useContext(LocationContext)
  if (!context) throw new Error('useUserLocation must be used inside LocationProvider')
  return context
}

// Temporary compatibility alias for existing components; new code should use
// useUserLocation.
export const useLocation = useUserLocation
