import { AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { getUrgency } from '../utils/urgency'

const ICONS = {
  fresh: CheckCircle2,
  soon: Clock,
  urgent: AlertTriangle,
  expired: XCircle,
}

export default function UrgencyBadge({ deadline, urgency, className = '' }) {
  const data = urgency || getUrgency(deadline)
  const Icon = ICONS[data.key] || Clock
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${data.badge} ${className}`}
      title={data.description}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {data.label}
    </span>
  )
}
