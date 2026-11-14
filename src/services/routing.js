import { ROUTING_BASE_URLS } from '../config'

const BASES = ROUTING_BASE_URLS
const cache = new Map()

const ok = (point) =>
  point &&
  Number.isFinite(point.lat) &&
  Number.isFinite(point.lng) &&
  Math.abs(point.lat) <= 90 &&
  Math.abs(point.lng) <= 180

/**
 * Fetch the fastest road route between two { lat, lng } points.
 *
 * @returns {Promise<{coords:number[][],distanceKm:number,durationMin:number}>}
 */
export async function getRoute(from, to, signal) {
  if (!ok(from) || !ok(to)) {
    throw new Error('Start or destination location is missing')
  }

  const key = `${from.lat.toFixed(4)},${from.lng.toFixed(4)}|${to.lat.toFixed(4)},${to.lng.toFixed(4)}`
  if (cache.has(key)) return cache.get(key)

  // OSRM expects longitude before latitude.
  const path = `${from.lng},${from.lat};${to.lng},${to.lat}`
  let lastError = new Error('Could not reach the routing service')

  for (const base of BASES) {
    try {
      const response = await fetch(`${base}/${path}?overview=full&geometries=geojson`, {
        signal,
      })
      if (!response.ok) {
        throw new Error(`Routing server returned ${response.status}`)
      }

      const data = await response.json()
      const route = data.routes?.[0]
      if (data.code !== 'Ok' || !route) {
        throw new Error(`No road route found (${data.code})`)
      }

      const result = {
        coords: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
        distanceKm: route.distance / 1000,
        durationMin: Math.max(1, Math.round(route.duration / 60)),
      }
      cache.set(key, result)
      return result
    } catch (error) {
      if (error?.name === 'AbortError') throw error
      console.warn('[routing] failed on', base, error)
      lastError = error
    }
  }

  throw lastError
}

export function clearRouteCache() {
  cache.clear()
}
