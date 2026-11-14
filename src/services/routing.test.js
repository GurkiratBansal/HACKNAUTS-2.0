import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRoute, RoutingError, clearRouteCache } from './routing'

const pointA = { lat: 28.6448, lng: 77.2167 }
const pointB = { lat: 28.633, lng: 77.219 }

function osrmOk() {
  return {
    code: 'Ok',
    routes: [
      {
        distance: 1755.1,
        duration: 175,
        geometry: { coordinates: [[77.2167, 28.6448], [77.219, 28.633]] },
        legs: [{ summary: 'Main Road', steps: [{ maneuver: { type: 'turn', modifier: 'left' }, name: 'MG Road', distance: 100 }] }],
      },
    ],
  }
}

describe('routing service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    clearRouteCache()
  })

  it('builds a lng,lat URL and parses routes', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => osrmOk(),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await getRoute(pointA, pointB)
    expect(fetchMock).toHaveBeenCalled()
    const url = fetchMock.mock.calls[0][0]
    expect(url).toContain('/77.2167,28.6448;77.219,28.633?')
    expect(url).toContain('alternatives=true')
    expect(result.routes).toHaveLength(1)
    expect(result.routes[0].coords[0]).toEqual([28.6448, 77.2167])
    expect(result.routes[0].distanceKm).toBeCloseTo(1.755, 3)
  })

  it('rejects NaN/null points', async () => {
    await expect(getRoute({ lat: NaN, lng: 1 }, pointB)).rejects.toBeInstanceOf(RoutingError)
    await expect(getRoute(null, pointB)).rejects.toMatchObject({ code: 'bad_input' })
  })

  it('throws no_route on code NoRoute', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ code: 'NoRoute', routes: [] }),
    }))
    await expect(getRoute(pointA, pointB)).rejects.toMatchObject({ code: 'no_route' })
  })

  it('falls back to second base on 500', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => osrmOk() })
    vi.stubGlobal('fetch', fetchMock)

    const result = await getRoute(pointA, pointB)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result.routes).toHaveLength(1)
  })

  it('caches results', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => osrmOk(),
    })
    vi.stubGlobal('fetch', fetchMock)

    await getRoute(pointA, pointB)
    await getRoute({ ...pointA, lat: pointA.lat + 0.00001 }, pointB)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('does not report aborts as errors', async () => {
    const abortError = new Error('Aborted')
    abortError.name = 'AbortError'
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError))
    await expect(getRoute(pointA, pointB, new AbortController().signal)).rejects.toMatchObject({
      name: 'AbortError',
    })
  })
})
