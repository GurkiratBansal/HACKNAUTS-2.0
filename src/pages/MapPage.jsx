import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ShieldCheck } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useUserLocation } from '../context/LocationContext'
import { useRoute } from '../hooks/useRoute'
import LocationPicker from '../components/LocationPicker'
import LocationBar from '../components/LocationBar'
import MapView from '../components/MapView'
import RouteLayer from '../components/RouteLayer'
import MapPanel from '../components/map/MapPanel'
import RouteSummary from '../components/RouteSummary'
import UrgencyBadge from '../components/UrgencyBadge'
import { haversineKm } from '../utils/distance'
import { getUrgency } from '../utils/urgency'
import { formatDistance } from '../utils/format'

const URGENCY_PIN = {
  fresh: 'var(--fresh-urgency-fresh)',
  soon: 'var(--fresh-urgency-soon)',
  urgent: 'var(--fresh-urgency-urgent)',
}

export default function MapPage() {
  const { currentUser, donations, ngos, addToast } = useApp()
  const { place } = useUserLocation()
  const role = currentUser?.role || 'donor'
  const [guestView, setGuestView] = useState('ngos')
  const view = currentUser ? (role === 'ngo' ? 'donations' : 'ngos') : guestView
  const [query, setQuery] = useState('')
  const [maxDistance, setMaxDistance] = useState('all')
  const [urgency, setUrgency] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [routeKey, setRouteKey] = useState(0)
  const [routeInfo, setRouteInfo] = useState(null)

  const origin = place

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

  // Selected pin is for reference only; routing is button‑triggered.
  const selectedItem = useMemo(() => {
    if (!selectedId || selectedId === 'my-ngo') return null
    const pool = view === 'ngos' ? visibleNgos : visibleDonations
    return pool.find((item) => item.id === selectedId) || null
  }, [selectedId, view, visibleNgos, visibleDonations])

  const routeFrom = place
  const routeTo = selectedItem
    ? view === 'ngos'
      ? { lat: selectedItem.lat, lng: selectedItem.lng }
      : selectedItem.location
    : null
  const routeFromLabel = place?.label || 'Your location'
  const routeToLabel = selectedItem
    ? view === 'ngos'
      ? selectedItem.name
      : selectedItem.foodName
    : ''

  // useRoute returns { route, loading, error } and retries when requestKey changes.
  const routeResult = useRoute(routeFrom, routeTo, routeKey)

  const selectedRoute = routeResult.route

  const center = place ? [place.lat, place.lng] : null

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

    if (currentUser && role === 'ngo' && origin) {
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

  // Button‑triggered routing: increment routeKey to fetch a fresh route.
  const triggerRoute = () => {
    if (!routeTo) {
      addToast('Select a pin first.', 'info')
      return
    }
    setRouteKey((k) => k + 1)
  }

  const clearRoute = () => {
    setRouteKey((k) => k + 1)
    setRouteInfo(null)
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
    onSelect: null,
    showDashboardCta: !currentUser,
    ownBase: Boolean(currentUser && role === 'ngo'),
  }

  if (!place) {
    return (
      <main className="min-h-[calc(100dvh-4.5rem)] bg-canvas px-4 py-8 sm:px-6">
        <LocationPicker idPrefix="map-location-picker" className="mx-auto max-w-2xl" />
      </main>
    )
  }

  return (
    <main className="relative h-[calc(100dvh-4.5rem)] overflow-hidden bg-canvas">
      <LocationBar className="absolute left-1/2 top-3 z-[1002] w-[min(92vw,440px)] -translate-x-1/2 lg:left-[calc(50%+190px)]" />

      <MapView
        center={center}
        zoom={12}
        height="100%"
        className="h-full"
        flat
        zoomControlPosition="topright"
        markers={markers}
        activeMarkerId={selectedId}
        onMarkerClick={setSelectedId}
      >
        <RouteLayer
          from={routeFrom}
          to={routeTo}
          route={selectedRoute}
          loading={routeResult.loading}
          error={routeResult.error}
          onRouteInfo={setRouteInfo}
        />
      </MapView>

      <MapPanel {...panelProps} />

      {routeResult.route && routeInfo?.status === 'ready' && (
        <RouteSummary
          info={routeInfo}
          fromLabel={routeFromLabel}
          toLabel={routeToLabel}
          onStart={triggerRoute}
          canStart={true}
          onRetry={clearRoute}
          googleMapsUrl={
            routeTo
              ? `https://www.google.com/maps/dir/?api=1&destination=${routeTo.lat},${routeTo.lng}`
              : undefined
          }
        />
      )}

      <p className="pointer-events-none absolute bottom-4 right-4 z-[1001] hidden rounded-xl border border-line bg-surface/90 px-3 py-2 text-[11px] text-ink-muted shadow-soft backdrop-blur lg:block">
        OpenStreetMap tiles · sample data for demo
      </p>
    </main>
  )
}