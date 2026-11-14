import { Circle, Marker, Popup, useMap } from 'react-leaflet'
import { useEffect, useMemo } from 'react'
import L from 'leaflet'

const BLIP_TRANSITION = 'transform 500ms linear, opacity 200ms ease'

function blipIcon(heading, hasHeading) {
  return L.divIcon({
    className: 'fresh-nav-blip',
    html: `<span class="fresh-nav-blip__ring" aria-hidden="true"></span>
           <span class="fresh-nav-blip__dot" aria-hidden="true"></span>
           ${
             hasHeading
               ? `<span class="fresh-nav-blip__arrow" style="transform: rotate(${heading}deg)" aria-hidden="true"></span>`
               : ''
           }`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

export default function CurrentLocationMarker({
  position,
  accuracy,
  heading,
  speed,
  reducedMotion = false,
}) {
  const map = useMap()
  const hasHeading = Number.isFinite(heading) && (speed == null || speed > 1)
  const icon = useMemo(() => blipIcon(heading || 0, hasHeading), [heading, hasHeading])

  useEffect(() => {
    // Keep the marker element transition in sync with reduced-motion.
    const el = map.getContainer()
    el.style.setProperty('--nav-blip-transition', reducedMotion ? 'none' : BLIP_TRANSITION)
  }, [map, reducedMotion])

  if (!position) return null

  return (
    <>
      {Number.isFinite(accuracy) && accuracy >= 20 && (
        <Circle
          center={[position.lat, position.lng]}
          radius={accuracy}
          pathOptions={{
            color: '#2563eb',
            fillColor: '#2563eb',
            fillOpacity: 0.08,
            weight: 1,
            opacity: 0.35,
          }}
        />
      )}
      <Marker
        position={[position.lat, position.lng]}
        icon={icon}
        zIndexOffset={1100}
        keyboard={false}
      >
        <Popup>
          <p className="text-xs font-semibold text-ink">Your location</p>
          {Number.isFinite(accuracy) && (
            <p className="text-[11px] text-ink-muted">Accuracy: {Math.round(accuracy)} m</p>
          )}
        </Popup>
      </Marker>
    </>
  )
}
