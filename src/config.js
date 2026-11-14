/**
 * Public, key-free OSRM-compatible routing endpoints.
 *
 * The `routed-*` prefixes are intentional: the public OSRM demo servers would
 * otherwise answer with a shared "demo" profile instead of the requested one.
 * Point these at a self-hosted OSRM instance or a backend proxy without
 * changing any UI code.
 */
export const ROUTING_BASE_URLS = {
  drive: 'https://routing.openstreetmap.de/routed-car/route/v1/driving',
  bike: 'https://routing.openstreetmap.de/routed-bike/route/v1/driving',
  walk: 'https://routing.openstreetmap.de/routed-foot/route/v1/driving',
}

export const DEFAULT_ROUTING_MODE = 'drive'

export const ROUTING_MODES = [
  { id: 'drive', label: 'Drive', icon: 'car' },
  { id: 'bike', label: 'Bike', icon: 'bike' },
  { id: 'walk', label: 'Walk', icon: 'walk' },
]
