// FRESH:FILE  Generic sidebar panel container.
// FRESH:AREA  Donations

const TONES = {
  brand: {
    panel: 'border-brand-200/70 bg-brand-50/60 dark:border-brand-800 dark:bg-brand-900/20',
    icon: 'bg-brand-600 text-white',
  },
  saffron: {
    panel:
      'border-saffron-200/80 bg-saffron-50/70 dark:border-saffron-900 dark:bg-saffron-900/20',
    icon: 'bg-saffron-500 text-brand-950',
  },
  neutral: {
    panel: 'border-line bg-surface',
    icon: 'bg-elevated text-ink-soft ring-1 ring-inset ring-line-strong',
  },
}

export default function SidePanel({ icon: Icon, title, tone = 'brand', children }) {
  const style = TONES[tone] || TONES.brand

  return (
    <section className={`rounded-3xl border p-4 shadow-soft sm:p-5 ${style.panel}`}>
      <h2 className="flex items-center gap-2.5 text-sm font-bold text-ink">
        {Icon && (
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
        {title}
      </h2>
      <div className="mt-3 text-[13px] leading-relaxed text-ink-soft">{children}</div>
    </section>
  )
}
