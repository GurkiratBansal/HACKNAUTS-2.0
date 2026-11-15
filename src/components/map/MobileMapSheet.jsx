// FRESH:FILE  Mobile bottom-sheet layout for the map page.
// FRESH:AREA  Map

import { ChevronDown, ChevronRight, ChevronUp, MapPin } from 'lucide-react'
import Button from '../ui/Button'
import MapBaseLegend from './MapBaseLegend'
import MapFilters from './MapFilters'
import MapResults from './MapResults'
import MapViewToggle from './MapViewToggle'
import UrgencyLegend from './UrgencyLegend'

export default function MobileMapSheet({
  open,
  onToggle,
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
    <section
      aria-label="Map results"
      className={`absolute inset-x-0 bottom-0 z-[1001] flex flex-col overflow-hidden rounded-t-[16px] border-t border-fresh-border bg-fresh-light-card/95 shadow-fresh-sm backdrop-blur-md dark:bg-fresh-dark-card/95 lg:hidden ${
        open ? 'h-[74vh]' : ''
      }`}
    >
      <h1 className="sr-only">Nearby map</h1>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="map-sheet-body"
        className="flex w-full shrink-0 flex-col items-center gap-1.5 px-4 pb-2.5 pt-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-fresh-mint"
      >
        <span className="h-1.5 w-12 rounded-full bg-fresh-border" aria-hidden="true" />
        <span className="flex w-full items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-fresh-mint/15 text-fresh-mint">
              <MapPin className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 text-left">
              <span className="block font-display text-sm font-bold text-fresh-ink dark:text-fresh-light-bg">
                Nearby map
              </span>
              <span className="block truncate text-[11px] text-fresh-ink-muted dark:text-fresh-ink-soft">
                {count} {ngoView ? 'verified NGOs' : count === 1 ? 'listing' : 'listings'}
                {' · '}
                {open ? 'Tap to hide the list' : 'Tap to see the list'}
              </span>
            </span>
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-fresh-border bg-black/5 text-fresh-ink-muted dark:bg-white/5 dark:text-fresh-ink-soft">
            {open ? (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            )}
          </span>
        </span>
      </button>

      <div
        id="map-sheet-body"
        className={`min-h-0 flex-1 overflow-y-auto border-t border-fresh-border px-4 pb-4 pt-3 ${
          open ? 'block' : 'hidden'
        }`}
      >
        {showToggle && (
          <MapViewToggle
            value={guestView}
            onChange={onGuestChange}
            className="mb-3"
          />
        )}
        <MapFilters
          idPrefix="map-mobile"
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
        <div className="mt-3">
          <MapResults
            view={view}
            items={items}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        </div>
        {!ngoView && showDashboardCta && (
          <Button
            to="/ngo"
            variant="secondary"
            size="md"
            iconRight={ChevronRight}
            className="mt-3 w-full"
          >
            Open NGO dashboard
          </Button>
        )}
      </div>
    </section>
  )
}
