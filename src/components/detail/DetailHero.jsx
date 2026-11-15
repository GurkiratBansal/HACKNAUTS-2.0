// FRESH:FILE  Header of the donation detail page (photo, name, badges).
// FRESH:AREA  Donations

import {
  AlertTriangle,
  CheckCircle2,
  Truck,
  UtensilsCrossed,
} from 'lucide-react'
import Button from '../ui/Button'
import SmartImage from '../ui/SmartImage'
import UrgencyBadge from '../UrgencyBadge'
import CountdownTimer from '../CountdownTimer'
import StatusStepper from '../StatusStepper'
import { categoryLabel, formatDate, storageLabel } from '../../utils/format'

const STATUS_TONES = {
  accepted:
    'border border-fresh-teal/30 bg-fresh-teal/15 text-fresh-teal',
  picked_up:
    'border border-amber-500/30 bg-amber-500/15 text-amber-500 dark:text-amber-400',
  distributed:
    'border border-fresh-mint/30 bg-fresh-mint/15 text-fresh-mint',
}

const STATUS_LABELS = {
  accepted: 'Pickup confirmed',
  picked_up: 'Picked up',
  distributed: 'Distributed',
}

export default function DetailHero({
  donation,
  urgency,
  isNgo,
  canAccept,
  canAdvance,
  onAccept,
  onAdvance,
  onReport,
}) {
  return (
    <section className="overflow-hidden rounded-[12px] border border-fresh-border bg-fresh-light-card shadow-fresh-sm dark:bg-fresh-dark-card">
      <div className="relative h-60 bg-gradient-to-br from-fresh-mint/10 via-transparent to-fresh-teal/10 sm:h-80">
        <SmartImage
          src={donation.photo}
          alt={donation.foodName}
          loading="eager"
          className="h-full w-full"
          fallback={
            <span className="flex h-full w-full items-center justify-center text-fresh-mint/50">
              <UtensilsCrossed className="h-14 w-14" aria-hidden="true" />
            </span>
          }
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
          aria-hidden="true"
        />

        <div className="absolute inset-x-4 top-4 flex flex-wrap items-center gap-2">
          {donation.status === 'available' ? (
            <UrgencyBadge urgency={urgency} className="shadow-fresh-sm" />
          ) : (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                STATUS_TONES[donation.status] || STATUS_TONES.accepted
              }`}
            >
              {STATUS_LABELS[donation.status] || donation.status}
            </span>
          )}
          <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-bold text-fresh-ink border border-fresh-border dark:bg-black/50 dark:text-fresh-light-bg backdrop-blur">
            {donation.quantity} servings
          </span>
        </div>

        <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-white">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur border border-white/10">
            <UtensilsCrossed className="h-3 w-3" aria-hidden="true" />
            {categoryLabel(donation.category)}
          </span>
          <span className="rounded-full bg-black/60 px-2.5 py-1 backdrop-blur border border-white/10">
            {donation.diet === 'veg' ? 'Veg' : 'Non-veg'}
          </span>
          <span className="rounded-full bg-black/60 px-2.5 py-1 backdrop-blur border border-white/10">
            {storageLabel(donation.storage)}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold tracking-tight text-fresh-ink dark:text-fresh-light-bg sm:text-3xl">
              {donation.foodName}
            </h1>
            <p className="mt-1.5 text-sm text-fresh-ink-muted dark:text-fresh-ink-soft">
              Listed by{' '}
              <span className="font-semibold text-fresh-ink dark:text-fresh-light-bg">{donation.donorName}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {isNgo && (
              <Button
                type="button"
                variant="outline-danger"
                size="md"
                icon={AlertTriangle}
                onClick={onReport}
              >
                Report unsafe food
              </Button>
            )}
            {canAccept && (
              <Button
                type="button"
                variant="primary"
                size="md"
                icon={CheckCircle2}
                onClick={onAccept}
              >
                Accept pickup
              </Button>
            )}
            {canAdvance && (
              <Button
                type="button"
                variant="secondary"
                size="md"
                icon={Truck}
                onClick={onAdvance}
              >
                {donation.status === 'accepted' ? 'Mark picked up' : 'Mark distributed'}
              </Button>
            )}
          </div>
        </div>

        <div className="mt-5 rounded-[10px] border border-fresh-border bg-white/60 p-4 dark:bg-white/5">
          <CountdownTimer
            deadline={donation.deadline}
            startAt={donation.createdAt}
            showProgress
            completed={donation.status === 'distributed'}
          />
          <p className="mt-2 text-xs text-fresh-ink-muted dark:text-fresh-ink-soft">
            Pickup deadline: {formatDate(donation.deadline)}
          </p>
        </div>

        <div className="mt-5">
          <StatusStepper donation={donation} />
        </div>
      </div>
    </section>
  )
}
