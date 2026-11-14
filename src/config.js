/**
 * Public, key-free OSRM-compatible routing endpoints.
 *
 * The `routed-*` prefixes are intentional: the public OSRM demo servers would
 * otherwise answer with a shared "demo" profile instead of the requested one.
 * Each mode lists bases in fallback order.
 */
export const ROUTING_BASES = {
  drive: [
    'https://routing.openstreetmap.de/routed-car/route/v1/driving',
    'https://router.project-osrm.org/route/v1/driving',
  ],
  bike: [
    'https://routing.openstreetmap.de/routed-bike/route/v1/driving',
    'https://router.project-osrm.org/route/v1/driving',
  ],
  walk: [
    'https://routing.openstreetmap.de/routed-foot/route/v1/driving',
    'https://router.project-osrm.org/route/v1/driving',
  ],
}

export const DEFAULT_ROUTING_MODE = 'drive'

// Backwards-compatible single-base map (first base per mode).
export const ROUTING_BASE_URLS = Object.fromEntries(
  Object.entries(ROUTING_BASES).map(([mode, bases]) => [mode, bases[0]]),
)

export const ROUTING_MODES = [
  { id: 'drive', label: 'Drive' },
  { id: 'bike', label: 'Bike' },
  { id: 'walk', label: 'Walk' },
]
