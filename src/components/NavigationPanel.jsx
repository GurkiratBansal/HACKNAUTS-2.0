import { useEffect, useState } from 'react'
import {
  Car,
  ChevronUp,
  ExternalLink,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  Square,
  Zap,
} from 'lucide-react'
import { formatDistance } from '../utils/format'

const SPEEDS = [1, 2, 4, 8]

function stateLabel(state) {
  switch (state) {
    case 'routing':
      return 'Recalculating route…'
    case 'navigating':
      return 'Navigating'
    case 'off_route':
      return 'Off route'
    case 'arrived':
      return 'Arrived'
    case 'error':
      return 'Needs attention'
    default:
      return 'Ready'
  }
}

export default function NavigationPanel({
  nav,
  destinationName,
  destination,
  role = 'donor',
  follow = true,
  onFollowChange,
  onMarkPickedUp,
  onStop,
  reducedMotion = false,
}) {
  const [expanded, setExpanded] = useState(false)

  const state = nav?.state || 'idle'
  const remainingKm = nav?.remainingKm ?? 0
  const remainingMin = nav?.remainingMin ?? 0
  const progress = nav?.progressPercent ?? 0
  const sim = nav?.simulation || {}
  const error = nav?.error

  const googleMapsUrl = destination
    ? `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`
    : '#'

  // Announce meaningful state changes only.
  useEffect(() => {
    if (state === 'arrived') {
      // aria-live region below handles the text.
    }
  }, [state])

  const isArrived = state === 'arrived'

  return (
    <div className="pointer-events-auto">
      {/* Mobile bottom sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[1002] rounded-t-3xl border-t border-line bg-surface shadow-lift backdrop-blur-md transition-transform duration-300 lg:hidden ${
          expanded ? 'translate-y-0' : 'translate-y-[calc(100%-5.5rem)]'
        }`}
        role="dialog"
        aria-label="Navigation"
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Car className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 text-left">
              <span className="block truncate text-sm font-bold text-ink">
                {destinationName}
              </span>
              <span className="block text-[11px] text-ink-muted">
                {formatDistance(remainingKm)} · {Math.round(remainingMin)} min est.
              </span>
            </span>
          </span>
          <ChevronUp
            className={`h-4 w-4 text-ink-muted transition ${expanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        <div className="max-h-[70vh] overflow-y-auto px-4 pb-4">
          <PanelBody
            nav={nav}
            state={state}
            stateLabel={stateLabel(state)}
            remainingKm={remainingKm}
            remainingMin={remainingMin}
            progress={progress}
            sim={sim}
            error={error}
            isArrived={isArrived}
            destinationName={destinationName}
            destination={destination}
            role={role}
            follow={follow}
            onFollowChange={onFollowChange}
            onMarkPickedUp={onMarkPickedUp}
            onStop={onStop}
            googleMapsUrl={googleMapsUrl}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>

      {/* Desktop side card */}
      <div className="hidden lg:block">
        <div className="absolute right-4 top-4 z-[1002] w-80 rounded-3xl border border-line bg-surface/95 p-4 shadow-lift backdrop-blur-md">
          <PanelBody
            nav={nav}
            state={state}
            stateLabel={stateLabel(state)}
            remainingKm={remainingKm}
            remainingMin={remainingMin}
            progress={progress}
            sim={sim}
            error={error}
            isArrived={isArrived}
            destinationName={destinationName}
            destination={destination}
            role={role}
            follow={follow}
            onFollowChange={onFollowChange}
            onMarkPickedUp={onMarkPickedUp}
            onStop={onStop}
            googleMapsUrl={googleMapsUrl}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>
    </div>
  )
}

