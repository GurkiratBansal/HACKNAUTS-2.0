// FRESH:FILE  Panel listing which NGOs were alerted for this donation.
// FRESH:AREA  Donations

import { Clock, Sparkles } from 'lucide-react'
import { formatDistance } from '../../utils/format'

function AlertRow({ ngo, accepted, escalated = false }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-[8px] px-3 py-2.5 border ${
        accepted
          ? 'border-fresh-mint/30 bg-fresh-mint/10'
          : escalated
            ? 'border-amber-500/30 bg-amber-500/10'
            : 'border-fresh-border bg-black/5 dark:bg-white/5'
      }`}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-fresh-ink dark:text-fresh-light-bg">{ngo.name}</p>
        <p className="truncate text-xs text-fresh-ink-muted dark:text-fresh-ink-soft">
          {ngo.focus} · {formatDistance(ngo.distanceKm)} away
        </p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold border ${
          accepted
            ? 'border-fresh-mint/40 bg-fresh-mint text-fresh-cta'
            : escalated
              ? 'border-amber-500/30 bg-amber-500/20 text-amber-700 dark:text-amber-300'
              : 'border-fresh-border bg-white/50 text-fresh-ink-muted dark:bg-black/40 dark:text-fresh-ink-soft'
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
    <section className="rounded-[12px] border border-fresh-border bg-fresh-light-card p-5 shadow-fresh-sm dark:bg-fresh-dark-card sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-fresh-ink dark:text-fresh-light-bg">
            <Sparkles
              className="h-5 w-5 text-fresh-mint"
              aria-hidden="true"
            />
            Smart alert simulation
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-fresh-ink-muted dark:text-fresh-ink-soft">
            {accepted
              ? 'An NGO accepted the alert and will coordinate the pickup.'
              : stage2
                ? 'No response, alerting the next nearest NGOs.'
                : 'Alerting the 3 nearest verified NGOs…'}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-xs font-bold border ${
            accepted
              ? 'border-fresh-mint/30 bg-fresh-mint/15 text-fresh-mint'
              : stage2
                ? 'border-amber-500/30 bg-amber-500/15 text-amber-500 dark:text-amber-400'
                : 'border-fresh-teal/30 bg-fresh-teal/15 text-fresh-teal'
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
        <div className="mt-3 rounded-[8px] border border-fresh-teal/30 bg-fresh-teal/10 p-3 text-sm text-fresh-ink dark:text-fresh-light-bg">
          <Clock className="mr-1.5 inline h-4 w-4 text-fresh-teal" aria-hidden="true" />
          Auto-escalating in{' '}
          <span className="font-bold tabular-nums">
            {Math.ceil(escalationMs / 1000)}s
          </span>{' '}
          if no NGO accepts.
        </div>
      )}

      {stage2 && !donation.escalatedAt && (
        <p className="mt-3 rounded-[8px] border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
          This listing has moved to the second alert ring.
        </p>
      )}

      <div className="mt-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-fresh-ink-muted">
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
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-600 dark:text-amber-400">
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

      <p className="mt-4 text-xs leading-relaxed text-fresh-ink-muted dark:text-fresh-ink-soft">
        If no NGO accepts within 60 seconds, the next three nearest
        verified NGOs are added automatically. The panel updates live on this page
        and on the donor dashboard.
      </p>
    </section>
  )
}
