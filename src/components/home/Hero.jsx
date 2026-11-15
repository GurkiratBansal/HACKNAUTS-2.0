// FRESH:FILE  Landing hero: headline, subtext and primary actions.
// FRESH:AREA  Layout

import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  Leaf,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react'
import { formatNumber } from '../../utils/format'
import HeroArt from './HeroArt'

export default function Hero({ impact, donorTarget, ngoTarget }) {
  return (
    <section className="relative overflow-hidden border-b border-line/70 bg-gradient-to-b from-brand-50 via-canvas to-canvas dark:from-brand-950/70 dark:via-canvas dark:to-canvas">
      <div className="pointer-events-none absolute inset-0 pattern-dots opacity-40" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-brand-200/50 blur-3xl dark:bg-brand-800/40" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-saffron-200/40 blur-3xl dark:bg-saffron-900/20" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-surface/90 px-3.5 py-1.5 text-xs font-semibold text-brand-700 shadow-soft dark:border-brand-700 dark:text-brand-200">
            <Sparkles className="h-3.5 w-3.5 text-saffron-600 dark:text-saffron-400" aria-hidden="true" />
            Surplus food, matched before it spoils
          </span>

          <h1 className="mt-6 text-[2.25rem] font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.5rem]">
            From surplus to support,{' '}
            <span className="text-brand-700 dark:text-brand-300">
              before it goes to{' '}
              <span className="relative inline-block">
                waste.
                <svg
                  viewBox="0 0 160 10"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1 left-0 h-2.5 w-full text-saffron-500"
                  aria-hidden="true"
                >
                  <path d="M2 7c34-4 78-5 156-2" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">
            FRESH connects community kitchens, wedding halls, restaurants and
            individuals with nearby verified NGOs — so good food reaches people,
            not a landfill.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to={donorTarget}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-saffron-500 px-5 text-sm font-bold text-brand-950 shadow-glow transition hover:bg-saffron-400 active:scale-[0.98] focus-visible:outline-brand-500"
            >
              I want to donate food
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to={ngoTarget}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-brand-600 bg-surface/70 px-5 text-sm font-bold text-brand-700 transition hover:bg-brand-50 active:scale-[0.98] focus-visible:outline-brand-500 dark:border-brand-400 dark:text-brand-200 dark:hover:bg-brand-900/40"
            >
              <Building2 className="h-4 w-4" aria-hidden="true" />
              I&apos;m an NGO
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-brand-600 dark:text-brand-300" aria-hidden="true" />
              {formatNumber(impact.activeNgos)} verified NGOs
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-line-strong sm:block" aria-hidden="true" />
            <span className="inline-flex items-center gap-1.5">
              <UtensilsCrossed className="h-4 w-4 text-brand-600 dark:text-brand-300" aria-hidden="true" />
              {formatNumber(impact.meals)} meals saved
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-line-strong sm:block" aria-hidden="true" />
            <span className="inline-flex items-center gap-1.5">
              <Leaf className="h-4 w-4 text-brand-600 dark:text-brand-300" aria-hidden="true" />
              {formatNumber(impact.kg)} kg diverted
            </span>
          </div>
        </div>

        <HeroArt />
      </div>
    </section>
  )
}
