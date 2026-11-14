import { describe, it, expect } from 'vitest'
import {
  makeSampleDonations,
  makeSampleKitchens,
  makeSampleNgos,
} from './sample'

const center = {
  lat: 30.90097,
  lng: 75.85726,
  city: 'Ludhiana',
  state: 'Punjab',
}

describe('sample data generators', () => {
  it('places kitchens within the nearby band', () => {
    const kitchens = makeSampleKitchens(center)
    expect(kitchens.length).toBeGreaterThan(0)
    for (const kitchen of kitchens) {
      expect(kitchen.distanceKm).toBeGreaterThanOrEqual(0.5)
      expect(kitchen.distanceKm).toBeLessThanOrEqual(20)
      expect([
        'ngo',
        'community_kitchen',
        'restaurant',
        'wedding_hall',
        'event',
        'individual',
      ]).toContain(kitchen.type)
    }
  })

  it('spreads NGOs across nearby and far bands', () => {
    const ngos = makeSampleNgos(center)
    const distances = ngos.map((ngo) => ({
      lat: ngo.lat,
      lng: ngo.lng,
    }))
    expect(ngos.every((ngo) => ngo.type === 'ngo')).toBe(true)
    expect(distances.length).toBeGreaterThan(8)
  })

  it('keeps donations within the sample bands and localises addresses', () => {
    const donations = makeSampleDonations(center)
    const distances = donations.map((donation) =>
      Math.hypot(donation.location.lat - center.lat, donation.location.lng - center.lng),
    )
    expect(donations.length).toBe(8)
    expect(Math.min(...distances)).toBeGreaterThan(0)
    expect(Math.max(...distances)).toBeGreaterThan(0.2)
    expect(donations.some((donation) => donation.address.includes('Ludhiana'))).toBe(true)
    expect(donations.some((donation) => donation.donorType)).toBe(true)
    expect(donations.some((donation) => donation.address.includes('Delhi'))).toBe(false)
  })

  it('adds the expected donor types without renaming fields', () => {
    const donations = makeSampleDonations(center)
    const types = new Set(donations.map((donation) => donation.donorType))
    expect(types.has('restaurant')).toBe(true)
    expect(types.has('community_kitchen')).toBe(true)
    expect(types.has('wedding_hall')).toBe(true)
    expect(types.has('individual')).toBe(true)
    expect(donations.every((donation) => donation.foodName && donation.location)).toBe(true)
  })
})
