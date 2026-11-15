// FRESH:FILE  Unit tests for the India-only gate (outside, unconfirmed, confirmed).
// FRESH:AREA  Location

import { describe, it, expect, vi } from 'vitest'
import { verifyInIndia } from './locationGate'

const indiaPoint = { lat: 30.9, lng: 75.85, label: 'Ludhiana' }

describe('location gate', () => {
  it('accepts an explicit IN country code', async () => {
    const result = await verifyInIndia({ ...indiaPoint, countryCode: 'IN' })
    expect(result.ok).toBe(true)
    expect(result.place.countryCode).toBe('IN')
  })

  it('rejects other countries', async () => {
    for (const countryCode of ['NP', 'BD', 'PK', 'XX']) {
      const result = await verifyInIndia({ ...indiaPoint, countryCode })
      expect(result.ok).toBe(false)
      expect(result.code).toBe('outside')
    }
  })

  it('rejects coordinates outside the India box even with an IN code', async () => {
    const result = await verifyInIndia({
      lat: 40.71,
      lng: -74.0,
      countryCode: 'IN',
    })
    expect(result.ok).toBe(false)
    expect(result.code).toBe('outside')
  })

  it('uses reverse geocoding when no country code is available', async () => {
    const reverseGeocode = vi.fn().mockResolvedValue({
      ok: true,
      place: {
        countryCode: 'IN',
        label: 'Ludhiana, Punjab, India',
        city: 'Ludhiana',
        state: 'Punjab',
      },
    })
    const result = await verifyInIndia(indiaPoint, { reverseGeocode })
    expect(reverseGeocode).toHaveBeenCalledWith(indiaPoint.lat, indiaPoint.lng, undefined)
    expect(result.ok).toBe(true)
    expect(result.place.city).toBe('Ludhiana')
    expect(result.place.state).toBe('Punjab')
  })

  it('fails closed when reverse geocoding cannot confirm India', async () => {
    const reverseGeocode = vi.fn().mockResolvedValue({
      ok: false,
      message: 'The location service could not be reached.',
    })
    const result = await verifyInIndia(indiaPoint, { reverseGeocode })
    expect(result.ok).toBe(false)
    expect(result.code).toBe('unconfirmed')
  })

  it('fails closed when the geocoder throws', async () => {
    const reverseGeocode = vi.fn().mockRejectedValue(new Error('network down'))
    const result = await verifyInIndia(indiaPoint, { reverseGeocode })
    expect(result.ok).toBe(false)
    expect(result.code).toBe('unconfirmed')
  })

  it('fails closed when no country check is possible', async () => {
    const result = await verifyInIndia(indiaPoint)
    expect(result.ok).toBe(false)
    expect(result.code).toBe('unconfirmed')
  })

  it('rethrows caller aborts', async () => {
    const reverseGeocode = vi.fn().mockImplementation((_lat, _lng, _signal) => {
      const error = new Error('Aborted')
      error.name = 'AbortError'
      return Promise.reject(error)
    })
    await expect(
      verifyInIndia(indiaPoint, { reverseGeocode }),
    ).rejects.toMatchObject({ name: 'AbortError' })
  })
})
