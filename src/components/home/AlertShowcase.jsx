// FRESH:FILE  Landing preview of the emergency alert experience.
// FRESH:AREA  Emergency

import { BellRing, Building2, CheckCircle2, Timer } from 'lucide-react'

const ALERTS = [
  { name: 'Roti Bank Delhi', distance: '2.1 km away' },
  { name: 'Feeding India Delhi', distance: '3.4 km away' },
  { name: 'No Food Waste Delhi', distance: '4.8 km away' },
]

export default function AlertShowcase() {
  return (
    <section className="border-b border-line/70 bg-surface">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.95fr] lg:gap-14 lg:px-8 lg:py-24">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
            Why FRESH
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Smart alerts keep good food moving.
          </h2>
          <p className="mt-4 leading-relaxed text-ink-soft">
            When a donor lists food, FRESH alerts the three nearest verified
            NGOs. If nobody responds within the response window, it automatically
            escalates to the next three — visibly, on the donor&apos;s page.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-ink-soft">
            {[
              'Urgency is rule-based on the pickup deadline, not a black box.',
              'Escalation is visible step by step, with distances.',
              'Final safety inspection always stays with the receiving NGO.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-saffron-600 dark:text-saffron-400" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200 dark:bg-brand-900/40 dark:text-brand-200 dark:ring-brand-700">
              <BellRing className="h-3.5 w-3.5" aria-hidden="true" />
              3 nearest NGOs first
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-saffron-50 px-3 py-1.5 text-xs font-semibold text-saffron-800 ring-1 ring-inset ring-saffron-200 dark:bg-saffron-900/30 dark:text-saffron-200 dark:ring-saffron-800">
              <Timer className="h-3.5 w-3.5" aria-hidden="true" />
              60s auto-escalation
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-brand-950 p-5 shadow-lift ring-1 ring-white/10 sm:p-6">
          <div className="pointer-events-none absolute inset-0 pattern-grid opacity-30" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-saffron-500/10 blur-2xl" aria-hidden="true" />

          <div className="relative flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white">Smart alert panel</h3>
            <span className="rounded-full bg-saffron-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-saffron-300 ring-1 ring-inset ring-saffron-400/30">
              Live alert flow
            </span>
          </div>

          <div className="relative mt-4 space-y-2.5">
            {ALERTS.map((ngo) => (
              <div
                key={ngo.name}
                className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-inset ring-white/10"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-800 text-brand-200">
                  <Building2 className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{ngo.name}</p>
                  <p className="text-xs text-brand-100/70">{ngo.distance}</p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-400/15 px-2 py-1 text-[10px] font-semibold text-brand-200 ring-1 ring-inset ring-brand-400/25">
                  Alerted
                </span>
              </div>
            ))}
          </div>

          <p className="relative mt-4 flex items-start gap-2 rounded-xl bg-saffron-400/10 px-3 py-2.5 text-xs leading-relaxed text-saffron-100 ring-1 ring-inset ring-saffron-400/20">
            <Timer className="mt-0.5 h-3.5 w-3.5 shrink-0 text-saffron-300" aria-hidden="true" />
            No response in 60 seconds → the next 3 nearest verified NGOs are
            added automatically.
          </p>
        </div>
      </div>
    </section>
  )
}
