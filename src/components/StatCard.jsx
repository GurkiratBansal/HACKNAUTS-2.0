import { useEffect, useRef, useState } from 'react'

/**
 * Animated count-up. Starts from the previously rendered value so the
 * impact page does not reset to zero on every state update.
 */
export default function StatCard({
  label,
  value,
  decimals = 0,
  suffix = '',
  icon: Icon,
  tone = 'emerald',
  hint,
}) {
  const [display, setDisplay] = useState(0)
  const fromRef = useRef(0)

  useEffect(() => {
    const from = fromRef.current
    const to = Number(value) || 0
    const duration = 900
    const start = performance.now()
    let frame

    const tick = (time) => {
      const progress = Math.min(1, (time - start) / duration)
      const eased = 1 - (1 - progress) ** 3
      const next = from + (to - from) * eased
      setDisplay(next)
      if (progress < 1) frame = requestAnimationFrame(tick)
      else fromRef.current = to
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])

  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700',
    orange: 'bg-orange-50 text-orange-700',
    sky: 'bg-sky-50 text-sky-700',
    violet: 'bg-violet-50 text-violet-700',
  }

  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(display)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {formatted}
            {suffix && <span className="ml-1 text-base font-semibold text-slate-500">{suffix}</span>}
          </p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        {Icon && (
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
      </div>
    </div>
  )
}
