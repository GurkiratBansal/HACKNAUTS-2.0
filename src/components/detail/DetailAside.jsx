// FRESH:FILE  Detail sidebar: accept button, status timeline and contact reveal rules.
// FRESH:AREA  Donations

import {
  Phone,
  ShieldAlert,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import Button from '../ui/Button'
import {
  categoryLabel,
  formatDate,
  formatTime,
  storageLabel,
} from '../../utils/format'
import { getSafetyHint, URGENCY_DISCLAIMER } from '../../utils/urgency'

function Card({ title, icon: Icon, children, tone = 'neutral' }) {
  const tones = {
    neutral: 'border-fresh-border bg-fresh-light-card dark:bg-fresh-dark-card',
    brand: 'border-fresh-border bg-fresh-light-card dark:bg-fresh-dark-card',
    danger: 'border-red-500/30 bg-red-500/10 dark:text-red-200',
  }

  return (
    <section className={`rounded-[12px] border p-5 shadow-fresh-sm ${tones[tone] || tones.neutral}`}>
      <h2 className="flex items-center gap-2 text-base font-bold text-fresh-ink dark:text-fresh-light-bg">
        {Icon && (
          <Icon
            className="h-4 w-4 text-fresh-mint"
            aria-hidden="true"
          />
        )}
        {title}
      </h2>
      {children}
    </section>
  )
}

function Row({ term, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-fresh-ink-muted dark:text-fresh-ink-soft">{term}</dt>
      <dd className="text-right font-semibold text-fresh-ink dark:text-fresh-light-bg">{value}</dd>
    </div>
  )
}

export default function DetailAside({
  donation,
  acceptedNgo,
  contactVisible,
  currentUser,
}) {
  return (
    <aside className="space-y-4">
      <Card title="Handling details">
        <dl className="mt-3 space-y-2.5 text-sm">
          <Row term="Cooked / packed" value={formatDate(donation.cookedAt)} />
          <Row term="Storage" value={storageLabel(donation.storage)} />
          <Row term="Listed" value={formatDate(donation.createdAt)} />
          <Row term="Pickup deadline" value={formatDate(donation.deadline)} />
          <Row term="Category" value={categoryLabel(donation.category)} />
          <Row term="Diet" value={donation.diet === 'veg' ? 'Veg' : 'Non-veg'} />
        </dl>

        <p className="mt-3 flex items-start gap-2 rounded-[8px] border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {getSafetyHint(donation.category, donation.storage)}
        </p>

        {donation.notes && (
          <div className="mt-3 rounded-[8px] bg-black/5 p-3 text-xs leading-relaxed text-fresh-ink-muted dark:bg-white/5 dark:text-fresh-ink-soft border border-fresh-border">
            <span className="font-semibold text-fresh-ink dark:text-fresh-light-bg">Donor notes: </span>
            {donation.notes}
          </div>
        )}
      </Card>

      <Card title="Contacts">
        <div className="mt-3 space-y-3">
          <div className="rounded-[8px] bg-black/5 p-3 border border-fresh-border dark:bg-white/5">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-fresh-ink-muted">
              <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
              Donor
            </p>
            <p className="mt-1 text-sm font-bold text-fresh-ink dark:text-fresh-light-bg">{donation.donorName}</p>
            {contactVisible ? (
              <a
                href={`tel:${donation.contactPhone.replace(/\s/g, '')}`}
                className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-fresh-mint hover:underline"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />{' '}
                {donation.contactPhone}
              </a>
            ) : (
              <p className="mt-0.5 text-xs leading-relaxed text-fresh-ink-muted dark:text-fresh-ink-soft">
                Contact is revealed to the NGO that accepts the pickup.
              </p>
            )}
          </div>

          {acceptedNgo && (
            <div className="rounded-[8px] border border-fresh-mint/30 bg-fresh-mint/10 p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-fresh-mint">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Accepted by
              </p>
              <p className="mt-1 text-sm font-bold text-fresh-ink dark:text-fresh-light-bg">{acceptedNgo.name}</p>
              <p className="text-xs text-fresh-ink-muted dark:text-fresh-ink-soft">{acceptedNgo.focus}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-fresh-mint">
                {acceptedNgo.verified
                  ? 'Verified NGO'
                  : 'Registered NGO · verification pending'}
              </p>
              {acceptedNgo.phone && (
                <a
                  href={`tel:${acceptedNgo.phone.replace(/\s/g, '')}`}
                  className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-fresh-mint hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />{' '}
                  {acceptedNgo.phone}
                </a>
              )}
            </div>
          )}

          {!currentUser && (
            <Button to="/login" variant="secondary" className="w-full">
              Log in to accept or manage this pickup
            </Button>
          )}
        </div>
      </Card>

      <Card title="Status timeline">
        <ol className="mt-3 space-y-2 text-sm">
          {donation.timeline.map((entry, index) => (
            <li
              key={`${entry.status}-${index}`}
              className="flex items-center justify-between gap-2 rounded-[8px] bg-black/5 px-3 py-2 border border-fresh-border dark:bg-white/5"
            >
              <span className="font-semibold capitalize text-fresh-ink dark:text-fresh-light-bg">
                {entry.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-fresh-ink-muted dark:text-fresh-ink-soft">{formatTime(entry.at)}</span>
            </li>
          ))}
        </ol>
      </Card>

      {donation.reports?.length > 0 && (
        <section className="rounded-[10px] border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-900 dark:text-red-200">
          <p className="font-bold">
            {donation.reports.length} safety report
            {donation.reports.length > 1 ? 's' : ''}
          </p>
          <p className="mt-1 text-xs leading-relaxed">
            Reports are stored locally in this browser and visible to the donor.
          </p>
        </section>
      )}

      <p className="rounded-[10px] border border-fresh-border bg-fresh-light-card p-4 text-xs leading-relaxed text-fresh-ink-muted shadow-fresh-sm dark:bg-fresh-dark-card dark:text-fresh-ink-soft">
        {URGENCY_DISCLAIMER} FRESH never guarantees that food is safe.
      </p>
    </aside>
  )
}
