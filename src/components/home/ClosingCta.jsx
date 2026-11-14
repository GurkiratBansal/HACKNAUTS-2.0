import { Link } from 'react-router-dom'
import { ArrowRight, Building2, ShieldCheck } from 'lucide-react'

export default function ClosingCta({ donorTarget, ngoTarget }) {
  return (
    <section className="bg-canvas">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6 sm:pb-24 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-brand-800 via-brand-700 to-brand-600 px-6 py-10 shadow-lift sm:px-10 sm:py-12 lg:px-14">
          <div className="pointer-events-none absolute inset-0 pattern-rings opacity-40" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-saffron-400/20 blur-3xl" aria-hidden="true" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-saffron-300">
                Have surplus food today?
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Turn today&apos;s surplus into tonight&apos;s meal.
              </h2>
              <p className="mt-3 max-w-xl leading-relaxed text-brand-50/85">
                List it in under a minute. A verified NGO nearby can accept the
                pickup before the window closes.
              </p>
              <p className="mt-4 inline-flex items-start gap-2 text-xs leading-relaxed text-brand-100/70">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-200" aria-hidden="true" />
                Donor declaration and receiving-NGO inspection keep safety human
                and accountable.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row lg:flex-col xl:flex-row">
              <Link
                to={donorTarget}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-saffron-500 px-5 text-sm font-bold text-brand-950 shadow-glow transition hover:bg-saffron-400 active:scale-[0.98]"
              >
                Donate food
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to={ngoTarget}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/40 px-5 text-sm font-bold text-white transition hover:bg-white/10 active:scale-[0.98]"
              >
                <Building2 className="h-4 w-4" aria-hidden="true" />
                Join as an NGO
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
