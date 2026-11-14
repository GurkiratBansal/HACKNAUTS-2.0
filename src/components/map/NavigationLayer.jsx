import { Polyline } from 'react-leaflet'
import { snapToRoute } from '../../utils/navigation'
import CurrentLocationMarker from './CurrentLocationMarker'

const TRAVELLED_STYLE = {
  color: '#9ca3b8',
  weight: 3,
  opacity: 0.75,
  dashArray: '4 6',
  lineCap: 'round',
  lineJoin: 'round',
  interactive: false,
}

const REMAINING_STYLE = {
  color: '#059669',
  weight: 6,
  opacity: 0.95,
  lineCap: 'round',
  lineJoin: 'round',
  interactive: false,
}

function splitRoute(routeCoords, snapped) {
  if (!Array.isArray(routeCoords) || routeCoords.length < 2) {
    return { travelled: [], remaining: routeCoords || [] }
  }
  if (!snapped) {
    return { travelled: [], remaining: routeCoords }
  }
  const snap = snapToRoute(snapped, routeCoords)
  const idx = Math.max(0, Math.min(snap.segmentIndex, routeCoords.length - 2))
  const travelled = routeCoords
    .slice(0, idx + 1)
    .concat([[snapped.lat, snapped.lng]])
  const remaining = [[snapped.lat, snapped.lng]].concat(routeCoords.slice(idx + 1))
  return { travelled, remaining }
}

export default function NavigationLayer({
  route,
  position,
  snappedPosition,
  reducedMotion = false,
}) {
  if (!route?.coords) return null

  const { travelled, remaining } = splitRoute(route.coords, snappedPosition)

  return (
    <>
      {travelled.length >= 2 && (
        <Polyline positions={travelled} pathOptions={TRAVELLED_STYLE} />
      )}
      {remaining.length >= 2 && (
        <Polyline positions={remaining} pathOptions={REMAINING_STYLE} />
      )}
      {position && (
        <CurrentLocationMarker
          position={position}
          accuracy={position.accuracy}
          heading={position.heading}
          speed={position.speed}
          reducedMotion={reducedMotion}
        />
      )}
    </>
  )
}
