// FRESH:FILE  2x2 impact stats card with hairline dividers and dynamic "Time matters" SVG chart.
// FRESH:AREA  Impact & Layout

import { Clock, ShieldAlert, TrendingDown } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatNumber } from '../../utils/format'
import { URGENCY } from '../../utils/urgency'

export default function ImpactStatsAndChart() {
  const { impact } = useApp()

  const stats = [
    {
      label: 'Meals saved',
      value: formatNumber(impact.meals),
      subtext: 'Calculated from accepted batches',
    },
    {
      label: 'Food diverted',
      value: `${formatNumber(impact.kg)} kg`,
      subtext: 'Kept out of metropolitan landfills',
    },
    {
      label: 'CO₂e avoided',
      value: `${formatNumber(impact.co2)} kg`,
      subtext: 'Equivalent emissions prevented',
    },
    {
      label: 'Verified NGOs',
      value: formatNumber(impact.activeNgos),
      subtext: 'Active community partners in network',
    },
  ]

  return (
    <section className="bg-canvas py-20 px-4 sm:px-6 lg:px-8 border-b border-line dark:border-white/10">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-[8px] border border-line bg-surface px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0A7A5C] shadow-sm dark:border-white/10 dark:bg-[#0B2219] dark:text-[#3EE6B8]">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Time-Sensitive Operations</span>
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-ink dark:text-[#F2F7F4]">
            Why <span className="fresh-gradient-text">every minute</span> counts
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft dark:text-[#A9BBB2]">
            Food freshness decays rapidly. FRESH maps urgency dynamically to guarantee timely pickups.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 items-start">
          {/* 2x2 Stats Card with Hairline Dividers */}
          <div className="flex flex-col rounded-[12px] border border-line bg-surface shadow-sm overflow-hidden dark:border-white/10 dark:bg-[#0B2219]/90">
            <div className="flex items-center justify-between border-b border-line px-6 py-4 dark:border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-ink dark:text-[#F2F7F4]">
                Network Impact Summary
              </span>
              <span className="rounded-[6px] border border-line bg-elevated px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted dark:border-white/10 dark:bg-[#06130F] dark:text-[#A9BBB2]">
                Sample data for demo
              </span>
            </div>

            <div className="grid grid-cols-2 divide-x divide-y divide-line dark:divide-white/10">
              {stats.map((stat, i) => (
                <div key={stat.label} className={`p-4 sm:p-8 ${i === 1 ? 'border-t-0' : ''}`}>
                  <p className="text-xs font-semibold text-ink-muted dark:text-[#A9BBB2]">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-xl sm:text-4xl font-black tracking-tight text-ink tabular-nums dark:text-white">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[10px] sm:text-[11px] text-ink-soft dark:text-[#A9BBB2]/80">
                    {stat.subtext}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-line bg-elevated/40 px-6 py-3 text-[11px] text-ink-muted dark:border-white/10 dark:bg-[#06130F]/40 dark:text-[#A9BBB2]">
              Real-time calculations based on local pickup completions.
            </div>
          </div>

          {/* "Time Matters" SVG Chart */}
          <div className="flex flex-col rounded-[12px] border border-line bg-surface p-6 shadow-sm dark:border-white/10 dark:bg-[#0B2219]/90 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0A7A5C] dark:text-[#3EE6B8]">
                  Urgency Decay Curve
                </span>
                <h3 className="mt-1 text-lg font-bold text-ink dark:text-[#F2F7F4]">
                  Perishability vs. Response Window
                </h3>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-emerald-500/10 text-emerald-600 dark:text-[#3EE6B8]">
                <TrendingDown className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>

            {/* Inline SVG Curve with Dynamic Config Urgency Thresholds */}
            <div className="mt-6 w-full overflow-hidden">
              <svg
                viewBox="0 0 500 240"
                className="w-full h-auto text-ink dark:text-white select-none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Food urgency decay curve showing fresh, soon, urgent and expired threshold zones"
              >
                {/* Background threshold zones */}
                {/* Fresh Zone: > 2h (X: 0 to 220) */}
                <rect x="30" y="20" width="200" height="170" fill="#10B981" fillOpacity="0.08" />
                {/* Pickup Soon Zone: 30m to 2h (X: 230 to 360) */}
                <rect x="230" y="20" width="130" height="170" fill="#F59E0B" fillOpacity="0.08" />
                {/* Urgent Zone: < 30m (X: 360 to 440) */}
                <rect x="360" y="20" width="80" height="170" fill="#EF4444" fillOpacity="0.08" />
                {/* Expired Zone: past deadline (X: 440 to 480) */}
                <rect x="440" y="20" width="40" height="170" fill="#64748B" fillOpacity="0.08" />

                {/* Grid lines */}
                <line x1="30" y1="190" x2="480" y2="190" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />
                <line x1="30" y1="20" x2="30" y2="190" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />
                <line x1="230" y1="20" x2="230" y2="190" stroke="#F59E0B" strokeOpacity="0.3" strokeDasharray="3 3" />
                <line x1="360" y1="20" x2="360" y2="190" stroke="#EF4444" strokeOpacity="0.3" strokeDasharray="3 3" />
                <line x1="440" y1="20" x2="440" y2="190" stroke="#64748B" strokeOpacity="0.3" strokeDasharray="3 3" />

                {/* Zone Labels */}
                <text x="130" y="40" textAnchor="middle" fill="#059669" fontSize="11" fontWeight="bold">
                  {URGENCY.fresh.label.toUpperCase()} (&gt;2h)
                </text>
                <text x="295" y="40" textAnchor="middle" fill="#D97706" fontSize="11" fontWeight="bold">
                  {URGENCY.soon.label.toUpperCase()} (30m–2h)
                </text>
                <text x="400" y="40" textAnchor="middle" fill="#DC2626" fontSize="11" fontWeight="bold">
                  {URGENCY.urgent.label.toUpperCase()} (&lt;30m)
                </text>

                {/* Usability decay curve */}
                <path
                  d="M 30 35 C 150 40, 220 80, 290 120 C 350 155, 400 180, 440 190 L 480 190"
                  stroke="#3EE6B8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Axis Labels */}
                <text x="30" y="212" fill="currentColor" fillOpacity="0.6" fontSize="10">Prep time</text>
                <text x="230" y="212" textAnchor="middle" fill="currentColor" fillOpacity="0.6" fontSize="10">2h window</text>
                <text x="360" y="212" textAnchor="middle" fill="currentColor" fillOpacity="0.6" fontSize="10">30 min left</text>
                <text x="440" y="212" textAnchor="middle" fill="currentColor" fillOpacity="0.6" fontSize="10">Deadline</text>
              </svg>
            </div>

            {/* Mandatory Disclaimer Caption */}
            <div className="mt-4 flex items-start gap-2 rounded-[8px] border border-line bg-elevated/70 p-3 text-xs leading-relaxed text-ink-soft dark:border-white/10 dark:bg-[#06130F]/60 dark:text-[#A9BBB2]">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#0A7A5C] dark:text-[#3EE6B8]" aria-hidden="true" />
              <p>
                Illustrative. Urgency is guidance only. Final food safety checks rest with the donor and the receiving organization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
