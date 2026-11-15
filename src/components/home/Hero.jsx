// FRESH:FILE  Dark landing hero: forest green, emerald radial glow, 64px faint grid, mint headline, dual CTAs and skewed glass steps.
// FRESH:AREA  Layout

import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import HeroArt from './HeroArt'

export default function Hero({ impact: _impact, donorTarget, ngoTarget }) {
  return (
    <section className="fresh-dark-hero border-b border-white/10 px-4 pb-20 pt-14 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8">
      {/* Background radial emerald glow */}
      <div className="fresh-emerald-glow" aria-hidden="true" />

      {/* Faint 64px grid with 4% white lines fading out at edges */}
      <div className="fresh-hero-grid" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        {/* Left Column: Headlines and actions */}
        <div className="max-w-2xl text-left">
          {/* Small uppercase section label with a tiny icon above centered heading */}
          <div className="inline-flex items-center gap-2 rounded-[8px] border border-white/10 bg-[#0B2219]/80 px-3 py-1.5 shadow-sm backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[#3EE6B8]" aria-hidden="true" />
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3EE6B8]">
              Decentralized Food Rescue
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.12] tracking-tight text-[#F2F7F4] sm:text-5xl lg:text-6xl">
            Surplus food to{' '}
            <span className="fresh-gradient-text">nearby NGOs</span>, before it
            goes to waste
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#A9BBB2] sm:text-lg">
            FRESH shows donors and NGOs each other on a local map, ranks food by
            pickup time, and guides the pickup by road. India only for now.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to={donorTarget}
              className="fresh-btn-primary inline-flex h-12 items-center justify-center gap-2 px-6 text-sm font-bold shadow-lg"
            >
              I want to donate food
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to={ngoTarget}
              className="fresh-btn-secondary inline-flex h-12 items-center justify-center gap-2 px-6 text-sm font-bold shadow-sm"
            >
              <Building2 className="h-4 w-4 text-[#3EE6B8]" aria-hidden="true" />
              I&apos;m an NGO
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-xs font-medium text-[#A9BBB2]">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-[#3EE6B8]" aria-hidden="true" />
              Local radius &amp; road routing
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-white/20 sm:block" aria-hidden="true" />
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#3EE6B8]" aria-hidden="true" />
              Human inspection at handover
            </span>
          </div>
        </div>

        {/* Right Column: Skewed glass steps animation */}
        <div className="w-full">
          <HeroArt />
        </div>
      </div>
    </section>
  )
}
