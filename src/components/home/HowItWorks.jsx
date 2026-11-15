// FRESH:FILE  Three-step explainer section on the landing page.
// FRESH:AREA  Layout

import {
  HandHeart,
  Search,
  ShieldCheck,
  Truck,
  UtensilsCrossed,
} from 'lucide-react'

const STEPS = [
  {
    icon: UtensilsCrossed,
    title: 'Donate',
    text: 'A kitchen, banquet hall or individual lists surplus food with a pickup deadline and handling details.',
  },
  {
    icon: Search,
    title: 'Discover',
    text: 'Verified NGOs nearby see the listing on a live map, sorted by urgency and distance.',
  },
  {
    icon: HandHeart,
    title: 'Accept',
    text: 'An NGO accepts the pickup, receives the donor contact and inspects the food on arrival.',
  },
  {
    icon: Truck,
    title: 'Distribute',
    text: 'The pickup is marked complete and the meals reach people instead of a landfill.',
  },
]

export default function HowItWorks() {
  return (
    <section className="border-b border-line/70 bg-canvas">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
              How it works
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Four steps from a full tray to a full plate.
            </h2>
            <p className="mt-3 leading-relaxed text-ink-soft">
              The platform coordinates the handoff. The donor and the receiving
              NGO remain responsible for food safety.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink-soft shadow-soft">
            <span className="h-2 w-2 rounded-full bg-saffron-500" aria-hidden="true" />
            About 60 seconds to list
          </span>
        </div>

        <div className="relative mt-14">
          <div
            className="absolute left-[12.5%] right-[12.5%] top-7 hidden border-t-2 border-dashed border-line-strong lg:block"
            aria-hidden="true"
          />
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative flex flex-col">
                <div className="flex justify-center">
                  <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 font-display text-base font-bold text-white shadow-soft ring-8 ring-canvas">
                    0{index + 1}
                    <span className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-canvas bg-saffron-500 text-brand-950">
                      <step.icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </span>
                </div>
                <div className="mt-5 flex flex-1 flex-col rounded-2xl border border-line bg-surface p-5 shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-card">
                  <h3 className="text-base font-bold text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-8 flex items-start gap-2 rounded-xl border border-line bg-surface/60 px-4 py-3 text-xs leading-relaxed text-ink-muted">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden="true" />
          FRESH coordinates the handoff only — final food safety verification
          always rests with the donor and the receiving NGO.
        </p>
      </div>
    </section>
  )
}
