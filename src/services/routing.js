import { ROUTING_BASE_URLS, DEFAULT_ROUTING_MODE } from '../config'

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
    throw new Error('No road route found between these points.')
  }
  if (
    !Number.isFinite(Number(route.distance)) ||
    !Number.isFinite(Number(route.duration))
  ) {
    throw new Error('No road route found between these points.')
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
    throw new Error('No road route found between these points.')
  }
  const raw = Array.isArray(data.routes) ? data.routes : []
  if (raw.length === 0) {
    throw new Error('No road route found between these points.')
  }
  const routes = raw.map(toRoute)
  if (routes.length === 0) {
    throw new Error('No road route found between these points.')
  }
  return routes
}

export async function getRoute(from, to, signal, mode = DEFAULT_ROUTING_MODE) {
  if (!isPoint(from) || !isPoint(to)) {
    throw new Error('A valid start and destination are required for routing.')
  }

  const baseUrl = ROUTING_BASE_URLS[mode] || ROUTING_BASE_URLS.drive
  const start = { lat: Number(from.lat), lng: Number(from.lng) }
  const end = { lat: Number(to.lat), lng: Number(to.lng) }
  const key = cacheKey(start, end, mode)

  if (cache.has(key)) return cache.get(key)

  const url = `${baseUrl}/${start.lng},${start.lat};${end.lng},${
    end.lat
  }?overview=full&geometries=geojson&alternatives=true&steps=true`

  let response
  try {
    response = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    })
  } catch (error) {
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

  const routes = toRoutes(data)
  remember(key, routes)
  return routes
}
