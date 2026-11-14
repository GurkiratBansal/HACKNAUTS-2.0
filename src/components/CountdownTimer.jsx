import { useEffect, useState } from 'react'
import { CheckCircle2, Clock } from 'lucide-react'
import { getUrgency } from '../utils/urgency'
import { formatCountdown } from '../utils/format'

const TONES = {
  fresh: { text: 'text-brand-700 dark:text-brand-300', bar: 'bg-brand-500' },
  soon: { text: 'text-warning-700 dark:text-warning-300', bar: 'bg-warning-500' },
  urgent: { text: 'text-danger-700 dark:text-danger-300', bar: 'bg-danger-500' },
  expired: { text: 'text-ink-muted', bar: 'bg-line-strong' },
}

/**
 * Live countdown to the pickup deadline. Pass `startAt` together with
 * `showProgress` to render an accessible share-of-window progress bar.
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

  // One shared one-second tick per mounted timer; cheap for this demo scale.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (completed) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 dark:text-brand-300 ${className}`}
      >
        {showIcon && <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
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
      {showIcon && <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />}
      <span className="tabular-nums">{formatCountdown(urgency.msLeft)}</span>
      <span className="font-medium text-ink-muted">
        {expired ? 'past deadline' : 'left'}
      </span>
    </>
  )

  if (!showProgress || !hasWindow) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-sm font-semibold ${tone.text} ${className}`}
      >
        {clock}
      </span>
    )
  }

  return (
    <div className={className}>
      <div
        className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm font-semibold ${tone.text}`}
      >
        <span className="inline-flex items-center gap-1.5">{clock}</span>
        <span className="text-[11px] font-medium text-ink-muted">
          {expired ? 'Deadline passed' : `${percent}% of window left`}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Pickup window remaining"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-700 ease-out ${tone.bar}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
