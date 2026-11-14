import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  CheckCircle2,
  Leaf,
  Scale,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react'
import { useApp, BASELINE_IMPACT } from '../context/AppContext'
import StatCard from '../components/StatCard'
import { formatNumber } from '../utils/format'

const MONTHS = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']
const BASELINE_MONTHS = [1800, 2100, 1950, 2400, 2700, 3100]

export default function ImpactDashboard() {
  const { impact, donations } = useApp()

  const chart = useMemo(() => {
    const now = new Date()
    const currentKey = `${now.getFullYear()}-${now.getMonth()}`
    const currentMeals = donations
      .filter((d) => d.status === 'distributed')
      .filter((d) => {
        const date = new Date(d.timeline?.find((t) => t.status === 'distributed')?.at || d.createdAt)
        return `${date.getFullYear()}-${date.getMonth()}` === currentKey
      })
      .reduce((sum, d) => sum + Number(d.quantity || 0), 0)
    return MONTHS.map((label, index) => ({
      label,
      meals: BASELINE_MONTHS[index] + (index === MONTHS.length - 1 ? currentMeals : 0),
    }))
  }, [donations])

  const max = Math.max(...chart.map((c) => c.meals), 1)
  const totalTrend = chart.reduce((sum, c) => sum + c.meals, 0)
  const points = chart
    .map((c, index) => {
      const x = (index / (chart.length - 1)) * 100
      const y = 100 - (c.meals / max) * 82
      return `${x},${y}`
    })
    .join(' ')

  return (
    <main className="bg-canvas">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Impact dashboard</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Every meal counts.
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Live totals combine seeded baseline data with the donations completed in
              this demo browser.
            </p>
          </div>
          <Link to="/ngo" className="inline-flex items-center justify-center rounded-xl border border-emerald-600 bg-white px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50">
            Find a pickup
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Meals saved" value={impact.meals} icon={UtensilsCrossed} tone="emerald" />
          <StatCard label="Kg food diverted" value={impact.kg} decimals={0} suffix="kg" icon={Scale} tone="orange" />
          <StatCard label="CO₂e avoided" value={impact.co2} decimals={0} suffix="kg" icon={Leaf} tone="sky" />
          <StatCard label="Active NGOs" value={impact.activeNgos} icon={Building2} tone="violet" />
          <StatCard label="Donations completed" value={impact.completed} icon={CheckCircle2} tone="emerald" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Meals saved over time</h2>
                <p className="text-xs text-slate-500">Seeded baseline plus the current demo month.</p>
              </div>
              <p className="text-sm font-bold text-emerald-700">{formatNumber(totalTrend)} meals</p>
            </div>

            <div className="mt-6 flex h-52 items-end gap-3" role="img" aria-label="Bar chart of meals saved per month">
              {chart.map((item) => (
                <div key={item.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[11px] font-bold tabular-nums text-slate-500">{formatNumber(item.meals)}</span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-700"
                    style={{ height: `${Math.max(6, (item.meals / max) * 100)}%` }}
                  />
                  <span className="text-xs font-semibold text-slate-500">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Trend line</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><Sparkles className="h-3.5 w-3.5" /> growing</span>
              </div>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-2 h-24 w-full" aria-hidden="true">
                <defs>
                  <linearGradient id="fresh-trend" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon points={`0,100 ${points} 100,100`} fill="url(#fresh-trend)" />
                <polyline points={points} fill="none" stroke="#059669" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">How this is calculated</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2"><Dot /> 1 serving = 0.4 kg of food.</li>
                <li className="flex items-start gap-2"><Dot /> 1 kg food saved = 2.5 kg CO₂e avoided.</li>
                <li className="flex items-start gap-2"><Dot /> Only distributions marked complete count toward the live additions.</li>
                <li className="flex items-start gap-2"><Dot /> Baseline: {formatNumber(BASELINE_IMPACT.meals)} meals and {formatNumber(BASELINE_IMPACT.completed)} completed donations from the demo network.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <h2 className="text-base font-bold text-emerald-900">Your demo contribution</h2>
              <p className="mt-1 text-4xl font-extrabold tabular-nums text-emerald-800">{formatNumber(impact.distributedDonations)}</p>
              <p className="text-sm text-emerald-800">completed donation{impact.distributedDonations === 1 ? '' : 's'} in this browser</p>
              <p className="mt-3 text-xs leading-relaxed text-emerald-700">
                Complete the NGO pickup flow to watch these numbers rise. The totals
                persist after refresh through localStorage.
              </p>
            </div>

            <p className="rounded-xl bg-white p-3 text-xs leading-relaxed text-slate-500 ring-1 ring-slate-200">
              These are estimates for a hackathon demo, not audited environmental
              claims. FRESH does not guarantee food safety.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}

function Dot() {
  return <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" aria-hidden="true" />
}
