import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { controlClass } from '../ui/Field'

const DISTANCES = [
  { value: 'all', label: 'Any distance' },
  { value: '3', label: 'Within 3 km' },
  { value: '5', label: 'Within 5 km' },
  { value: '10', label: 'Within 10 km' },
  { value: '25', label: 'Within 25 km' },
  { value: '50', label: 'Within 50 km' },
]

const URGENCY_CHIPS = [
  { value: 'all', label: 'All urgency', icon: SlidersHorizontal, active: 'bg-brand-600 text-white' },
  {
    value: 'fresh',
    label: 'Fresh',
    icon: CheckCircle2,
    active: 'bg-brand-600 text-white',
  },
  {
    value: 'soon',
    label: 'Soon',
    icon: Clock,
    active: 'bg-warning-500 text-brand-950',
  },
  {
    value: 'urgent',
    label: 'Urgent',
    icon: AlertTriangle,
    active: 'bg-danger-600 text-white',
  },
]

export default function MapFilters({
  idPrefix = 'map',
  query,
  onQueryChange,
  maxDistance,
  onDistanceChange,
  urgency,
  onUrgencyChange,
  showUrgency = true,
  onReset,
}) {
  const searchId = `${idPrefix}-search`
  const distanceId = `${idPrefix}-distance`
  const filtersActive =
    query.trim() !== '' ||
    maxDistance !== 'all' ||
    (showUrgency && urgency !== 'all')

  return (
    <div className="space-y-3">
      <div className="relative">
        <label htmlFor={searchId} className="sr-only">
          Search map
        </label>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
          aria-hidden="true"
        />
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={showUrgency ? 'Search food or area' : 'Search NGOs or area'}
          className={`${controlClass(false)} pl-10`}
        />
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor={distanceId} className="sr-only">
          Distance from your base
        </label>
        <select
          id={distanceId}
          value={maxDistance}
          onChange={(event) => onDistanceChange(event.target.value)}
          className={controlClass(false)}
        >
          {DISTANCES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {filtersActive && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-xl px-2 text-xs font-bold text-brand-700 transition hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-brand-300 dark:hover:bg-brand-900/30"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Clear
          </button>
        )}
      </div>

      {showUrgency && (
        <div role="group" aria-label="Filter by urgency" className="flex flex-wrap gap-1.5">
          {URGENCY_CHIPS.map((chip) => {
            const Icon = chip.icon
            const active = urgency === chip.value
            return (
              <button
                key={chip.value}
                type="button"
                onClick={() => onUrgencyChange(chip.value)}
                aria-pressed={active}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 ${
                  active
                    ? `${chip.active} shadow-soft`
                    : 'bg-elevated text-ink-soft ring-1 ring-inset ring-line hover:bg-surface hover:text-ink'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {chip.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
