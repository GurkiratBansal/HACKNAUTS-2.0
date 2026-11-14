import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { LocationProvider, useLocation } from './LocationContext'
import { LOCATION_STORAGE_KEY } from '../config'

const savedPlace = {
  lat: 30.90097,
  lng: 75.85726,
  label: 'Ludhiana, Punjab, India',
  city: 'Ludhiana',
  state: 'Punjab',
  pincode: '141001',
  countryCode: 'IN',
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

function mockGeolocation(success) {
  Object.defineProperty(window.navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition: vi.fn((onSuccess) => onSuccess(success)),
    },
  })
}

const reverseIndia = {
  lat: '30.90097',
  lon: '75.85726',
  display_name: 'Ludhiana, Punjab, India',
  address: { country_code: 'in', city: 'Ludhiana', state: 'Punjab' },
}

describe('LocationContext', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState({}, '', '/')
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('restores a valid saved manual place first', async () => {
    setSavedPlace(savedPlace)
    mockPermissions('granted')
    mockGeolocation({
      coords: { latitude: 28.6139, longitude: 77.209, accuracy: 10 },
    })

    const { result } = renderHook(() => useLocation(), {
      wrapper: LocationProvider,
    })

    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.place.label).toContain('Ludhiana')
    expect(result.current.place.source).toBe('manual')
    expect(navigator.geolocation.getCurrentPosition).not.toHaveBeenCalled()
  })

  it('ignores invalid saved JSON and starts idle', async () => {
    localStorage.setItem(LOCATION_STORAGE_KEY, '{not json')
    mockPermissions('prompt')

    const { result } = renderHook(() => useLocation(), {
      wrapper: LocationProvider,
    })

    await waitFor(() => expect(result.current.status).toBe('idle'))
    expect(result.current.place).toBeNull()
    expect(localStorage.getItem(LOCATION_STORAGE_KEY)).toBeNull()
  })

  it('ignores a saved place outside India', async () => {
    setSavedPlace({ ...savedPlace, lat: 40.71, lng: -74, label: 'New York' })
    mockPermissions('prompt')

    const { result } = renderHook(() => useLocation(), {
      wrapper: LocationProvider,
    })

    await waitFor(() => expect(result.current.status).toBe('idle'))
    expect(result.current.place).toBeNull()
  })

  it('auto-detects GPS only when permission is already granted', async () => {
    mockPermissions('granted')
    mockGeolocation({
      coords: { latitude: 30.901, longitude: 75.857, accuracy: 12 },
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => reverseIndia,
      }),
    )

    const { result } = renderHook(() => useLocation(), {
      wrapper: LocationProvider,
    })

    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.place.lat).toBeCloseTo(30.901, 3)
    expect(result.current.place.source).toBe('gps')
    expect(localStorage.getItem(LOCATION_STORAGE_KEY)).toBeNull()
  })

  it('does not auto-detect when permission is only prompted', async () => {
    mockPermissions('prompt')
    mockGeolocation({
      coords: { latitude: 30.901, longitude: 75.857, accuracy: 12 },
    })

    const { result } = renderHook(() => useLocation(), {
      wrapper: LocationProvider,
    })

    await waitFor(() => expect(result.current.status).toBe('idle'))
    expect(navigator.geolocation.getCurrentPosition).not.toHaveBeenCalled()
  })

  it('fails closed when GPS cannot be confirmed as India', async () => {
    mockPermissions('prompt')
    mockGeolocation({
      coords: { latitude: 30.901, longitude: 75.857, accuracy: 12 },
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ ...reverseIndia, address: { country_code: 'np' } }),
      }),
    )

    const { result } = renderHook(() => useLocation(), {
      wrapper: LocationProvider,
    })

    act(() => {
      result.current.detect()
    })

    await waitFor(() => expect(result.current.status).toBe('outside'))
    expect(localStorage.getItem(LOCATION_STORAGE_KEY)).toBeNull()
  })
})
