import { useEffect } from 'react'
import { Polyline, useMap } from 'react-leaflet'
import { haversineKm } from '../utils/distance'
import { recommendRoute } from '../utils/routeScore'

const SELECTED_STYLE = {
  color: '#059669',
  weight: 6,
  opacity: 0.95,
  lineCap: 'round',
  lineJoin: 'round',
  interactive: false,
}

const ALTERNATIVE_STYLE = {
  color: '#94a3b8',
  weight: 3,
  opacity: 0.85,
  dashArray: '6 8',
  lineCap: 'round',
  lineJoin: 'round',
  interactive: true,
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

export default function RouteLayer({
  from,
  to,
  routes,
  loading,
  error,
  selectedRouteId,
  onSelectRoute,
  onRouteInfo,
}) {
  const map = useMap()
  const valid = isPoint(from) && isPoint(to)
  const fromLat = valid ? Number(from.lat) : NaN
  const fromLng = valid ? Number(from.lng) : NaN
  const toLat = valid ? Number(to.lat) : NaN
  const toLng = valid ? Number(to.lng) : NaN

  const routeList = Array.isArray(routes) ? routes : []
  const selected =
    routeList.find((route) => route.id === selectedRouteId) || routeList[0] || null

  useEffect(() => {
    if (!valid) {
      onRouteInfo?.(null)
      return
    }

    if (selected) {
      map.fitBounds(selected.coords, FIT_OPTIONS)
      onRouteInfo?.({
        status: 'ready',
        distanceKm: selected.distanceKm,
        durationMin: selected.durationMin,
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
    selected,
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

  if (selected) {
    return (
      <>
        {routeList
          .filter((route) => route.id !== selected.id)
          .map((route) => (
            <Polyline
              key={route.id}
              positions={route.coords}
              pathOptions={ALTERNATIVE_STYLE}
              eventHandlers={{
                click: () => onSelectRoute?.(route.id),
              }}
            />
          ))}
        <Polyline
          positions={selected.coords}
          pathOptions={SELECTED_STYLE}
        />
      </>
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
      />
    )
  }

  return null
}
