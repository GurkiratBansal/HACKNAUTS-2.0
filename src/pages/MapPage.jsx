import { useMemo, useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { ChevronRight, ShieldCheck } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useUserLocation } from '../context/LocationContext'
import { useRoute } from '../hooks/useRoute'
import { getRoute } from '../services/routing'
import LocationPicker from '../components/LocationPicker'
import LocationBar from '../components/LocationBar'
import MapView from '../components/MapView'
import RouteLayer from '../components/RouteLayer'
import MapPanel from '../components/map/MapPanel'
import RouteSummary from '../components/RouteSummary'
import UrgencyBadge from '../components/UrgencyBadge'
import ReliefTag from '../components/ReliefTag'
import NeedsBoard from '../components/NeedsBoard'
import HazardLayer from '../components/HazardLayer'
import { haversineKm } from '../utils/distance'
import { getUrgency } from '../utils/urgency'
import { formatDistance } from '../utils/format'
import demoLudhiana, { isDemoPlaceActive } from '../data/demoLudhiana'
import { useEmergency } from '../context/EmergencyContext'
import { makeSampleHazardZones } from '../data/hazardZones'

const URGENCY_PIN = {
  fresh: 'var(--fresh-urgency-fresh)',
  soon: 'var(--fresh-urgency-soon)',
  urgent: 'var(--fresh-urgency-urgent)',
}

