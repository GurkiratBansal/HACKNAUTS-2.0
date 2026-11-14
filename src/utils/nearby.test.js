import { describe, it, expect } from 'vitest'
import { nearby, recommend, recommendReason } from './nearby'

const center = { lat: 30.90097, lng: 75.85726 }

function item(id, lat, lng, extra = {}) {
  return { id, lat, lng, ...extra }
}

describe('nearby', () => {
  const items = [
    item('close', 30.901, 75.857),
    item('medium', 30.95, 75.87),
    item('far', 31.05, 75.9),
    item('very-far', 31.5, 76.0),
  ]

  it('hides everything beyond the radius', () => {
    const result = nearby(items, center, 10)
    expect(result.map((entry) => entry.id)).toEqual(['close', 'medium'])
    expect(result.every((entry) => entry.distanceKm <= 10)).toBe(true)
  })

  it('returns an empty list when nothing is inside the radius', () => {
    expect(nearby(items, center, 0.01)).toEqual([])
  })

  it('sorts by distance and copies distanceKm', () => {
    const result = nearby([items[1], items[0]], center, 10)
    expect(result[0].id).toBe('close')
    expect(result[0].distanceKm).toBeGreaterThan(0)
    expect(result[0]).not.toBe(items[0])
  })

  it('supports nested location objects', () => {
    const nested = [{ id: 'nested', location: { lat: 30.901, lng: 75.857 } }]
    const result = nearby(nested, center, 5)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('nested')
  })

  it('handles invalid centers safely', () => {
    expect(nearby(items, null, 10)).toEqual([])
    expect(nearby(items, { lat: NaN, lng: 75 }, 10)).toEqual([])
  })
})

describe('recommend', () => {
  const now = Date.now()
  const food = [
    { id: 'fresh-near', distanceKm: 1, deadline: new Date(now + 5 * 3600000).toISOString() },
    { id: 'urgent-far', distanceKm: 8, deadline: new Date(now + 10 * 60000).toISOString() },
    { id: 'soon-mid', distanceKm: 3, deadline: new Date(now + 60 * 60000).toISOString() },
    { id: 'fresh-far', distanceKm: 9, deadline: new Date(now + 4 * 3600000).toISOString() },
  ]

  it('sorts food by urgency first, then distance', () => {
    const result = recommend(food, 'food')
    expect(result.map((entry) => entry.id)).toEqual([
      'urgent-far',
      'soon-mid',
      'fresh-near',
    ])
  })

  it('sorts NGOs and kitchens by verified first, then distance', () => {
    const partners = [
      { id: 'unverified-near', distanceKm: 1, verified: false },
      { id: 'verified-far', distanceKm: 6, verified: true },
      { id: 'verified-near', distanceKm: 2, verified: true },
    ]
    const result = recommend(partners, 'ngo')
    expect(result.map((entry) => entry.id)).toEqual([
      'verified-near',
      'verified-far',
      'unverified-near',
    ])
  })

  it('builds a one-line reason without the word best', () => {
    const foodReason = recommendReason(food[1], 'food')
    expect(foodReason).toContain('km')
    expect(foodReason).toContain('urgent')
    const partnerReason = recommendReason({ distanceKm: 1.2, verified: true }, 'ngo')
    expect(partnerReason).toBe('1.2 km, verified')
    expect(`${foodReason} ${partnerReason}`).not.toContain('best')
  })
})
