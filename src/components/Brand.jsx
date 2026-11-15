// FRESH:FILE  FRESH logo/wordmark with custom inline SVG mark.
// FRESH:AREA  Layout

import FreshLogo from './FreshLogo'

/** Shared FRESH logo and wordmark. */
export default function Brand({
  tone = 'light',
  showTagline = true,
  className = '',
}) {
  return (
    <FreshLogo
      tone={tone}
      showTagline={showTagline}
      className={className}
      size="md"
    />
  )
}
