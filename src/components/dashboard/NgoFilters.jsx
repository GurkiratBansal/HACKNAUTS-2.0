// FRESH:FILE  Filter controls for the NGO dashboard queue with removable filter chips and "Clear all".
// FRESH:AREA  Donations

import { RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react'
import Button from '../ui/Button'
import Field, { controlClass } from '../ui/Field'

const CATEGORIES = [
  { value: 'all', label: 'All categories' },
  { value: 'cooked', label: 'Cooked meal' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'raw', label: 'Raw / packaged' },
]

const DISTANCES = [
  { value: '3', label: 'Within 3 km' },
  { value: '5', label: 'Within 5 km' },
  { value: '10', label: 'Within 10 km' },
  { value: '20', label: 'Within 20 km' },
  { value: 'all', label: 'Any distance' },
]

const DIETS = [
  { value: 'all', label: 'Veg & non-veg' },
  { value: 'veg', label: 'Veg only' },
  { value: 'non-veg', label: 'Non-veg only' },
]

export default function NgoFilters({
  query,
  onQueryChange,
  filters,
  onFilterChange,
  showFilters,
  onToggleFilters,
  onReset,
}) {
  const set = (key) => (event) => onFilterChange(key, event.target.value)

  const activeChips = []
  if (query) {
    activeChips.push({
      key: 'query',
      label: `"${query}"`,
      remove: () => onQueryChange(''),
    })
  }
  if (filters.category && filters.category !== 'all') {
    const cat = CATEGORIES.find((c) => c.value === filters.category)
    activeChips.push({
      key: 'category',
      label: cat ? cat.label : filters.category,
      remove: () => onFilterChange('category', 'all'),
    })
  }
  if (filters.diet && filters.diet !== 'all') {
    const diet = DIETS.find((d) => d.value === filters.diet)
    activeChips.push({
      key: 'diet',
      label: diet ? diet.label : filters.diet,
      remove: () => onFilterChange('diet', 'all'),
    })
  }
  if (filters.maxDistance && filters.maxDistance !== '10' && filters.maxDistance !== 'all') {
    activeChips.push({
      key: 'distance',
      label: `< ${filters.maxDistance} km`,
      remove: () => onFilterChange('maxDistance', '10'),
    })
  }
  if (filters.minQuantity && Number(filters.minQuantity) > 0) {
    activeChips.push({
      key: 'qty',
      label: `≥ ${filters.minQuantity} servings`,
      remove: () => onFilterChange('minQuantity', ''),
    })
  }

  return (
    <section
      aria-label="Search and filter listings"
      className="rounded-[12px] border border-line bg-surface p-3 shadow-sm dark:border-white/10 dark:bg-[#0B2219] sm:p-4"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="ngo-search" className="sr-only">
            Search food or area
          </label>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted dark:text-[#A9BBB2]"
            aria-hidden="true"
          />
          <input
            id="ngo-search"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search food or area"
            className={`${controlClass(false)} pl-10`}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            icon={SlidersHorizontal}
            onClick={onToggleFilters}
            aria-expanded={showFilters}
            aria-controls="ngo-filter-panel"
            className="flex-1 sm:flex-none"
          >
            Filters
          </Button>
          <Button
            type="button"
            variant="ghost"
            icon={RotateCcw}
            onClick={onReset}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Removable filter chips with Clear all */}
      {activeChips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-line dark:border-white/10">
          <span className="text-[11px] font-semibold text-ink-muted dark:text-[#A9BBB2] mr-1">
            Active:
          </span>
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 rounded-[6px] border border-line bg-elevated px-2 py-0.5 text-xs font-semibold text-ink dark:border-white/15 dark:bg-[#06130F] dark:text-[#F2F7F4]"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={chip.remove}
                aria-label={`Remove filter ${chip.label}`}
                className="text-ink-muted hover:text-danger-600 dark:text-[#A9BBB2] dark:hover:text-danger-400"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-bold text-emerald-700 hover:underline dark:text-[#3EE6B8] ml-2"
          >
            Reset all
          </button>
        </div>
      )}

      {showFilters && (
        <div
          id="ngo-filter-panel"
          className="mt-3 grid gap-3 border-t border-line pt-3 dark:border-white/10 sm:grid-cols-2 xl:grid-cols-4"
        >
          <Field
            as="select"
            id="filter-distance"
            label="Distance"
            value={filters.maxDistance}
            onChange={set('maxDistance')}
          >
            {DISTANCES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Field>

          <Field
            id="filter-qty"
            label="Minimum servings"
            type="number"
            min="1"
            value={filters.minQuantity}
            onChange={set('minQuantity')}
            placeholder="Any"
          />

          <Field
            as="select"
            id="filter-category"
            label="Category"
            value={filters.category}
            onChange={set('category')}
          >
            {CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Field>

          <Field
            as="select"
            id="filter-diet"
            label="Diet"
            value={filters.diet}
            onChange={set('diet')}
          >
            {DIETS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Field>
        </div>
      )}
    </section>
  )
}
