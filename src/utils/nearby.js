// FRESH:FILE  Radius filter and recommendation helpers for the map page; returns items copied with distanceKm, nearest first.
// FRESH:AREA  Map

import { DEFAULT_RADIUS_KM, RADIUS_OPTIONS } from '../config'
import { haversineKm } from './distance'
import { getUrgency, urgencyRank } from './urgency'
import { formatDistance } from './format'

export { DEFAULT_RADIUS_KM, RADIUS_OPTIONS }

const KM_PER_DEGREE_LAT = 111.32

function pointOf(item) {
  return item?.location && Number.isFinite(Number(item.location.lat))
    ? item.location
    : item
}

// FRESH:Map  Keeps only items within radiusKm of the centre; bounding-box prefilter keeps it cheap.
/**
 * Keep only items within `radiusKm` of `center`, hiding everything else.
 * A bounding-box prefilter keeps the Haversine pass cheap for large lists.
 * The returned items are copied with a `distanceKm` field and sorted nearest
 * first.
 */
export function nearby(items, center, radiusKm = DEFAULT_RADIUS_KM) {
  if (!center || !Number.isFinite(Number(center.lat)) || !Number.isFinite(Number(center.lng))) {
    return []
  }
  const radius = Number(radiusKm)
  if (!Number.isFinite(radius) || radius < 0) return []

  const lat = Number(center.lat)
  const lng = Number(center.lng)
  const latDelta = radius / KM_PER_DEGREE_LAT + 0.0005
  const cosLat = Math.max(0.01, Math.cos((lat * Math.PI) / 180))
  const lngDelta = radius / (KM_PER_DEGREE_LAT * cosLat) + 0.0005

  return (Array.isArray(items) ? items : [])
    .map((item) => {
      const point = pointOf(item)
      return {
        item,
        point,
        distanceKm: haversineKm(center, point),
      }
    })
    .filter(({ point, distanceKm }) => {
      if (!Number.isFinite(Number(point?.lat)) || !Number.isFinite(Number(point?.lng))) {
        return false
      }
      if (
        Math.abs(Number(point.lat) - lat) > latDelta ||
        Math.abs(Number(point.lng) - lng) > lngDelta
      ) {
        return false
      }
      return distanceKm <= radius
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .map(({ item, distanceKm }) => ({ ...item, distanceKm }))
}

// FRESH:Map  Top picks: food by urgency then distance; partners by verified then distance.
/**
 * Top three recommendations for a strip. Food sorts by urgency first, then
 * distance; NGOs and kitchens sort by verified first, then distance. The word
 * "best" is intentionally not used.
 */
export function recommend(items, kind = 'food', limit = 3) {
  const list = [...(Array.isArray(items) ? items : [])]
  if (kind === 'food') {
    return list
      .sort((a, b) => {
        const rank = urgencyRank(getUrgency(a.deadline).key) - urgencyRank(getUrgency(b.deadline).key)
        return rank !== 0 ? rank : (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
      })
      .slice(0, limit)
  }
  return list
    .sort((a, b) => {
      const verified = Number(Boolean(b.verified)) - Number(Boolean(a.verified))
      return verified !== 0 ? verified : (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
    })
    .slice(0, limit)
}

// FRESH:Map  One-line human reason for a recommendation.
/** One-line, human reason for a recommendation. */
export function recommendReason(item, kind = 'food') {
  const parts = [formatDistance(item.distanceKm)]
  if (kind === 'food') {
    const urgency = getUrgency(item.deadline).key
    if (urgency !== 'fresh' && urgency !== 'expired') parts.push(urgency)
  } else if (item.verified) {
    parts.push('verified')
  }
  return parts.join(', ')
}
