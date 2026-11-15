// FRESH:FILE  Progress stepper across donation statuses with 10px radii and mint active indicator.
// FRESH:AREA  Donations

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
      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border transition-colors duration-200 ${
        done
          ? 'bg-emerald-600 text-white border-emerald-500 dark:bg-emerald-600 dark:border-emerald-400'
          : active
            ? 'bg-surface text-ink border-2 border-[#3EE6B8] shadow-sm dark:bg-[#0B2219] dark:text-[#3EE6B8]'
            : 'bg-elevated text-ink-muted border-line dark:bg-[#06130F] dark:border-white/10 dark:text-[#A9BBB2]'
      }`}
    >
      {done ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Icon className="h-4 w-4" aria-hidden="true" />
      )}
      {active && (
        <span
          className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#3EE6B8] ring-2 ring-surface dark:ring-[#06130F]"
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
        <div className="flex items-start gap-3 rounded-[10px] border border-line bg-elevated p-4 text-ink-soft dark:border-white/10 dark:bg-[#06130F]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-danger-50 text-danger-700 border border-danger-200 dark:bg-danger-900/30 dark:text-danger-200 dark:border-danger-800">
            <XCircle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-bold text-ink dark:text-[#F2F7F4]">Expired</p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-soft dark:text-[#A9BBB2]">
              The pickup deadline passed before an NGO accepted. This listing is
              hidden from NGO dashboards and cannot be accepted.
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-ink-muted dark:text-[#A9BBB2]">
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
                    <span className="absolute inset-0 border-l-2 border-dashed border-line dark:border-white/10" />
                    <span
                      className={`absolute inset-0 origin-top bg-[#3EE6B8] transition-transform duration-500 ${
                        done ? 'scale-y-100' : 'scale-y-0'
                      }`}
                    />
                  </span>
                  <span
                    className="absolute left-1/2 top-5 hidden h-0.5 w-[calc(100%+0.75rem)] sm:block"
                    aria-hidden="true"
                  >
                    <span className="absolute inset-x-0 top-0 border-t-2 border-dashed border-line dark:border-white/10" />
                    <span
                      className={`absolute inset-x-0 top-0 h-0.5 origin-left bg-[#3EE6B8] transition-transform duration-500 ${
                        done ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </span>
                </>
              )}

              <StepCircle icon={step.icon} done={done} active={active} />

              <div className="min-w-0 sm:mt-3 sm:text-center">
                <p
                  className={`text-xs font-bold ${
                    done || active ? 'text-ink dark:text-[#F2F7F4]' : 'text-ink-muted dark:text-[#A9BBB2]'
                  }`}
                >
                  {step.label}
                </p>
                <p
                  className={`mt-0.5 text-[11px] ${
                    active
                      ? 'font-bold text-emerald-700 dark:text-[#3EE6B8]'
                      : 'text-ink-muted dark:text-[#A9BBB2]'
                  }`}
                >
                  {meta}
                </p>
              </div>
            </li>
          )
        })}
      </ol>

      <p className="mt-4 text-xs leading-relaxed text-ink-muted dark:text-[#A9BBB2]">
        Lifecycle: Available → Pickup Confirmed → Picked Up → Distributed. The NGO
        advances each step after accepting.
      </p>
    </div>
  )
}
