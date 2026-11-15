// FRESH:FILE  Custom inline-SVG FRESH mark and wordmark.
// FRESH:AREA  Brand & Layout

export default function FreshLogo({
  tone = 'light',
  showTagline = false,
  className = '',
  size = 'md',
}) {
  const isDark = tone === 'dark'
  const textColor = isDark ? '#F2F7F4' : '#0C1A15'
  const subtextColor = isDark ? '#A9BBB2' : '#4B5E56'

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  }

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Custom FRESH inline SVG emblem */}
      <svg
        className={`${iconSizes[size] || iconSizes.md} shrink-0`}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="freshBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3EE6B8" />
            <stop offset="100%" stopColor="#19C8D8" />
          </linearGradient>
          <linearGradient id="freshGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F4A38" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0B2219" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {/* Rounded squircle tile with hairline border */}
        <rect
          x="1"
          y="1"
          width="34"
          height="34"
          rx="9"
          fill="url(#freshGlowGrad)"
          stroke="#3EE6B8"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
        {/* Dynamic organic leaf node */}
        <path
          d="M18 7C18 7 27 10 27 19C27 24 23 28 18 28C13 28 9 24 9 19C9 10 18 7 18 7Z"
          fill="url(#freshBrandGrad)"
          fillOpacity="0.2"
        />
        <path
          d="M18 10C18 10 25 12.5 25 19C25 22.8 21.8 26 18 26C14.2 26 11 22.8 11 19C11 12.5 18 10 18 10Z"
          stroke="url(#freshBrandGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Center vein indicating road/route connecting nodes */}
        <path
          d="M18 13V23M18 18L21.5 15M18 20L14.5 17.5"
          stroke="#3EE6B8"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span className="leading-none">
        <span
          className={`block font-display ${textSizes[size] || textSizes.md} font-black tracking-tight`}
          style={{ color: textColor }}
        >
          FRESH
        </span>
        {showTagline && (
          <span
            className="mt-0.5 hidden sm:block max-w-[200px] text-[10px] font-medium leading-tight tracking-normal"
            style={{ color: subtextColor }}
          >
            Food Reduction &amp; Excess Sharing Hub
          </span>
        )}
      </span>
    </span>
  )
}
