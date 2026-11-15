// FRESH:FILE  Small stat card used across dashboards with hairline borders and 10px radius.
// FRESH:AREA  Donations

import { formatNumber } from '../../utils/format'

const TONES = {
  brand: {
    card: 'border-line bg-surface dark:border-white/10 dark:bg-[#0B2219]',
    label: 'text-ink-muted dark:text-[#A9BBB2]',
    tile: 'bg-emerald-600 text-white',
    hint: 'text-ink-muted dark:text-[#A9BBB2]/80',
  },
  saffron: {
    card: 'border-line bg-surface dark:border-white/10 dark:bg-[#0B2219]',
    label: 'text-ink-muted dark:text-[#A9BBB2]',
    tile: 'bg-[#19C8D8] text-[#04201A]',
    hint: 'text-ink-muted dark:text-[#A9BBB2]/80',
  },
  info: {
    card: 'border-line bg-surface dark:border-white/10 dark:bg-[#0B2219]',
    label: 'text-ink-muted dark:text-[#A9BBB2]',
    tile: 'bg-sky-600 text-white',
    hint: 'text-ink-muted dark:text-[#A9BBB2]/80',
  },
  danger: {
    card: 'border-line bg-surface dark:border-white/10 dark:bg-[#0B2219]',
    label: 'text-ink-muted dark:text-[#A9BBB2]',
    tile: 'bg-danger-600 text-white',
    hint: 'text-ink-muted dark:text-[#A9BBB2]/80',
  },
  neutral: {
    card: 'border-line bg-surface dark:border-white/10 dark:bg-[#0B2219]',
    label: 'text-ink-muted dark:text-[#A9BBB2]',
    tile: 'bg-elevated text-ink-soft dark:bg-[#06130F] dark:text-[#A9BBB2]',
    hint: 'text-ink-muted dark:text-[#A9BBB2]/80',
  },
}

export default function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'brand',
  decimals = 0,
  suffix = '',
}) {
  const style = TONES[tone] || TONES.brand

  return (
    <div className={`rounded-[10px] border p-4 shadow-sm transition hover:border-[#3EE6B8]/40 ${style.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-xs font-semibold ${style.label}`}>{label}</p>
          <p className="mt-1 font-display text-2xl font-black tabular-nums text-ink dark:text-[#F2F7F4]">
            {formatNumber(value, decimals)}
            {suffix && (
              <span className="ml-1 text-xs font-semibold text-ink-muted dark:text-[#A9BBB2]">{suffix}</span>
            )}
          </p>
          {hint && <p className={`mt-0.5 text-[11px] ${style.hint}`}>{hint}</p>}
        </div>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] font-bold ${style.tile}`}
        >
          {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
        </span>
      </div>
    </div>
  )
}
