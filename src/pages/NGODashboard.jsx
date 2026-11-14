import { useMemo, useState } from 'react'
import {
  Filter,
  MapPin,
  ShieldCheck,
  Sparkles,
  Truck,
  UtensilsCrossed,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useUserLocation } from '../context/LocationContext'
import FoodCard from '../components/FoodCard'
import LocationPicker from '../components/LocationPicker'
import LocationBar from '../components/LocationBar'
import EmptyState from '../components/EmptyState'
import Button from '../components/ui/Button'
import DashboardShell from '../components/dashboard/DashboardShell'
import NgoFilters from '../components/dashboard/NgoFilters'
import NgoSidePanels from '../components/dashboard/NgoSidePanels'
import StatTile from '../components/dashboard/StatTile'
import { haversineKm } from '../utils/distance'
import { getUrgency, urgencyRank } from '../utils/urgency'

const ALL = 'all'
const DEFAULT_FILTERS = {
  maxDistance: '10',
  minQuantity: '',
  category: ALL,
  diet: ALL,
}

export default function NGODashboard() {
  const { currentUser, donations, ngos, acceptDonation } = useApp()
  const { place } = useUserLocation()
  const matchedNgo =
    ngos.find((n) => n.id === currentUser?.ngoId) ||
    ngos.find((n) => n.name === currentUser?.orgName)
  const origin = place
  const ngo =
    matchedNgo || {
      name: currentUser?.orgName || currentUser?.name || 'Your NGO',
      city: currentUser?.city || 'Your area',
      verified: false,
    }

  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Unfiltered pool drives the summary stats; the card grid below is filtered.
  const allNearby = useMemo(
    () =>
      donations
        .filter((d) => d.status === 'available')
        .filter((d) => getUrgency(d.deadline).key !== 'expired')
        .map((d) => ({ ...d, distanceKm: haversineKm(origin, d.location) })),
    [donations, origin],
  )

  const available = useMemo(() => {
    return allNearby
      .filter((d) => {
        if (filters.maxDistance !== ALL && d.distanceKm > Number(filters.maxDistance)) return false
        if (filters.minQuantity && Number(d.quantity) < Number(filters.minQuantity)) return false
        if (filters.category !== ALL && d.category !== filters.category) return false
        if (filters.diet !== ALL && d.diet !== filters.diet) return false
        if (
          query.trim() &&
          !`${d.foodName} ${d.address}`.toLowerCase().includes(query.trim().toLowerCase())
        ) {
          return false
        }
        return true
      })
      .sort(
        (a, b) =>
          urgencyRank(getUrgency(a.deadline).key) -
            urgencyRank(getUrgency(b.deadline).key) ||
          a.distanceKm - b.distanceKm,
      )
  }, [allNearby, filters, query])

  const urgentCount = allNearby.filter(
    (d) => getUrgency(d.deadline).key === 'urgent',
  ).length
  const totalServings = allNearby.reduce(
    (sum, d) => sum + Number(d.quantity || 0),
    0,
  )

  const setFilter = (key, value) =>
    setFilters((previous) => ({ ...previous, [key]: value }))

  const reset = () => {
    setFilters(DEFAULT_FILTERS)
    setQuery('')
  }

  if (!place) {
    return (
      <main className="min-h-[calc(100dvh-4.5rem)] bg-canvas px-4 py-8 sm:px-6">
        <LocationPicker idPrefix="ngo-location-picker" className="mx-auto max-w-2xl" />
      </main>
    )
  }

  return (
    <DashboardShell
      role="ngo"
      eyebrow="NGO dashboard"
      title={currentUser?.orgName || ngo.name}
      badge={
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${
            ngo.verified
              ? 'bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-900/40 dark:text-brand-200 dark:ring-brand-700'
              : 'bg-warning-50 text-warning-800 ring-warning-200 dark:bg-warning-900/30 dark:text-warning-200 dark:ring-warning-800'
          }`}
        >
          <ShieldCheck className="h-3 w-3" aria-hidden="true" />
          {ngo.verified ? 'Verified NGO' : 'Verification pending'}
        </span>
      }
      description={
        <span className="inline-flex flex-wrap items-center gap-1.5">
          <MapPin
            className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300"
            aria-hidden="true"
          />
          {ngo.city} · Live surplus from donors near your team
        </span>
      }
      actions={
        <Button to="/map" variant="outline" icon={MapPin}>
          Open map view
        </Button>
      }
    >
      <LocationBar className="mb-5" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile
          icon={UtensilsCrossed}
          label="Available listings"
          value={available.length}
          hint="Match your current filters"
          tone="brand"
        />
        <StatTile
          icon={Sparkles}
          label="Servings nearby"
          value={totalServings}
          hint="Across all open listings"
          tone="saffron"
        />
        <StatTile
          icon={Truck}
          label="Urgent pickups"
          value={urgentCount}
          hint="Under 30 minutes left"
          tone="danger"
        />
      </div>

      <div className="mt-5">
        <NgoFilters
          query={query}
          onQueryChange={setQuery}
          filters={filters}
          onFilterChange={setFilter}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((value) => !value)}
          onReset={reset}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight text-ink">
                Nearby available food
              </h2>
              <p className="mt-0.5 text-xs text-ink-muted">
                Showing {available.length} of {allNearby.length} open listings
                within your filters.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-ink-soft shadow-soft">
              <Filter className="h-3.5 w-3.5" aria-hidden="true" />
              Sorted by urgency, then distance
            </span>
          </div>

          {available.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={UtensilsCrossed}
                title="No listings match these filters"
                description="Widen the distance or clear a filter. New donations appear here as soon as donors publish them."
                action={
                  <Button type="button" variant="secondary" onClick={reset}>
                    Clear filters
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {available.map((donation) => (
                <FoodCard
                  key={donation.id}
                  donation={donation}
                  distanceKm={donation.distanceKm}
                  onAccept={(d) => acceptDonation(d.id)}
                />
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-col justify-between gap-3 rounded-3xl border border-dashed border-brand-300 bg-brand-50/60 p-5 dark:border-brand-700 dark:bg-brand-900/20 sm:flex-row sm:items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">
                Future feature
              </p>
              <h2 className="mt-1 flex items-center gap-2 font-display text-base font-bold text-ink">
                <Sparkles
                  className="h-4 w-4 text-brand-600 dark:text-brand-300"
                  aria-hidden="true"
                />
                AI Food Safety Assistant
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-soft">
                Coming soon: photo-based freshness prompts and handling
                checklists. This demo does not fake AI output — inspection always
                stays with your team.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-brand-800 dark:text-brand-200">
              Coming soon
            </span>
          </div>
        </div>

        <NgoSidePanels />
      </div>
    </DashboardShell>
  )
}
