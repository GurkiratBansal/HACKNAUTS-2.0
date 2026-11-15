// FRESH:FILE  Compact header control showing the active place; opens the picker.
// FRESH:AREA  Location

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
      className={`fresh-location-bar flex items-center gap-2 rounded-[10px] border border-fresh-border bg-fresh-light-card/95 px-3 py-2 shadow-fresh-sm backdrop-blur-md dark:bg-fresh-dark-card/95 ${className}`}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-fresh-mint/15 text-fresh-mint"
        aria-hidden="true"
      >
        <MapPin className="h-4 w-4" />
      </span>
      <span
        role="status"
        aria-live="polite"
        className="min-w-0 flex-1 truncate text-xs text-fresh-ink-muted dark:text-fresh-ink-soft"
      >
        {place ? (
          <>
            Showing near <strong className="font-bold text-fresh-ink dark:text-fresh-light-bg">{place.label}</strong>
          </>
        ) : (
          'Set a location to see nearby food and partners'
        )}
      </span>
      <button
        type="button"
        onClick={openPicker}
        className="inline-flex min-h-[36px] shrink-0 items-center rounded-[8px] border border-fresh-border bg-white/50 px-3 text-xs font-semibold text-fresh-ink transition hover:bg-white dark:bg-white/5 dark:text-fresh-mint dark:hover:bg-white/10 focus-visible:outline-fresh-mint"
      >
        {place ? 'Change location' : 'Set location'}
      </button>
    </div>
  )
}
