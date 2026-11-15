// FRESH:FILE  Generic sidebar panel container.
// FRESH:AREA  Donations

const TONES = {
  brand: {
    panel: 'border-fresh-border bg-fresh-light-card dark:bg-fresh-dark-card',
    icon: 'bg-fresh-mint/15 text-fresh-mint',
  },
  saffron: {
    panel: 'border-fresh-border bg-fresh-light-card dark:bg-fresh-dark-card',
    icon: 'bg-amber-500/15 text-amber-500 dark:text-amber-400',
  },
  neutral: {
    panel: 'border-fresh-border bg-fresh-light-card dark:bg-fresh-dark-card',
    icon: 'bg-black/5 text-fresh-ink-muted dark:bg-white/10 dark:text-fresh-ink-soft',
  },
}

export default function SidePanel({ icon: Icon, title, tone = 'brand', children }) {
  const style = TONES[tone] || TONES.brand

  return (
    <section className={`rounded-[12px] border p-4 shadow-fresh-sm sm:p-5 ${style.panel}`}>
      <h2 className="flex items-center gap-2.5 text-sm font-bold text-fresh-ink dark:text-fresh-light-bg">
        {Icon && (
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] ${style.icon}`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
        {title}
      </h2>
      <div className="mt-3 text-[13px] leading-relaxed text-fresh-ink-muted dark:text-fresh-ink-soft">{children}</div>
    </section>
  )
}
