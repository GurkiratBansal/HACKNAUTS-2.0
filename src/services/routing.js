import { ROUTING_BASE_URLS } from '../config'

export class RoutingError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'RoutingError'
    this.code = code
  }
}

/**
 * All road-routing network access for the demo lives in this module.
 *
 * OSRM returns distances in metres, durations in seconds and GeoJSON
 * coordinates as [lng, lat]. Leaflet needs [lat, lng], so the conversion
 * happens once here and the UI only ever sees the simple single-route shape:
 * { coords, distanceKm, durationMin }.
 */

const CACHE_LIMIT = 100
const cache = new Map()
const REQUEST_TIMEOUT_MS = 8000

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

function isPoint(point) {
  return (
    point != null &&
    Number.isFinite(Number(point.lat)) &&
    Number.isFinite(Number(point.lng)) &&
    Math.abs(Number(point.lat)) <= 90 &&
    Math.abs(Number(point.lng)) <= 180
  )
}

function devWarn(...args) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(...args)
  }
}

function devSanityCheck(from, to) {
  if (!import.meta.env.DEV) return
  const inIndia = (point) =>
    point.lat >= 6 && point.lat <= 38 && point.lng >= 68 && point.lng <= 98
  if (!inIndia(from) || !inIndia(to)) {
    devWarn(
      '[routing] Coordinates may be swapped or outside India. from=',
      from,
      'to=',
      to,
    )
  }
}

function abortError() {
  const error = new Error('Aborted')
  error.name = 'AbortError'
  return error
}

function toRoute(data) {
  if (!data || data.code !== 'Ok') {
    const code =
      data?.code === 'NoRoute' || data?.code === 'NoSegment'
        ? 'no_route'
        : 'unavailable'
    throw new RoutingError(code, 'Could not load a road route between these points.')
  }

  const best = Array.isArray(data.routes) ? data.routes[0] : null
  const coordinates = best?.geometry?.coordinates

  if (
    !best ||
    !Array.isArray(coordinates) ||
    coordinates.length < 2 ||
    !Number.isFinite(Number(best.distance)) ||
    !Number.isFinite(Number(best.duration))
  ) {
    throw new RoutingError('no_route', 'Could not load a road route between these points.')
  }

  return {
    coords: coordinates.map(([lng, lat]) => [lat, lng]),
    distanceKm: Number(best.distance) / 1000,
    durationMin: Math.max(1, Math.round(Number(best.duration) / 60)),
  }
}

async function fetchRoute(base, start, end, signal) {
  const url = `${base}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  const onAbort = () => controller.abort()
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', onAbort, { once: true })
  }

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      devWarn('[routing] request failed', url, response.status)
      throw new RoutingError(
        'unavailable',
        `The road-routing service returned HTTP ${response.status}.`,
      )
    }

    let data
    try {
      data = await response.json()
    } catch {
      devWarn('[routing] unreadable response', url, response.status)
      throw new RoutingError(
        'unavailable',
        'The road-routing service returned an unreadable response.',
      )
    }

    if (!data || data.code !== 'Ok') {
      devWarn('[routing] response code', url, response.status, data?.code)
    }
    return toRoute(data)
  } finally {
    clearTimeout(timer)
    if (signal) signal.removeEventListener('abort', onAbort)
  }
}

export function clearRouteCache() {
  cache.clear()
}

/**
 * Fetch the fastest road route between two { lat, lng } points.
 *
 * @param {{lat:number,lng:number}} from
 * @param {{lat:number,lng:number}} to
 * @param {AbortSignal} [signal]
 * @returns {Promise<{coords:number[][],distanceKm:number,durationMin:number}>}
 */
export async function getRoute(from, to, signal) {
  if (!isPoint(from) || !isPoint(to)) {
    throw new RoutingError(
      'bad_input',
      'A valid start and destination are required for routing.',
    )
  }

  const start = { lat: Number(from.lat), lng: Number(from.lng) }
  const end = { lat: Number(to.lat), lng: Number(to.lng) }

  devSanityCheck(start, end)

  const key = cacheKey(start, end)
  if (cache.has(key)) return cache.get(key)

  let lastError = null

  for (const base of ROUTING_BASE_URLS) {
    if (signal?.aborted) throw abortError()

    try {
      const route = await fetchRoute(base, start, end, signal)
      remember(key, route)
      return route
    } catch (error) {
      if (signal?.aborted) throw abortError()

      if (error instanceof RoutingError) {
        // A genuine "no road here" answer is final; trying another server for
        // the same coordinates would only produce the same answer.
        if (error.code === 'no_route') throw error
        lastError = error
        continue
      }

      if (error?.name === 'AbortError') {
        // Only an internal timeout abort reaches this branch; a caller abort
        // was handled by the signal check above.
        lastError = new RoutingError(
          'unavailable',
          'The road-routing service timed out.',
        )
        devWarn('[routing] request timed out', base)
        continue
      }

      lastError = new RoutingError(
        'unavailable',
        'The road-routing service could not be reached.',
      )
      devWarn('[routing] network error', base, error?.message)
    }
  }

  throw (
    lastError ||
    new RoutingError(
      'unavailable',
      'The road-routing service could not be reached.',
    )
  )
}
