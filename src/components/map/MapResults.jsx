// FRESH:FILE  Scrollable list of filtered donations and partners next to the map.
// FRESH:AREA  Map

import { MapPin, ShieldCheck } from 'lucide-react'
import UrgencyBadge from '../UrgencyBadge'
import { formatDistance } from '../../utils/format'

function EmptyResults({ view }) {
  return (
    <div className="rounded-[10px] border border-fresh-border bg-black/5 p-6 text-center dark:bg-white/5">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-[8px] bg-fresh-mint/15 text-fresh-mint">
        <MapPin className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="mt-3 text-sm font-bold text-fresh-ink dark:text-fresh-light-bg">No pins match these filters</p>
      <p className="mt-1 text-xs leading-relaxed text-fresh-ink-muted dark:text-fresh-ink-soft">
        {view === 'ngos'
          ? 'Try a wider distance or a different NGO name.'
          : 'Try a wider distance, another urgency or a different dish.'}
      </p>
    </div>
  )
}

export default function MapResults({ view, items, selectedId, onSelect }) {
  if (items.length === 0) return <EmptyResults view={view} />

  return (
    <ul className="space-y-1.5" aria-label={view === 'ngos' ? 'NGO results' : 'Food results'}>
      {items.map((item) => {
        const selected = item.id === selectedId
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              aria-pressed={selected}
              className={`w-full rounded-[10px] border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fresh-mint ${
                selected
                  ? 'border-fresh-mint/40 bg-fresh-mint/15 shadow-fresh-sm'
                  : 'border-transparent hover:border-fresh-border hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-fresh-ink dark:text-fresh-light-bg">
                    {view === 'ngos' ? item.name : item.foodName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-fresh-ink-muted dark:text-fresh-ink-soft">
                    {view === 'ngos'
                      ? item.focus
                      : `${item.quantity} servings · ${item.address}`}
                  </p>
                </div>
                {view === 'ngos' ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-fresh-mint/30 bg-fresh-mint/15 px-2 py-0.5 text-[10px] font-bold text-fresh-mint">
                    <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                    Verified
                  </span>
                ) : (
                  <UrgencyBadge urgency={item.urgency} className="shrink-0" />
                )}
              </div>

              <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-fresh-ink-muted dark:text-fresh-ink-soft">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                {view === 'ngos'
                  ? `${item.city} · ${formatDistance(item.distanceKm)} away`
                  : `${formatDistance(item.distanceKm)} away · ${item.diet === 'veg' ? 'Veg' : 'Non-veg'}`}
              </p>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
