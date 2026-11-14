import { Leaf, ShieldCheck, Sparkles, Users, UtensilsCrossed } from 'lucide-react'
import { useCountUp } from '../../hooks/useCountUp'
import { useInView } from '../../hooks/useInView'
import { formatNumber } from '../../utils/format'

const METRICS = [
  { key: 'meals', label: 'Meals saved', icon: UtensilsCrossed, suffix: '' },
  { key: 'kg', label: 'Food diverted', icon: Leaf, suffix: 'kg' },
  { key: 'co2', label: 'CO₂e avoided', icon: Sparkles, suffix: 'kg' },
  { key: 'activeNgos', label: 'Verified NGO partners', icon: Users, suffix: '' },
]

function Counter({ metric, value, start }) {
  const display = useCountUp(value, { start })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-saffron-400/15 text-saffron-300 ring-1 ring-inset ring-saffron-400/25">
          <metric.icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <dt className="text-sm font-medium text-brand-100/80">{metric.label}</dt>
      </div>
      <dd className="font-display text-4xl font-extrabold tracking-tight text-white tabular-nums sm:text-[2.75rem]">
        <span aria-hidden="true">{formatNumber(display)}</span>
        <span className="sr-only">{formatNumber(value)}</span>
        {metric.suffix && (
          <span className="ml-1.5 text-sm font-semibold text-brand-200">{metric.suffix}</span>
        )}
      </dd>
    </div>
  )
}

export default function ImpactBand({ impact }) {
  const [ref, inView] = useInView({ threshold: 0.25 })

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800"
    >
      <div className="pointer-events-none absolute inset-0 pattern-grid opacity-40" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-saffron-500/10 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-saffron-300">
              Impact so far
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Small handoffs, visible change.
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-brand-100/75">
              Every completed pickup adds to a shared picture of meals rescued,
              food diverted and emissions avoided across the FRESH network.
            </p>
          </div>
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/5 px-3.5 py-2 text-xs text-brand-100/70 ring-1 ring-inset ring-white/10">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-300" aria-hidden="true" />
            Estimate, not an audited figure
          </p>
        </div>

        <dl className="mt-10 grid gap-8 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((metric) => (
            <Counter key={metric.key} metric={metric} value={impact[metric.key]} start={inView} />
          ))}
        </dl>

        <p className="mt-8 text-xs leading-relaxed text-brand-100/60">
          Assumptions: 1 serving = 0.4 kg food, and 1 kg food saved = 2.5 kg CO₂e avoided.
              Sample data.
        </p>
      </div>
    </section>
  )
}
