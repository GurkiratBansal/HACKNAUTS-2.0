// FRESH:FILE  Unit tests for stored-place validation and the India-only guard.
// FRESH:AREA  Location

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { LocationProvider, useUserLocation } from './LocationContext'
import { LOCATION_STORAGE_KEY } from '../config'

vi.mock('../services/geocode', () => ({
  reversePlace: vi.fn().mockResolvedValue('Ludhiana, Punjab'),
  reversePlaceDetails: vi.fn().mockResolvedValue({
    label: 'Ludhiana, Punjab',
    state: 'Punjab',
  }),
}))

const savedPlace = {
  lat: 30.90097,
  lng: 75.85726,
  label: 'Ludhiana, Punjab, India',
  source: 'manual',
}

function setSavedPlace(value) {
  if (value === null) localStorage.removeItem(LOCATION_STORAGE_KEY)
  else localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(value))
}

function mockPermissions(state) {
  Object.defineProperty(window.navigator, 'permissions', {
    configurable: true,
    value: { query: vi.fn().mockResolvedValue({ state }) },
  })
}

function mockGeolocation(coords) {
  const getCurrentPosition = vi.fn((onSuccess) => {
    onSuccess({ coords })
  })
  Object.defineProperty(window.navigator, 'geolocation', {
    configurable: true,
    value: { getCurrentPosition },
  })
  return getCurrentPosition
}

describe('LocationContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses a valid saved manual place before checking GPS', async () => {
    setSavedPlace(savedPlace)
    mockPermissions('granted')
    const getCurrentPosition = mockGeolocation({
      latitude: 28.6139,
      longitude: 77.209,
      accuracy: 10,
    })

    const { result } = renderHook(() => useUserLocation(), {
      wrapper: LocationProvider,
    })

    await waitFor(() => expect(result.current.place?.source).toBe('manual'))
    expect(result.current.place.label).toContain('Ludhiana')
    expect(result.current.status).toBe('idle')
    expect(getCurrentPosition).not.toHaveBeenCalled()
  })

  it('starts with no place and does not request GPS when permission is prompted', async () => {
    mockPermissions('prompt')
    const getCurrentPosition = mockGeolocation({
      latitude: 30.901,
      longitude: 75.857,
      accuracy: 12,
    })

    const { result } = renderHook(() => useUserLocation(), {
      wrapper: LocationProvider,
    })

    await waitFor(() => expect(result.current.status).toBe('idle'))
    expect(result.current.place).toBeNull()
    expect(getCurrentPosition).not.toHaveBeenCalled()
  })

  it('auto-detects GPS only when permission is already granted', async () => {
    mockPermissions('granted')
    mockGeolocation({
      latitude: 30.901,
      longitude: 75.857,
      accuracy: 12,
    })

    const { result } = renderHook(() => useUserLocation(), {
      wrapper: LocationProvider,
    })

    await waitFor(() => expect(result.current.place?.source).toBe('gps'))
    expect(result.current.place.lat).toBeCloseTo(30.901, 3)
    expect(result.current.status).toBe('idle')
    expect(localStorage.getItem(LOCATION_STORAGE_KEY)).toBeNull()
  })

  it('replaces a stale saved manual place with a fresh GPS position', async () => {
    setSavedPlace(savedPlace)
    mockPermissions('granted')
    mockGeolocation({
      latitude: 30.923,
      longitude: 75.818,
      accuracy: 8,
    })

    const { result } = renderHook(() => useUserLocation(), {
      wrapper: LocationProvider,
    })

    await waitFor(() => expect(result.current.place?.source).toBe('manual'))
    act(() => result.current.detect())

    await waitFor(() => expect(result.current.place?.source).toBe('gps'))
    expect(result.current.place.lat).toBeCloseTo(30.923, 3)
    expect(localStorage.getItem(LOCATION_STORAGE_KEY)).toBeNull()
  })

  it('ignores invalid saved JSON and starts with no place', async () => {
    localStorage.setItem(LOCATION_STORAGE_KEY, '{not json')
    mockPermissions('prompt')

    const { result } = renderHook(() => useUserLocation(), {
      wrapper: LocationProvider,
    })

    await waitFor(() => expect(result.current.status).toBe('idle'))
    expect(result.current.place).toBeNull()
    expect(localStorage.getItem(LOCATION_STORAGE_KEY)).toBeNull()
  })

  it('discards a saved coordinate outside India', async () => {
    setSavedPlace({ ...savedPlace, lat: 40.71, lng: -74 })
    mockPermissions('prompt')

    const { result } = renderHook(() => useUserLocation(), {
      wrapper: LocationProvider,
    })

    await waitFor(() => expect(result.current.status).toBe('idle'))
    expect(result.current.place).toBeNull()
    expect(localStorage.getItem(LOCATION_STORAGE_KEY)).toBeNull()
  })
})
