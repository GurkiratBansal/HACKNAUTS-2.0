import { useEffect } from 'react'
import { Polyline, useMap } from 'react-leaflet'

const ROAD_STYLE = {
  color: '#059669',
  weight: 6,
  opacity: 0.92,
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
 * Draws the one real OSRM road route.
 *
 * There is deliberately no straight-line fallback: when routing fails the
 * summary card shows the error, a Try again button and a Google Maps link
 * instead of drawing a misleading line across the city.
 */
export default function RouteLayer({ from, to, route, loading, error, onRouteInfo }) {
  const map = useMap()
  const valid = isPoint(from) && isPoint(to)
  const fromLat = valid ? Number(from.lat) : NaN
  const fromLng = valid ? Number(from.lng) : NaN
  const toLat = valid ? Number(to.lat) : NaN
  const toLng = valid ? Number(to.lng) : NaN

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
      // Frame the two pins so the user can still see where they are, but do
      // not draw a line between them.
      map.fitBounds(
        [
          [fromLat, fromLng],
          [toLat, toLng],
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
  }, [
    valid,
    route,
    loading,
    error,
    map,
    onRouteInfo,
    fromLat,
    fromLng,
    toLat,
    toLng,
  ])

  if (!valid || !route?.coords?.length) return null

  return (
    <Polyline
      positions={route.coords}
      pathOptions={ROAD_STYLE}
      aria-label="Driving route"
    />
  )
}
