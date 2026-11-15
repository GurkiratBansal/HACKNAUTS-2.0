// FRESH:FILE  Final call-to-action band: dark forest card, emerald glow, mint gradient button.
// FRESH:AREA  Layout

import { Link } from 'react-router-dom'
import { ArrowRight, Building2, ShieldCheck, Sparkles } from 'lucide-react'

export default function ClosingCta({ donorTarget, ngoTarget }) {
  return (
    <section className="bg-canvas py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[14px] border border-white/10 bg-[#06130F] p-8 sm:p-12 shadow-2xl">
          <div className="fresh-emerald-glow opacity-80" aria-hidden="true" />
          <div className="fresh-hero-grid opacity-60" aria-hidden="true" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-[8px] border border-white/10 bg-[#0B2219]/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#3EE6B8]">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                <span>Ready to divert surplus?</span>
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F2F7F4]">
                Turn today&apos;s surplus into tonight&apos;s meal
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#A9BBB2]">
                List food in under a minute. Verified local shelters receive instant alerts
                and coordinate collection before the window closes.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-[#A9BBB2]">
                <ShieldCheck className="h-4 w-4 text-[#3EE6B8]" aria-hidden="true" />
                <span>Simple donor declaration and volunteer verification at handover.</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row shrink-0">
              <Link
                to={donorTarget}
                className="fresh-btn-primary inline-flex h-12 items-center justify-center gap-2 px-6 text-xs font-bold shadow-md"
              >
                Donate food
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to={ngoTarget}
                className="fresh-btn-secondary inline-flex h-12 items-center justify-center gap-2 px-6 text-xs font-bold"
              >
                <Building2 className="h-4 w-4 text-[#3EE6B8]" aria-hidden="true" />
                Join as an NGO
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
