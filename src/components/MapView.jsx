// FRESH:FILE  Leaflet map wrapper shared by the map and detail pages.
// FRESH:AREA  Map

import { useEffect, useRef } from 'react'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import MapRecenter from './map/MapRecenter'
import 'leaflet/dist/leaflet.css'

// Inline glyphs keep pins crisp without loading an icon font or external asset.
const PIN_GLYPHS = {
  food:
    '<path d="M4 12h16a8 8 0 0 1-16 0Z"/><path d="M9 5c-1 1.2-1 2.3 0 3.5M13 4c-1 1.2-1 2.3 0 3.5"/>',
  ngo: '<path d="M12 20s-7-4.35-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 4.65-7 9-7 9Z"/>',
  you: '<circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/>',
  pickup:
    '<path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  relief: '<path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11Z"/><path d="M12 7v6M9 10h6"/>',
}

function pinIcon(marker) {
  const size = marker.kind === 'you' ? 18 : marker.selected ? 46 : 40
  const glyph = PIN_GLYPHS[marker.kind] || PIN_GLYPHS.food
  return L.divIcon({
    className: 'fresh-map-pin',
    html: `<span class="fresh-pin${marker.selected ? ' fresh-pin--selected' : ''}${
      marker.kind === 'you' ? ' fresh-pin--you' : ''
    }" style="--pin-color:${
      marker.color || 'var(--fresh-urgency-fresh)'
    };${marker.ink ? `--pin-ink:${marker.ink};` : ''}width:${size}px;height:${size}px;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${glyph}</svg>
    </span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(event) {
      if (onMapClick) {
        onMapClick({ lat: event.latlng.lat, lng: event.latlng.lng })
      }
    },
  })
  return null
}

function ClosePopupsOnChange({ trigger }) {
  const map = useMap()

  useEffect(() => {
    if (trigger > 0) map.closePopup()
  }, [map, trigger])

  return null
}

function MarkerItem({ marker, active, onMarkerClick }) {
  const map = useMap()
  const markerRef = useRef(null)

  // Selecting a result in the side panel opens its popup and centres the pin.
  useEffect(() => {
    if (!active) return undefined
    const reduceMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches
    map.panTo([marker.lat, marker.lng], { animate: !reduceMotion })
    const timer = window.setTimeout(() => {
      markerRef.current?.openPopup()
    }, 60)
    return () => window.clearTimeout(timer)
  }, [active, map, marker.lat, marker.lng])

  return (
    <Marker
      ref={markerRef}
      position={[marker.lat, marker.lng]}
      icon={pinIcon({ ...marker, selected: active })}
      title={marker.title}
      zIndexOffset={active ? 1000 : 0}
      eventHandlers={{
        click: () => onMarkerClick?.(marker.id),
      }}
    >
      {marker.popup && <Popup>{marker.popup}</Popup>}
    </Marker>
  )
}

export default function MapView({
  center,
  zoom = 12,
  markers = [],
  height = '420px',
  className = '',
  onMapClick,
  onMarkerClick,
  activeMarkerId,
  showZoomControl = true,
  zoomControlPosition = 'topleft',
  flat = false,
  closePopupsKey = 0,
  children,
}) {
  const lat = Array.isArray(center) ? center[0] : center?.lat
  const lng = Array.isArray(center) ? center[1] : center?.lng

  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
    return (
      <div
        role="alert"
        className="flex min-h-11 items-center justify-center rounded-2xl border border-danger-200 bg-danger-50 p-4 text-sm font-semibold text-danger-800 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-200"
      >
        Map location is unavailable. Please choose a location.
      </div>
    )
  }

  const mapCenter = [Number(lat), Number(lng)]

  return (
    <div
      className={`overflow-hidden bg-elevated ${
        flat
          ? 'rounded-none border-0 shadow-none'
          : 'rounded-2xl border border-line shadow-soft'
      } ${className}`}
      style={{ height }}
    >
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom
        zoomControl={false}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >
        {showZoomControl && <ZoomControl position={zoomControlPosition} />}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapRecenter center={mapCenter} zoom={zoom} />
        <ClosePopupsOnChange trigger={closePopupsKey} />
        {onMapClick && <ClickHandler onMapClick={onMapClick} />}
        {children}
        {markers.map((marker) => (
          <MarkerItem
            key={marker.id}
            marker={marker}
            active={marker.id === activeMarkerId}
            onMarkerClick={onMarkerClick}
          />
        ))}
      </MapContainer>
    </div>
  )
}
