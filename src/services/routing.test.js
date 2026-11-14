import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getRoute, RoutingError, clearRouteCache } from './routing'

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
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('builds a lng,lat URL without alternatives or steps and parses the route', async () => {
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

  it('rejects NaN, null and out-of-range points', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(getRoute({ lat: NaN, lng: 1 }, pointB)).rejects.toMatchObject({
      code: 'bad_input',
    })
    await expect(getRoute(null, pointB)).rejects.toMatchObject({
      code: 'bad_input',
    })
    await expect(getRoute({ lat: 100, lng: 77 }, pointB)).rejects.toMatchObject({
      code: 'bad_input',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('throws no_route on code NoRoute', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ code: 'NoRoute', routes: [] }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(getRoute(pointA, pointB)).rejects.toMatchObject({
      code: 'no_route',
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('falls back to the second base on a 500', async () => {
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

  it('falls back to the second base on a timeout', async () => {
    vi.useFakeTimers()
    let call = 0
    const fetchMock = vi.fn((url, options) => {
      call += 1
      if (call === 1) {
        return new Promise((resolve, reject) => {
          options.signal.addEventListener('abort', () => {
            const error = new Error('Aborted')
            error.name = 'AbortError'
            reject(error)
          })
        })
      }
      return Promise.resolve(okResponse())
    })
    vi.stubGlobal('fetch', fetchMock)

    const pending = getRoute(pointA, pointB)
    await vi.advanceTimersByTimeAsync(8000)
    const route = await pending

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1][0]).toContain('router.project-osrm.org')
    expect(route.coords).toHaveLength(2)
  })

  it('caches by coordinates rounded to four decimals', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse())
    vi.stubGlobal('fetch', fetchMock)

    await getRoute(pointA, pointB)
    await getRoute({ ...pointA, lat: pointA.lat + 0.00001 }, pointB)

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('never reports caller aborts as routing errors', async () => {
    const controller = new AbortController()
    controller.abort()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      getRoute(pointA, pointB, controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('uses RoutingError for invalid input', async () => {
    await expect(getRoute(null, pointB)).rejects.toBeInstanceOf(RoutingError)
  })
})
