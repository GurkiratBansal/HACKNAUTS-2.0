import {
  Check,
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

function StepCircle({ icon: Icon, done, active }) {
  return (
    <span
      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1 transition-colors duration-300 ${
        done
          ? 'bg-brand-600 text-white ring-brand-600 dark:bg-brand-500 dark:ring-brand-500'
          : active
            ? 'bg-surface text-brand-700 ring-2 ring-brand-500 dark:text-brand-200'
            : 'bg-elevated text-ink-muted ring-line'
      }`}
    >
      {done ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Icon className="h-4 w-4" aria-hidden="true" />
      )}
      {active && (
        <span
          className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-saffron-500 ring-2 ring-surface"
          aria-hidden="true"
        />
      )}
    </span>
  )
}

export default function StatusStepper({ donation }) {
  const expired =
    donation.status === 'available' && getUrgency(donation.deadline).key === 'expired'
  const currentIndex = ORDER[donation.status] ?? 0
  const timeline = donation.timeline || []
  const timeFor = (key) => timeline.find((t) => t.status === key)?.at

  if (expired) {
    return (
      <div>
        <div className="flex items-start gap-3 rounded-2xl border border-line bg-elevated p-4 text-ink-soft">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-50 text-danger-700 dark:bg-danger-900/30 dark:text-danger-200">
            <XCircle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold text-ink">Expired</p>
            <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">
              The pickup deadline passed before an NGO accepted. This listing is
              hidden from NGO dashboards and cannot be accepted.
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-ink-muted">
          Lifecycle: Available → Pickup Confirmed → Picked Up → Distributed. The
          NGO advances each step after accepting.
        </p>
      </div>
    )
  }

  return (
    <div>
      <ol className="flex flex-col sm:grid sm:grid-cols-4 sm:gap-3">
        {STEPS.map((step, index) => {
          const done = index < currentIndex
          const active = index === currentIndex
          const at = timeFor(step.key)
          const meta = at
            ? formatTime(at)
            : done
              ? 'Done'
              : active
                ? 'Current step'
                : 'Pending'

          return (
            <li
              key={step.key}
              aria-current={active ? 'step' : undefined}
              className="relative flex gap-3 pb-6 last:pb-0 sm:flex-col sm:items-center sm:gap-0 sm:pb-0"
            >
              {index < STEPS.length - 1 && (
                <>
                  <span
                    className="absolute bottom-0 left-5 top-5 w-0.5 -translate-x-1/2 sm:hidden"
                    aria-hidden="true"
                  >
                    <span className="absolute inset-0 border-l-2 border-dashed border-line" />
                    <span
                      className={`absolute inset-0 origin-top bg-brand-500 transition-transform duration-500 ${
                        done ? 'scale-y-100' : 'scale-y-0'
                      }`}
                    />
                  </span>
                  <span
                    className="absolute left-1/2 top-5 hidden h-0.5 w-[calc(100%+0.75rem)] sm:block"
                    aria-hidden="true"
                  >
                    <span className="absolute inset-x-0 top-0 border-t-2 border-dashed border-line" />
                    <span
                      className={`absolute inset-x-0 top-0 h-0.5 origin-left bg-brand-500 transition-transform duration-500 ${
                        done ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </span>
                </>
              )}

              <StepCircle icon={step.icon} done={done} active={active} />

              <div className="min-w-0 sm:mt-3 sm:text-center">
                <p
                  className={`text-sm font-semibold ${
                    done || active ? 'text-ink' : 'text-ink-muted'
                  }`}
                >
                  {step.label}
                </p>
                <p
                  className={`mt-0.5 text-[11px] ${
                    active
                      ? 'font-semibold text-brand-700 dark:text-brand-300'
                      : 'text-ink-muted'
                  }`}
                >
                  {meta}
                </p>
              </div>
            </li>
          )
        })}
      </ol>

      <p className="mt-4 text-xs leading-relaxed text-ink-muted">
        Lifecycle: Available → Pickup Confirmed → Picked Up → Distributed. The NGO
        advances each step after accepting.
      </p>
    </div>
  )
}
