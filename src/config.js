/**
 * Public, key-free OSRM-compatible routing endpoint.
 *
 * The `routed-car` prefix is intentional: the public OSRM demo servers would
 * otherwise answer with a shared "demo" profile instead of a car route. Point
 * this at a self-hosted OSRM instance or a backend proxy without changing any
 * UI code.
 */
export const ROUTING_BASE_URL =
  'https://routing.openstreetmap.de/routed-car/route/v1/driving'
