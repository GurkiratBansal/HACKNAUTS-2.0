// FRESH:FILE  SAMPLE DATA: relief-need categories, pledge math and generated needs for the emergency needs board.
// FRESH:AREA  Data

// FRESH:Needs  Relief categories with labels.
export const RELIEF_ITEMS = [
  ['cooked_meals', 'Cooked meals'],
  ['dry_ration', 'Dry ration'],
  ['packaged_food', 'Packaged food'],
  ['drinking_water', 'Drinking water'],
  ['baby_food', 'Baby food'],
]

// FRESH:Needs  Validates a pledge and returns the updated need (fulfilled at full pledge).
export function pledgeNeedAmount(need, amount) {
  const remaining = Math.max(0, Number(need.quantity) - Number(need.pledged || 0))
  const pledge = Number(amount)
  if (!Number.isInteger(pledge) || pledge < 1 || pledge > remaining) {
    return { ok: false, message: `Enter a whole number from 1 to ${remaining}.` }
  }
  const pledged = Number(need.pledged || 0) + pledge
  return {
    ok: true,
    need: { ...need, pledged, status: pledged >= Number(need.quantity) ? 'fulfilled' : 'partly_pledged' },
  }
}

// FRESH:Needs  Builds four sample relief needs around the active place.
export function makeSampleNeeds(place) {
  if (!place) return []
  const points = [
    [0.008, 0.006],
    [-0.006, 0.009],
    [0.012, -0.008],
    [-0.011, -0.006],
  ]
  const now = Date.now()
  return points.map(([latOffset, lngOffset], index) => ({
    id: `relief-sample-${index + 1}`,
    requesterId: `relief-requester-${index + 1}`,
    requesterName: ['Ludhiana Relief Kitchen', 'Ward Support Pantry', 'Family Shelter Kitchen', 'Community Water Point'][index],
    requesterType: index === 1 ? 'kitchen' : 'ngo',
    item: RELIEF_ITEMS[index % RELIEF_ITEMS.length][0],
    quantity: [500, 300, 240, 800][index],
    unit: index === 3 ? 'bottles' : 'meals',
    neededBy: new Date(now + (index + 2) * 60 * 60 * 1000).toISOString(),
    area: ['Central Ludhiana', 'Model Town', 'BRS Nagar', 'Sarabha Nagar'][index],
    lat: Number(place.lat) + latOffset,
    lng: Number(place.lng) + lngOffset,
    status: 'open',
    pledged: 0,
    isSample: true,
  }))
}
