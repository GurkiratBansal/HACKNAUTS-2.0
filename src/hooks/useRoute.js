import { useEffect, useState } from 'react'
import { getRoute } from '../services/routing'
import { recommendRoute } from '../utils/routeScore'

const EMPTY = { key: null, routes: [], route: null, loading: false, error: null }

const finite = (value) => Number.isFinite(Number(value))

export function useRoute(from, to, mode = 'drive') {
  const fromLat = from ? Number(from.lat) : NaN
  const fromLng = from ? Number(from.lng) : NaN
  const toLat = to ? Number(to.lat) : NaN
  const toLng = to ? Number(to.lng) : NaN
  const valid =
    finite(fromLat) && finite(fromLng) && finite(toLat) && finite(toLng)
  const key = valid ? `${mode}:${fromLat},${fromLng}|${toLat},${toLng}` : null

  const [entry, setEntry] = useState(EMPTY)
  const current = entry.key === key ? entry : null

  useEffect(() => {
    if (!valid) return undefined

    const controller = new AbortController()
    let active = true

    setEntry({ key, routes: [], route: null, loading: true, error: null })

    getRoute(
      { lat: fromLat, lng: fromLng },
      { lat: toLat, lng: toLng },
      controller.signal,
      mode,
    )
      .then((routes) => {
        if (!active) return
        const result = recommendRoute(routes)
        setEntry({
          key,
          routes,
          route: result.recommended || routes[0] || null,
          loading: false,
          error: null,
        })
      })
      .catch((error) => {
        if (!active || error?.name === 'AbortError') return
        setEntry({ key, routes: [], route: null, loading: false, error })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [valid, key, fromLat, fromLng, toLat, toLng, mode])

  return {
    routes: current?.routes || [],
    route: current?.route || null,
    loading: Boolean(valid && (!current || current.loading)),
    error: current?.error || null,
  }
}
