import { useEffect, useState } from 'react'
import { getRoute } from '../services/routing'

const EMPTY = { key: null, route: null, loading: false, error: null }

const finite = (value) => Number.isFinite(Number(value))

/**
 * Resolve a road route for the current selection.
 *
 * The previous route is hidden immediately when the selection changes, and
 * the in-flight request is aborted on cleanup so a slow answer for an old pin
 * can never replace the new one.
 */
export function useRoute(from, to) {
  const fromLat = from ? Number(from.lat) : NaN
  const fromLng = from ? Number(from.lng) : NaN
  const toLat = to ? Number(to.lat) : NaN
  const toLng = to ? Number(to.lng) : NaN
  const valid =
    finite(fromLat) && finite(fromLng) && finite(toLat) && finite(toLng)
  const key = valid ? `${fromLat},${fromLng}|${toLat},${toLng}` : null

  const [entry, setEntry] = useState(EMPTY)
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
  }, [valid, key, fromLat, fromLng, toLat, toLng])

  return {
    route: current?.route || null,
    // A selection with no settled result yet is loading, even on the first
    // render before the effect has had a chance to run.
    loading: Boolean(valid && (!current || current.loading)),
    error: current?.error || null,
  }
}
