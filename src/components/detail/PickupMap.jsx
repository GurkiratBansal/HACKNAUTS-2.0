import { MapPin } from 'lucide-react'
import MapView from '../MapView'

const URGENCY_PIN = {
  fresh: 'var(--fresh-urgency-fresh)',
  soon: 'var(--fresh-urgency-soon)',
  urgent: 'var(--fresh-urgency-urgent)',
  expired: 'var(--fresh-urgency-expired)',
}

export default function PickupMap({ donation, urgency, alerted }) {
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

  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6">
      <h2 className="font-display text-lg font-bold text-ink">Pickup location</h2>
      <p className="mt-1.5 flex items-start gap-1.5 text-sm leading-relaxed text-ink-soft">
        <MapPin
          className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300"
          aria-hidden="true"
        />
        {donation.address}
      </p>
      <div className="mt-3">
        <MapView
          center={[donation.location.lat, donation.location.lng]}
          zoom={13}
          height="280px"
          markers={markers}
        />
      </div>
      <p className="mt-2 text-[11px] text-ink-muted">
        The pickup pin is approximate. Coordinate the exact entrance with the donor.
      </p>
    </section>
  )
}
