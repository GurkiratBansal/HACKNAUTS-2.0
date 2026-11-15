// FRESH:FILE  Draws hazard zone circles on the Leaflet map.
// FRESH:AREA  Emergency

import { Circle, Tooltip } from 'react-leaflet'

export default function HazardLayer({ zones = [] }) {
  return zones.map((zone) => (
    <Circle
      key={zone.id}
      center={[zone.lat, zone.lng]}
      radius={zone.radiusKm * 1000}
      pathOptions={{ color: '#b45309', fillColor: '#f59e0b', fillOpacity: 0.18, weight: 2, dashArray: '6 6' }}
    >
      <Tooltip sticky>
        <strong>{zone.label}</strong><br />
        Check local updates before travelling.
      </Tooltip>
    </Circle>
  ))
}
