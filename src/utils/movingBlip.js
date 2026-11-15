// FRESH:FILE  Interpolation, bearing, and distance calculation for the moving map blip.
// FRESH:AREA  Routing

/**
 * Calculate distance between two [lat, lng] points in kilometers (Haversine formula).
 */
export function getPointDistanceKm(p1, p2) {
  if (!p1 || !p2) return 0
  const R = 6371
  const dLat = ((p2[0] - p1[0]) * Math.PI) / 180
  const dLng = ((p2[1] - p1[1]) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1[0] * Math.PI) / 180) *
      Math.cos((p2[0] * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Calculate compass bearing (degrees 0 - 360) from point p1 to p2.
 */
export function calculateBearing(p1, p2) {
  if (!p1 || !p2) return 0
  const lat1 = (p1[0] * Math.PI) / 180
  const lat2 = (p2[0] * Math.PI) / 180
  const dLng = ((p2[1] - p1[1]) * Math.PI) / 180
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  const brng = (Math.atan2(y, x) * 180) / Math.PI
  return (brng + 360) % 360
}

/**
 * Smoothly interpolates the blip's current position, bearing, and traveled trail
 * along the route coordinates array based on a progress value from 0.0 to 1.0.
 */
export function interpolateRoutePosition(coords = [], progress = 0) {
  if (!coords || coords.length === 0) {
    return { position: [0, 0], bearing: 0, traveledCoords: [] }
  }

  if (coords.length === 1 || progress <= 0) {
    const bearing = coords.length > 1 ? calculateBearing(coords[0], coords[1]) : 0
    return {
      position: coords[0],
      bearing,
      traveledCoords: [coords[0]],
    }
  }

  if (progress >= 1) {
    const lastIdx = coords.length - 1
    const bearing = calculateBearing(coords[lastIdx - 1], coords[lastIdx])
    return {
      position: coords[lastIdx],
      bearing,
      traveledCoords: [...coords],
    }
  }

  // 1. Calculate cumulative segment distances
  const cumulative = [0]
  let totalDist = 0
  for (let i = 0; i < coords.length - 1; i++) {
    const d = getPointDistanceKm(coords[i], coords[i + 1])
    totalDist += d
    cumulative.push(totalDist)
  }

  if (totalDist === 0) {
    return { position: coords[0], bearing: 0, traveledCoords: [coords[0]] }
  }

  const targetDist = progress * totalDist

  // 2. Locate current active segment
  let segIdx = 0
  for (let i = 0; i < cumulative.length - 1; i++) {
    if (targetDist >= cumulative[i] && targetDist <= cumulative[i + 1]) {
      segIdx = i
      break
    }
  }

  const segStartDist = cumulative[segIdx]
  const segEndDist = cumulative[segIdx + 1]
  const segLen = segEndDist - segStartDist

  const fraction = segLen > 0 ? (targetDist - segStartDist) / segLen : 0

  const p1 = coords[segIdx]
  const p2 = coords[segIdx + 1]

  const lat = p1[0] + fraction * (p2[0] - p1[0])
  const lng = p1[1] + fraction * (p2[1] - p1[1])
  const currentPos = [lat, lng]

  const bearing = calculateBearing(p1, p2)
  const traveledCoords = [...coords.slice(0, segIdx + 1), currentPos]

  return {
    position: currentPos,
    bearing,
    traveledCoords,
  }
}

/**
 * Snaps real physical user GPS coordinates to closest route segment.
 */
export function findClosestProgressOnRoute(coords = [], userLat, userLng) {
  if (!coords || coords.length < 2) return 0
  const userPoint = [userLat, userLng]
  let minDist = Infinity
  let closestIdx = 0

  for (let i = 0; i < coords.length; i++) {
    const d = getPointDistanceKm(coords[i], userPoint)
    if (d < minDist) {
      minDist = d
      closestIdx = i
    }
  }

  return closestIdx / (coords.length - 1)
}
