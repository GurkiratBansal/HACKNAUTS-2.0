// FRESH:FILE  Hero visual: skewed glass steps pickup journey with CSS glow cycle.
// FRESH:AREA  Layout

import {
  Bell,
  CheckCircle2,
  Heart,
  Navigation,
  UtensilsCrossed,
} from 'lucide-react'

const STEPS = [
  {
    num: '01',
    title: 'Donor lists food',
    desc: 'Surplus quantity, dish type, and safe pickup deadline',
    icon: UtensilsCrossed,
  },
  {
    num: '02',
    title: 'Nearby NGOs alerted',
    desc: 'Automated notification to 3 nearest verified partners',
    icon: Bell,
  },
  {
    num: '03',
    title: 'NGO accepts',
    desc: 'Pickup claim locked, direct contact and instructions unlocked',
    icon: CheckCircle2,
  },
  {
    num: '04',
    title: 'Road route to pickup',
    desc: 'Live turn-by-turn road route avoiding traffic bottlenecks',
    icon: Navigation,
  },
  {
    num: '05',
    title: 'Distributed',
    desc: 'Meals reach families and communities before spoiling',
    icon: Heart,
  },
]

export default function HeroArt() {
  return (
    <div
      className="relative mx-auto w-full max-w-[520px] select-none"
      aria-hidden="true"
    >
      {/* Soft backplate glow */}
      <div className="pointer-events-none absolute -inset-4 rounded-[24px] bg-[#0F4A38]/30 blur-2xl" />

      {/* Glass card container */}
      <div className="relative rounded-[16px] border border-white/10 bg-[#06130F]/80 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#3EE6B8] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#3EE6B8]">
              Automated handoff cycle
            </span>
          </div>
          <span className="rounded-[6px] border border-white/10 bg-[#0B2219] px-2 py-0.5 text-[10px] font-semibold text-[#A9BBB2]">
            5-Stage Pipeline
          </span>
        </div>

        {/* Stack of skewed glass steps */}
        <div className="fresh-hero-steps-container">
          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.num}
                className="fresh-hero-step group"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-white/10 bg-[#06130F] text-[#3EE6B8] transition group-hover:border-[#3EE6B8]/50">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-bold text-[#F2F7F4]">
                      {step.title}
                    </span>
                    <span className="font-mono text-[10px] font-semibold text-[#A9BBB2]">
                      {step.num}
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-[#A9BBB2]">
                    {step.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-[#A9BBB2]">
          <span>Hover or focus to pause</span>
          <span className="text-[#3EE6B8]">CSS-driven · 60fps</span>
        </div>
      </div>
    </div>
  )
}
