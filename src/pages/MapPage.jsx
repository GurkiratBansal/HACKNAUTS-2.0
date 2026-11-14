import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Phone, ShieldCheck } from 'lucide-react'
import { useApp } from '../context/AppContext'
import MapView from '../components/MapView'
import MapPanel from '../components/map/MapPanel'
import MobileMapSheet from '../components/map/MobileMapSheet'
import UrgencyBadge from '../components/UrgencyBadge'
import { haversineKm } from '../utils/distance'
import { getUrgency } from '../utils/urgency'
import { formatDistance } from '../utils/format'

const FALLBACK_ORIGIN = { lat: 28.6139, lng: 77.209 }

const URGENCY_PIN = {
  fresh: 'var(--fresh-urgency-fresh)',
  soon: 'var(--fresh-urgency-soon)',
  urgent: 'var(--fresh-urgency-urgent)',
}

export default function MapPage() {
  const { currentUser, donations, ngos } = useApp()
  const role = currentUser?.role || 'donor'
  const [guestView, setGuestView] = useState('ngos')
  const view = currentUser ? (role === 'ngo' ? 'donations' : 'ngos') : guestView
  const [query, setQuery] = useState('')
  const [maxDistance, setMaxDistance] = useState('all')
  const [urgency, setUrgency] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const origin = currentUser?.location || FALLBACK_ORIGIN

  const verifiedNgos = useMemo(
    () =>
      ngos
        .filter((ngo) => ngo.verified)
        .map((ngo) => ({ ...ngo, distanceKm: haversineKm(origin, ngo) }))
        .sort((a, b) => a.distanceKm - b.distanceKm),
    [ngos, origin],
  )

  const available = useMemo(
    () =>
      donations
        .filter((donation) => donation.status === 'available')
        .filter((donation) => getUrgency(donation.deadline).key !== 'expired')
        .map((donation) => ({
          ...donation,
          distanceKm: haversineKm(origin, donation.location),
          urgency: getUrgency(donation.deadline),
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm),
    [donations, origin],
  )

  const visibleNgos = useMemo(() => {
    const search = query.trim().toLowerCase()
    return verifiedNgos.filter((ngo) => {
      if (maxDistance !== 'all' && ngo.distanceKm > Number(maxDistance)) return false
      if (
        search &&
        !`${ngo.name} ${ngo.focus} ${ngo.city}`.toLowerCase().includes(search)
      ) {
        return false
      }
      return true
    })
  }, [verifiedNgos, query, maxDistance])

  const visibleDonations = useMemo(() => {
    const search = query.trim().toLowerCase()
    return available.filter((donation) => {
      if (maxDistance !== 'all' && donation.distanceKm > Number(maxDistance)) {
        return false
      }
      if (urgency !== 'all' && donation.urgency.key !== urgency) return false
      if (
        search &&
        !`${donation.foodName} ${donation.address}`
          .toLowerCase()
          .includes(search)
      ) {
        return false
      }
      return true
    })
  }, [available, query, maxDistance, urgency])

  const items = view === 'ngos' ? visibleNgos : visibleDonations

  const markers = useMemo(() => {
    const list =
      view === 'ngos'
        ? visibleNgos.map((ngo) => ({
            id: ngo.id,
            lat: ngo.lat,
            lng: ngo.lng,
            kind: 'ngo',
            color: URGENCY_PIN.fresh,
            title: ngo.name,
            popup: (
              <div className="w-56">
                <p className="text-sm font-bold text-ink">{ngo.name}</p>
                <p className="mt-0.5 text-xs text-ink-soft">{ngo.focus}</p>
                <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-brand-700 dark:text-brand-300">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  Verified NGO
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  {ngo.city} · {formatDistance(ngo.distanceKm)} away
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-ink-soft">
                  <Phone className="h-3 w-3" aria-hidden="true" />
                  {ngo.phone}
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">
                  Sample NGO for the demo. Donors can call to coordinate a
                  drop-off.
                </p>
              </div>
            ),
          }))
        : visibleDonations.map((donation) => ({
            id: donation.id,
            lat: donation.location.lat,
            lng: donation.location.lng,
            kind: 'food',
            color: URGENCY_PIN[donation.urgency.key] || URGENCY_PIN.fresh,
            ink:
              donation.urgency.key === 'soon' ? '2 44 34' : undefined,
            title: donation.foodName,
            popup: (
              <div className="w-60">
                <p className="text-sm font-bold text-ink">{donation.foodName}</p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {donation.quantity} servings ·{' '}
                  {formatDistance(donation.distanceKm)} away
                </p>
                <div className="mt-1.5">
                  <UrgencyBadge urgency={donation.urgency} />
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">
                  {donation.address}
                </p>
                <Link
                  to={`/donation/${donation.id}`}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:underline dark:text-brand-300"
                >
                  View details
                  <ChevronRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </div>
            ),
          }))

    if (currentUser && role === 'ngo') {
      list.push({
        id: 'my-ngo',
        lat: origin.lat,
        lng: origin.lng,
        kind: 'you',
        color: 'var(--fresh-you)',
        title: 'Your NGO location',
        popup: (
          <div className="w-48">
            <p className="text-sm font-bold text-ink">
              {currentUser.orgName || currentUser.name}
            </p>
            <p className="text-xs text-ink-soft">Your registered pickup base</p>
          </div>
        ),
      })
    }

    return list
  }, [view, visibleNgos, visibleDonations, currentUser, role, origin])

  const clearSelection = () => setSelectedId(null)

  const changeQuery = (value) => {
    setQuery(value)
    clearSelection()
  }

  const changeDistance = (value) => {
    setMaxDistance(value)
    clearSelection()
  }

  const changeUrgency = (value) => {
    setUrgency(value)
    clearSelection()
  }

  const resetFilters = () => {
    setQuery('')
    setMaxDistance('all')
    setUrgency('all')
    clearSelection()
  }

  const changeGuestView = (next) => {
    setGuestView(next)
    clearSelection()
  }

  const handleSelect = (id) => {
    setSelectedId(id)
    setSheetOpen(false)
  }

  const panelProps = {
    view,
    count: items.length,
    showToggle: !currentUser,
    guestView,
    onGuestChange: changeGuestView,
    query,
    onQueryChange: changeQuery,
    maxDistance,
    onDistanceChange: changeDistance,
    urgency,
    onUrgencyChange: changeUrgency,
    onReset: resetFilters,
    items,
    selectedId,
    onSelect: handleSelect,
    showDashboardCta: !currentUser,
    ownBase: Boolean(currentUser && role === 'ngo'),
  }

  return (
    <main className="relative h-[calc(100dvh-4.5rem)] overflow-hidden bg-canvas">
      <MapView
        center={[origin.lat, origin.lng]}
        zoom={12}
        height="100%"
        className="h-full"
        flat
        zoomControlPosition="topright"
        markers={markers}
        activeMarkerId={selectedId}
        onMarkerClick={setSelectedId}
      />

      <MapPanel {...panelProps} />

      <MobileMapSheet
        {...panelProps}
        open={sheetOpen}
        onToggle={() => setSheetOpen((value) => !value)}
      />

      <p className="pointer-events-none absolute bottom-4 right-4 z-[1001] hidden rounded-xl border border-line bg-surface/90 px-3 py-2 text-[11px] text-ink-muted shadow-soft backdrop-blur lg:block">
        OpenStreetMap tiles · sample data for demo
      </p>
    </main>
  )
}
