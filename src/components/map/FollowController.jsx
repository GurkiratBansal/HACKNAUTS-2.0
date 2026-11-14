import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

export default function FollowController({ onDrag }) {
  const map = useMap()
  useEffect(() => {
    const handler = () => onDrag?.()
    map.on('dragstart', handler)
    return () => map.off('dragstart', handler)
  }, [map, onDrag])
  return null
}
