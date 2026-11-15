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
    'bg-info-50 text-info-800 ring-info-200 dark:bg-info-900/40 dark:text-info-200 dark:ring-info-800',
  picked_up:
    'bg-saffron-50 text-saffron-800 ring-saffron-200 dark:bg-saffron-900/30 dark:text-saffron-200 dark:ring-saffron-800',
  distributed:
    'bg-brand-50 text-brand-800 ring-brand-200 dark:bg-brand-900/40 dark:text-brand-200 dark:ring-brand-700',
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
    <section className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
      <div className="relative h-60 bg-gradient-to-br from-brand-100 via-cream to-saffron-100 dark:from-brand-900 dark:via-brand-950 dark:to-saffron-900/40 sm:h-80">
        <SmartImage
          src={donation.photo}
          alt={donation.foodName}
          loading="eager"
          className="h-full w-full"
          fallback={
            <span className="flex h-full w-full items-center justify-center text-brand-700/50 dark:text-brand-300/50">
              <UtensilsCrossed className="h-14 w-14" aria-hidden="true" />
            </span>
          }
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-950/65 via-brand-950/10 to-transparent"
          aria-hidden="true"
        />

        <div className="absolute inset-x-4 top-4 flex flex-wrap items-center gap-2">
          {donation.status === 'available' ? (
            <UrgencyBadge urgency={urgency} className="shadow-soft" />
          ) : (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${
                STATUS_TONES[donation.status] || STATUS_TONES.accepted
              }`}
            >
              {STATUS_LABELS[donation.status] || donation.status}
            </span>
          )}
          <span className="rounded-full bg-surface/90 px-2.5 py-1 text-xs font-bold text-ink-soft ring-1 ring-line backdrop-blur">
            {donation.quantity} servings
          </span>
        </div>

        <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-white">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-950/65 px-2.5 py-1 backdrop-blur">
            <UtensilsCrossed className="h-3 w-3" aria-hidden="true" />
            {categoryLabel(donation.category)}
          </span>
          <span className="rounded-full bg-brand-950/65 px-2.5 py-1 backdrop-blur">
            {donation.diet === 'veg' ? 'Veg' : 'Non-veg'}
          </span>
          <span className="rounded-full bg-brand-950/65 px-2.5 py-1 backdrop-blur">
            {storageLabel(donation.storage)}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              {donation.foodName}
            </h1>
            <p className="mt-1.5 text-sm text-ink-soft">
              Listed by{' '}
              <span className="font-semibold text-ink">{donation.donorName}</span>
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

        <div className="mt-5 rounded-2xl border border-line bg-elevated/80 p-4">
          <CountdownTimer
            deadline={donation.deadline}
            startAt={donation.createdAt}
            showProgress
            completed={donation.status === 'distributed'}
          />
          <p className="mt-2 text-xs text-ink-muted">
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
