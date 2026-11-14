import { useEffect, useState } from 'react'
import { getRoute } from '../services/routing'

const finite = (value) => Number.isFinite(Number(value))

/**
 * Load one road route. The request is aborted when the endpoints change or
 * the component unmounts. requestKey can be changed to retry the same route.
 */
export function useRoute(from, to, requestKey = 0) {
  const fromLat = from ? Number(from.lat) : NaN
  const fromLng = from ? Number(from.lng) : NaN
  const toLat = to ? Number(to.lat) : NaN
  const toLng = to ? Number(to.lng) : NaN
  const valid =
    finite(fromLat) && finite(fromLng) && finite(toLat) && finite(toLng)
  const key = valid
    ? `${fromLat},${fromLng}|${toLat},${toLng}|${requestKey}`
    : null

  const [entry, setEntry] = useState({
    key: null,
    route: null,
    loading: false,
    error: null,
  })
  const current = entry.key === key ? entry : null

  useEffect(() => {
    if (!valid) return undefined

    const controller = new AbortController()
    let active = true
    setEntry({ key, route: null, loading: true, error: null })

    getRoute(
      { lat: fromLat, lng: fromLng },
      { lat: toLat, lng: toLng },
      controller.signal,
    )
      .then((route) => {
        if (active) setEntry({ key, route, loading: false, error: null })
      })
      .catch((error) => {
        if (!active || error?.name === 'AbortError') return
        setEntry({ key, route: null, loading: false, error })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [valid, key, fromLat, fromLng, toLat, toLng, requestKey])

  return {
    route: current?.route || null,
    loading: Boolean(valid && (!current || current.loading)),
    error: current?.error || null,
  }
}
