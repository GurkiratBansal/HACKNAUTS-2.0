import {
  CheckCircle2,
  Clock3,
  Navigation,
  PackageCheck,
  Sparkles,
} from 'lucide-react'

/**
 * Product-style hero animation. It intentionally uses only HTML/SVG so the
 * landing page remains fast, self-contained and editable without a video asset.
 */
export default function HeroArt() {
  return (
    <div className="relative mx-auto w-full max-w-[620px]" aria-label="FRESH product preview">
      <div className="fresh-saas-glow pointer-events-none absolute -inset-6" aria-hidden="true" />

      <div className="fresh-saas-window relative overflow-hidden rounded-[2rem] border border-white/30 bg-[#063f31] p-3 shadow-lift ring-1 ring-brand-950/10 sm:rounded-[2.5rem] sm:p-4">
        <div className="pointer-events-none absolute inset-0 fresh-saas-grid opacity-50" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-300/15 blur-3xl" aria-hidden="true" />

        <div className="relative flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2.5 text-white backdrop-blur sm:px-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-300/20 text-emerald-200">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span className="text-[11px] font-bold tracking-wide">FRESH network</span>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-100/75">
            <span className="h-1.5 w-1.5 rounded-full bg-lime-300 shadow-[0_0_10px_2px_rgb(190_242_100_/_0.7)]" />
            Live nearby
          </span>
        </div>

        <div className="relative mt-3 grid min-h-[330px] grid-cols-[1fr_0.82fr] gap-3 sm:min-h-[370px] sm:gap-4">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#07513e] p-3 sm:p-4">
            <div className="flex items-center justify-between text-[10px] font-semibold text-emerald-100/70">
              <span>Nearby food map</span>
              <span className="rounded-full bg-white/10 px-2 py-1">Ludhiana · nearby</span>
            </div>

            <svg
              viewBox="0 0 360 270"
              className="absolute inset-x-0 bottom-0 h-[78%] w-full"
              role="img"
              aria-label="Animated road route from a food donor to a nearby NGO"
            >
              <defs>
                <linearGradient id="fresh-route-gradient" x1="0" x2="1">
                  <stop offset="0" stopColor="#bef264" />
                  <stop offset="1" stopColor="#6ee7b7" />
                </linearGradient>
              </defs>
              <path d="M24 226C76 212 66 155 122 163S164 95 212 112s62-40 122-61" className="fresh-saas-road" />
              <path d="M24 226C76 212 66 155 122 163S164 95 212 112s62-40 122-61" className="fresh-saas-route" />
              <circle cx="24" cy="226" r="8" className="fill-lime-300" />
              <circle cx="24" cy="226" r="15" className="fresh-saas-pulse fill-none stroke-lime-200/50" />
              <circle cx="334" cy="51" r="10" className="fill-emerald-200" />
              <circle cx="334" cy="51" r="19" className="fresh-saas-pulse fill-none stroke-emerald-200/40 [animation-delay:700ms]" />
              <circle cx="139" cy="157" r="7" className="fill-orange-300" />
              <circle cx="211" cy="111" r="6" className="fill-teal-200" />
            </svg>

            <div className="absolute bottom-4 left-4 rounded-xl border border-white/15 bg-[#063f31]/85 px-3 py-2 text-white shadow-lg backdrop-blur">
              <p className="text-[10px] font-semibold text-emerald-100/65">Active route</p>
              <p className="mt-0.5 text-xs font-bold">Road route · 2.1 km</p>
            </div>
            <div className="absolute bottom-4 right-4 overflow-hidden rounded-xl border border-white/40 bg-white/15 p-1 shadow-lg backdrop-blur">
              <img
                src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=160&q=75"
                alt="Fresh shared meal"
                loading="lazy"
                className="h-12 w-12 rounded-lg object-cover"
              />
            </div>
          </div>

          <div className="relative flex flex-col gap-3">
            <div className="fresh-saas-card fresh-saas-card--one rounded-2xl border border-white/60 bg-white/95 p-3 shadow-xl">
              <div className="flex items-start gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <PackageCheck className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-500">Pickup status</p>
                  <p className="mt-0.5 truncate text-xs font-extrabold text-slate-900">Pickup confirmed</p>
                  <p className="mt-1 text-[10px] font-medium text-slate-500">Community kitchen sample</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Handoff ready
              </div>
            </div>

            <div className="fresh-saas-card fresh-saas-card--two rounded-2xl border border-white/60 bg-white/95 p-3 shadow-xl">
              <div className="flex items-center gap-2">
                <img
                  src="https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=120&q=75"
                  alt="Vegetarian meal tray"
                  loading="lazy"
                  className="h-9 w-9 shrink-0 rounded-lg object-cover ring-2 ring-orange-100"
                />
                <div>
                  <p className="text-[10px] font-semibold text-slate-500">New donation</p>
                  <p className="text-xs font-extrabold text-slate-900">60 meal trays</p>
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="fresh-saas-progress h-full rounded-full bg-gradient-to-r from-orange-400 to-lime-400" />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" aria-hidden="true" /> Urgent</span>
                <span>15 min left</span>
              </div>
            </div>

            <div className="fresh-saas-card fresh-saas-card--three mt-auto rounded-2xl border border-emerald-200/20 bg-emerald-300/15 p-3 text-emerald-50 backdrop-blur">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                  <Navigation className="h-3.5 w-3.5 text-lime-300" aria-hidden="true" />
                </span>
                <span className="text-[11px] font-bold">3 verified NGOs alerted</span>
              </div>
              <p className="mt-1 text-[10px] font-medium text-emerald-100/65">The nearest match is on the way.</p>
            </div>
          </div>
        </div>

        <div className="relative mt-3 flex items-center justify-between gap-3 px-1 text-[10px] font-semibold text-emerald-100/65">
          <span>Less waste</span>
          <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
          <span>More shared meals</span>
        </div>
      </div>
    </div>
  )
}
