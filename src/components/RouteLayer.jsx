import { useEffect } from 'react'
import { Polyline, useMap } from 'react-leaflet'
import { useRoute } from '../hooks/useRoute'
import { haversineKm } from '../utils/distance'

const ROAD_STYLE = {
  color: '#059669',
  weight: 6,
  opacity: 0.92,
  lineCap: 'round',
  lineJoin: 'round',
  interactive: false,
}

const FALLBACK_STYLE = {
  color: '#94a3b8',
  weight: 4,
  opacity: 0.95,
  dashArray: '8 10',
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
 * Must be rendered inside a MapContainer.
 *
 * Draws the real OSRM road route, zooms the map to it, and reports a small
 * summary upward for the route card. If routing fails (offline, CORS, no
 * route) it draws a dashed straight line instead so a live demo never goes
 * blank, and labels that distance as a straight-line estimate.
 */
export default function RouteLayer({ from, to, onRouteInfo }) {
  const map = useMap()
  const { route, loading, error } = useRoute(from, to)
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

    if (route) {
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
          [fromLat, fromLng],
          [toLat, toLng],
        ],
        FIT_OPTIONS,
      )
      onRouteInfo?.({
        status: 'fallback',
        distanceKm: haversineKm(
          { lat: fromLat, lng: fromLng },
          { lat: toLat, lng: toLng },
        ),
        durationMin: null,
        message: error.message || 'Road route unavailable.',
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

  if (!valid) return null

  if (route) {
    return (
      <Polyline
        positions={route.coords}
        pathOptions={ROAD_STYLE}
        aria-label="Driving route"
      />
    )
  }

  if (error) {
    return (
      <Polyline
        positions={[
          [fromLat, fromLng],
          [toLat, toLng],
        ]}
        pathOptions={FALLBACK_STYLE}
        aria-label="Straight-line fallback because no road route is available"
      />
    )
  }

  return null
}
