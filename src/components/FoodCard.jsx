import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  ImageOff,
  MapPin,
  ShieldAlert,
  UtensilsCrossed,
} from 'lucide-react'
import UrgencyBadge from './UrgencyBadge'
import CountdownTimer from './CountdownTimer'
import { getSafetyHint, getUrgency } from '../utils/urgency'
import {
  categoryLabel,
  formatDistance,
  storageLabel,
  timeAgo,
} from '../utils/format'

const STATUS_STYLES = {
  available: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  accepted: 'bg-sky-50 text-sky-700 ring-sky-200',
  picked_up: 'bg-violet-50 text-violet-700 ring-violet-200',
  distributed: 'bg-slate-100 text-slate-700 ring-slate-200',
}

const STATUS_LABELS = {
  available: 'Available',
  accepted: 'Accepted',
  picked_up: 'Picked up',
  distributed: 'Distributed',
}

export default function FoodCard({
  donation,
  distanceKm,
  onAccept,
  donorView = false,
  showSafetyHint = true,
}) {
  const [imageFailed, setImageFailed] = useState(false)
  const urgency = getUrgency(donation.deadline)
  const expired = urgency.key === 'expired'
  const isAvailable = donation.status === 'available' && !expired
  const completed = donation.status === 'distributed'

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-emerald-100 via-orange-50 to-emerald-50">
        {donation.photo && !imageFailed ? (
          <img
            src={donation.photo}
            alt={`${donation.foodName} listed for donation`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-emerald-700/60">
            {imageFailed ? <ImageOff className="h-10 w-10" /> : <UtensilsCrossed className="h-10 w-10" />}
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {/* Urgency only matters while a listing is still waiting for a pickup. */}
          {donation.status === 'available' && <UrgencyBadge urgency={urgency} />}
          {donorView && (
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[donation.status] || STATUS_STYLES.available}`}>
              {STATUS_LABELS[donation.status] || donation.status}
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
          {donation.quantity} servings
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold leading-snug text-slate-900">
            <Link to={`/donation/${donation.id}`} className="hover:text-emerald-700 focus:outline-none focus-visible:underline">
              {donation.foodName}
            </Link>
          </h3>
          {completed ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Done
            </span>
          ) : donation.status === 'available' ? (
            <CountdownTimer deadline={donation.deadline} showIcon={false} className="shrink-0 text-xs" />
          ) : (
            <span className="shrink-0 text-xs font-semibold text-sky-700">In progress</span>
          )}
        </div>

        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
          <span>{categoryLabel(donation.category)}</span>
          <span aria-hidden="true">·</span>
          <span className={donation.diet === 'veg' ? 'text-emerald-700' : 'text-orange-700'}>
            {donation.diet === 'veg' ? 'Veg' : 'Non-veg'}
          </span>
          <span aria-hidden="true">·</span>
          <span>{storageLabel(donation.storage)}</span>
        </p>

        <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          <span className="line-clamp-2">
            {donation.address}
            {Number.isFinite(distanceKm) && (
              <span className="font-semibold text-slate-800"> · {formatDistance(distanceKm)} away</span>
            )}
          </span>
        </p>

        {showSafetyHint && (
          <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-50 p-2.5 text-xs leading-relaxed text-amber-900">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {getSafetyHint(donation.category, donation.storage)}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="text-xs text-slate-400">Listed {timeAgo(donation.createdAt)}</span>
          <div className="flex items-center gap-2">
            <Link
              to={`/donation/${donation.id}`}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Details <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            {!donorView && onAccept && (
              <button
                type="button"
                onClick={() => onAccept(donation)}
                disabled={!isAvailable}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {expired ? 'Expired' : isAvailable ? 'Accept pickup' : 'Accepted'}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
