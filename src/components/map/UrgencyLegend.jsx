import {
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react'

const ITEMS = [
  {
    label: 'Fresh',
    icon: CheckCircle2,
    pin: 'bg-brand-600 text-white',
  },
  {
    label: 'Soon',
    icon: Clock,
    pin: 'bg-warning-500 text-brand-950',
  },
  {
    label: 'Urgent',
    icon: AlertTriangle,
    pin: 'bg-danger-600 text-white',
  },
]

export default function UrgencyLegend({ className = '' }) {
  return (
    <div
      role="group"
      className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 ${className}`}
      aria-label="Urgency legend"
    >
      {ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <span
            key={item.label}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft"
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-surface ${item.pin}`}
            >
              <Icon className="h-3 w-3" aria-hidden="true" />
            </span>
            {item.label}
          </span>
        )
      })}
    </div>
  )
}
