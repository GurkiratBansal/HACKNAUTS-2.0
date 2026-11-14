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
