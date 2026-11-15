// FRESH:FILE  Mini map on the detail page with the pickup point and route.
// FRESH:AREA  Map

import { MapPin } from 'lucide-react'
import MapView from '../MapView'
import LocationBar from '../LocationBar'
import LocationPicker from '../LocationPicker'
import RouteLayer from '../RouteLayer'
import RouteSummary from '../RouteSummary'

const URGENCY_PIN = {
  fresh: 'var(--fresh-urgency-fresh)',
  soon: 'var(--fresh-urgency-soon)',
  urgent: 'var(--fresh-urgency-urgent)',
  expired: 'var(--fresh-urgency-expired)',
}

export default function PickupMap({
  donation,
  urgency,
  alerted,
  route,
  routeLoading,
  routeError,
  routeInfo,
  onRouteInfo,
  onRequestRoute,
  onClearRoute,
  googleMapsUrl,
  place,
}) {
  const markers = [
    {
      id: 'donation',
      lat: donation.location.lat,
      lng: donation.location.lng,
      kind: 'pickup',
      color: URGENCY_PIN[urgency.key] || URGENCY_PIN.fresh,
      ink: urgency.key === 'soon' ? '2 44 34' : undefined,
      title: donation.foodName,
      popup: <p className="text-xs font-semibold text-ink">{donation.foodName}</p>,
    },
    ...alerted.slice(0, 6).map((ngo) => ({
      id: ngo.id,
      lat: ngo.lat,
      lng: ngo.lng,
      kind: 'ngo',
      color: 'var(--fresh-ngo)',
      title: ngo.name,
      popup: <p className="text-xs font-semibold text-ink">{ngo.name}</p>,
    })),
  ]

  if (!place) {
    return (
      <section className="rounded-[12px] border border-fresh-border bg-fresh-light-card p-5 shadow-fresh-sm dark:bg-fresh-dark-card sm:p-6">
        <LocationPicker idPrefix="detail-location-picker" />
      </section>
    )
  }

  return (
    <section className="rounded-[12px] border border-fresh-border bg-fresh-light-card p-5 shadow-fresh-sm dark:bg-fresh-dark-card sm:p-6">
      <h2 className="font-display text-lg font-bold text-fresh-ink dark:text-fresh-light-bg">Pickup location</h2>
      <p className="mt-1.5 flex items-start gap-1.5 text-sm leading-relaxed text-fresh-ink-muted dark:text-fresh-ink-soft">
        <MapPin
          className="mt-0.5 h-4 w-4 shrink-0 text-fresh-mint"
          aria-hidden="true"
        />
        {donation.address}
      </p>
      <LocationBar className="mt-3" />
      <div className="mt-3 overflow-hidden rounded-[10px] border border-fresh-border">
        <MapView
          center={[place.lat, place.lng]}
          zoom={13}
          height="280px"
          markers={markers}
        >
          <RouteLayer
            from={place}
            to={donation.location}
            route={route}
            loading={routeLoading}
            error={routeError}
            onRouteInfo={onRouteInfo}
          />
        </MapView>
      </div>
      {routeInfo && (
        <RouteSummary
          info={routeInfo}
          fromLabel={place.label}
          toLabel={donation.foodName}
          onRetry={onRequestRoute}
          onClear={onClearRoute}
          googleMapsUrl={googleMapsUrl}
        />
      )}
      <p className="mt-2 text-[11px] text-fresh-ink-muted dark:text-fresh-ink-soft">
        The pickup pin is approximate. Coordinate the exact entrance with the donor.
      </p>
    </section>
  )
}
