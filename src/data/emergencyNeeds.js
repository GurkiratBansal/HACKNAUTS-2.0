export const RELIEF_ITEMS = [
  ['cooked_meals', 'Cooked meals'],
  ['dry_ration', 'Dry ration'],
  ['packaged_food', 'Packaged food'],
  ['drinking_water', 'Drinking water'],
  ['baby_food', 'Baby food'],
]

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
