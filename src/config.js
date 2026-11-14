/**
 * Public, key-free OSRM-compatible routing endpoints.
 *
 * The `routed-car` prefix is intentional: the public OSRM demo server would
 * otherwise answer with a shared "demo" profile instead of a car route.
 * Fallback order matters: FOSSGIS first, public OSRM demo second.
 */
export const ROUTING_BASE_URL =
  'https://routing.openstreetmap.de/routed-car/route/v1/driving'

export const ROUTING_BACKUP_BASE_URL =
  'https://router.project-osrm.org/route/v1/driving'

export const ROUTING_BASE_URLS = [
  ROUTING_BASE_URL,
  ROUTING_BACKUP_BASE_URL,
]

/**
 * FRESH is an India-only demo. This check is client-side and can be bypassed;
 * production enforcement needs server-side checks later.
 */
export const ENFORCE_INDIA_ONLY = true

export const RADIUS_OPTIONS = [5, 10, 25, 50]
export const DEFAULT_RADIUS_KM = 10

// Emergency feed integration is intentionally disabled. Browser CORS rules
// make direct RSS calls unreliable; a backend proxy is the real solution.
export const EMERGENCY_SACHET_ENABLED = false

export const LOCATION_STORAGE_KEY = 'fresh.v2.place'
