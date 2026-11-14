import { useEffect } from 'react'
import { Polyline, useMap } from 'react-leaflet'

const ROAD_STYLE = {
  color: '#059669',
  weight: 5,
  opacity: 0.95,
  lineCap: 'round',
  lineJoin: 'round',
  interactive: false,
}

const FIT_OPTIONS = { padding: [48, 48], maxZoom: 15 }

const isPoint = (point) =>
  point &&
  Number.isFinite(Number(point.lat)) &&
  Number.isFinite(Number(point.lng))

/**
 * Draws the one real OSRM road route as an emerald weight-5 polyline.
 *
 * Nothing is rendered when there is no route. No straight-line fallback.
 */
export default function RouteLayer({ from, to, route, loading, error, onRouteInfo }) {
  const map = useMap()
  const valid = isPoint(from) && isPoint(to)

  useEffect(() => {
    if (!valid) {
      onRouteInfo?.(null)
      return
    }

    if (route?.coords?.length) {
      map.fitBounds(route.coords, FIT_OPTIONS)
      onRouteInfo?.({
        status: 'ready',
        distanceKm: route.distanceKm,
        durationMin: route.durationMin,
      })
      return
    }

    if (error) {
      map.fitBounds(
        [
          [Number(from.lat), Number(from.lng)],
          [Number(to.lat), Number(to.lng)],
        ],
        FIT_OPTIONS,
      )
      onRouteInfo?.({
        status: 'error',
        message: error.message || 'Could not load a road route.',
      })
      return
    }

    if (loading) onRouteInfo?.({ status: 'loading' })
  }, [valid, route, loading, error, map, onRouteInfo, Number(from?.lat), Number(from?.lng), Number(to?.lat), Number(to?.lng)])

  if (!valid || !route?.coords?.length) return null

  return (
    <Polyline
      positions={route.coords}
      pathOptions={ROAD_STYLE}
      aria-label="Driving route"
    />
  )
}