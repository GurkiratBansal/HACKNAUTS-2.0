import { formatNumber } from '../../utils/format'

const TONES = {
  brand: {
    card: 'border-brand-200/70 bg-brand-50/70 dark:border-brand-800 dark:bg-brand-900/25',
    label: 'text-brand-800/80 dark:text-brand-200/80',
    tile: 'bg-brand-600 text-white',
    hint: 'text-brand-700/70 dark:text-brand-200/60',
  },
  saffron: {
    card: 'border-saffron-200/80 bg-saffron-50/80 dark:border-saffron-900 dark:bg-saffron-900/20',
    label: 'text-saffron-800/80 dark:text-saffron-200/80',
    tile: 'bg-saffron-500 text-brand-950',
    hint: 'text-saffron-800/70 dark:text-saffron-200/60',
  },
  info: {
    card: 'border-info-200/80 bg-info-50/80 dark:border-info-900 dark:bg-info-900/20',
    label: 'text-info-800/80 dark:text-info-200/80',
    tile: 'bg-info-600 text-white',
    hint: 'text-info-700/70 dark:text-info-200/60',
  },
  danger: {
    card: 'border-danger-200/80 bg-danger-50/80 dark:border-danger-900 dark:bg-danger-900/20',
    label: 'text-danger-700/80 dark:text-danger-200/80',
    tile: 'bg-danger-600 text-white',
    hint: 'text-danger-700/70 dark:text-danger-200/60',
  },
  neutral: {
    card: 'border-line bg-elevated/70',
    label: 'text-ink-muted',
    tile: 'bg-surface text-ink-soft ring-1 ring-inset ring-line-strong',
    hint: 'text-ink-muted',
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
    <div className={`rounded-2xl border p-4 shadow-soft ${style.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-xs font-semibold ${style.label}`}>{label}</p>
          <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-ink">
            {formatNumber(value, decimals)}
            {suffix && (
              <span className="ml-1 text-sm font-semibold text-ink-muted">{suffix}</span>
            )}
          </p>
          {hint && <p className={`mt-0.5 text-[11px] ${style.hint}`}>{hint}</p>}
        </div>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.tile}`}
        >
          {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
        </span>
      </div>
    </div>
  )
}
