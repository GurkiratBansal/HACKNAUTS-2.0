import { AlertTriangle, Car, Loader2 } from 'lucide-react'
import { formatDistance } from '../../utils/format'

/**
 * Small, non-interactive overlay that tells the user what the route line is.
 * It never blocks map clicks, so selecting another pin keeps working.
 */
export default function RouteInfoCard({ info, fromLabel, toLabel, onStart, canStart }) {
  if (!info) return null

  const loading = info.status === 'loading'
  const fallback = info.status === 'fallback'
  const Icon = loading ? Loader2 : fallback ? AlertTriangle : Car

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute left-1/2 top-3 z-[1001] w-[min(92vw,400px)] -translate-x-1/2 rounded-2xl border border-line bg-surface/95 px-4 py-3 shadow-lift backdrop-blur-md lg:left-[calc(50%+190px)]"
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            fallback
              ? 'bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-200'
              : 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
          }`}
          aria-hidden="true"
        >
          <Icon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
            {loading ? 'Finding route' : fallback ? 'Route unavailable' : 'Road route'}
          </p>

          {loading && (
            <p className="mt-0.5 text-sm font-bold text-ink">
              Finding the fastest drive…
            </p>
          )}

          {!loading && fallback && (
            <p className="mt-0.5 text-sm font-bold text-ink">
              {formatDistance(info.distanceKm)} straight-line
            </p>
          )}

          {!loading && !fallback && (
            <p className="mt-0.5 text-sm font-bold text-ink">
              {info.durationMin} min drive · {formatDistance(info.distanceKm)}
            </p>
          )}

          <p className="mt-0.5 truncate text-[11px] text-ink-muted">
            {fromLabel} → {toLabel}
          </p>

          {canStart && onStart && (
            <button
              type="button"
              onClick={onStart}
              className="pointer-events-auto mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-xs font-bold text-white transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              Start navigation
            </button>
          )}

          {!loading && !fallback && (
            <p className="mt-0.5 text-[11px] text-ink-muted">
              Driving route · OpenStreetMap
            </p>
          )}

          {fallback && (
            <p className="mt-1 text-[11px] leading-snug text-ink-muted">
              Live road routing failed, so a dashed straight line is shown to
              keep the demo moving.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
