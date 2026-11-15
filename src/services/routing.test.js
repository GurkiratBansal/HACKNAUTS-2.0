// FRESH:FILE  Unit tests for the routing service (fetch mocked).
// FRESH:AREA  Routing

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { clearRouteCache, getRoute } from './routing'

const pointA = { lat: 28.633, lng: 77.219 }
const pointB = { lat: 28.6448, lng: 77.2167 }

function osrmOk() {
  return {
    code: 'Ok',
    routes: [
      {
        distance: 1755.1,
        duration: 175,
        geometry: {
          coordinates: [
            [77.2167, 28.6448],
            [77.219, 28.633],
          ],
        },
      },
    ],
  }
}

const okResponse = () => ({
  ok: true,
  status: 200,
  json: async () => osrmOk(),
})

describe('routing service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    clearRouteCache()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('builds a lng,lat URL without alternatives or steps and converts coordinates', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse())
    vi.stubGlobal('fetch', fetchMock)

    const route = await getRoute(pointA, pointB)
    const url = fetchMock.mock.calls[0][0]

    expect(url).toContain('/77.219,28.633;77.2167,28.6448?')
    expect(url).toContain('overview=full')
    expect(url).toContain('geometries=geojson')
    expect(url).not.toContain('alternatives=')
    expect(url).not.toContain('steps=')
    expect(route.coords[0]).toEqual([28.6448, 77.2167])
    expect(route.coords[1]).toEqual([28.633, 77.219])
    expect(route.distanceKm).toBeCloseTo(1.7551, 4)
    expect(route.durationMin).toBe(3)
  })

  it('rejects missing or out-of-range points', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(getRoute({ lat: NaN, lng: 1 }, pointB)).rejects.toThrow(
      'Start or destination location is missing',
    )
    await expect(getRoute(null, pointB)).rejects.toThrow(
      'Start or destination location is missing',
    )
    await expect(getRoute({ lat: 100, lng: 77 }, pointB)).rejects.toThrow(
      'Start or destination location is missing',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('throws when the routing service reports NoRoute', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ code: 'NoRoute', routes: [] }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(getRoute(pointA, pointB)).rejects.toThrow('No road route found (NoRoute)')
  })

  it('falls back to the backup server on a 500 response', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
      .mockResolvedValueOnce(okResponse())
    vi.stubGlobal('fetch', fetchMock)

    const route = await getRoute(pointA, pointB)

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0][0]).toContain('routing.openstreetmap.de')
    expect(fetchMock.mock.calls[1][0]).toContain('router.project-osrm.org')
    expect(route.coords).toHaveLength(2)
  })

  it('falls back to the backup server on a timeout error', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('request timed out'))
      .mockResolvedValueOnce(okResponse())
    vi.stubGlobal('fetch', fetchMock)

    const route = await getRoute(pointA, pointB)

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1][0]).toContain('router.project-osrm.org')
    expect(route.coords).toHaveLength(2)
  })

  it('caches routes by rounded coordinates', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse())
    vi.stubGlobal('fetch', fetchMock)

    await getRoute(pointA, pointB)
    await getRoute({ ...pointA, lat: pointA.lat + 0.00001 }, pointB)

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('rethrows caller aborts without reporting a routing failure', async () => {
    const controller = new AbortController()
    const abortError = new Error('Aborted')
    abortError.name = 'AbortError'
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError))

    await expect(
      getRoute(pointA, pointB, controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError' })
  })
})
