import { useEffect } from 'react'
import { Polyline, Tooltip, useMap } from 'react-leaflet'
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

const STRAIGHT_LINE_STYLE = {
  color: '#94a3b8',
  weight: 2,
  opacity: 0.8,
  dashArray: '4 6',
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
      const straightKm = haversineKm(
        { lat: fromLat, lng: fromLng },
        { lat: toLat, lng: toLng },
      )
      map.fitBounds(
        [
          [fromLat, fromLng],
          [toLat, toLng],
        ],
        FIT_OPTIONS,
      )
      if (straightKm < 1) {
        onRouteInfo?.({
          status: 'straight',
          distanceKm: straightKm,
          durationMin: null,
          message: 'Straight-line distance only',
        })
      } else {
        onRouteInfo?.({
          status: 'error',
          distanceKm: straightKm,
          durationMin: null,
          message: error?.message || 'Could not load a road route.',
        })
      }
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
    const straightKm = haversineKm(
      { lat: fromLat, lng: fromLng },
      { lat: toLat, lng: toLng },
    )
    if (straightKm < 1) {
      return (
        <Polyline
          positions={[
            [fromLat, fromLng],
            [toLat, toLng],
          ]}
          pathOptions={STRAIGHT_LINE_STYLE}
        >
          <Tooltip permanent>Straight-line distance only</Tooltip>
        </Polyline>
      )
    }
    onRouteInfo?.({
      status: 'error',
      distanceKm: straightKm,
      durationMin: null,
      message: error?.message || 'Could not load a road route.',
    })
    return null
  }

  return null
}
