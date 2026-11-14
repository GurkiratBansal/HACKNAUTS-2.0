import { useCallback, useEffect, useState } from 'react'
import { getRoute } from '../services/routing'
import { recommendRoute } from '../utils/routeScore'

const finite = (value) => Number.isFinite(Number(value))

export function useRoute(from, to, mode = 'drive') {
  const fromLat = from ? Number(from.lat) : NaN
  const fromLng = from ? Number(from.lng) : NaN
  const toLat = to ? Number(to.lat) : NaN
  const toLng = to ? Number(to.lng) : NaN
  const valid =
    Number.isFinite(fromLat) &&
    Number.isFinite(fromLng) &&
    Number.isFinite(toLat) &&
    Number.isFinite(toLng)
  const key = valid ? `${mode}:${fromLat},${fromLng}|${toLat},${toLng}` : null

  const [reloadToken, setReloadToken] = useState(0)
  const [entry, setEntry] = useState({
    key: null,
    routes: [],
    selectedId: null,
    loading: false,
    error: null,
  })
  const current = entry.key === key ? entry : null

  const refetch = useCallback(() => setReloadToken((value) => value + 1), [])
  const selectRoute = useCallback((id) => {
    setEntry((prev) => (prev.key === key ? { ...prev, selectedId: id } : prev))
  }, [key])

  useEffect(() => {
    if (!valid) return undefined

    const controller = new AbortController()
    let active = true

    setEntry({ key, routes: [], selectedId: null, loading: true, error: null })

    getRoute(
      { lat: fromLat, lng: fromLng },
      { lat: toLat, lng: toLng },
      controller.signal,
      mode,
    )
      .then((result) => {
        if (!active) return
        const routes = Array.isArray(result?.routes) ? result.routes : []
        const recommendation = recommendRoute(routes)
        setEntry({
          key,
          routes,
          selectedId: recommendation.recommended?.id ?? routes[0]?.id ?? null,
          loading: false,
          error: null,
        })
      })
      .catch((error) => {
        if (!active || error?.name === 'AbortError') return
        setEntry({
          key,
          routes: [],
          selectedId: null,
          loading: false,
          error,
        })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [valid, key, fromLat, fromLng, toLat, toLng, mode, reloadToken])

  const routes = current?.routes || []
  const selectedId = current?.selectedId ?? null
  const selectedRoute = routes.find((route) => route.id === selectedId) || routes[0] || null

  return {
    routes,
    selectedRoute,
    selectedId,
    selectRoute,
    recommendedId: routes.length ? recommendRoute(routes).recommended?.id ?? null : null,
    loading: Boolean(valid && (!current || current.loading)),
    error: current?.error || null,
    refetch,
  }
}
