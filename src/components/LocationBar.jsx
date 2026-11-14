import { MapPin } from 'lucide-react'
import { useLocation } from '../context/LocationContext'

/**
 * Compact status line for the active place. The label is exposed to screen
 * readers politely so a place change is announced without stealing focus.
 */
export default function LocationBar({ className = '' }) {
  const { place, openPicker } = useLocation()

  return (
    <div
      className={`flex items-center gap-2 rounded-2xl border border-line bg-surface/95 px-3 py-2 shadow-soft backdrop-blur-md ${className}`}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
        aria-hidden="true"
      >
        <MapPin className="h-4 w-4" />
      </span>
      <span
        role="status"
        aria-live="polite"
        className="min-w-0 flex-1 truncate text-xs text-ink-soft"
      >
        {place ? (
          <>
            Showing near <strong className="font-bold text-ink">{place.label}</strong>
          </>
        ) : (
          'Set a location to see nearby food and partners'
        )}
      </span>
      <button
        type="button"
        onClick={openPicker}
        className="inline-flex min-h-11 shrink-0 items-center rounded-lg border border-line bg-surface px-3 text-xs font-bold text-brand-700 transition hover:bg-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-brand-300"
      >
        {place ? 'Change location' : 'Set location'}
      </button>
    </div>
  )
}
