import { haversineKm } from './distance.js'

/**
 * Pure helpers for live navigation.
 *
 * Everything here is side-effect free so it can be unit tested and reused by
 * both the real GPS pipeline and the demo simulation.
 */

const METRES_PER_DEG_LAT = 111139

function metresPerDegLng(lat) {
  return METRES_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180)
}

export function haversineMeters(a, b) {
  return haversineKm(a, b) * 1000
}

export const OFF_ROUTE_THRESHOLD_M = 50
export const ARRIVAL_THRESHOLD_M = 30
export const MIN_GPS_MOVE_M = 5
export const MAX_GPS_ACCURACY_M = 100

export function snapToRoute(position, routeCoords) {
  if (
    !position ||
    !Array.isArray(routeCoords) ||
    routeCoords.length < 2
  ) {
    return {
      snapped: position
        ? { lat: Number(position.lat), lng: Number(position.lng) }
        : null,
      segmentIndex: 0,
      distanceMeters: Infinity,
    }
  }

  let best = { distanceMeters: Infinity, segmentIndex: 0, snapped: null }

  for (let i = 0; i < routeCoords.length - 1; i++) {
    const a = { lat: routeCoords[i][0], lng: routeCoords[i][1] }
    const b = { lat: routeCoords[i + 1][0], lng: routeCoords[i + 1][1] }

    const mPerDegLat = METRES_PER_DEG_LAT
    const mPerDegLng = metresPerDegLng(a.lat)

    const bx = (b.lng - a.lng) * mPerDegLng
    const by = (b.lat - a.lat) * mPerDegLat
    const px = (position.lng - a.lng) * mPerDegLng
    const py = (position.lat - a.lat) * mPerDegLat

    const len2 = bx * bx + by * by
    let t = len2 === 0 ? 0 : (px * bx + py * by) / len2
    t = Math.max(0, Math.min(1, t))

    const nx = t * bx
    const ny = t * by
    const dist = Math.hypot(px - nx, py - ny)

    if (dist < best.distanceMeters) {
      best = {
        distanceMeters: dist,
        segmentIndex: i,
        snapped: {
          lat: a.lat + ny / mPerDegLat,
          lng: a.lng + nx / mPerDegLng,
        },
      }
    }
  }

  return best
}

export function remainingDistance(snapped, routeCoords, segmentIndex) {
  if (!snapped || !Array.isArray(routeCoords) || routeCoords.length < 2) {
    return 0
  }

  let idx = segmentIndex
  if (idx == null) {
    idx = snapToRoute(snapped, routeCoords).segmentIndex
  }
  idx = Math.max(0, Math.min(idx, routeCoords.length - 2))

  const toPoint = (coord) => ({ lat: coord[0], lng: coord[1] })

  let total = haversineMeters(snapped, toPoint(routeCoords[idx + 1]))
  for (let i = idx + 1; i < routeCoords.length - 1; i++) {
    total += haversineMeters(toPoint(routeCoords[i]), toPoint(routeCoords[i + 1]))
  }
  return total / 1000
}

export function remainingTimeMinutes(
  remainingKm,
  originalDistanceKm,
  originalDurationMin,
) {
  if (!Number.isFinite(remainingKm) || !originalDistanceKm) return 0
  const ratio = (originalDurationMin || 0) / originalDistanceKm
  return Math.max(0, remainingKm * ratio)
}

export function bearing(from, to) {
  if (!from || !to) return 0
  const phi1 = (from.lat * Math.PI) / 180
  const phi2 = (to.lat * Math.PI) / 180
  const deltaLambda = ((to.lng - from.lng) * Math.PI) / 180
  const y = Math.sin(deltaLambda) * Math.cos(phi2)
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda)
  const theta = Math.atan2(y, x)
  return (theta * 180) / Math.PI + (theta < 0 ? 360 : 0)
}

export function isOffRoute(distanceMeters, threshold = OFF_ROUTE_THRESHOLD_M) {
  return Number.isFinite(distanceMeters) && distanceMeters > threshold
}

export function isArrived(distanceMeters, threshold = ARRIVAL_THRESHOLD_M) {
  return Number.isFinite(distanceMeters) && distanceMeters <= threshold
}

export function progressPercent(remainingKm, totalKm) {
  if (!Number.isFinite(totalKm) || totalKm <= 0) return 100
  if (!Number.isFinite(remainingKm)) return 0
  const value = (1 - remainingKm / totalKm) * 100
  return Math.max(0, Math.min(100, value))
}

export function moveAlongRoute(routeCoords, distanceMeters) {
  if (!Array.isArray(routeCoords) || routeCoords.length < 2) {
    return {
      position:
        routeCoords && routeCoords[0]
          ? { lat: routeCoords[0][0], lng: routeCoords[0][1] }
          : null,
      segmentIndex: 0,
      travelledMeters: 0,
    }
  }

  const toPoint = (coord) => ({ lat: coord[0], lng: coord[1] })
  const segments = []
  let cumulative = 0
  for (let i = 0; i < routeCoords.length - 1; i++) {
    const length = haversineMeters(
      toPoint(routeCoords[i]),
      toPoint(routeCoords[i + 1]),
    )
    segments.push({ index: i, start: cumulative, end: cumulative + length, length })
    cumulative += length
  }

  const target = Math.max(0, Math.min(distanceMeters, cumulative))
  const segment =
    segments.find((item) => target <= item.end) || segments[segments.length - 1]

  const local = target - segment.start
  const ratio = segment.length === 0 ? 0 : local / segment.length
  const a = toPoint(routeCoords[segment.index])
  const b = toPoint(routeCoords[segment.index + 1])

  return {
    position: {
      lat: a.lat + (b.lat - a.lat) * ratio,
      lng: a.lng + (b.lng - a.lng) * ratio,
    },
    segmentIndex: segment.index,
    travelledMeters: target,
  }
}
