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
    neutral: 'border-line bg-surface',
    brand: 'border-brand-200/80 bg-brand-50/60 dark:border-brand-800 dark:bg-brand-900/20',
    danger: 'border-danger-200 bg-danger-50 dark:border-danger-800 dark:bg-danger-900/20',
  }

  return (
    <section className={`rounded-2xl border p-5 shadow-soft ${tones[tone] || tones.neutral}`}>
      <h2 className="flex items-center gap-2 text-base font-bold text-ink">
        {Icon && (
          <Icon
            className="h-4 w-4 text-brand-600 dark:text-brand-300"
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
      <dt className="text-ink-muted">{term}</dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
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

        <p className="mt-3 flex items-start gap-2 rounded-xl border border-warning-200/80 bg-warning-50 p-3 text-xs leading-relaxed text-warning-900 dark:border-warning-800 dark:bg-warning-900/25 dark:text-warning-100">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {getSafetyHint(donation.category, donation.storage)}
        </p>

        {donation.notes && (
          <div className="mt-3 rounded-xl bg-elevated p-3 text-xs leading-relaxed text-ink-soft ring-1 ring-inset ring-line">
            <span className="font-semibold text-ink">Donor notes: </span>
            {donation.notes}
          </div>
        )}
      </Card>

      <Card title="Contacts">
        <div className="mt-3 space-y-3">
          <div className="rounded-xl bg-elevated p-3 ring-1 ring-inset ring-line">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
              <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
              Donor
            </p>
            <p className="mt-1 text-sm font-bold text-ink">{donation.donorName}</p>
            {contactVisible ? (
              <a
                href={`tel:${donation.contactPhone.replace(/\s/g, '')}`}
                className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />{' '}
                {donation.contactPhone}
              </a>
            ) : (
              <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                Contact is revealed to the NGO that accepts the pickup.
              </p>
            )}
          </div>

          {acceptedNgo && (
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-3 dark:border-brand-800 dark:bg-brand-900/30">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-700 dark:text-brand-300">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Accepted by
              </p>
              <p className="mt-1 text-sm font-bold text-ink">{acceptedNgo.name}</p>
              <p className="text-xs text-ink-soft">{acceptedNgo.focus}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-brand-700 dark:text-brand-300">
                {acceptedNgo.verified
                  ? 'Verified NGO'
                  : 'Registered NGO · verification pending'}
              </p>
              {acceptedNgo.phone && (
                <a
                  href={`tel:${acceptedNgo.phone.replace(/\s/g, '')}`}
                  className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300"
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
              className="flex items-center justify-between gap-2 rounded-xl bg-elevated px-3 py-2 ring-1 ring-inset ring-line"
            >
              <span className="font-semibold capitalize text-ink-soft">
                {entry.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-ink-muted">{formatTime(entry.at)}</span>
            </li>
          ))}
        </ol>
      </Card>

      {donation.reports?.length > 0 && (
        <section className="rounded-2xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-900 dark:border-danger-800 dark:bg-danger-900/25 dark:text-danger-100">
          <p className="font-bold">
            {donation.reports.length} safety report
            {donation.reports.length > 1 ? 's' : ''}
          </p>
          <p className="mt-1 text-xs leading-relaxed">
            Reports are stored locally in this browser and visible to the donor.
          </p>
        </section>
      )}

      <p className="rounded-2xl border border-line bg-surface p-4 text-xs leading-relaxed text-ink-muted shadow-soft">
        {URGENCY_DISCLAIMER} FRESH never guarantees that food is safe.
      </p>
    </aside>
  )
}