function PanelBody({
  nav,
  state,
  stateLabel,
  remainingKm,
  remainingMin,
  progress,
  sim,
  error,
  isArrived,
  destinationName,
  destination,
  role,
  follow,
  onFollowChange,
  onMarkPickedUp,
  onStop,
  googleMapsUrl,
  reducedMotion,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
            Live navigation
          </p>
          <h2 className="mt-0.5 truncate font-display text-lg font-extrabold text-ink">
            {destinationName}
          </h2>
        </div>
        {sim.active && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-saffron-100 px-2.5 py-1 text-[10px] font-bold text-saffron-800 ring-1 ring-inset ring-saffron-200 dark:bg-saffron-900/30 dark:text-saffron-200 dark:ring-saffron-800">
            <Zap className="h-3 w-3" aria-hidden="true" />
            Simulated movement
          </span>
        )}
      </div>

      <p
        role="status"
        aria-live="polite"
        className="text-sm font-semibold text-ink"
      >
        {stateLabel}
      </p>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {nav?.announcement}
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-danger-200 bg-danger-50 p-3 text-xs leading-relaxed text-danger-800 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-200">
          {error}
        </p>
      )}

      {!isArrived && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-line bg-elevated/60 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                Remaining
              </p>
              <p className="mt-0.5 text-lg font-extrabold text-ink">
                {formatDistance(remainingKm)}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-elevated/60 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                Estimate
              </p>
              <p className="mt-0.5 text-lg font-extrabold text-ink">
                {Math.round(remainingMin)} min
              </p>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-ink-muted">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Route progress"
              className="h-2 w-full overflow-hidden rounded-full bg-elevated ring-1 ring-inset ring-line"
            >
              <div
                className="h-full rounded-full bg-brand-600 transition-all duration-500"
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              />
            </div>
          </div>
        </>
      )}

      {isArrived && (
        <div className="rounded-2xl border border-success-200 bg-success-50 p-4 dark:border-success-800 dark:bg-success-800/20">
          <p className="text-sm font-bold text-success-800 dark:text-success-200">
            {role === 'ngo'
              ? `You have arrived at ${destinationName}`
              : `Reached ${destinationName}`}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            {role === 'ngo'
              ? 'Confirm the pickup with the donor, then update the status.'
              : 'Coordinate the drop-off with the organisation.'}
          </p>
          {role === 'ngo' && onMarkPickedUp && (
            <button
              type="button"
              onClick={onMarkPickedUp}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-bold text-white transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              Mark as picked up
            </button>
          )}
        </div>
      )}

      {/* Simulation controls */}
      <div className="rounded-2xl border border-line bg-elevated/40 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold text-ink">Simulate movement</p>
          <button
            type="button"
            onClick={() =>
              sim.active
                ? nav?.actions?.stopSimulation?.()
                : nav?.actions?.startSimulation?.()
            }
            aria-pressed={Boolean(sim.active)}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs font-bold text-ink transition hover:bg-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            {sim.active ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
            {sim.active ? 'Stop sim' : 'Start sim'}
          </button>
        </div>

        {sim.active && (
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-ink-muted">Speed</span>
              {SPEEDS.map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => nav?.actions?.setSimulationSpeed?.(speed)}
                  aria-pressed={sim.speed === speed}
                  className={`inline-flex min-h-8 items-center rounded-lg px-2 text-[11px] font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 ${
                    sim.speed === speed
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface text-ink ring-1 ring-inset ring-line hover:bg-elevated'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  sim.paused
                    ? nav?.actions?.resumeSimulation?.()
                    : nav?.actions?.pauseSimulation?.()
                }
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs font-bold text-ink transition hover:bg-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
              >
                {sim.paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
                {sim.paused ? 'Resume' : 'Pause'}
              </button>
              <button
                type="button"
                onClick={() => nav?.actions?.jumpNearDestination?.()}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs font-bold text-ink transition hover:bg-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                Jump near destination
              </button>
              <button
                type="button"
                onClick={() => nav?.actions?.triggerOffRouteTest?.()}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs font-bold text-ink transition hover:bg-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Off-route test
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onStop}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-sm font-bold text-ink transition hover:bg-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
        >
          <Square className="h-4 w-4" aria-hidden="true" />
          Stop navigation
        </button>
        <button
          type="button"
          onClick={() => onFollowChange?.(!follow)}
          aria-pressed={follow}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-sm font-bold text-ink transition hover:bg-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
        >
          {follow ? 'Following' : 'Re-center'}
        </button>
      </div>

      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-sm font-bold text-brand-700 transition hover:bg-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-brand-300"
      >
        Open in Google Maps
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
      </a>
    </div>
  )
}
