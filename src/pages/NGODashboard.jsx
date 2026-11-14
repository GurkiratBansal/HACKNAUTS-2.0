import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Filter,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Truck,
  UtensilsCrossed,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import FoodCard from '../components/FoodCard'
import EmptyState from '../components/EmptyState'
import { haversineKm } from '../utils/distance'
import { getUrgency, urgencyRank } from '../utils/urgency'

const ALL = 'all'

export default function NGODashboard() {
  const { currentUser, donations, ngos, acceptDonation } = useApp()
  const matchedNgo =
    ngos.find((n) => n.id === currentUser?.ngoId) ||
    ngos.find((n) => n.name === currentUser?.orgName)
  const origin =
    currentUser?.location ||
    (matchedNgo
      ? { lat: matchedNgo.lat, lng: matchedNgo.lng }
      : { lat: 28.6139, lng: 77.209 })
  const ngo =
    matchedNgo || {
      name: currentUser?.orgName || currentUser?.name || 'Your NGO',
      city: currentUser?.city || 'New Delhi',
      verified: false,
    }

  const [maxDistance, setMaxDistance] = useState('10')
  const [minQuantity, setMinQuantity] = useState('')
  const [category, setCategory] = useState(ALL)
  const [diet, setDiet] = useState(ALL)
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
        if (maxDistance !== ALL && d.distanceKm > Number(maxDistance)) return false
        if (minQuantity && Number(d.quantity) < Number(minQuantity)) return false
        if (category !== ALL && d.category !== category) return false
        if (diet !== ALL && d.diet !== diet) return false
        if (query.trim() && !`${d.foodName} ${d.address}`.toLowerCase().includes(query.trim().toLowerCase())) return false
        return true
      })
      .sort(
        (a, b) =>
          urgencyRank(getUrgency(a.deadline).key) -
            urgencyRank(getUrgency(b.deadline).key) ||
          a.distanceKm - b.distanceKm,
      )
  }, [allNearby, maxDistance, minQuantity, category, diet, query])

  const urgentCount = allNearby.filter((d) => getUrgency(d.deadline).key === 'urgent').length
  const totalServings = allNearby.reduce((sum, d) => sum + Number(d.quantity || 0), 0)

  const reset = () => {
    setMaxDistance('10')
    setMinQuantity('')
    setCategory(ALL)
    setDiet(ALL)
    setQuery('')
  }

  return (
    <main className="bg-[#fbfaf7]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">NGO dashboard</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {currentUser?.orgName || ngo.name}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4 text-emerald-600" /> {ngo.city}</span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                {ngo.verified ? 'Verified NGO' : 'Verification pending'}
              </span>
            </p>
          </div>
          <Link to="/map" className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-white px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50">
            <MapPin className="h-4 w-4" /> Open map view
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat icon={UtensilsCrossed} label="Available listings" value={available.length} />
          <Stat icon={Sparkles} label="Servings nearby" value={totalServings} />
          <Stat icon={Truck} label="Urgent pickups" value={urgentCount} tone="red" />
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <label htmlFor="ngo-search" className="sr-only">Search food or area</label>
              <input
                id="ngo-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search food or area"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
            <button type="button" onClick={reset} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100">
              Reset
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="filter-distance" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Distance</label>
                <select id="filter-distance" value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                  <option value="3">Within 3 km</option>
                  <option value="5">Within 5 km</option>
                  <option value="10">Within 10 km</option>
                  <option value="20">Within 20 km</option>
                  <option value="all">Any distance</option>
                </select>
              </div>
              <div>
                <label htmlFor="filter-qty" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Minimum servings</label>
                <input id="filter-qty" type="number" min="1" value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)} placeholder="Any" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <div>
                <label htmlFor="filter-category" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Category</label>
                <select id="filter-category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                  <option value="all">All categories</option>
                  <option value="cooked">Cooked meal</option>
                  <option value="snacks">Snacks</option>
                  <option value="bakery">Bakery</option>
                  <option value="raw">Raw / packaged</option>
                </select>
              </div>
              <div>
                <label htmlFor="filter-diet" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Diet</label>
                <select id="filter-diet" value={diet} onChange={(e) => setDiet(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                  <option value="all">Veg &amp; non-veg</option>
                  <option value="veg">Veg only</option>
                  <option value="non-veg">Non-veg only</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">Nearby available food</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
            <Filter className="h-3.5 w-3.5" /> Sorted by urgency, then distance
          </span>
        </div>

        {available.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={UtensilsCrossed}
              title="No listings match these filters"
              description="Widen the distance or clear a filter. New donations appear here as soon as donors publish them."
              action={<button type="button" onClick={reset} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">Clear filters</button>}
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

        <div className="mt-8 flex flex-col justify-between gap-3 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Future feature</p>
            <h2 className="mt-1 flex items-center gap-2 text-base font-bold text-slate-900">
              <Sparkles className="h-4 w-4 text-emerald-700" /> AI Food Safety Assistant
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Coming soon: photo-based freshness prompts and handling checklists.
              This demo does not fake AI output — inspection always stays with your team.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
            Coming soon
          </span>
        </div>
      </div>
    </main>
  )
}

function Stat({ icon: Icon, label, value, tone = 'emerald' }) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
  }
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xl font-extrabold tabular-nums text-slate-900">{value}</p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  )
}
