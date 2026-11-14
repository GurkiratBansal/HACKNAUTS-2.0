import { useEffect, useRef, useState } from 'react'
import { Loader2, MapPin, Navigation, Search, TriangleAlert } from 'lucide-react'
import { useUserLocation } from '../context/LocationContext'
import { searchPincode, searchPlaces } from '../services/geocode'
import Button from './ui/Button'
import Field from './ui/Field'

const DEMO_PLACE = {
  lat: 30.901,
  lng: 75.8573,
  label: 'Ludhiana, Punjab',
  state: 'Punjab',
}

function demoLocationVisible() {
  if (import.meta.env.DEV) return true
  try {
    return new URLSearchParams(window.location.search).get('demo') === '1'
  } catch {
    return false
  }
}

export default function LocationPicker({ onComplete, className = '', idPrefix = 'location-picker' }) {
  const { place, status, error, detect, setManual } = useUserLocation()
  const [address, setAddress] = useState('')
  const [pincode, setPincode] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selectedSuggestion, setSelectedSuggestion] = useState(null)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [searching, setSearching] = useState(false)
  const abortRef = useRef(null)
  const waitingForGpsRef = useRef(false)

  useEffect(() => {
    if (!waitingForGpsRef.current) return
    if (place?.source === 'gps' && status === 'idle') {
      waitingForGpsRef.current = false
      onComplete?.()
    } else if (status === 'denied' || status === 'unavailable') {
      waitingForGpsRef.current = false
      setMessage(error || 'Type your area or pincode instead.')
    }
  }, [place?.source, status, error, onComplete])

  useEffect(() => {
    const text = address.trim()
    if (text.length < 3 || selectedSuggestion) {
      setSuggestions([])
      setSearching(false)
      return undefined
    }

    const timer = window.setTimeout(async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setSearching(true)
      try {
        const results = await searchPlaces(text, controller.signal)
        if (controller.signal.aborted) return
        setSuggestions(results)
        setMessage(results.length ? '' : 'No matching places yet. Try adding a city or pincode.')
      } catch (requestError) {
        if (requestError?.name !== 'AbortError') {
          setSuggestions([])
          setMessage(requestError?.message || 'Address search failed. Please try again.')
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false)
      }
    }, 450)

    return () => {
      window.clearTimeout(timer)
      abortRef.current?.abort()
    }
  }, [address, selectedSuggestion])

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const choose = (candidate) => {
    const result = setManual(candidate)
    if (!result.ok) {
      setMessage(result.message || 'Choose a valid place inside India.')
      return
    }
    setMessage('')
    setErrors({})
    onComplete?.()
  }

  const submit = async (event) => {
    event?.preventDefault?.()
    const nextErrors = {}
    const cleanPincode = pincode.trim()

    if (cleanPincode && !/^[1-9][0-9]{5}$/.test(cleanPincode)) {
      nextErrors.pincode = 'Enter a valid 6-digit pincode.'
    }
    if (!cleanPincode && !address.trim()) {
      nextErrors.address = 'Enter an area, city or pincode.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setMessage('Please fix the highlighted field and try again.')
      return
    }

    setBusy(true)
    setMessage('')
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      if (selectedSuggestion) {
        choose(selectedSuggestion)
        return
      }

      const results = cleanPincode
        ? await searchPincode(cleanPincode, controller.signal)
        : await searchPlaces(address.trim(), controller.signal)

      if (controller.signal.aborted) return
      if (!results.length) {
        setMessage(
          cleanPincode
            ? 'We could not find that pincode. Check the digits and try again.'
            : 'We could not find that place. Try adding a city or pincode.',
        )
        return
      }
      choose(results[0])
    } catch (requestError) {
      if (requestError?.name !== 'AbortError') {
        setMessage(requestError?.message || 'We could not check that place. Please try again.')
      }
    } finally {
      if (!controller.signal.aborted) setBusy(false)
    }
  }

  const useGps = () => {
    waitingForGpsRef.current = true
    setMessage('')
    setErrors({})
    detect()
  }

  return (
    <section
      className={`rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6 ${className}`.trim()}
      aria-labelledby={`${idPrefix}-title`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
        Set your location
      </p>
      <h2
        id={`${idPrefix}-title`}
        className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink"
      >
        Where are you sharing food?
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
        Choose your current location, an area, or a 6-digit Indian pincode.
      </p>

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="mt-4 min-h-5 text-sm font-medium text-ink-soft"
      >
        {message || (status === 'detecting' ? 'Finding your current location…' : '')}
      </div>

      <div className="mt-4 space-y-4">
        <Field
          id={`${idPrefix}-address`}
          label="Area, street or city"
          value={address}
          onChange={(event) => {
            setAddress(event.target.value)
            setSelectedSuggestion(null)
            setErrors((current) => ({ ...current, address: '' }))
          }}
          error={errors.address}
          placeholder="Model Town, Ludhiana"
          autoComplete="street-address"
        />

        <Field
          id={`${idPrefix}-pincode`}
          label="Pincode"
          value={pincode}
          onChange={(event) => {
            setPincode(event.target.value.replace(/\D/g, '').slice(0, 6))
            setErrors((current) => ({ ...current, pincode: '' }))
          }}
          error={errors.pincode}
          placeholder="141001"
          inputMode="numeric"
          autoComplete="postal-code"
          pattern="[1-9][0-9]{5}"
          maxLength={6}
          hint="Enter a 6-digit pincode, or use the address field above."
        />

        {suggestions.length > 0 && (
          <div className="rounded-2xl border border-line bg-elevated/60 p-1.5">
            <p className="px-2 pb-1 pt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
              Address results
            </p>
            <ul aria-label="Address results">
              {suggestions.map((suggestion, index) => (
                <li key={`${suggestion.lat}-${suggestion.lng}-${index}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSuggestion(suggestion)
                      setAddress(suggestion.label)
                      setSuggestions([])
                    }}
                    className="flex min-h-11 w-full items-start gap-2 rounded-xl px-2 py-2 text-left text-sm text-ink transition hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
                  >
                    <MapPin
                      className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300"
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span className="block font-semibold">{suggestion.label}</span>
                      {suggestion.state && (
                        <span className="block text-[11px] text-ink-muted">
                          {suggestion.state}
                          {suggestion.pincode ? ` · ${suggestion.pincode}` : ''}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {searching && (
          <p className="flex items-center gap-2 text-xs text-ink-muted" aria-live="polite">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Searching addresses…
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="secondary"
            icon={status === 'detecting' ? Loader2 : Navigation}
            loading={status === 'detecting'}
            onClick={useGps}
            className="sm:w-auto"
          >
            Use my current location
          </Button>
          <Button
            type="button"
            variant="primary"
            icon={busy ? Loader2 : Search}
            loading={busy}
            onClick={submit}
            className="sm:w-auto"
          >
            {busy ? 'Checking place…' : 'Use this place'}
          </Button>
        </div>
      </div>

      {demoLocationVisible() && (
        <div className="mt-4 border-t border-line pt-4">
          <Button
            type="button"
            variant="outline"
            icon={MapPin}
            onClick={() => choose(DEMO_PLACE)}
            className="w-full"
          >
            Use Ludhiana location
          </Button>
          <p className="mt-2 text-[11px] text-ink-muted">
            Sample location. This choice is never made automatically.
          </p>
        </div>
      )}

      <p className="mt-4 flex items-start gap-2 rounded-2xl bg-elevated p-3 text-[11px] leading-relaxed text-ink-muted">
        <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Your live GPS position stays in this browser tab and is never stored. Manual
        places are saved so the map reopens nearby.
      </p>
    </section>
  )
}
