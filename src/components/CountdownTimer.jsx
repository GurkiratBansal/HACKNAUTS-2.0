import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { getUrgency } from '../utils/urgency'
import { formatCountdown } from '../utils/format'

export default function CountdownTimer({
  deadline,
  completed = false,
  className = '',
  showIcon = true,
}) {
  const [now, setNow] = useState(Date.now())

  // One shared one-second tick per mounted timer; cheap for this demo scale.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (completed) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 ${className}`}>
        {showIcon && <CheckIcon />}
        Completed
      </span>
    )
  }

  const urgency = getUrgency(deadline, now)
  const expired = urgency.key === 'expired'

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-medium ${expired ? 'text-slate-500' : 'text-slate-700'} ${className}`}
      aria-live="polite"
    >
      {showIcon && <Clock className="h-4 w-4" aria-hidden="true" />}
      <span className="tabular-nums">{formatCountdown(urgency.msLeft)}</span>
      <span className="text-slate-500">{expired ? 'past deadline' : 'left'}</span>
    </span>
  )
}

function CheckIcon() {
  return <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
}
