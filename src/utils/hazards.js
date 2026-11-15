// FRESH:FILE  Route safety check: true when any sampled route point falls inside a hazard zone circle.
// FRESH:AREA  Emergency

import { haversineKm } from './distance'

// FRESH:Hazard  Samples the polyline and tests each point against every zone radius.
export function routeNearHazard(coords, zones, sampleEvery = 4) {
  if (!Array.isArray(coords) || !coords.length || !Array.isArray(zones)) return false
  const sampled = coords.filter((_, index) => index % sampleEvery === 0)
  const points = sampled.concat(coords.at(-1) ? [coords.at(-1)] : [])
  return zones.some((zone) => points.some(([lat, lng]) => haversineKm({ lat, lng }, zone) <= Number(zone.radiusKm)))
}
