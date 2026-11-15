// FRESH:FILE  Colored badge for a listing's urgency level.
// FRESH:AREA  Donations

import { AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { getUrgency } from '../utils/urgency'

/**
 * Urgency always pairs an icon with text, so colour is never the only signal.
 * The source data lives in utils/urgency.js; tokens are mapped here.
 */
const TONES = {
  fresh: {
    icon: CheckCircle2,
    classes:
      'bg-brand-50 text-brand-800 ring-brand-200 dark:bg-brand-900/40 dark:text-brand-200 dark:ring-brand-700',
  },
  soon: {
    icon: Clock,
    classes:
      'bg-warning-50 text-warning-800 ring-warning-200 dark:bg-warning-900/30 dark:text-warning-200 dark:ring-warning-800',
  },
  urgent: {
    icon: AlertTriangle,
    classes:
      'bg-danger-50 text-danger-700 ring-danger-200 dark:bg-danger-900/30 dark:text-danger-200 dark:ring-danger-800',
  },
  expired: {
    icon: XCircle,
    classes:
      'bg-elevated text-ink-soft ring-line-strong dark:bg-elevated dark:text-ink-muted',
  },
}

export default function UrgencyBadge({ deadline, urgency, className = '' }) {
  const data = urgency || getUrgency(deadline)
  const tone = TONES[data.key] || TONES.expired
  const Icon = tone.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${tone.classes} ${className}`}
      title={data.description}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {data.label}
    </span>
  )
}
