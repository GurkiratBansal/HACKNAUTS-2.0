import { Clock, Sparkles } from 'lucide-react'
import { formatDistance } from '../../utils/format'

function AlertRow({ ngo, accepted, escalated = false }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 ring-1 ${
        accepted
          ? 'bg-brand-50 ring-brand-200 dark:bg-brand-900/30 dark:ring-brand-700'
          : escalated
            ? 'bg-warning-50/70 ring-warning-200 dark:bg-warning-900/20 dark:ring-warning-800'
            : 'bg-elevated ring-line'
      }`}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-ink">{ngo.name}</p>
        <p className="truncate text-xs text-ink-muted">
          {ngo.focus} · {formatDistance(ngo.distanceKm)} away
        </p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${
          accepted
            ? 'bg-brand-600 text-white'
            : escalated
              ? 'bg-warning-100 text-warning-900 dark:bg-warning-900/40 dark:text-warning-100'
              : 'bg-surface text-ink-soft ring-1 ring-line'
        }`}
      >
        {accepted ? 'Accepted' : escalated ? 'Escalated' : 'Alerted'}
      </span>
    </div>
  )
}

export default function AlertPanel({
  donation,
  stage2,
  waitingForEscalation,
  escalationMs,
  firstThree,
  laterThree,
  acceptedNgoId,
}) {
  const accepted = donation.status === 'accepted'

  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
            <Sparkles
              className="h-5 w-5 text-brand-600 dark:text-brand-300"
              aria-hidden="true"
            />
            Smart alert simulation
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            {accepted
              ? 'An NGO accepted the alert and will coordinate the pickup.'
              : stage2
                ? 'No response, alerting the next nearest NGOs.'
                : 'Alerting the 3 nearest verified NGOs…'}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${
            accepted
              ? 'bg-brand-50 text-brand-800 ring-brand-200 dark:bg-brand-900/40 dark:text-brand-200 dark:ring-brand-700'
              : stage2
                ? 'bg-warning-50 text-warning-800 ring-warning-200 dark:bg-warning-900/30 dark:text-warning-200 dark:ring-warning-800'
                : 'bg-info-50 text-info-800 ring-info-200 dark:bg-info-900/30 dark:text-info-200 dark:ring-info-800'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full bg-current ${accepted ? '' : 'animate-pulse'}`}
            aria-hidden="true"
          />
          {accepted ? 'Accepted' : stage2 ? 'Escalated' : 'Alerting'}
        </span>
      </div>

      {waitingForEscalation && (
        <div className="mt-3 rounded-xl border border-info-200/80 bg-info-50 p-3 text-sm text-info-900 dark:border-info-800 dark:bg-info-900/25 dark:text-info-100">
          <Clock className="mr-1.5 inline h-4 w-4" aria-hidden="true" />
          Auto-escalating in{' '}
          <span className="font-bold tabular-nums">
            {Math.ceil(escalationMs / 1000)}s
          </span>{' '}
          if no NGO accepts.
        </div>
      )}

      {stage2 && !donation.escalatedAt && (
        <p className="mt-3 rounded-xl border border-warning-200/80 bg-warning-50 p-3 text-sm text-warning-900 dark:border-warning-800 dark:bg-warning-900/25 dark:text-warning-100">
          This listing has moved to the second alert ring.
        </p>
      )}

      <div className="mt-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
          First alert ring
        </p>
        <div className="mt-2 space-y-2">
          {firstThree.map((ngo) => (
            <AlertRow key={ngo.id} ngo={ngo} accepted={ngo.id === acceptedNgoId} />
          ))}
        </div>
      </div>

      {stage2 && laterThree.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-warning-700 dark:text-warning-300">
            Second alert ring · escalated
          </p>
          <div className="mt-2 space-y-2">
            {laterThree.map((ngo) => (
              <AlertRow
                key={ngo.id}
                ngo={ngo}
                accepted={ngo.id === acceptedNgoId}
                escalated
              />
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 text-xs leading-relaxed text-ink-muted">
        Demo timer: if no NGO accepts within 60 seconds, the next three nearest
        verified NGOs are added automatically. The panel updates live on this page
        and on the donor dashboard.
      </p>
    </section>
  )
}
