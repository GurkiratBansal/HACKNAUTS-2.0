import { useMemo } from 'react'
import {
  Building2,
  CheckCircle2,
  Leaf,
  Scale,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react'
import { useApp, BASELINE_IMPACT } from '../context/AppContext'
import StatTile from '../components/dashboard/StatTile'
import Button from '../components/ui/Button'
import { formatNumber } from '../utils/format'

const MONTHS = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']
const BASELINE_MONTHS = [1800, 2100, 1950, 2400, 2700, 3100]

export default function ImpactDashboard() {
  const { impact, donations } = useApp()

  const chart = useMemo(() => {
    const now = new Date()
    const currentKey = `${now.getFullYear()}-${now.getMonth()}`
    const currentMeals = donations
      .filter((donation) => donation.status === 'distributed')
      .filter((donation) => {
        const date = new Date(
          donation.timeline?.find((entry) => entry.status === 'distributed')?.at ||
            donation.createdAt,
        )
        return `${date.getFullYear()}-${date.getMonth()}` === currentKey
      })
      .reduce((sum, donation) => sum + Number(donation.quantity || 0), 0)
    return MONTHS.map((label, index) => ({
      label,
      meals: BASELINE_MONTHS[index] + (index === MONTHS.length - 1 ? currentMeals : 0),
    }))
  }, [donations])

  const max = Math.max(...chart.map((entry) => entry.meals), 1)
  const totalTrend = chart.reduce((sum, entry) => sum + entry.meals, 0)
  const points = chart
    .map((entry, index) => {
      const x = (index / (chart.length - 1)) * 100
      const y = 100 - (entry.meals / max) * 82
      return `${x},${y}`
    })
    .join(' ')

  return (
    <main className="bg-canvas">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
              Impact dashboard
            </p>
            <h1 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Every meal counts.
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft sm:text-base">
              Live totals combine seeded baseline data with the donations completed
              in this browser.
            </p>
          </div>
          <Button to="/ngo" variant="outline" size="md">
            Find a pickup
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatTile
            label="Meals saved"
            value={impact.meals}
            icon={UtensilsCrossed}
            tone="brand"
            hint="Network total"
          />
          <StatTile
            label="Kg food diverted"
            value={impact.kg}
            decimals={0}
            suffix="kg"
            icon={Scale}
            tone="saffron"
            hint="1 serving = 0.4 kg"
          />
          <StatTile
            label="CO₂e avoided"
            value={impact.co2}
            decimals={0}
            suffix="kg"
            icon={Leaf}
            tone="info"
            hint="1 kg = 2.5 kg CO₂e"
          />
          <StatTile
            label="Active NGOs"
            value={impact.activeNgos}
            icon={Building2}
            tone="neutral"
            hint="Verified partners"
          />
          <StatTile
            label="Donations completed"
            value={impact.completed}
            icon={CheckCircle2}
            tone="brand"
            hint="Pickup to distribution"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">
                  Meals saved over time
                </h2>
                <p className="mt-0.5 text-xs text-ink-muted">
                  Seeded baseline plus the current month.
                </p>
              </div>
              <p className="text-sm font-bold text-brand-700 dark:text-brand-300">
                {formatNumber(totalTrend)} meals
              </p>
            </div>

            <div
              className="mt-6 flex h-52 items-end gap-3"
              role="img"
              aria-label="Bar chart of meals saved per month"
            >
              {chart.map((item) => (
                <div
                  key={item.label}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="text-[11px] font-bold tabular-nums text-ink-muted">
                    {formatNumber(item.meals)}
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition-all duration-700 dark:from-brand-500 dark:to-brand-300"
                    style={{ height: `${Math.max(6, (item.meals / max) * 100)}%` }}
                  />
                  <span className="text-xs font-semibold text-ink-muted">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <dl className="sr-only">
              {chart.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{formatNumber(item.meals)} meals</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 rounded-2xl bg-elevated p-4 ring-1 ring-inset ring-line">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                  Trend line
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 dark:text-brand-300">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  growing
                </span>
              </div>
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="mt-2 h-24 w-full text-brand-600 dark:text-brand-300"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="fresh-trend" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon points={`0,100 ${points} 100,100`} fill="url(#fresh-trend)" />
                <polyline
                  points={points}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-3xl border border-line bg-surface p-5 shadow-card">
              <h2 className="font-display text-base font-bold text-ink">
                How this is calculated
              </h2>
              <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-ink-soft">
                <li className="flex items-start gap-2">
                  <Dot /> 1 serving = 0.4 kg of food.
                </li>
                <li className="flex items-start gap-2">
                  <Dot /> 1 kg food saved = 2.5 kg CO₂e avoided.
                </li>
                <li className="flex items-start gap-2">
                  <Dot /> Only distributions marked complete count toward the live
                  additions.
                </li>
                <li className="flex items-start gap-2">
                  <Dot /> Baseline: {formatNumber(BASELINE_IMPACT.meals)} meals and{' '}
                  {formatNumber(BASELINE_IMPACT.completed)} completed donations from
                  the FRESH network.
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-brand-200/80 bg-brand-50/80 p-5 shadow-soft dark:border-brand-800 dark:bg-brand-900/25">
              <h2 className="font-display text-base font-bold text-ink">
              Your contribution
              </h2>
              <p className="mt-1 font-display text-4xl font-extrabold tabular-nums text-brand-800 dark:text-brand-200">
                {formatNumber(impact.distributedDonations)}
              </p>
              <p className="text-sm text-ink-soft">
                completed donation
                {impact.distributedDonations === 1 ? '' : 's'} in this browser
              </p>
              <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                Complete the NGO pickup flow to watch these numbers rise. The totals
                persist after refresh through localStorage.
              </p>
            </div>

            <p className="rounded-2xl border border-line bg-surface p-4 text-xs leading-relaxed text-ink-muted">
              These are estimates, not audited environmental
              claims. FRESH does not guarantee food safety.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}

function Dot() {
  return (
    <span
      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600 dark:bg-brand-300"
      aria-hidden="true"
    />
  )
}
