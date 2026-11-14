import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNavigation } from './useNavigation'

vi.mock('../services/routing', () => ({
  getRoute: vi.fn(),
}))

import { getRoute } from '../services/routing'

const route = {
  coords: [
    [28.633, 77.219],
    [28.634, 77.22],
    [28.635, 77.221],
  ],
  distanceKm: 0.5,
  durationMin: 6,
}

const destination = { lat: 28.635, lng: 77.221 }

describe('useNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getRoute.mockResolvedValue({
      routes: [
        {
          id: 0,
          coords: route.coords,
          distanceKm: 0.4,
          durationMin: 5,
          turnCount: 2,
          steps: [],
          summary: '',
        },
      ],
    })
  })

  it('starts in idle', () => {
    const { result } = renderHook(() =>
      useNavigation({ route, destination, destinationName: 'Test NGO' }),
    )
    expect(result.current.state).toBe('idle')
  })

  it('moves to navigating on start', () => {
    const { result } = renderHook(() =>
      useNavigation({ route, destination, destinationName: 'Test NGO' }),
    )
    act(() => {
      result.current.actions.start()
    })
    expect(result.current.state).toBe('navigating')
  })

  it('goes off-route and reroutes after 3 bad updates', async () => {
    const { result } = renderHook(() =>
      useNavigation({ route, destination, destinationName: 'Test NGO' }),
    )
    act(() => result.current.actions.start())
    // far away point
    const far1 = { lat: 28.65, lng: 77.25, accuracy: 5, timestamp: Date.now() }
    const far2 = { lat: 28.6501, lng: 77.2501, accuracy: 5, timestamp: Date.now() + 1000 }
    const far3 = { lat: 28.6502, lng: 77.2502, accuracy: 5, timestamp: Date.now() + 2000 }
    act(() => result.current.actions.ingestPosition(far1))
    act(() => result.current.actions.ingestPosition(far2))
    act(() => result.current.actions.ingestPosition(far3))
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    // eslint-disable-next-line no-console
    console.log('STATE:', result.current.state, 'ERROR:', result.current.error, 'OFFROUTE?')
    expect(getRoute).toHaveBeenCalled()
  })

  it('arrives near the destination', () => {
    const { result } = renderHook(() =>
      useNavigation({ route, destination, destinationName: 'Test NGO' }),
    )
    act(() => result.current.actions.start())
    const near = { lat: destination.lat, lng: destination.lng, accuracy: 5, timestamp: Date.now() }
    act(() => result.current.actions.ingestPosition(near))
    expect(result.current.state).toBe('arrived')
  })

  it('simulation can be started', () => {
    const { result } = renderHook(() =>
      useNavigation({ route, destination, destinationName: 'Test NGO' }),
    )
    act(() => result.current.actions.start())
    act(() => result.current.actions.startSimulation())
    expect(result.current.simulation.active).toBe(true)
  })
})
