// FRESH:FILE  UN SDG goals restyled as small bordered tiles (no official UN logos).
// FRESH:AREA  Impact

import { Globe2 } from 'lucide-react'

const SDGS = [
  {
    number: '02',
    title: 'Zero Hunger',
    desc: 'Targeted surplus redirection prevents meal wastage and supports community nutritional security.',
    tag: 'Goal 2',
  },
  {
    number: '03',
    title: 'Good Health & Well-being',
    desc: 'Standardized safe handling guidelines, temperature warnings, and human verification at handoff.',
    tag: 'Goal 3',
  },
  {
    number: '11',
    title: 'Sustainable Cities',
    desc: 'Hyperlocal mapping keeps transit routes under 10 km, reducing emissions and vehicle miles.',
    tag: 'Goal 11',
  },
  {
    number: '12',
    title: 'Responsible Consumption',
    desc: 'Equips commercial catering and banquets to track, document, and divert edible leftovers.',
    tag: 'Goal 12',
  },
  {
    number: '17',
    title: 'Partnerships for the Goals',
    desc: 'Direct bridge connecting food businesses, verified charities, and municipal volunteer groups.',
    tag: 'Goal 17',
  },
]

export default function SdgGrid() {
  return (
    <section className="bg-canvas py-16 px-4 sm:px-6 lg:px-8 border-b border-line dark:border-white/10">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-[8px] border border-line bg-surface px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0A7A5C] shadow-sm dark:border-white/10 dark:bg-[#0B2219] dark:text-[#3EE6B8]">
            <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Sustainable Development Goals</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink dark:text-[#F2F7F4]">
            Aligned with <span className="fresh-gradient-text">global impact</span> targets
          </h2>
        </div>

        {/* Small Bordered Tiles */}
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
          {SDGS.map((sdg) => (
            <div
              key={sdg.number}
              className="flex flex-col justify-between rounded-[10px] border border-line bg-surface p-4 shadow-sm transition hover:border-[#3EE6B8]/40 dark:border-white/10 dark:bg-[#0B2219]/70"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-black text-brand-600 dark:text-[#3EE6B8]">
                    {sdg.number}
                  </span>
                  <span className="rounded-[4px] border border-line bg-elevated px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-ink-muted dark:border-white/10 dark:bg-[#06130F] dark:text-[#A9BBB2]">
                    {sdg.tag}
                  </span>
                </div>
                <h3 className="mt-2 text-xs font-bold text-ink dark:text-[#F2F7F4]">
                  {sdg.title}
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-soft dark:text-[#A9BBB2]">
                  {sdg.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
