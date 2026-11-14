import { MapPin, ShieldCheck } from 'lucide-react'
import UrgencyBadge from '../UrgencyBadge'
import { formatDistance } from '../../utils/format'

function EmptyResults({ view }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-elevated/60 p-6 text-center">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-surface text-brand-700 ring-1 ring-inset ring-line dark:text-brand-300">
        <MapPin className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="mt-3 text-sm font-bold text-ink">No pins match these filters</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">
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
              className={`w-full rounded-2xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
                selected
                  ? 'border-brand-400 bg-brand-50/80 shadow-soft dark:border-brand-600 dark:bg-brand-900/30'
                  : 'border-transparent hover:border-line hover:bg-elevated/70'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink">
                    {view === 'ngos' ? item.name : item.foodName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink-soft">
                    {view === 'ngos'
                      ? item.focus
                      : `${item.quantity} servings · ${item.address}`}
                  </p>
                </div>
                {view === 'ngos' ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-50 px-2 py-1 text-[10px] font-bold text-brand-700 ring-1 ring-inset ring-brand-200 dark:bg-brand-900/40 dark:text-brand-200 dark:ring-brand-700">
                    <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                    Verified
                  </span>
                ) : (
                  <UrgencyBadge urgency={item.urgency} className="shrink-0" />
                )}
              </div>

              <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-ink-muted">
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
