// FRESH:FILE  Shared frontend constants: OSRM routing endpoints, map radius options, emergency flags, storage keys.
// FRESH:AREA  Utils

// FRESH:Routing  Primary OSRM-compatible routing endpoint (FOSSGIS).
// WHY: the routed-car prefix avoids the shared "demo" profile on public servers.
/**
 * Public, key-free OSRM-compatible routing endpoints.
 *
 * The `routed-car` prefix is intentional: the public OSRM demo server would
 * otherwise answer with a shared "demo" profile instead of a car route.
 * Fallback order matters: FOSSGIS first, public OSRM demo second.
 */
export const ROUTING_BASE_URL =
  'https://routing.openstreetmap.de/routed-car/route/v1/driving'

// FRESH:Routing  Fallback routing endpoint used when the primary fails.
export const ROUTING_BACKUP_BASE_URL =
  'https://router.project-osrm.org/route/v1/driving'

export const ROUTING_BASE_URLS = [
  ROUTING_BASE_URL,
  ROUTING_BACKUP_BASE_URL,
]

// FRESH:Utils  India-only switch. Client-side only; production still needs server checks.
/**
 * FRESH is an India-only demo. This check is client-side and can be bypassed;
 * production enforcement needs server-side checks later.
 */
export const ENFORCE_INDIA_ONLY = true

// FRESH:Map  Radius filter choices (km) and the default radius.
export const RADIUS_OPTIONS = [5, 10, 25, 50]
export const DEFAULT_RADIUS_KM = 10

// FRESH:Emergency  Emergency flags: mock-first data, SACHET feed off, urgency window factor.
// Emergency backend integration: keep local/simulated data by default so the UI
// works without a running server and fails gracefully when requests fail.
export const EMERGENCY_USE_MOCK = true
export const EMERGENCY_SACHET_ENABLED = false
// Temporary emergency multiplier; verify against current food-safety guidance.
export const EMERGENCY_URGENCY_FACTOR = 0.5

// FRESH:Location  localStorage key for the saved manual place.
export const LOCATION_STORAGE_KEY = 'fresh.v2.place'

// FRESH:Backend  Live backend API base URL when cloud database sync is enabled.
export const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL || ''
