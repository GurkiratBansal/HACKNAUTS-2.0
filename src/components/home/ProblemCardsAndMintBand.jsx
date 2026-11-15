// FRESH:FILE  Light problem cards section with pale mint gradient band.
// FRESH:AREA  Layout

import { AlertTriangle, Clock, MapPin, Sparkles } from 'lucide-react'

const PROBLEMS = [
  {
    icon: Clock,
    title: 'The Safe Window Barrier',
    text: 'Prepared hot food degrades rapidly. Without clear, countdown-based pickup windows, safe meals are pre-emptively thrown away to avoid liability.',
  },
  {
    icon: MapPin,
    title: 'The Proximity Black Hole',
    text: 'Kitchens do not know which verified shelters have transport vehicles available within 15 minutes of their specific neighbourhood.',
  },
  {
    icon: AlertTriangle,
    title: 'Traffic & Road Blindspots',
    text: 'Straight-line radar estimates fail in Indian metropolitan traffic. Pickups require realistic driving polylines calculated on real road grids.',
  },
]

export default function ProblemCardsAndMintBand() {
  return (
    <section className="bg-[#F4F6F5] py-20 px-4 sm:px-6 lg:px-8 border-b border-[#D3DCD8] dark:bg-[#06130F] dark:border-white/10">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#D3DCD8] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0A7A5C] shadow-sm dark:border-white/10 dark:bg-[#0B2219] dark:text-[#3EE6B8]">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            <span>The Food Waste Gap</span>
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0C1A15] dark:text-[#F2F7F4]">
            Why good food <span className="fresh-gradient-text">still gets lost</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#4B5E56] dark:text-[#A9BBB2]">
            Food recovery fails when matching systems ignore the physical constraints of perishable meals.
          </p>
        </div>

        {/* Three Pale Bordered Cards with Icon Top-Left */}
        <div className="grid gap-6 md:grid-cols-3">
          {PROBLEMS.map((problem) => {
            const Icon = problem.icon
            return (
              <div
                key={problem.title}
                className="flex flex-col justify-between rounded-[10px] border border-[#D3DCD8] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#0A7A5C]/40 dark:border-white/10 dark:bg-[#0B2219]/70 dark:hover:border-[#3EE6B8]/40"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-[#D3DCD8] bg-[#E9EEEC] text-[#0A7A5C] dark:border-white/10 dark:bg-[#06130F] dark:text-[#3EE6B8]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-[#0C1A15] dark:text-[#F2F7F4]">
                    {problem.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#4B5E56] dark:text-[#A9BBB2]">
                    {problem.text}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pale Mint Gradient Band */}
        <div className="fresh-mint-band mt-14 rounded-[12px] border border-[#D3DCD8] p-8 sm:p-12 text-center shadow-sm dark:border-white/10">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0A7A5C] dark:text-[#3EE6B8]">
            The FRESH Solution
          </p>
          <h3 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#0C1A15] dark:text-[#F2F7F4]">
            &ldquo;FRESH shows the right food to the right NGO while it is still usable.&rdquo;
          </h3>
          <p className="mt-3 max-w-xl mx-auto text-xs text-[#4B5E56] dark:text-[#A9BBB2]">
            By prioritizing urgent listings and calculating road routes, pickups happen inside the safe consumption window.
          </p>
        </div>
      </div>
    </section>
  )
}
