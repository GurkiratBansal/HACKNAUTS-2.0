// FRESH:FILE  Colored badge for a listing's urgency level with distinct tokens and 8-12px radius.
// FRESH:AREA  Donations

import { AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { getUrgency } from '../utils/urgency'

/**
 * Urgency always pairs an icon with text. Tokens stay strictly distinct from brand mint.
 * 8-12px rounded rectangles, NOT full pills.
 */
const TONES = {
  fresh: {
    icon: CheckCircle2,
    classes:
      'bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700',
  },
  soon: {
    icon: Clock,
    classes:
      'bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700',
  },
  urgent: {
    icon: AlertTriangle,
    classes:
      'bg-red-50 text-red-800 border border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-700',
  },
  expired: {
    icon: XCircle,
    classes:
      'bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-700',
  },
}

export default function UrgencyBadge({ deadline, urgency, className = '' }) {
  const data = urgency || getUrgency(deadline)
  const tone = TONES[data.key] || TONES.expired
  const Icon = tone.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-[8px] px-2.5 py-1 text-xs font-bold shadow-sm ${tone.classes} ${className}`}
      title={data.description}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {data.label}
    </span>
  )
}
