import {
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  UtensilsCrossed,
} from 'lucide-react'

/**
 * Layered, fully inline artwork for the hero. The floating cards mirror real
 * product surfaces (food card, map pin, pickup confirmation) without using
 * any external imagery.
 */
export default function HeroArt() {
  return (
    <div className="relative mx-auto w-full max-w-[600px]">
      <div
        className="pointer-events-none absolute -inset-5 rounded-[3rem] bg-gradient-to-br from-brand-200/80 via-cream to-saffron-200/70 blur-2xl dark:from-brand-800/40 dark:via-canvas dark:to-saffron-900/20"
        aria-hidden="true"
      />

      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/30 bg-[radial-gradient(circle_at_78%_10%,rgb(52_211_153_/_0.24),transparent_28%),linear-gradient(135deg,#065f46,#047857_55%,#0f766e)] p-5 shadow-lift ring-1 ring-brand-950/10 sm:p-6">
        <div className="pointer-events-none absolute inset-0 pattern-rings opacity-30" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-14 -top-16 h-56 w-56 rounded-full bg-saffron-300/15 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" aria-hidden="true" />

        <div className="relative flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-bold text-brand-50 shadow-sm ring-1 ring-inset ring-white/20 backdrop-blur">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-saffron-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-saffron-400" />
            </span>
            Live nearby
          </span>
          <span className="text-[11px] font-semibold text-brand-100/80">Ludhiana · demo</span>
        </div>

        <div className="relative mt-5 min-h-[320px] overflow-hidden rounded-[1.6rem] bg-brand-950/35 shadow-inner ring-1 ring-inset ring-white/15 sm:min-h-[360px]">
          <svg
            viewBox="0 0 400 330"
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label="A shared plate, a nearby verified NGO and a confirmed pickup"
          >
            <circle cx="262" cy="148" r="92" className="fill-cream/10" />
            <circle cx="262" cy="148" r="92" fill="none" strokeWidth="2" className="stroke-cream/20" />
            <circle cx="262" cy="148" r="64" fill="none" strokeWidth="2" className="stroke-cream/15" />
            <circle cx="246" cy="136" r="18" className="fill-saffron-400/80" />
            <circle cx="280" cy="145" r="15" className="fill-brand-300/70" />
            <circle cx="258" cy="171" r="13" className="fill-saffron-300/60" />
            <path
              d="M246 118c3-8 11-12 19-11-1 8-8 15-16 15"
              className="fill-brand-200/70"
            />
            <path
              d="M56 282c58-32 101-27 145-57 31-21 34-43 57-57"
              fill="none"
              strokeWidth="3"
              strokeDasharray="2 9"
              strokeLinecap="round"
              className="stroke-saffron-300/80"
            />
            <circle cx="56" cy="282" r="5" className="fill-saffron-300" />
            <circle cx="56" cy="282" r="11" fill="none" strokeWidth="1.5" className="stroke-saffron-300/50" />
            <circle cx="332" cy="278" r="4" className="fill-cream/30" />
            <circle cx="348" cy="250" r="2.5" className="fill-cream/20" />
          </svg>

          <div className="absolute right-4 top-4 flex animate-float-slow flex-col items-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-cream bg-brand-600 text-white shadow-card ring-4 ring-brand-950/10">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="mt-1.5 rounded-full bg-surface px-2.5 py-1 text-[10px] font-bold text-ink shadow-soft">
              NGO · 2.1 km
            </span>
          </div>

          <div className="absolute right-4 top-[104px] flex items-center gap-2 rounded-2xl border border-white/60 bg-surface/95 px-3 py-2.5 shadow-card backdrop-blur">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block text-[11px] font-bold text-ink">Pickup confirmed</span>
               <span className="block text-[10px] font-medium text-ink-muted">Community kitchen sample</span>
            </span>
          </div>

          <div className="absolute bottom-4 left-4 w-[min(72%,260px)] animate-float rounded-2xl border border-white/70 bg-surface/95 p-3.5 shadow-card backdrop-blur">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-saffron-100 text-saffron-700 dark:bg-saffron-900/30 dark:text-saffron-300">
                  <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="leading-tight">
                  <p className="text-[11px] font-medium text-ink-muted">Veg biryani</p>
                  <p className="text-[12px] font-bold text-ink">80 servings</p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warning-50 px-1.5 py-0.5 text-[9px] font-bold text-warning-800 ring-1 ring-inset ring-warning-200 dark:bg-warning-900/30 dark:text-warning-200 dark:ring-warning-800">
                <Clock className="h-2.5 w-2.5" aria-hidden="true" />
                Soon
              </span>
            </div>
             <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
               <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-brand-500 via-emerald-400 to-saffron-500" />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px]">
              <span className="font-medium text-ink-muted">Pickup window</span>
              <span className="font-bold text-ink">1h 42m left</span>
            </div>
          </div>
        </div>

        <div className="relative mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-[11px] text-brand-100/80">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-saffron-300" aria-hidden="true" />
            3 verified NGOs alerted
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-saffron-300" aria-hidden="true" />
            60s auto-escalation
          </span>
        </div>
      </div>
    </div>
  )
}
