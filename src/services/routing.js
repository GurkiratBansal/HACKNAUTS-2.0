import { ROUTING_BASE_URL } from '../config'

/**
 * All road-routing network access for the demo lives in this module.
 *
 * The response is OSRM-compatible: distances are metres, durations seconds
 * and GeoJSON coordinates are [lng, lat]. Leaflet expects [lat, lng], so the
 * conversion happens once here.
 */

const CACHE_LIMIT = 100
const cache = new Map()

const isPoint = (point) =>
  point &&
  Number.isFinite(Number(point.lat)) &&
  Number.isFinite(Number(point.lng))

// Four decimals is roughly 11 m — enough to reuse a route while a user keeps
// the same pin selected, without hiding genuinely different pickups.
const roundCoord = (value) => Math.round(Number(value) * 10000) / 10000

function cacheKey(from, to) {
  return `${roundCoord(from.lat)},${roundCoord(from.lng)};${roundCoord(
    to.lat,
  )},${roundCoord(to.lng)}`
}

function remember(key, route) {
  if (cache.has(key)) cache.delete(key)
  cache.set(key, route)
  while (cache.size > CACHE_LIMIT) {
    cache.delete(cache.keys().next().value)
  }
}

function toRoute(data) {
  if (!data || data.code !== 'Ok') {
    throw new Error('No road route found between these points.')
  }
  const legs = Array.isArray(data.routes) ? data.routes : []
  const best = legs[0]
  const coordinates = best?.geometry?.coordinates

  if (
    !best ||
    !Array.isArray(coordinates) ||
    coordinates.length === 0 ||
    !Number.isFinite(Number(best.distance)) ||
    !Number.isFinite(Number(best.duration))
  ) {
    throw new Error('No road route found between these points.')
  }

  return {
    coords: coordinates.map(([lng, lat]) => [lat, lng]),
    distanceKm: Number(best.distance) / 1000,
    durationMin: Math.max(1, Math.round(Number(best.duration) / 60)),
  }
}

/**
 * Fetch a driving route between two { lat, lng } points.
 *
 * @param {{lat:number,lng:number}} from
 * @param {{lat:number,lng:number}} to
 * @param {AbortSignal} [signal]
 * @returns {Promise<{coords:number[][],distanceKm:number,durationMin:number}>}
 */
export async function getRoute(from, to, signal) {
  if (!isPoint(from) || !isPoint(to)) {
    throw new Error('A valid start and destination are required for routing.')
  }

  const start = { lat: Number(from.lat), lng: Number(from.lng) }
  const end = { lat: Number(to.lat), lng: Number(to.lng) }
  const key = cacheKey(start, end)

  if (cache.has(key)) return cache.get(key)

  const url = `${ROUTING_BASE_URL}/${start.lng},${start.lat};${end.lng},${
    end.lat
  }?overview=full&geometries=geojson`

  let response
  try {
    response = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    })
  } catch (error) {
    // Preserve AbortError so the hook can ignore an intentional cancellation.
    if (error?.name === 'AbortError') throw error
    throw new Error(
      'The road-routing service could not be reached. Check your connection and try again.',
    )
  }

  if (!response.ok) {
    throw new Error(
      `The road-routing service returned HTTP ${response.status}.`,
    )
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error('The road-routing service returned an unreadable response.')
  }

  const route = toRoute(data)
  remember(key, route)
  return route
}
