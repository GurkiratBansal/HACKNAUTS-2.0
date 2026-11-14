import { Link } from 'react-router-dom'
import {
  ArrowRight,
  HandHeart,
  ImageOff,
  MapPin,
  ShieldAlert,
  UtensilsCrossed,
} from 'lucide-react'
import UrgencyBadge from './UrgencyBadge'
import CountdownTimer from './CountdownTimer'
import Button from './ui/Button'
import SmartImage from './ui/SmartImage'
import { getSafetyHint, getUrgency } from '../utils/urgency'
import {
  categoryLabel,
  formatDistance,
  storageLabel,
  timeAgo,
} from '../utils/format'

const STATUS_STYLES = {
  available:
    'bg-brand-50/95 text-brand-800 ring-brand-200 dark:bg-brand-900/70 dark:text-brand-200 dark:ring-brand-700',
  accepted:
    'bg-info-50/95 text-info-800 ring-info-200 dark:bg-info-900/60 dark:text-info-200 dark:ring-info-800',
  picked_up:
    'bg-saffron-50/95 text-saffron-800 ring-saffron-200 dark:bg-saffron-900/60 dark:text-saffron-200 dark:ring-saffron-800',
  distributed:
    'bg-elevated/95 text-ink-soft ring-line-strong dark:bg-brand-950/80 dark:text-brand-100',
}

const STATUS_LABELS = {
  available: 'Available',
  accepted: 'Accepted',
  picked_up: 'Picked up',
  distributed: 'Distributed',
}

function DietChip({ diet }) {
  const veg = diet === 'veg'
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-semibold ring-1 ring-inset ${
        veg
          ? 'bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-900/40 dark:text-brand-200 dark:ring-brand-700'
          : 'bg-saffron-50 text-saffron-800 ring-saffron-200 dark:bg-saffron-900/30 dark:text-saffron-200 dark:ring-saffron-800'
      }`}
    >
      {veg ? 'Veg' : 'Non-veg'}
    </span>
  )
}

export default function FoodCard({
  donation,
  distanceKm,
  onAccept,
  donorView = false,
  showSafetyHint = true,
}) {
  const urgency = getUrgency(donation.deadline)
  const expired = urgency.key === 'expired'
  const isAvailable = donation.status === 'available' && !expired

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-soft transition duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-card dark:hover:border-brand-700">
      <div className="p-2 pb-0">
        <div className="relative h-44 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-100 via-cream to-saffron-100 dark:from-brand-900 dark:via-brand-950 dark:to-saffron-900/40">
          <SmartImage
            src={donation.photo}
            alt={`${donation.foodName} listed for donation`}
            className="h-full w-full"
            imgClassName="transition duration-500 group-hover:scale-[1.04]"
            fallback={
              <div className="flex h-full items-center justify-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-surface/60 text-brand-700/60 ring-1 ring-inset ring-brand-900/10 backdrop-blur dark:text-brand-300/70 dark:ring-white/10">
                  {donation.photo ? (
                    <ImageOff className="h-9 w-9" aria-hidden="true" />
                  ) : (
                    <UtensilsCrossed className="h-9 w-9" aria-hidden="true" />
                  )}
                </span>
              </div>
            }
          />

          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-950/60 via-brand-950/5 to-transparent"
            aria-hidden="true"
          />

          <div className="absolute inset-x-2.5 top-2.5 flex flex-wrap items-start gap-1.5">
            {/* Urgency only matters while a listing is still waiting for a pickup. */}
            {donation.status === 'available' && (
              <UrgencyBadge urgency={urgency} className="shadow-soft" />
            )}
            {donation.status !== 'available' && (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${
                  STATUS_STYLES[donation.status] || STATUS_STYLES.available
                }`}
              >
                {STATUS_LABELS[donation.status] || donation.status}
              </span>
            )}
          </div>

          <div className="absolute inset-x-2.5 bottom-2.5 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-950/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              <UtensilsCrossed className="h-3 w-3" aria-hidden="true" />
              {donation.quantity} servings
            </span>
            {Number.isFinite(distanceKm) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-950/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                {formatDistance(distanceKm)} away
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="font-display text-lg font-bold leading-snug text-ink">
          <Link
            to={`/donation/${donation.id}`}
            className="underline-offset-4 hover:text-brand-700 hover:underline focus-visible:outline-none focus-visible:underline focus-visible:decoration-saffron-500 focus-visible:decoration-2 dark:hover:text-brand-300"
          >
            {donation.foodName}
          </Link>
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="rounded-full bg-elevated px-2 py-0.5 font-semibold text-ink-soft ring-1 ring-inset ring-line">
            {categoryLabel(donation.category)}
          </span>
          <DietChip diet={donation.diet} />
          <span className="rounded-full bg-elevated px-2 py-0.5 font-semibold text-ink-soft ring-1 ring-inset ring-line">
            {storageLabel(donation.storage)}
          </span>
        </div>

        <p className="mt-3 flex items-start gap-1.5 text-[13px] leading-relaxed text-ink-soft">
          <MapPin
            className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400"
            aria-hidden="true"
          />
          <span className="line-clamp-2">{donation.address}</span>
        </p>

        {showSafetyHint && (
          <p className="mt-3 flex items-start gap-2 rounded-xl border border-warning-200/80 bg-warning-50/80 p-2.5 text-[11px] leading-relaxed text-warning-900 dark:border-warning-800/60 dark:bg-warning-900/25 dark:text-warning-100">
            <ShieldAlert
              className="mt-0.5 h-3.5 w-3.5 shrink-0"
              aria-hidden="true"
            />
            {getSafetyHint(donation.category, donation.storage)}
          </p>
        )}

        <div className="mt-auto pt-4">
          {donation.status === 'available' && (
            <CountdownTimer
              deadline={donation.deadline}
              startAt={donation.createdAt}
              showProgress
              className="mb-4"
            />
          )}

          <div className="flex items-center justify-between gap-2 border-t border-line pt-3 text-[11px] text-ink-muted">
            <span>Listed {timeAgo(donation.createdAt)}</span>
            <Link
              to={`/donation/${donation.id}`}
              className="inline-flex items-center gap-1 font-semibold text-brand-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:underline dark:text-brand-300"
            >
              Details
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {!donorView && onAccept ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              icon={isAvailable ? HandHeart : undefined}
              disabled={!isAvailable}
              onClick={() => onAccept(donation)}
              className="mt-3 w-full"
            >
              {expired ? 'Expired' : isAvailable ? 'Accept pickup' : 'Accepted'}
            </Button>
          ) : (
            <Button
              to={`/donation/${donation.id}`}
              variant="outline"
              size="md"
              iconRight={ArrowRight}
              className="mt-3 w-full"
            >
              View listing
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
