import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  DEV_DEMO_BYPASS_PARAM,
  DEV_DEMO_PLACE,
  ENFORCE_INDIA_ONLY,
  LOCATION_STORAGE_KEY,
} from '../config'
import { reverseGeocode } from '../services/geocoding'
import { inIndiaBox } from '../utils/india'
import { verifyInIndia } from '../utils/locationGate'

const LocationContext = createContext(null)

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
    // Storage can be unavailable; the in-memory place still works.
  }
}

/** Validate a persisted manual place before trusting it. */
export function validateStoredPlace(value) {
  if (!value || typeof value !== 'object') return null
  const lat = Number(value.lat)
  const lng = Number(value.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (!inIndiaBox({ lat, lng })) return null
  const countryCode = String(value.countryCode || '').toUpperCase()
  if (countryCode && countryCode !== 'IN') return null
  if (typeof value.label !== 'string' || !value.label.trim()) return null
  return {
    ...value,
    lat,
    lng,
    label: value.label.trim(),
    countryCode: 'IN',
    source: value.source === 'gps' ? 'manual' : value.source || 'manual',
  }
}

function readManualPlace() {
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY)
    if (!raw) return null
    return validateStoredPlace(JSON.parse(raw))
  } catch {
    removeManualPlace()
    return null
  }
}

function devBypassActive() {
  if (!import.meta.env.DEV) return false
  try {
    return new URLSearchParams(window.location.search).get(DEV_DEMO_BYPASS_PARAM) === '1'
  } catch {
    return false
  }
}

export function LocationProvider({ children }) {
  const [place, setPlace] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [bypassActive] = useState(devBypassActive)
  const abortRef = useRef(null)
  const lastAttemptRef = useRef(null)
  const startedRef = useRef(false)

  const abortPending = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
  }, [])

  const savePlace = useCallback(
    async (candidate, { source = 'manual', persist = true } = {}) => {
      abortPending()
      const controller = new AbortController()
      abortRef.current = controller
      lastAttemptRef.current = { kind: 'save', candidate, options: { source, persist } }
      setStatus('checking')
      setError(null)

      const result = await verifyInIndia(candidate, {
        reverseGeocode,
        signal: controller.signal,
      })
      if (controller.signal.aborted) return { ok: false, code: 'aborted' }

      if (!result.ok) {
        setStatus(result.code === 'outside' ? 'outside' : 'unconfirmed')
        setError(result.message)
        return result
      }

      const nextPlace = { ...result.place, source }
      setPlace(nextPlace)
      setStatus('ready')
      setError(null)
      if (persist) writeManualPlace(nextPlace)
      return result
    },
    [abortPending],
  )

  const detect = useCallback(() => {
    if (!navigator?.geolocation) {
      setStatus('error')
      setError('Location is not available in this browser. Enter a place instead.')
      return
    }
    abortPending()
    lastAttemptRef.current = { kind: 'detect' }
    setStatus('locating')
    setError(null)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const candidate = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: 'Current location',
          accuracy: position.coords.accuracy,
        }
        await savePlace(candidate, { source: 'gps', persist: false })
      },
      (geoError) => {
        const message =
          geoError?.code === 1
            ? 'Location permission was not given. Enter a place instead.'
            : geoError?.code === 2
              ? 'Location is unavailable. Enter a place instead.'
              : 'Location timed out. Try again or enter a place.'
        setStatus('error')
        setError(message)
      },
      { enableHighAccuracy: true, timeout: 15000 },
    )
  }, [abortPending, savePlace])

  // Priority: saved manual place, then GPS only when permission is already
  // granted, then the picker. There is intentionally no city default.
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    if (bypassActive) {
      setPlace(DEV_DEMO_PLACE)
      setStatus('ready')
      return
    }

    const saved = readManualPlace()
    if (saved) {
      setPlace(saved)
      setStatus('ready')
      return
    }

    if (!ENFORCE_INDIA_ONLY) {
      setStatus('idle')
      return
    }

    if (!navigator?.permissions?.query) return undefined

    let cancelled = false
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((permission) => {
        if (!cancelled && permission.state === 'granted') detect()
      })
      .catch(() => {
        // Permission lookup is best-effort; the picker still works.
      })
    return () => {
      cancelled = true
    }
  }, [bypassActive, detect])

  useEffect(() => {
    return () => abortPending()
  }, [abortPending])

  const retry = useCallback(() => {
    const attempt = lastAttemptRef.current
    if (!attempt) {
      detect()
      return
    }
    if (attempt.kind === 'detect') {
      detect()
      return
    }
    savePlace(attempt.candidate, attempt.options)
  }, [detect, savePlace])

  const openPicker = useCallback(() => setPickerOpen(true), [])
  const closePicker = useCallback(() => setPickerOpen(false), [])

  const chooseManualPlace = useCallback(
    (candidate) => savePlace(candidate, { source: 'manual', persist: true }),
    [savePlace],
  )

  const clearSavedPlace = useCallback(() => {
    removeManualPlace()
    setPlace(null)
    setStatus('idle')
    setError(null)
    setPickerOpen(true)
  }, [])

  const value = useMemo(
    () => ({
      place,
      status,
      error,
      pickerOpen,
      bypassActive,
      enforceIndiaOnly: ENFORCE_INDIA_ONLY,
      detect,
      retry,
      savePlace,
      chooseManualPlace,
      clearSavedPlace,
      openPicker,
      closePicker,
    }),
    [
      place,
      status,
      error,
      pickerOpen,
      bypassActive,
      detect,
      retry,
      savePlace,
      chooseManualPlace,
      clearSavedPlace,
      openPicker,
      closePicker,
    ],
  )

  return (
    <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
  )
}

export function useLocation() {
  const context = useContext(LocationContext)
  if (!context) throw new Error('useLocation must be used inside LocationProvider')
  return context
}
