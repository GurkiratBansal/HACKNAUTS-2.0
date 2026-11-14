import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  clearGeocodeCache,
  reversePlace,
  searchPincode,
  searchPlaces,
} from './geocode'

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
      geometry: { coordinates: [87, 27] },
      properties: { name: 'Outside India', countrycode: 'NP' },
    },
  ],
}

function jsonResponse(data, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => data }
}

describe('geocode service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    clearGeocodeCache()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reverse geocodes a coordinate and returns a readable label', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(nominatimResult))
    vi.stubGlobal('fetch', fetchMock)

    const label = await reversePlace(30.90097, 75.85726)

    expect(label).toContain('Ludhiana')
    expect(fetchMock.mock.calls[0][0]).toContain('nominatim.openstreetmap.org/reverse')
    expect(fetchMock.mock.calls[0][0]).toContain('format=jsonv2')
  })

  it('uses Your location when reverse geocoding has no label', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({ lat: '30.9', lon: '75.85', address: {} }),
      ),
    )

    await expect(reversePlace(30.9, 75.85)).resolves.toBe('Your location')
  })

  it('resolves a pincode with the requested Nominatim query', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([nominatimResult]))
    vi.stubGlobal('fetch', fetchMock)

    const places = await searchPincode('141001')

    expect(places).toHaveLength(1)
    expect(places[0].city).toBe('Ludhiana')
    expect(fetchMock.mock.calls[0][0]).toContain('postalcode=141001')
    expect(fetchMock.mock.calls[0][0]).toContain('countrycodes=in')
    expect(fetchMock.mock.calls[0][0]).toContain('format=jsonv2')
  })

  it('searches places with the India bounding box', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(photonResult))
    vi.stubGlobal('fetch', fetchMock)

    const places = await searchPlaces('Ludhiana')

    expect(places).toHaveLength(1)
    expect(fetchMock.mock.calls[0][0]).toContain('photon.komoot.io')
    expect(fetchMock.mock.calls[0][0]).toContain('bbox=68,6,98,38')
  })

  it('caches results', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(photonResult))
    vi.stubGlobal('fetch', fetchMock)

    await searchPlaces('Ludhiana')
    await searchPlaces('Ludhiana')

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('reports a clear error for a non-OK response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 503)))

    await expect(searchPincode('141001')).rejects.toThrow(
      'The location service returned HTTP 503',
    )
  })
})
