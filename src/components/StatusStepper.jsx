import {
  CheckCircle2,
  ClipboardList,
  HeartHandshake,
  Truck,
  XCircle,
} from 'lucide-react'
import { formatTime } from '../utils/format'
import { getUrgency } from '../utils/urgency'

const STEPS = [
  { key: 'available', label: 'Available', icon: ClipboardList },
  { key: 'accepted', label: 'Pickup Confirmed', icon: CheckCircle2 },
  { key: 'picked_up', label: 'Picked Up', icon: Truck },
  { key: 'distributed', label: 'Distributed', icon: HeartHandshake },
]

const ORDER = { available: 0, accepted: 1, picked_up: 2, distributed: 3 }

export default function StatusStepper({ donation }) {
  const expired =
    donation.status === 'available' && getUrgency(donation.deadline).key === 'expired'
  const currentIndex = ORDER[donation.status] ?? 0
  const timeline = donation.timeline || []
  const timeFor = (key) => timeline.find((t) => t.status === key)?.at

  return (
    <div>
      {expired ? (
        <div className="flex items-start gap-3 rounded-xl bg-slate-100 p-4 text-slate-700 ring-1 ring-slate-200">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">Expired</p>
            <p className="text-sm text-slate-600">
              The pickup deadline passed before an NGO accepted. This listing is
              hidden from NGO dashboards and cannot be accepted.
            </p>
          </div>
        </div>
      ) : (
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-2">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const done = index < currentIndex
            const active = index === currentIndex
            const at = timeFor(step.key)
            return (
              <li key={step.key} className="relative">
                <div
                  className={`flex h-full flex-col gap-1.5 rounded-xl p-3 ring-1 ${
                    active
                      ? 'bg-emerald-50 ring-emerald-200'
                      : done
                        ? 'bg-emerald-50/60 ring-emerald-100'
                        : 'bg-slate-50 ring-slate-200'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      done || active
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className={`text-xs font-semibold ${done || active ? 'text-emerald-900' : 'text-slate-500'}`}>
                    {step.label}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {at ? formatTime(at) : done ? 'Done' : active ? 'Current step' : 'Pending'}
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      )}
      <p className="mt-3 text-xs text-slate-500">
        Lifecycle: Available → Pickup Confirmed → Picked Up → Distributed. The NGO
        advances each step after accepting.
      </p>
    </div>
  )
}
