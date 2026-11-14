import { useMemo, useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, Phone, ShieldCheck } from 'lucide-react'
import { useApp } from '../context/AppContext'
import MapView from '../components/MapView'
import RouteLayer from '../components/RouteLayer'
import MapPanel from '../components/map/MapPanel'
import MobileMapSheet from '../components/map/MobileMapSheet'
import RouteSummary from '../components/RouteSummary'
import NavigationLayer from '../components/map/NavigationLayer'
import FollowController from '../components/map/FollowController'
import NavigationPanel from '../components/NavigationPanel'
import { useRoute } from '../hooks/useRoute'
import { useNavigation } from '../hooks/useNavigation'
import UrgencyBadge from '../components/UrgencyBadge'
import { haversineKm } from '../utils/distance'
import { getUrgency } from '../utils/urgency'
import { recommendRoute } from '../utils/routeScore'
import { formatDistance } from '../utils/format'

const FALLBACK_ORIGIN = { lat: 28.6139, lng: 77.209 }

const URGENCY_PIN = {
  fresh: 'var(--fresh-urgency-fresh)',
  soon: 'var(--fresh-urgency-soon)',
  urgent: 'var(--fresh-urgency-urgent)',
}

export default function MapPage() {
  const { currentUser, donations, ngos, advanceStatus, addToast } = useApp()
  const [searchParams] = useSearchParams()
  const role = currentUser?.role || 'donor'
  const [guestView, setGuestView] = useState('ngos')
  const view = currentUser ? (role === 'ngo' ? 'donations' : 'ngos') : guestView
  const [query, setQuery] = useState('')
  const [maxDistance, setMaxDistance] = useState('all')
  const [urgency, setUrgency] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [routeInfo, setRouteInfo] = useState(null)
  const [follow, setFollow] = useState(true)
  const [routeMode, setRouteMode] = useState('drive')
  const demoMode = searchParams.get('demo') === '1'

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

  // The selected pin drives the road route. Routing only starts for signed-in
  // users because only they have a real origin (their donor/NGO location).
  const selectedItem = useMemo(() => {
    if (!selectedId || selectedId === 'my-ngo') return null
    const pool = view === 'ngos' ? visibleNgos : visibleDonations
    return pool.find((item) => item.id === selectedId) || null
  }, [selectedId, view, visibleNgos, visibleDonations])

  const routeFrom = currentUser?.location || null
  const routeTo = selectedItem
    ? view === 'ngos'
      ? { lat: selectedItem.lat, lng: selectedItem.lng }
      : selectedItem.location
    : null
  const routeFromLabel =
    currentUser?.orgName || currentUser?.name || 'Your location'
  const routeToLabel = selectedItem
    ? view === 'ngos'
      ? selectedItem.name
      : selectedItem.foodName
    : ''

  useEffect(() => {
    const focus = searchParams.get('focus') || searchParams.get('navigate')
    if (!focus || focus === selectedId) return
    const pool = view === 'ngos' ? visibleNgos : visibleDonations
    if (pool.some((item) => item.id === focus)) setSelectedId(focus)
  }, [searchParams, view, visibleNgos, visibleDonations, selectedId])

  const routeResult = useRoute(routeFrom, routeTo, routeMode)

  const selectedRoute = routeResult.selectedRoute
  const nav = useNavigation({
    route: selectedRoute,
    destination: routeTo,
    destinationName: routeToLabel || 'destination',
    role: currentUser?.role || 'donor',
    mode: routeMode,
    destinationValid: Boolean(selectedItem),
    onArrive: () => {
      // no-op: arrival UI is driven by nav state
    },
  })

  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const center =
    follow && nav.snappedPosition
      ? [nav.snappedPosition.lat, nav.snappedPosition.lng]
      : [origin.lat, origin.lng]
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

  const handleStartNavigation = () => {
    if (routeResult.route) nav.actions.start()
    else addToast('Route is still loading. Try again in a moment.', 'info')
  }

  const handleStopNavigation = () => {
    nav.actions.stop()
    setFollow(true)
  }

  const handleMarkPickedUp = () => {
    if (selectedId) {
      const res = advanceStatus(selectedId)
      if (res?.ok) nav.actions.stop()
    }
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
        <FollowController onDrag={() => setFollow(false)} />
        {nav.state === 'idle' ? (
          <RouteLayer
            from={routeFrom}
            to={routeTo}
            routes={routeResult.routes}
            loading={routeResult.loading}
            error={routeResult.error}
            selectedRouteId={routeResult.selectedId}
            onSelectRoute={routeResult.selectRoute}
            onRouteInfo={setRouteInfo}
          />
        ) : (
          <NavigationLayer
            route={nav.route || selectedRoute}
            position={nav.position}
            snappedPosition={nav.snappedPosition}
            reducedMotion={reduceMotion}
          />
        )}
      </MapView>

      <MapPanel {...panelProps} />

      {nav.state === 'idle' && (
        <MobileMapSheet
          {...panelProps}
          open={sheetOpen}
          onToggle={() => setSheetOpen((value) => !value)}
        />
      )}

      {nav.state === 'idle' ? (
        <div className="space-y-2">
          <div className="flex items-center gap-1 rounded-2xl border border-line bg-surface/95 p-1 shadow-soft backdrop-blur-md">
            {['drive', 'bike', 'walk'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setRouteMode(mode)}
                aria-pressed={routeMode === mode}
                className={`inline-flex min-h-9 flex-1 items-center justify-center rounded-xl text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 ${
                  routeMode === mode
                    ? 'bg-brand-600 text-white'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {mode === 'drive' ? 'Drive' : mode === 'bike' ? 'Bike' : 'Walk'}
              </button>
            ))}
          </div>
          <RouteSummary
            info={routeInfo}
            fromLabel={routeFromLabel}
            toLabel={routeToLabel}
            routes={routeResult.routes}
            selectedRouteId={routeResult.selectedId}
            onSelectRoute={routeResult.selectRoute}
            onStart={handleStartNavigation}
            canStart={Boolean(routeResult.routes?.length && routeTo)}
            onRetry={routeResult.refetch}
            googleMapsUrl={
              routeTo
                ? `https://www.google.com/maps/dir/?api=1&destination=${routeTo.lat},${routeTo.lng}`
                : undefined
            }
          />
        </div>
      ) : (
        <NavigationPanel
          nav={nav}
          destinationName={routeToLabel || 'destination'}
          destination={routeTo}
          role={currentUser?.role || 'donor'}
          follow={follow}
          onFollowChange={setFollow}
          onMarkPickedUp={handleMarkPickedUp}
          onStop={handleStopNavigation}
          reducedMotion={reduceMotion}
        />
      )}

      <p className="pointer-events-none absolute bottom-4 right-4 z-[1001] hidden rounded-xl border border-line bg-surface/90 px-3 py-2 text-[11px] text-ink-muted shadow-soft backdrop-blur lg:block">
        OpenStreetMap tiles · sample data for demo
      </p>
    </main>
  )
}
