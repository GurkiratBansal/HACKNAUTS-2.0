import { ChevronRight } from 'lucide-react'
import Button from '../ui/Button'
import MapBaseLegend from './MapBaseLegend'
import MapFilters from './MapFilters'
import MapResults from './MapResults'
import MapViewToggle from './MapViewToggle'
import UrgencyLegend from './UrgencyLegend'

export default function MapPanel({
  view,
  count,
  showToggle,
  guestView,
  onGuestChange,
  query,
  onQueryChange,
  maxDistance,
  onDistanceChange,
  urgency,
  onUrgencyChange,
  onReset,
  items,
  selectedId,
  onSelect,
  showDashboardCta = false,
  ownBase = false,
}) {
  const ngoView = view === 'ngos'

  return (
    <aside
      aria-label="Map filters and results"
      className="absolute bottom-4 left-4 top-4 z-[1001] hidden w-[360px] flex-col overflow-hidden rounded-3xl border border-line bg-surface/95 shadow-lift backdrop-blur-md lg:flex"
    >
      <div className="shrink-0 border-b border-line p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
              Live network map
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink">
              Nearby map
            </h1>
          </div>
          <span className="inline-flex shrink-0 items-center rounded-full border border-line bg-elevated px-2.5 py-1 text-[11px] font-bold text-ink-soft">
            {count} {ngoView ? 'NGOs' : count === 1 ? 'listing' : 'listings'}
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
          {ngoView
           ? 'Verified NGO bases nearby. Pick a result to show it on the map.'
            : 'Open surplus, colour-coded by pickup urgency. Pick a result to open its pin.'}
        </p>
        {showToggle && (
          <MapViewToggle
            value={guestView}
            onChange={onGuestChange}
            className="mt-3"
          />
        )}
      </div>

      <div className="shrink-0 border-b border-line p-4">
        <MapFilters
          query={query}
          onQueryChange={onQueryChange}
          maxDistance={maxDistance}
          onDistanceChange={onDistanceChange}
          urgency={urgency}
          onUrgencyChange={onUrgencyChange}
          showUrgency={!ngoView}
          onReset={onReset}
        />
        {!ngoView && <UrgencyLegend className="mt-3" />}
        {ownBase && <MapBaseLegend className="mt-2" />}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        <MapResults
          view={view}
          items={items}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      </div>

      {!ngoView && showDashboardCta && (
        <div className="shrink-0 border-t border-line p-3">
          <Button
            to="/ngo"
            variant="secondary"
            size="md"
            iconRight={ChevronRight}
            className="w-full"
          >
            Open NGO dashboard
          </Button>
        </div>
      )}
    </aside>
  )
}
