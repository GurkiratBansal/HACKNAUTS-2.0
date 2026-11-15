// FRESH:FILE  Live countdown to a pickup deadline with distinct urgency color tokens.
// FRESH:AREA  Donations

import { useEffect, useState } from 'react'
import { CheckCircle2, Clock } from 'lucide-react'
import { getUrgency } from '../utils/urgency'
import { formatCountdown } from '../utils/format'

const TONES = {
  fresh: { text: 'text-emerald-700 dark:text-emerald-300', bar: 'bg-emerald-500' },
  soon: { text: 'text-amber-700 dark:text-amber-300', bar: 'bg-amber-500' },
  urgent: { text: 'text-red-700 dark:text-red-300', bar: 'bg-red-500' },
  expired: { text: 'text-ink-muted dark:text-[#A9BBB2]', bar: 'bg-slate-400' },
}

/**
 * Live countdown to the pickup deadline with separate urgency tokens.
 */
export default function CountdownTimer({
  deadline,
  startAt,
  completed = false,
  className = '',
  showIcon = true,
  showProgress = false,
}) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (completed) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-[#3EE6B8] ${className}`}
      >
        {showIcon && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />}
        Completed
      </span>
    )
  }

  const urgency = getUrgency(deadline, now)
  const tone = TONES[urgency.key] || TONES.fresh
  const expired = urgency.key === 'expired'
  const windowMs = startAt
    ? new Date(deadline).getTime() - new Date(startAt).getTime()
    : 0
  const hasWindow = Number.isFinite(windowMs) && windowMs > 0
  const percent = hasWindow
    ? Math.round(Math.min(100, Math.max(0, (urgency.msLeft / windowMs) * 100)))
    : 0

  const clock = (
    <>
      {showIcon && <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
      <span className="tabular-nums font-bold">{formatCountdown(urgency.msLeft)}</span>
      <span className="font-medium text-ink-muted dark:text-[#A9BBB2]">
        {expired ? 'past deadline' : 'left'}
      </span>
    </>
  )

  if (!showProgress || !hasWindow) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${tone.text} ${className}`}
      >
        {clock}
      </span>
    )
  }

  return (
    <div className={className}>
      <div
        className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-semibold ${tone.text}`}
      >
        <span className="inline-flex items-center gap-1.5">{clock}</span>
        <span className="text-[11px] font-medium text-ink-muted dark:text-[#A9BBB2]">
          {expired ? 'Deadline passed' : `${percent}% of window left`}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Pickup window remaining"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="mt-2 h-1.5 overflow-hidden rounded-[4px] bg-line dark:bg-white/10"
      >
        <div
          className={`h-full rounded-[4px] transition-[width] duration-700 ease-out ${tone.bar}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
