import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { formatDistance } from '../utils/format'
import { recommendRoute } from '../utils/routeScore'

// Alternatives are a later feature. The app currently renders one fastest
// OSRM route, so this picker is intentionally not mounted by RouteSummary.
const ICONS = {
  Fastest: '⚡',
  Shortest: '📏',
  'Fewest turns': '↩',
  Recommended: '★',
}

export default function RouteOptions({
  routes,
  selectedRouteId,
  onSelect,
  className = '',
}) {
  const [stepsOpen, setStepsOpen] = useState(false)
  if (!Array.isArray(routes) || routes.length <= 1) return null

  const result = recommendRoute(routes)
  const labelsById = result.recommendedLabels || {}
  const selected = routes.find((route) => route.id === selectedRouteId) || routes[0]

  const handleKeyDown = (event, index) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault()
      const next = routes[(index + 1) % routes.length]
      onSelect?.(next.id)
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault()
      const prev = routes[(index - 1 + routes.length) % routes.length]
      onSelect?.(prev.id)
    }
  }

  return (
    <div className={className}>
      <div
        role="radiogroup"
        aria-label="Route options"
        className="space-y-2"
      >
        {routes.map((route, index) => {
          const labels = labelsById[String(route.id)] || []
          const isSelected = route.id === selected.id
          return (
            <button
              key={route.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onSelect?.(route.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
                isSelected
                  ? 'border-brand-400 bg-brand-50/80 shadow-soft dark:border-brand-600 dark:bg-brand-900/30'
                  : 'border-line bg-surface hover:border-brand-300 hover:bg-elevated/60'
              }`}
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-current text-[10px] font-bold">
                {isSelected ? '●' : ''}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-1.5">
                  {labels.map((label) => (
                    <span
                      key={label}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        label === 'Recommended'
                          ? 'bg-brand-600 text-white'
                          : 'bg-elevated text-ink-soft ring-1 ring-inset ring-line'
                      }`}
                    >
                      <span aria-hidden="true">{ICONS[label] || '•'}</span>
                      {label}
                    </span>
                  ))}
                </span>
                <span className="mt-1 block text-sm font-bold text-ink">
                  {formatDistance(route.distanceKm)} · about {route.durationMin} min
                </span>
                <span className="block text-[11px] text-ink-muted">
                  {route.turnCount} turn{route.turnCount === 1 ? '' : 's'}
                  {route.summary ? ` · ${route.summary}` : ''}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {result.reason && (
        <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">
          Recommended: {result.reason}.
        </p>
      )}

      {selected?.steps?.length && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setStepsOpen((value) => !value)}
            aria-expanded={stepsOpen}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 hover:underline dark:text-brand-300"
          >
            <ChevronRight
              className={`h-3 w-3 transition ${stepsOpen ? 'rotate-90' : ''}`}
              aria-hidden="true"
            />
            Route steps
          </button>
          {stepsOpen && (
            <ol className="mt-2 space-y-1 text-[11px] text-ink-muted">
              {selected.steps.map((step, index) => (
                <li key={index} className="flex gap-2">
                  <span className="shrink-0 font-semibold text-ink-soft">
                    {index + 1}.
                  </span>
                  <span className="min-w-0">
                    {step.instruction}
                    {step.distanceKm > 0 && (
                      <span className="text-ink-muted">
                        {' '}
                        ({formatDistance(step.distanceKm)})
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  )
}
