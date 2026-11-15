// FRESH:FILE  Legend explaining base map tiles and data sources.
// FRESH:AREA  Map

/**
 * Explains the violet marker shown only to a logged-in NGO so the extra pin
 * never looks like an unexplained outlier.
 */
export default function MapBaseLegend({ className = '' }) {
  return (
    <p
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft ${className}`}
    >
      <span
        className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--fresh-you))] ring-2 ring-surface"
        aria-hidden="true"
      />
      Violet pin marks your registered base
    </p>
  )
}
