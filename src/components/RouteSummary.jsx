// FRESH:FILE  Shows route distance and ETA; warns when the route passes a hazard zone.
// FRESH:AREA  Routing

import { AlertTriangle, Car, Loader2 } from 'lucide-react'

/**
 * Accessible single-route summary.
 *
 * - "Route to {name}" button (primary, 44px target, aria-label)
 * - Loading state shown while routing
 * - Error state with "Could not load a road route" and "Try again"
 * - "{x.x} km by road, about {n} min drive (estimate)" when route is ready
 * - "Open in Google Maps" link (plain text, not color‑only)
 * - "Clear route" button
 * - role="status", aria-live="polite"
 */
export default function RouteSummary({
  info,
  fromLabel,
  toLabel,
  onStart,
  canStart,
  onRetry,
  onClear,
  googleMapsUrl,
}) {
  if (!info) return null

  const loading = info.status === 'loading'
  const error = info.status === 'error'
  const success = info.status === 'ready'

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute right-3 top-20 z-[1001] w-[min(calc(100vw-1.5rem),380px)] rounded-[12px] border border-fresh-border bg-fresh-light-card/95 px-4 py-3 shadow-fresh-sm backdrop-blur-md dark:bg-fresh-dark-card/95 sm:right-4 sm:w-[min(calc(100vw-2rem),380px)]"
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] ${
            error
              ? 'bg-amber-500/15 text-amber-500 dark:text-amber-400'
              : 'bg-fresh-mint/15 text-fresh-mint'
          }`}
          aria-hidden="true"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : error ? (
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Car className="h-4 w-4" aria-hidden="true" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-fresh-mint">
            {loading ? 'Finding route' : error ? 'Route unavailable' : 'Road route'}
          </p>

          {loading && (
            <p className="mt-0.5 text-sm font-bold text-fresh-ink dark:text-fresh-light-bg">Finding a road route…</p>
          )}

          {error && (
            <>
              <p className="mt-0.5 text-sm font-bold text-fresh-ink dark:text-fresh-light-bg">
                Could not load a road route
              </p>
              <p className="mt-1 text-[11px] leading-snug text-fresh-ink-muted dark:text-fresh-ink-soft">
                {info.message || 'The routing service did not return a usable route.'}
              </p>
            </>
          )}

          {success && (
            <>
              <p className="mt-0.5 text-sm font-bold text-fresh-ink dark:text-fresh-light-bg">
                {info.distanceKm.toFixed(1)} km by road, about{' '}
                {info.durationMin} min drive (estimate)
              </p>
              <p className="mt-0.5 text-[11px] text-fresh-ink-muted dark:text-fresh-ink-soft">
                Driving route - OpenStreetMap
              </p>
              {info.hazardWarning && (
                <p className="mt-2 rounded-[8px] border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] font-semibold leading-snug text-amber-900 dark:text-amber-200">
                  This route passes near a reported hazard area. Check local updates before travelling. Routes may not reflect road closures.
                </p>
              )}
            </>
          )}

          <p className="mt-0.5 text-[11px] text-fresh-ink-muted dark:text-fresh-ink-soft">
            {fromLabel} to {toLabel}
          </p>

          {canStart && onStart && !success && (
            <button
              type="button"
              onClick={onStart}
              className="pointer-events-auto mt-3 inline-flex min-h-11 items-center justify-center rounded-[8px] bg-gradient-to-r from-fresh-mint to-fresh-teal px-4 text-xs font-bold text-fresh-cta shadow-fresh-sm transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fresh-mint"
              aria-label={`Route to ${toLabel}`}
            >
              Route to {toLabel}
            </button>
          )}

          {error && onRetry && (
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onRetry}
                className="pointer-events-auto inline-flex min-h-11 w-24 items-center justify-center rounded-[8px] border border-fresh-border bg-fresh-light-card px-3 text-xs font-semibold text-fresh-ink transition hover:bg-black/5 dark:bg-fresh-dark-card dark:text-fresh-light-bg dark:hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fresh-mint"
                aria-label="Try again for a road route"
              >
                Try again
              </button>
            </div>
          )}

          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto mt-3 inline-flex min-h-11 items-center justify-center rounded-[8px] border border-fresh-border bg-fresh-light-card px-3 text-xs font-semibold text-fresh-mint transition hover:bg-black/5 dark:bg-fresh-dark-card dark:hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fresh-mint"
              aria-label="Open in Google Maps"
            >
              Open in Google Maps
            </a>
          )}

          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="pointer-events-auto mt-3 inline-flex min-h-11 items-center justify-center rounded-[8px] border border-fresh-border bg-fresh-light-card px-3 text-xs font-semibold text-fresh-ink transition hover:bg-black/5 dark:bg-fresh-dark-card dark:text-fresh-light-bg dark:hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fresh-mint"
              aria-label="Clear route"
            >
              Clear route
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
