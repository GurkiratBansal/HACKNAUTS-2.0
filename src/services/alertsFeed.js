// FRESH:FILE  Optional SACHET (NDMA) RSS alert fetch. Disabled by default: browsers block the feed via CORS; a backend proxy is the real fix.
// FRESH:AREA  Emergency

import { EMERGENCY_SACHET_ENABLED } from '../config'

// FRESH:Emergency  Fetches the state RSS feed when enabled; returns raw XML text.
// Exact state RSS URLs are unverified. Browsers may block direct RSS calls via
// CORS; a backend proxy is the real production solution. This stays disabled.
export async function fetchSachetAlerts(state, signal) {
  if (!EMERGENCY_SACHET_ENABLED) return []
  const slug = String(state || '').trim().toLowerCase().replace(/\s+/g, '_')
  if (!slug) return []
  const response = await fetch(
    `https://sachet.ndma.gov.in/cap_public_website/rss/rss_${slug}.xml`,
    { signal },
  )
  if (!response.ok) throw new Error(`SACHET feed returned ${response.status}`)
  return response.text()
}
