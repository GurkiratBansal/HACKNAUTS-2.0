// FRESH:FILE  Sample-data generator: shifts NGOs, kitchens and donations around the active place so the demo works in any Indian city. Nothing claims a real address.
// FRESH:AREA  Data

import { haversineKm } from '../utils/distance'
import { mockNgos } from '../data/mockNgos'
import { makeMockDonations } from '../data/mockDonations'

/**
 * Sample data is generated as offsets from the active place so the demo works
 * in any Indian city. The base centre is derived from the existing sample
 * rows rather than hard-coded, and no sample pin claims a real address.
 */

// FRESH:Data  Mean of the sample NGO coordinates; the origin for all offsets.
export const BASE_CENTER = mockNgos.reduce(
  (acc, ngo) => ({ lat: acc.lat + ngo.lat / mockNgos.length, lng: acc.lng + ngo.lng / mockNgos.length }),
  { lat: 0, lng: 0 },
)

// FRESH:Data  Moves a sample point by the same offset as the active place.
export function shiftPoint(point, center) {
  if (!point || !center) return point
  return {
    ...point,
    lat: Number(center.lat) + (Number(point.lat) - BASE_CENTER.lat),
    lng: Number(center.lng) + (Number(point.lng) - BASE_CENTER.lng),
  }
}

// FRESH:Data  Rewrites "Delhi" in sample text to the active city.
export function localiseText(text, center) {
  const city = center?.city || 'your city'
  return String(text || '')
    .replace(/New Delhi/g, city)
    .replace(/Delhi/g, city)
}

// FRESH:Data  Appends the active city to sample addresses.
export function localiseAddress(text, center) {
  const base = localiseText(text, center)
  if (!center?.city) return base
  return base.includes(center.city) ? base : `${base}, ${center.city}`
}

// FRESH:Data  Sample NGOs shifted to the active place.
export function makeSampleNgos(center) {
  if (!center) return mockNgos
  return mockNgos.map((ngo) => {
    const point = shiftPoint({ lat: ngo.lat, lng: ngo.lng }, center)
    return {
      ...ngo,
      ...point,
      type: ngo.type || 'ngo',
      area: ngo.city,
      city: center.city || ngo.city,
      address: localiseText(ngo.description, center),
      description: localiseText(ngo.description, center),
    }
  })
}

function offsetPoint(center, km, bearingDegrees) {
  const bearing = (bearingDegrees * Math.PI) / 180
  const latDelta = (km / 111.32) * Math.cos(bearing)
  const cosLat = Math.max(0.01, Math.cos((center.lat * Math.PI) / 180))
  const lngDelta = (km / (111.32 * cosLat)) * Math.sin(bearing)
  return {
    lat: Number(center.lat) + latDelta,
    lng: Number(center.lng) + lngDelta,
  }
}

const KITCHEN_TEMPLATES = [
  { id: 'kitchen-1', name: 'Spice Route Kitchen', type: 'restaurant', focus: 'Fresh rotis, curries and cooked meals', area: 'Model Town', km: 1.2, bearing: 40, verified: true },
  { id: 'kitchen-2', name: 'The Daily Crumb', type: 'restaurant', focus: 'Bakery and day-end surplus', area: 'Civil Lines', km: 2.4, bearing: 120, verified: true },
  { id: 'kitchen-3', name: 'Rose Garden Banquets', type: 'wedding_hall', focus: 'Wedding and event surplus', area: 'Pakhowal Road', km: 4.1, bearing: 210, verified: true },
  { id: 'kitchen-4', name: 'Sunrise Community Kitchen', type: 'community_kitchen', focus: 'Community meals and surplus sharing', area: 'Basti Sheikh', km: 5.6, bearing: 300, verified: true },
  { id: 'kitchen-5', name: 'Green Basket Grocers', type: 'restaurant', focus: 'Packaged and raw food with dates', area: 'Dugri', km: 7.8, bearing: 80, verified: false },
  { id: 'kitchen-6', name: 'Lotus Temple Langar', type: 'community_kitchen', focus: 'Cooked meals from a community kitchen', area: 'Model Town', km: 10.2, bearing: 160, verified: true },
  { id: 'kitchen-7', name: 'City Event Crew', type: 'event', focus: 'Function and catering surplus', area: 'Focal Point', km: 13.5, bearing: 250, verified: false },
  { id: 'kitchen-8', name: 'Home Kitchen Collective', type: 'individual', focus: 'Home-cooked surplus from local members', area: 'Sarabha Nagar', km: 17.4, bearing: 340, verified: false },
]

// FRESH:Data  Sample donor kitchens generated at fixed distances/bearings.
/** Kitchens and donor partners generated around the active place. */
export function makeSampleKitchens(center) {
  if (!center) return []
  return KITCHEN_TEMPLATES.map((template) => {
    const point = offsetPoint(center, template.km, template.bearing)
    return {
      id: template.id,
      name: template.name.includes('(Sample)') ? template.name : `${template.name} (Sample)`,
      type: template.type,
      focus: template.focus,
      area: template.area,
      city: center.city || '',
      state: center.state || '',
      lat: point.lat,
      lng: point.lng,
      verified: template.verified,
      phone: '',
      distanceKm: haversineKm(center, point),
      isDemo: true,
      isSample: true,
    }
  })
}

const DONOR_TYPES = {
  'don-seed-1': 'restaurant',
  'don-seed-2': 'restaurant',
  'don-seed-3': 'individual',
  'don-seed-4': 'community_kitchen',
  'don-seed-5': 'restaurant',
  'don-seed-6': 'wedding_hall',
  'don-seed-7': 'event',
  'don-seed-8': 'community_kitchen',
}

// FRESH:Data  Seed donations shifted around the active place, with donor types.
/** Seed donations shifted around the active place, with donor types added. */
export function makeSampleDonations(center) {
  return makeMockDonations().map((donation) => {
    const point = shiftPoint(donation.location, center)
    return {
      ...donation,
      foodName: donation.foodName.includes('(Sample)') ? donation.foodName : `${donation.foodName} (Sample)`,
      location: point,
      address: localiseAddress(donation.address, center),
      donorType: DONOR_TYPES[donation.id] || 'individual',
      isDemo: true,
      isSample: true,
    }
  })
}

// FRESH:Data  Distance lists used to sanity-check sample spread.
export function sampleDistanceBands(center) {
  const ngos = makeSampleNgos(center)
  const donations = makeSampleDonations(center)
  const kitchens = makeSampleKitchens(center)
  return {
    ngos: ngos.map((item) => haversineKm(center, item)),
    donations: donations.map((item) => haversineKm(center, item.location)),
    kitchens: kitchens.map((item) => item.distanceKm),
  }
}
