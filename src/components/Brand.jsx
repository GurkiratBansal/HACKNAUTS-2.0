/**
 * The FRESH mark: a plate rim with a saffron leaf rising out of it.
 * All colour comes from design tokens so the mark works on any surface.
 */
export default function Brand({
  tone = 'light',
  showTagline = true,
  className = '',
}) {
  const wordmark = tone === 'dark' ? 'text-white' : 'text-ink'
  const tagline = tone === 'dark' ? 'text-brand-100/70' : 'text-ink-muted'

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 48 48"
        className="h-10 w-10 shrink-0 drop-shadow-sm"
        aria-hidden="true"
      >
        <rect x="1" y="1" width="46" height="46" rx="14" className="fill-brand-700" />
        <circle
          cx="24"
          cy="27"
          r="10"
          fill="none"
          strokeWidth="2.2"
          className="stroke-cream/90"
        />
        <path
          d="M24.2 21.3c5.2-6 10.7-5.2 10.7-5.2s.9 5.8-3.4 9.7c-3.3 3-7.5 2.4-7.5 2.4"
          className="fill-saffron-400"
        />
        <path
          d="M15.7 25.7c-1.5 2-2.2 4.2-2.1 6.6"
          fill="none"
          strokeWidth="2.2"
          strokeLinecap="round"
          className="stroke-cream/60"
        />
        <circle cx="35.5" cy="12.5" r="3.2" className="fill-saffron-500/90" />
      </svg>
      <span className="leading-none">
        <span
          className={`block font-display text-[1.3rem] font-extrabold leading-none tracking-tight ${wordmark}`}
        >
          FRESH
        </span>
        {showTagline && (
          <span
            className={`mt-1 block max-w-[190px] text-[9px] font-medium leading-[1.25] tracking-wide ${tagline}`}
          >
            Food Reduction and Excess Sharing Hub
          </span>
        )}
      </span>
    </span>
  )
}