export default function MapPage() {
  const { currentUser, donations, ngos, addToast } = useApp()
  const { place } = useUserLocation()
  const { activeAlert, needs } = useEmergency()
  const role = currentUser?.role || 'donor'
  const [guestView, setGuestView] = useState('ngos')
  const view = currentUser ? (role === 'ngo' ? 'donations' : 'ngos') : guestView
  const [query, setQuery] = useState('')
  const [maxDistance, setMaxDistance] = useState('all')
  const [urgency, setUrgency] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [routeTargetId, setRouteTargetId] = useState(null)
  const [routeKey, setRouteKey] = useState(0)
  const [routeInfo, setRouteInfo] = useState(null)

  // ?demo=1 routing check panel state
  const [demoRunning, setDemoRunning] = useState(false)
  const [demoIndex, setDemoIndex] = useState(0)
  const [demoResults, setDemoResults] = useState([])
  const [demoRunId, setDemoRunId] = useState(0)
  const [searchParams] = useSearchParams()

  const origin = place
  const demoActive = isDemoPlaceActive(place)
  const emergencyAlert = activeAlert(place)
  const hazardZones = emergencyAlert ? makeSampleHazardZones(place) : []

  const verifiedNgos = useMemo(
    () =>
      ngos
        .filter((ngo) => ngo.verified || (demoActive && ngo.isDemo))
        .map((ngo) => ({ ...ngo, distanceKm: haversineKm(origin, ngo) }))
        .sort((a, b) => a.distanceKm - b.distanceKm),
    [ngos, origin, demoActive],
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

  const routeItem = useMemo(() => {
    if (!routeTargetId) return null
    const pool = view === 'ngos' ? visibleNgos : visibleDonations
    return pool.find((item) => item.id === routeTargetId) || null
  }, [routeTargetId, view, visibleNgos, visibleDonations])

  const routeFrom = place
  const routeTo = routeItem
    ? view === 'ngos'
      ? { lat: routeItem.lat, lng: routeItem.lng }
      : routeItem.location
    : null
  const routeFromLabel = place?.label || 'Your location'
  const routeToLabel = routeItem
    ? view === 'ngos'
      ? routeItem.name
      : routeItem.foodName
    : ''

  const selectItem = (id) => {
    setSelectedId(id)
    setRouteTargetId(null)
    setRouteKey(0)
    setRouteInfo(null)
  }

  const requestRouteFor = (id) => {
    setSelectedId(null)
    setRouteTargetId(id)
    setRouteInfo(null)
    setRouteKey((key) => key + 1)
  }

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
                  {ngo.verified ? 'Verified' : 'Verification pending'} · {ngo.type}
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  {ngo.area || ngo.city} · {formatDistance(ngo.distanceKm)} away
                </p>
                {ngo.isDemo && (
                  <p className="mt-1 text-[11px] font-semibold text-ink-muted">
                    Sample data
                  </p>
                )}
                <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">
                  Sample NGO. Donors can call to coordinate a
                  drop-off.
                </p>
                <button
                  type="button"
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation()
                    requestRouteFor(ngo.id)
                  }}
                  className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-600 px-3 text-xs font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                >
                  Route to NGO
                </button>
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
                {donation.locationApproximate && donation.status === 'available' && (
                  <p className="mt-1 text-[11px] font-semibold text-ink-muted">
                    Approximate pickup pin until accepted
                  </p>
                )}
                <Link
                  to={`/donation/${donation.id}`}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:underline dark:text-brand-300"
                >
                  View details
                  <ChevronRight className="h-3 w-3" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation()
                    requestRouteFor(donation.id)
                  }}
                  className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-600 px-3 text-xs font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                >
                  Show route to pickup
                </button>
              </div>
            ),
          }))

    if (origin) {
      list.push({
        id: 'my-location',
        lat: origin.lat,
        lng: origin.lng,
        kind: 'you',
        color: 'var(--fresh-you)',
        title: 'Your location',
        popup: (
          <div className="w-44">
            <p className="text-sm font-bold text-ink">Your location</p>
            <p className="text-xs text-ink-soft">{origin.label}</p>
          </div>
        ),
      })
    }

    if (emergencyAlert) {
      needs.forEach((need) => {
        list.push({
          id: need.id,
          lat: need.lat,
          lng: need.lng,
          kind: 'relief',
          color: 'var(--fresh-urgency-soon)',
          title: `${need.item} relief need`,
          popup: (
            <div className="w-52">
              <ReliefTag />
              <p className="mt-2 text-sm font-bold text-ink">{need.item.replace('_', ' ')}</p>
              <p className="mt-1 text-xs text-ink-soft">{need.area} · {need.pledged || 0} of {need.quantity} {need.unit} pledged</p>
              <p className="mt-2 text-[11px] text-ink-muted">Requester contact details appear after a pledge.</p>
            </div>
          ),
        })
      })
    }

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
  }, [view, visibleNgos, visibleDonations, currentUser, role, origin, emergencyAlert, needs])

  const clearSelection = () => {
    setSelectedId(null)
    setRouteTargetId(null)
    setRouteKey(0)
    setRouteInfo(null)
  }

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

  const demoParam = searchParams.get('demo')

  const startDemoRouting = () => {
    setDemoResults([])
    setDemoIndex(0)
    setDemoRunning(true)
    setDemoRunId((id) => id + 1)
  }

  useEffect(() => {
    if (!demoRunning || !place || demoRunId === 0) return undefined
    const controller = new AbortController()
    let cancelled = false

    async function run() {
      const results = []
      for (const entry of demoLudhiana) {
        if (cancelled) return
        try {
          const route = await getRoute(place, { lat: entry.lat, lng: entry.lng }, controller.signal)
          results.push({
            name: entry.name,
            ok: true,
            distanceKm: route.distanceKm,
            durationMin: route.durationMin,
          })
        } catch (error) {
          if (error?.name === 'AbortError' || cancelled) return
          results.push({
            name: entry.name,
            ok: false,
            error: error?.message || 'Could not load a road route',
            distanceKm: null,
            durationMin: null,
          })
        }
        setDemoResults([...results])
        setDemoIndex(results.length)
        await new Promise((resolve) => setTimeout(resolve, 1200))
      }
      if (!cancelled) setDemoRunning(false)
    }

    run()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [demoRunId, demoRunning, place])

  // Button‑triggered routing: increment routeKey to fetch a fresh route.
  const triggerRoute = () => {
    if (!routeTo) {
      addToast('Select a pin first.', 'info')
      return
    }
    setRouteKey((k) => k + 1)
  }

  const clearRoute = () => {
    setSelectedId(null)
    setRouteTargetId(null)
    setRouteKey(0)
    setRouteInfo(null)
  }

  const handleMarkerClick = (id) => {
    if (id === 'my-location' || id === 'my-ngo' || id.startsWith('relief-')) return
    if (view === 'ngos') {
      requestRouteFor(id)
    } else {
      selectItem(id)
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
    onSelect: view === 'ngos' ? requestRouteFor : selectItem,
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
        onMarkerClick={handleMarkerClick}
        closePopupsKey={routeKey}
      >
          <RouteLayer
          from={routeFrom}
          to={routeTo}
          route={selectedRoute}
          loading={routeResult.loading}
          error={routeResult.error}
            onRouteInfo={setRouteInfo}
            hazardZones={hazardZones}
          />
          <HazardLayer zones={hazardZones} />
      </MapView>

      <NeedsBoard />

      <MapPanel {...panelProps} />

      {routeInfo && (
        <RouteSummary
          info={routeInfo}
          fromLabel={routeFromLabel}
          toLabel={routeToLabel}
          onStart={triggerRoute}
          canStart={true}
          onRetry={clearRoute}
          onClear={clearRoute}
          googleMapsUrl={
            routeTo
              ? `https://www.google.com/maps/dir/?api=1&destination=${routeTo.lat},${routeTo.lng}`
              : undefined
          }
        />
      )}

      {demoParam === '1' && demoActive && (
        <section
          className="mt-6 rounded-2xl border border-line bg-surface/95 p-4 shadow-card sm:p-6"
        >
          <h3 className="font-display text-sm font-bold text-ink uppercase tracking-wider">
            Routing check ({place.label}) · Sample data
          </h3>
          {demoRunning ? (
            <div className="space-y-3">
              <p className="text-[11px] text-ink-muted">
                Routing to {demoLudhiana[demoIndex]?.name || 'entry'}…{demoIndex > 0 ? ` (${demoResults.length} completed)` : ''}
              </p>
            </div>
          ) : (
            <div>
              <button
                onClick={startDemoRouting}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-600 px-4 text-xs font-bold text-white transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500"
              >
                Start routing check
              </button>
              <p className="mt-2 text-[11px] text-ink-muted">
                Routes from your location to each Ludhiana sample entry one at a time.
              </p>
            </div>
          )}
          {demoResults.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left text-[11px] font-bold text-ink-soft">Name</th>
                    <th className="text-left text-[11px] font-bold text-ink-soft">Status</th>
                    <th className="text-left text-[11px] font-bold text-ink-soft">Distance (km)</th>
                    <th className="text-left text-[11px] font-bold text-ink-soft">Minutes</th>
                  </tr>
                </thead>
                <tbody>
                  {demoResults.map((r, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2 font-medium">{r.name}</td>
                      <td className="p-2">
                        {r.ok ? (
                          <span className="text-ink">OK</span>
                        ) : (
                          <span className="text-danger-600">{r.error || 'Failed'}</span>
                        )}
                      </td>
                      <td className="p-2">{r.distanceKm.toFixed(1)}</td>
                      <td className="p-2">{r.durationMin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <p className="pointer-events-none absolute bottom-4 right-4 z-[1001] hidden rounded-xl border border-line bg-surface/90 px-3 py-2 text-[11px] text-ink-muted shadow-soft backdrop-blur lg:block">
        OpenStreetMap tiles · sample data
      </p>
    </main>
  )
}
