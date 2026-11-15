// FRESH:FILE  Card summarising one food listing following the mobile reference design.
// FRESH:AREA  Donations

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
    'bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700',
  accepted:
    'bg-sky-50 text-sky-800 border border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-700',
  picked_up:
    'bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700',
  distributed:
    'bg-elevated text-ink-soft border border-line dark:bg-[#06130F] dark:text-[#A9BBB2] dark:border-white/10',
}

const STATUS_LABELS = {
  available: 'Available',
  accepted: 'Accepted',
  picked_up: 'Picked up',
  distributed: 'Distributed',
}

function DietTag({ diet }) {
  const veg = diet === 'veg'
  return (
    <span
      className={`rounded-[6px] px-2 py-0.5 text-[11px] font-bold border ${
        veg
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
          : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
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
    <article className="group flex h-full flex-col overflow-hidden rounded-[12px] border border-line bg-surface shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#3EE6B8]/40 hover:shadow-md dark:border-white/10 dark:bg-[#0B2219]">
      {/* Image or Category placeholder tile on top */}
      <div className="p-3 pb-0">
        <div className="relative h-44 overflow-hidden rounded-[10px] border border-line/60 bg-[#E9EEEC] dark:border-white/10 dark:bg-[#06130F]">
          <SmartImage
            src={donation.photo}
            alt={`${donation.foodName} listed for donation`}
            className="h-full w-full object-cover"
            imgClassName="transition duration-300 group-hover:scale-105"
            fallback={
              <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#0B2219] text-[#3EE6B8] border border-white/10">
                  {donation.photo ? (
                    <ImageOff className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <UtensilsCrossed className="h-6 w-6" aria-hidden="true" />
                  )}
                </span>
                <span className="mt-2 text-xs font-semibold text-ink-muted dark:text-[#A9BBB2]">
                  {categoryLabel(donation.category)}
                </span>
              </div>
            }
          />

          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            aria-hidden="true"
          />

          {/* Urgency Badge on top-left of image/tile */}
          <div className="absolute left-2.5 top-2.5 flex flex-wrap items-start gap-1.5">
            {donation.status === 'available' && (
              <UrgencyBadge urgency={urgency} />
            )}
            {donation.status !== 'available' && (
              <span
                className={`inline-flex items-center rounded-[8px] px-2.5 py-1 text-xs font-bold ${
                  STATUS_STYLES[donation.status] || STATUS_STYLES.available
                }`}
              >
                {STATUS_LABELS[donation.status] || donation.status}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Two small tags: category and veg/non-veg */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="rounded-[6px] border border-line bg-elevated px-2 py-0.5 font-semibold text-ink-soft dark:border-white/10 dark:bg-[#06130F] dark:text-[#A9BBB2]">
            {categoryLabel(donation.category)}
          </span>
          <DietTag diet={donation.diet} />
          <span className="rounded-[6px] border border-line bg-elevated px-2 py-0.5 font-semibold text-ink-soft dark:border-white/10 dark:bg-[#06130F] dark:text-[#A9BBB2]">
            {storageLabel(donation.storage)}
          </span>
        </div>

        {/* Title with tight tracking */}
        <h3 className="mt-2 font-display text-base sm:text-lg font-bold leading-snug tracking-tight text-ink dark:text-[#F2F7F4]">
          <Link
            to={`/donation/${donation.id}`}
            className="hover:text-emerald-700 dark:hover:text-[#3EE6B8] focus-visible:outline-none focus-visible:underline"
          >
            {donation.foodName}
          </Link>
        </h3>

        {/* Distance and Servings */}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-ink-muted dark:text-[#A9BBB2]">
          <span className="inline-flex items-center gap-1">
            <UtensilsCrossed className="h-3.5 w-3.5 text-[#3EE6B8]" aria-hidden="true" />
            <span className="font-bold text-ink dark:text-white">{donation.quantity}</span> servings
          </span>
          {Number.isFinite(distanceKm) && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-[#19C8D8]" aria-hidden="true" />
              <span>{formatDistance(distanceKm)} away</span>
            </span>
          )}
        </div>

        <p className="mt-2.5 flex items-start gap-1.5 text-xs leading-relaxed text-ink-soft dark:text-[#A9BBB2]">
          <MapPin
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-[#3EE6B8]"
            aria-hidden="true"
          />
          <span className="line-clamp-1">{donation.address}</span>
        </p>

        {showSafetyHint && (
          <div className="mt-3 flex items-start gap-2 rounded-[8px] border border-amber-200/80 bg-amber-50/80 p-2.5 text-[11px] leading-relaxed text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/20 dark:text-amber-200">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />
            <span>{getSafetyHint(donation.category, donation.storage)}</span>
          </div>
        )}

        {/* Actions & "View details" link with arrow */}
        <div className="mt-auto pt-4">
          {donation.status === 'available' && (
            <CountdownTimer
              deadline={donation.deadline}
              startAt={donation.createdAt}
              showProgress
              className="mb-3"
            />
          )}

          <div className="flex items-center justify-between border-t border-line dark:border-white/10 pt-3 text-xs text-ink-muted dark:text-[#A9BBB2]">
            <span>Listed {timeAgo(donation.createdAt)}</span>
            <Link
              to={`/donation/${donation.id}`}
              className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 dark:text-[#3EE6B8] dark:hover:text-[#3EE6B8]/80 transition"
            >
              View details
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
              View details
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
