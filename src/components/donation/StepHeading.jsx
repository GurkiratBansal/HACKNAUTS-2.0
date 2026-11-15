// FRESH:FILE  Heading block for a wizard step.
// FRESH:AREA  Donations

export default function StepHeading({ eyebrow, title, children }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
        {eyebrow}
      </p>
      <h2
        id="wizard-step-title"
        className="mt-1 font-display text-xl font-bold tracking-tight text-ink sm:text-2xl"
      >
        {title}
      </h2>
      {children && (
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{children}</p>
      )}
    </div>
  )
}
