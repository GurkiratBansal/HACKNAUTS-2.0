import freshLogo from '../assets/fresh-logo.png'

/** Shared FRESH logo and wordmark. */
export default function Brand({
  tone = 'light',
  showTagline = true,
  className = '',
}) {
  const wordmark = tone === 'dark' ? 'text-white' : 'text-ink'
  const tagline = tone === 'dark' ? 'text-brand-100/70' : 'text-ink-muted'

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src={freshLogo}
        alt=""
        aria-hidden="true"
        data-lite-safe="true"
        className="h-10 w-10 shrink-0 rounded-xl object-cover object-center shadow-sm"
      />
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
