import { useCallback, useEffect, useRef, useState } from 'react'

export function useGeolocation({ enableHighAccuracy = true } = {}) {
  const [state, setState] = useState({
    status: 'idle',
    position: null,
    error: null,
  })
  const watchIdRef = useRef(null)

  const stop = useCallback(() => {
    if (watchIdRef.current != null && navigator?.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setState((prev) => ({ ...prev, status: prev.position ? 'idle' : 'idle' }))
  }, [])

  const start = useCallback(() => {
    if (!navigator?.geolocation) {
      setState({ status: 'unsupported', position: null, error: 'Geolocation is not available in this browser.' })
      return false
    }
    if (
      !window.isSecureContext &&
      location.hostname !== 'localhost' &&
      location.hostname !== '127.0.0.1'
    ) {
      setState({
        status: 'insecure',
        position: null,
        error: 'Location needs a secure (HTTPS) context. Use simulation mode instead.',
      })
      return false
    }
    if (watchIdRef.current != null) return true
    setState((prev) => ({ ...prev, status: 'watching', error: null }))
    watchIdRef.current = navigator.geolocation.watchPosition(
      (p) => {
        setState({
          status: 'watching',
          position: {
            lat: p.coords.latitude,
            lng: p.coords.longitude,
            accuracy: p.coords.accuracy,
            speed: p.coords.speed,
            heading: p.coords.heading,
            timestamp: p.timestamp,
          },
          error: null,
        })
      },
      (err) => {
        const message =
          err.code === 1
            ? 'Location permission denied. Use simulation mode or the Google Maps link.'
            : err.code === 2
              ? 'Location unavailable. Try again or use simulation mode.'
              : 'Location request timed out. Try again.'
        setState((prev) => ({ ...prev, status: 'error', error: message }))
      },
      { enableHighAccuracy, maximumAge: 5000, timeout: 15000 },
    )
    return true
  }, [enableHighAccuracy])

  useEffect(() => {
    return () => {
      if (watchIdRef.current != null && navigator?.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  return { ...state, start, stop }
}
