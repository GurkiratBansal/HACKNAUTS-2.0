// FRESH:FILE  Filter controls for the NGO dashboard queue.
// FRESH:AREA  Donations

import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
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

  return (
    <section
      aria-label="Search and filter listings"
      className="rounded-3xl border border-line bg-surface p-3 shadow-soft sm:p-4"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="ngo-search" className="sr-only">
            Search food or area
          </label>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
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

      {showFilters && (
        <div
          id="ngo-filter-panel"
          className="mt-3 grid gap-3 border-t border-line pt-3 sm:grid-cols-2 xl:grid-cols-4"
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
