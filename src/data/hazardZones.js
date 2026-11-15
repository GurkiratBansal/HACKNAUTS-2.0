// FRESH:FILE  SAMPLE DATA: two fictional hazard circles generated around the active place for the emergency map.
// FRESH:AREA  Data

// FRESH:Hazard  Builds sample flood/heat zones near the active place.
export function makeSampleHazardZones(place) {
  if (!place) return []
  return [
    { id: 'hazard-sample-1', label: 'Reported waterlogging area (sample)', type: 'flood', lat: Number(place.lat) + 0.006, lng: Number(place.lng) + 0.004, radiusKm: 1.2, reportedAt: Date.now(), isSample: true },
    { id: 'hazard-sample-2', label: 'Reported heat-risk area (sample)', type: 'heatwave', lat: Number(place.lat) - 0.008, lng: Number(place.lng) - 0.006, radiusKm: 0.9, reportedAt: Date.now(), isSample: true },
  ]
}
