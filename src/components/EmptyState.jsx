// FRESH:FILE  Friendly placeholder when a list has nothing to show.
// FRESH:AREA  Layout

function EmptyPlateArt() {
  return (
    <svg
      viewBox="0 0 200 140"
      className="h-32 w-auto"
      aria-hidden="true"
      fill="none"
    >
      <ellipse
        cx="100"
        cy="118"
        rx="62"
        ry="9"
        className="fill-line/60 dark:fill-brand-950/70"
      />
      <ellipse
        cx="100"
        cy="96"
        rx="58"
        ry="13"
        className="fill-surface stroke-line-strong"
        strokeWidth="2"
      />
      <ellipse cx="100" cy="93" rx="42" ry="8" className="fill-elevated" />

      <path
        d="M58 88c0-23 18.8-42 42-42s42 19 42 42"
        className="stroke-brand-600 dark:stroke-brand-300"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M90 47V37h20v10"
        className="fill-surface stroke-brand-600 dark:stroke-brand-300"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="100" cy="33" r="5" className="fill-saffron-500" />

      <path
        d="M58 88h84"
        className="stroke-brand-600 dark:stroke-brand-300"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M74 34c-4-5-4-10 0-15M86 26c-4-5-4-10 0-15M126 30c4-5 4-10 0-15M138 40c4-5 4-10 0-15"
        className="stroke-brand-300 dark:stroke-brand-600"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1 7"
      />

      <path
        d="M43 46c-9-2-13-8-13-16 9 1 14 7 13 16Z"
        className="fill-brand-200 dark:fill-brand-700"
      />
      <path
        d="M43 47c1-7 5-11 12-13 0 8-4 12-12 13Z"
        className="fill-saffron-300 dark:fill-saffron-500/70"
      />
      <path
        d="M44 52c-1-4-1-7-1-7"
        className="stroke-brand-500 dark:stroke-brand-400"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M158 18v10M153 23h10"
        className="stroke-saffron-400"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="150" cy="61" r="2.5" className="fill-brand-400" />
      <circle cx="30" cy="76" r="2" className="fill-saffron-400" />
    </svg>
  )
}

export default function EmptyState({
  icon: Icon,
  title = 'Nothing here yet',
  description,
  action,
}) {
  return (
    <div className="relative overflow-hidden rounded-[12px] border border-fresh-border bg-fresh-light-card/80 p-8 text-center shadow-fresh-sm dark:bg-fresh-dark-card/60">
      <div
        className="pointer-events-none absolute -right-12 -top-14 h-44 w-44 rounded-full bg-fresh-mint/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-fresh-teal/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-fit">
        <EmptyPlateArt />
        {Icon && (
          <span className="absolute -right-2 top-1 flex h-10 w-10 items-center justify-center rounded-[8px] bg-fresh-mint text-fresh-cta shadow-fresh-sm ring-4 ring-fresh-light-card dark:ring-fresh-dark-card">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
      </div>

      <h3 className="relative mt-4 font-display text-lg font-bold tracking-tight text-fresh-ink dark:text-fresh-light-bg">
        {title}
      </h3>
      {description && (
        <p className="relative mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-fresh-ink-muted dark:text-fresh-ink-soft">
          {description}
        </p>
      )}
      {action && <div className="relative mt-5 flex justify-center">{action}</div>}
    </div>
  )
}
