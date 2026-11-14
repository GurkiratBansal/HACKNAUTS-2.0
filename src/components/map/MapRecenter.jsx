import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

/**
 * MapContainer ignores later `center` prop changes, so place changes are
 * animated with flyTo here. Reduced-motion users get an instant move.
 */
export default function MapRecenter({ center, zoom = 13 }) {
  const map = useMap()
  const lat = Array.isArray(center) ? center[0] : center?.lat
  const lng = Array.isArray(center) ? center[1] : center?.lng

  useEffect(() => {
    if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return
    const reduceMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches
    map.flyTo([Number(lat), Number(lng)], zoom, {
      duration: reduceMotion ? 0 : 0.7,
    })
  }, [lat, lng, zoom, map])

  return null
}
