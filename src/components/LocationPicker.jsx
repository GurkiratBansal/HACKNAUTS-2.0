import { useEffect, useRef, useState } from 'react'
import { Loader2, MapPin, Navigation, Search, TriangleAlert } from 'lucide-react'
import { useLocation } from '../context/LocationContext'
import Button from './ui/Button'
import Field from './ui/Field'
import Modal from './ui/Modal'
import { searchAddress, searchPincode, searchPlace } from '../services/geocoding'
import { INDIAN_STATES, isValidPin } from '../utils/india'

const empty = { area: '', city: '', state: '', pincode: '' }

/**
 * Manual location entry. Pincodes are resolved on submit through Nominatim,
 * with Photon as a fallback; the area/city field also offers debounced
 * suggestions. Only successful places are passed to LocationContext, which
 * persists manual selections and gates them to India.
 */
export default function LocationPicker({ open, onClose }) {
  const { place, status, error, detect, chooseManualPlace, closePicker } =
    useLocation()
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [searchError, setSearchError] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selectedSuggestion, setSelectedSuggestion] = useState(null)
  const [busy, setBusy] = useState(false)
  const abortRef = useRef(null)
  const summaryRef = useRef(null)
  const pendingGpsRef = useRef(false)

  // Prefill when the picker opens so the current place is visible.
  useEffect(() => {
    if (!open) return
    setForm({
      area: '',
      city: place?.city || '',
      state: place?.state || '',
      pincode: place?.pincode || '',
    })
    setErrors({})
    setSubmitError('')
    setSearchError('')
    setSuggestions([])
    setSelectedSuggestion(null)
  }, [open, place?.city, place?.state, place?.pincode])

  // Debounced address suggestions. The latest request wins; older ones abort.
  useEffect(() => {
    if (!open || selectedSuggestion) return undefined
    const text = [form.area, form.city].filter(Boolean).join(' ').trim()
    if (text.length < 3) {
      setSuggestions([])
      setSearchError('')
      return undefined
    }
    const timer = setTimeout(async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      try {
        const result = await searchAddress(text, controller.signal)
        if (controller.signal.aborted) return
        if (result.ok) {
          setSuggestions(result.suggestions)
          setSearchError('')
        } else {
          setSuggestions([])
          setSearchError(result.message)
        }
      } catch (requestError) {
        if (requestError?.name !== 'AbortError') {
          setSuggestions([])
          setSearchError('Address search failed. Please try again.')
        }
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [open, form.area, form.city, selectedSuggestion])

  // Close automatically after a successful GPS lookup.
  useEffect(() => {
    if (!pendingGpsRef.current) return
    if (status === 'ready') {
      pendingGpsRef.current = false
      closePicker()
    } else if (status === 'error' || status === 'outside' || status === 'unconfirmed') {
      pendingGpsRef.current = false
      setSubmitError(error || 'We could not confirm that location. Please try again.')
    }
  }, [status, error, closePicker])

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const set = (key) => (event) => {
    const value = event.target.value
    setForm((previous) => ({ ...previous, [key]: value }))
    setErrors((previous) => ({ ...previous, [key]: '' }))
    setSubmitError('')
    if (key === 'area' || key === 'city') setSelectedSuggestion(null)
  }

  const chooseSuggestion = (suggestion) => {
    abortRef.current?.abort()
    setSelectedSuggestion(suggestion)
    setForm({
      area: suggestion.city || suggestion.label || '',
      city: suggestion.city || '',
      state: suggestion.state || '',
      pincode: suggestion.pincode || '',
    })
    setSuggestions([])
    setSearchError('')
    setSubmitError('')
  }

  const focusSummary = () => {
    window.setTimeout(() => summaryRef.current?.focus({ preventScroll: true }), 0)
  }

  const submit = async (event) => {
    event.preventDefault()
    const next = {}
    const pin = form.pincode.trim()
    if (pin && !isValidPin(pin)) {
      next.pincode = 'Enter a valid 6-digit pincode.'
    }
    if (!pin && !form.area.trim() && !form.city.trim()) {
      next.area = 'Enter an area, city or pincode.'
    }
    if (!pin && !form.city.trim()) {
      next.city = 'Enter a city or a pincode.'
    }
    setErrors(next)
    if (Object.keys(next).length > 0) {
      setSubmitError('Please fix the highlighted fields and try again.')
      focusSummary()
      return
    }

    setBusy(true)
    setSubmitError('')
    try {
      let result
      if (selectedSuggestion) {
        result = { ok: true, place: selectedSuggestion }
      } else if (pin) {
        result = await searchPincode(pin)
      } else {
        result = await searchPlace(
          `${form.area} ${form.city} ${form.state}, India`.replace(/\s+/g, ' ').trim(),
        )
      }

      if (!result.ok) {
        setSubmitError(result.message || 'We could not find that place. Please try again.')
        focusSummary()
        return
      }

      const saved = await chooseManualPlace(result.place)
      if (saved.ok) {
        closePicker()
      } else {
        setSubmitError(saved.message || 'We could not confirm that place. Please try again.')
        focusSummary()
      }
    } catch (requestError) {
      if (requestError?.name !== 'AbortError') {
        setSubmitError('Something went wrong while checking that place. Please try again.')
        focusSummary()
      }
    } finally {
      setBusy(false)
    }
  }

  const useGps = () => {
    pendingGpsRef.current = true
    setSubmitError('')
    setSearchError('')
    detect()
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy="location-picker-title" size="lg">
      <div className="p-5 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
          Set your location
        </p>
        <h2
          id="location-picker-title"
          className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink"
        >
          Where are you sharing food?
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          FRESH is available in India only for now. Choose a place to see nearby
          food and partners.
        </p>

        {submitError && (
          <div
            ref={summaryRef}
            role="alert"
            tabIndex={-1}
            aria-live="polite"
            className="mt-4 flex items-start gap-2 rounded-2xl border border-danger-200 bg-danger-50 p-3 text-sm font-medium text-danger-700 focus:outline-none focus:ring-2 focus:ring-danger-400 dark:border-danger-800 dark:bg-danger-900/25 dark:text-danger-200"
          >
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {submitError}
          </div>
        )}

        <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="loc-area"
              label="Area or street"
              value={form.area}
              onChange={set('area')}
              error={errors.area}
              placeholder="Model Town"
              autoComplete="street-address"
            />
            <Field
              id="loc-city"
              label="City"
              value={form.city}
              onChange={set('city')}
              error={errors.city}
              placeholder="Ludhiana"
              autoComplete="address-level2"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="loc-state"
              label="State / UT"
              as="select"
              value={form.state}
              onChange={set('state')}
            >
              <option value="">Select a state or UT</option>
              {INDIAN_STATES.map((stateName) => (
                <option key={stateName} value={stateName}>
                  {stateName}
                </option>
              ))}
            </Field>
            <Field
              id="loc-pincode"
              label="Pincode"
              value={form.pincode}
              onChange={(event) =>
                set('pincode')({
                  target: {
                    value: event.target.value.replace(/\D/g, '').slice(0, 6),
                  },
                })
              }
              error={errors.pincode}
              placeholder="141001"
              inputMode="numeric"
              autoComplete="postal-code"
              pattern="[0-9]*"
              maxLength={6}
              hint="Six digits. We resolve it on submit only."
            />
          </div>

          {searchError && (
            <p role="alert" className="text-[13px] font-medium text-danger-600 dark:text-danger-400">
              {searchError}
            </p>
          )}

          {suggestions.length > 0 && (
            <div className="rounded-2xl border border-line bg-elevated/60 p-1.5">
              <p className="px-2 pb-1 pt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                Suggested places
              </p>
              <ul aria-label="Address suggestions">
                {suggestions.map((suggestion, index) => (
                  <li key={`${suggestion.lat}-${suggestion.lng}-${index}`}>
                    <button
                      type="button"
                      onClick={() => chooseSuggestion(suggestion)}
                      className="flex w-full items-start gap-2 rounded-xl px-2 py-2 text-left text-sm text-ink transition hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
                    >
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{suggestion.label}</span>
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

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              icon={Navigation}
              onClick={useGps}
              className="sm:w-auto"
            >
              Use my current location
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={busy ? Loader2 : Search}
              loading={busy}
              className="sm:w-auto"
            >
              {busy ? 'Checking place…' : 'Use this place'}
            </Button>
          </div>
        </form>

        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-elevated p-3 text-[11px] leading-relaxed text-ink-muted">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Your live GPS position is used only in this browser and is never stored.
          Manual places are saved so the map reopens nearby.
        </p>
      </div>
    </Modal>
  )
}
