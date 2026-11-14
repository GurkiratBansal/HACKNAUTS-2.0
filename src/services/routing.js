import { ROUTING_BASES, DEFAULT_ROUTING_MODE } from '../config'

export class RoutingError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'RoutingError'
    this.code = code
  }
}

/**
 * All road-routing network access for the demo lives in this module.
 */

const CACHE_LIMIT = 100
const cache = new Map()
const REQUEST_TIMEOUT_MS = 8000

const roundCoord = (value) => Math.round(Number(value) * 10000) / 10000

function cacheKey(from, to, mode) {
  return `${mode}:${roundCoord(from.lat)},${roundCoord(from.lng)};${roundCoord(
    to.lat,
  )},${roundCoord(to.lng)}`
}

function remember(key, routes) {
  if (cache.has(key)) cache.delete(key)
  cache.set(key, routes)
  while (cache.size > CACHE_LIMIT) {
    cache.delete(cache.keys().next().value)
  }
}

function isValidPoint(point) {
  return (
    point != null &&
    Number.isFinite(Number(point.lat)) &&
    Number.isFinite(Number(point.lng)) &&
    Math.abs(Number(point.lat)) <= 90 &&
    Math.abs(Number(point.lng)) <= 180
  )
}

function devSanityCheck(from, to) {
  if (!import.meta.env.DEV) return
  const inIndia = (point) =>
    point.lat >= 6 && point.lat <= 38 && point.lng >= 68 && point.lng <= 98
  if (!inIndia(from) || !inIndia(to)) {
    // eslint-disable-next-line no-console
    console.warn(
      '[routing] Coordinates may be swapped or outside India. from=',
      from,
      'to=',
      to,
    )
  }
}

function stepInstruction(step) {
  const maneuver = step?.maneuver || {}
  const type = maneuver.type || 'continue'
  const modifier = maneuver.modifier ? ` ${maneuver.modifier}` : ''
  const name = step?.name ? ` on ${step.name}` : ''
  return `${type}${modifier}${name}`.trim()
}

function toRoute(route, index) {
  const coordinates = route?.geometry?.coordinates
  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    throw new RoutingError('no_route', 'No road route found between these points.')
  }
  if (
    !Number.isFinite(Number(route.distance)) ||
    !Number.isFinite(Number(route.duration))
  ) {
    throw new RoutingError('no_route', 'No road route found between these points.')
  }

  const steps = []
  let turnCount = 0
  for (const leg of route.legs || []) {
    for (const step of leg.steps || []) {
      const maneuverType = step?.maneuver?.type || ''
      if (
        maneuverType &&
        maneuverType !== 'depart' &&
        maneuverType !== 'arrive' &&
        maneuverType !== 'continue'
      ) {
        turnCount += 1
      }
      steps.push({
        instruction: stepInstruction(step),
        name: step?.name || '',
        distanceKm: Number(step?.distance || 0) / 1000,
      })
    }
  }

  return {
    id: index,
    coords: coordinates.map(([lng, lat]) => [lat, lng]),
    distanceKm: Number(route.distance) / 1000,
    durationMin: Math.max(1, Math.round(Number(route.duration) / 60)),
    turnCount,
    steps,
    summary: (route.legs || [])
      .map((leg) => leg.summary)
      .filter(Boolean)
      .join(', '),
  }
}

function toRoutes(data) {
  if (!data || data.code !== 'Ok') {
    const code = data?.code === 'NoRoute' || data?.code === 'NoSegment' ? 'no_route' : 'unavailable'
    throw new RoutingError(code, 'No road route found between these points.')
  }
  const raw = Array.isArray(data.routes) ? data.routes : []
  if (raw.length === 0) {
    throw new RoutingError('no_route', 'No road route found between these points.')
  }
  return raw.map(toRoute)
}

function fetchWithTimeout(url, signal, timeoutMs) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  // Forward caller abort.
  const onAbort = () => controller.abort()
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', onAbort, { once: true })
  }

  return fetch(url, {
    signal: controller.signal,
    headers: { Accept: 'application/json' },
  })
    .finally(() => {
      clearTimeout(timer)
      if (signal) signal.removeEventListener('abort', onAbort)
    })
}

export function clearRouteCache() {
  cache.clear()
}

export async function getRoute(from, to, signal, mode = DEFAULT_ROUTING_MODE) {
  if (!isValidPoint(from) || !isValidPoint(to)) {
    throw new RoutingError('bad_input', 'A valid start and destination are required for routing.')
  }

  devSanityCheck(from, to)

  const start = { lat: Number(from.lat), lng: Number(from.lng) }
  const end = { lat: Number(to.lat), lng: Number(to.lng) }
  const bases = ROUTING_BASES[mode] || ROUTING_BASES.drive
  const key = cacheKey(start, end, mode)

  if (cache.has(key)) return cache.get(key)

  const params = 'overview=full&geometries=geojson&alternatives=true&steps=true'
  let lastError = null

  for (const base of bases) {
    if (signal?.aborted) {
      const err = new Error('Aborted')
      err.name = 'AbortError'
      throw err
    }
    const url = `${base}/${start.lng},${start.lat};${end.lng},${end.lat}?${params}`
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info('[routing] request', url)
    }
    try {
      const response = await fetchWithTimeout(url, signal, REQUEST_TIMEOUT_MS)
      if (response.status === 429 || response.status >= 500) {
        lastError = new RoutingError('unavailable', `Routing service returned HTTP ${response.status}.`)
        continue
      }
      if (!response.ok) {
        throw new RoutingError('unavailable', `Routing service returned HTTP ${response.status}.`)
      }
      const data = await response.json()
      const routes = toRoutes(data)
      const result = { routes }
      remember(key, result)
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.info('[routing] code', data.code, 'routes', routes.length)
      }
      return result
    } catch (error) {
      if (error?.name === 'AbortError' || signal?.aborted) {
        const err = new Error('Aborted')
        err.name = 'AbortError'
        throw err
      }
      if (error instanceof RoutingError) {
        // no_route is final; unavailable moves to next base
        if (error.code === 'no_route' || error.code === 'bad_input') throw error
        lastError = error
        continue
      }
      lastError = new RoutingError('unavailable', 'The road-routing service could not be reached.')
      continue
    }
  }

  throw lastError || new RoutingError('unavailable', 'The road-routing service could not be reached.')
}
