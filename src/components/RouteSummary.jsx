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
      className="pointer-events-none absolute left-1/2 top-3 z-[1001] w-[min(92vw,440px)] -translate-x-1/2 rounded-2xl border border-line bg-surface/95 px-4 py-3 shadow-lift backdrop-blur-md lg:left-[calc(50%+190px)]"
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            error
              ? 'bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-200'
              : loading
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
              : 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
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
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
            {loading ? 'Finding route' : error ? 'Route unavailable' : 'Road route'}
          </p>

          {loading && (
            <p className="mt-0.5 text-sm font-bold text-ink">Finding a road route…</p>
          )}

          {error && (
            <>
              <p className="mt-0.5 text-sm font-bold text-ink">
                Could not load a road route
              </p>
              <p className="mt-1 text-[11px] leading-snug text-ink-muted">
                {info.message || 'The routing service did not return a usable route.'}
              </p>
            </>
          )}

          {success && (
            <>
              <p className="mt-0.5 text-sm font-bold text-ink">
                {info.distanceKm.toFixed(1)} km by road, about{' '}
                {info.durationMin} min drive (estimate)
              </p>
              <p className="mt-0.5 text-[11px] text-ink-muted">
                Driving route - OpenStreetMap
              </p>
            </>
          )}

          <p className="mt-0.5 text-[11px] text-ink-muted">
            {fromLabel} to {toLabel}
          </p>

          {canStart && onStart && (
            <button
              type="button"
              onClick={onStart}
              className="pointer-events-auto mt-2 inline-flex min-h-11 w-28 items-center justify-center rounded-xl bg-brand-600 px-4 text-xs font-bold text-white transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              aria-label="Route to {toLabel}"
            >
              Route to {toLabel}
            </button>
          )}

          {error && onRetry && (
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onRetry}
                className="pointer-events-auto inline-flex min-h-11 w-24 items-center justify-center rounded-xl border border-line bg-surface px-3 text-xs font-bold text-ink transition hover:bg-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
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
              className="pointer-events-auto inline-flex min-h-11 w-24 items-center justify-center rounded-xl border border-line bg-surface px-3 text-xs font-bold text-brand-700 transition hover:bg-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 dark:text-brand-300"
              aria-label="Open in Google Maps"
            >
              Open in Google Maps
            </a>
          )}
        </div>
      </div>
    </div>
  )
}