// FRESH:FILE  Distance helpers: Haversine kilometres, distance sorting and nearest-NGO selection.
// FRESH:AREA  Utils

// FRESH:Utils  Great-circle distance in km between two { lat, lng } points.
/**
 * Haversine distance in kilometres between two lat/lng objects.
 * Used for NGO filtering, sorting and the smart-alert nearest-NGO list.
 */
export function haversineKm(a, b) {
  if (!a || !b) return Infinity
  const R = 6371
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

// FRESH:Utils  Copies a list sorted nearest-first from an origin.
export function sortByDistance(items, origin) {
  return [...items].sort(
    (a, b) => haversineKm(origin, a) - haversineKm(origin, b),
  )
}

// FRESH:Donation  N nearest (optionally verified) NGOs with distanceKm attached.
export function nearestNgos(ngos, origin, count = 3, onlyVerified = true) {
  const pool = onlyVerified ? ngos.filter((n) => n.verified) : ngos
  return sortByDistance(pool, origin)
    .slice(0, count)
    .map((ngo) => ({ ...ngo, distanceKm: haversineKm(origin, ngo) }))
}
