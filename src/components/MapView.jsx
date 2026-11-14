import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Vite does not rewrite Leaflet's default icon URL at runtime, so point the
// default icon at the bundled assets explicitly.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

function pinIcon(color, selected = false) {
  const size = selected ? 22 : 16
  return L.divIcon({
    className: 'fresh-map-pin',
    html: `<span style="
      display:block;width:${size}px;height:${size}px;border-radius:9999px;
      background:${color};border:3px solid #fff;
      box-shadow:0 2px 8px rgba(15,23,42,.35);"></span>`,
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

function Recenter({ center, zoom }) {
  const map = useMap()
  const [lat, lng] = center
  useEffect(() => {
    map.setView([lat, lng], zoom)
  }, [lat, lng, zoom, map])
  return null
}

export default function MapView({
  center = [28.6139, 77.209],
  zoom = 12,
  markers = [],
  height = '420px',
  className = '',
  onMapClick,
  showZoomControl = true,
  zoomControlPosition = 'topleft',
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm ${className}`}
      style={{ height }}
    >
      <MapContainer
        center={center}
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
        <Recenter center={center} zoom={zoom} />
        {onMapClick && <ClickHandler onMapClick={onMapClick} />}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={pinIcon(marker.color || '#059669', marker.selected)}
            title={marker.title}
          >
            {marker.popup && <Popup>{marker.popup}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
