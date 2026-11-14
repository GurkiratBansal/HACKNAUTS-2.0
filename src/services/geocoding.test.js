import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { reverseGeocode, searchAddress, searchPincode } from './geocoding'

const nominatimResult = {
  lat: '30.90097',
  lon: '75.85726',
  display_name: 'Ludhiana, Punjab, India',
  address: {
    city: 'Ludhiana',
    state: 'Punjab',
    postcode: '141001',
    country_code: 'in',
  },
}

const photonResult = {
  features: [
    {
      geometry: { coordinates: [75.85726, 30.90097] },
      properties: {
        name: 'Ludhiana',
        city: 'Ludhiana',
        state: 'Punjab',
        countrycode: 'IN',
        postcode: '141001',
      },
    },
    {
      geometry: { coordinates: [87.0, 27.0] },
      properties: { name: 'Outside', countrycode: 'NP' },
    },
  ],
}

function jsonResponse(data, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => data }
}

describe('geocoding service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('resolves a pincode through Nominatim first', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([nominatimResult]))
    vi.stubGlobal('fetch', fetchMock)

    const result = await searchPincode('141001')
    expect(result.ok).toBe(true)
    expect(result.place.city).toBe('Ludhiana')
    expect(result.place.countryCode).toBe('IN')
    expect(fetchMock.mock.calls[0][0]).toContain('nominatim.openstreetmap.org')
    expect(fetchMock.mock.calls[0][0]).toContain('postalcode=141001')
    expect(fetchMock.mock.calls[0][0]).toContain('countrycodes=in')
  })

  it('falls back to Photon text search when Nominatim has no result', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse(photonResult))
    vi.stubGlobal('fetch', fetchMock)

    const result = await searchPincode('141001')
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1][0]).toContain('photon.komoot.io')
    expect(fetchMock.mock.calls[1][0]).toContain('bbox=68,6,98,38')
    expect(result.ok).toBe(true)
    expect(result.place.countryCode).toBe('IN')
  })

  it('reports not_found when neither service can resolve the pincode', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse({ features: [] }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await searchPincode('141001')
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('not_found')
  })

  it('returns a retryable error on network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('offline')),
    )
    const result = await searchPincode('141001')
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('error')
  })

  it('filters address suggestions to India', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(photonResult)))
    const result = await searchAddress('Ludhiana')
    expect(result.ok).toBe(true)
    expect(result.suggestions).toHaveLength(1)
    expect(result.suggestions[0].countryCode).toBe('IN')
  })

  it('returns no suggestions for a very short query', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const result = await searchAddress('Lu')
    expect(result.ok).toBe(true)
    expect(result.suggestions).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('reverse geocodes coordinates and exposes the country', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(nominatimResult)))
    const result = await reverseGeocode(30.90097, 75.85726)
    expect(result.ok).toBe(true)
    expect(result.place.countryCode).toBe('IN')
    expect(result.place.label).toContain('Ludhiana')
  })

  it('rethrows caller aborts', async () => {
    const controller = new AbortController()
    controller.abort()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(Object.assign(new Error('Aborted'), { name: 'AbortError' })),
    )
    await expect(reverseGeocode(30.9, 75.85, controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    })
  })
})
