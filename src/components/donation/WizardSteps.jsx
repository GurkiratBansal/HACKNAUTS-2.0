// FRESH:FILE  Step indicator for the donation wizard.
// FRESH:AREA  Donations

import { Check } from 'lucide-react'

const STEPS = [
  { key: 'basics', label: 'Food details' },
  { key: 'handling', label: 'Handling' },
  { key: 'pickup', label: 'Pickup point' },
  { key: 'photo', label: 'Photo & review' },
]

/**
 * Four-step progress rail. Completed steps stay clickable so donors can jump
 * back without losing entered data; upcoming steps stay disabled.
 */
export default function WizardSteps({ current, onSelect }) {
  return (
    <nav aria-label="Add donation progress">
      <ol className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {STEPS.map((step, index) => {
          const done = index < current
          const active = index === current

          return (
            <li key={step.key} className="min-w-0">
              <button
                type="button"
                onClick={() => done && onSelect(index)}
                disabled={!done}
                aria-current={active ? 'step' : undefined}
                aria-label={`Step ${index + 1} of 4: ${step.label}${
                  done ? ' (completed)' : active ? ' (current)' : ''
                }`}
                className="group flex w-full min-w-0 flex-col gap-1.5 rounded-xl py-0.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500 disabled:cursor-default"
              >
                <span className="flex w-full min-w-0 items-center">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-xs font-bold transition-colors ${
                      done
                        ? 'border border-fresh-mint/40 bg-fresh-mint/20 text-fresh-mint'
                        : active
                          ? 'bg-gradient-to-r from-fresh-mint to-fresh-teal text-fresh-cta shadow-fresh-sm'
                          : 'border border-fresh-border bg-black/5 text-fresh-ink-muted dark:bg-white/5'
                    }`}
                  >
                    {done ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  {index < STEPS.length - 1 && (
                    <span
                      className={`ml-1.5 h-0.5 min-w-2 flex-1 rounded-full transition-colors ${
                        done ? 'bg-fresh-mint' : 'bg-fresh-border'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </span>
                <span
                  className={`text-[11px] font-semibold leading-tight sm:text-xs ${
                    active
                      ? 'font-bold text-fresh-ink dark:text-fresh-light-bg'
                      : done
                        ? 'text-fresh-mint'
                        : 'text-fresh-ink-muted'
                  }`}
                >
                  {step.label}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
