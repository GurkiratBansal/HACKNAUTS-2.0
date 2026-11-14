import { haversineKm } from '../utils/distance.js'

export const DEMO_CENTER = { lat: 30.9010, lng: 75.8573 }
export const DEMO_LABEL = 'Sample data'

const HOUR = 60 * 60 * 1000
const MINUTE = 60 * 1000
const at = (offset) => new Date(Date.now() + offset).toISOString()

// Fictional prospects based on the supplied Ludhiana directory areas.
// Coordinates were snapped with scripts/verify-demo-points.mjs.
export const demoNgos = [
  {
    id: 'demo-ngo-kalgidhar',
    name: 'Kalgidhar Langar (Sample)',
    focus: 'Langar and community meals',
    city: 'Field Gunj',
    lat: 30.9117,
    lng: 75.8574,
    phone: '+91 00000 00001',
    verified: true,
    type: 'community_kitchen',
    size: 'Large',
    area: 'Field Gunj',
    description: DEMO_LABEL,
    isDemo: true,
  },
  {
    id: 'demo-ngo-model-town',
    name: 'Model Town Meal Hall (Sample)',
    focus: 'Community kitchen and meal service',
    city: 'Model Town Extension',
    lat: 30.8980,
    lng: 75.8521,
    phone: '+91 00000 00002',
    verified: true,
    type: 'community_kitchen',
    size: 'Mid',
    area: 'Model Town Extension',
    description: DEMO_LABEL,
    isDemo: true,
  },
  {
    id: 'demo-ngo-sunet',
    name: 'Sunet Community Kitchen (Sample)',
    focus: 'Neighbourhood meal distribution',
    city: 'Sunet / BRS Nagar',
    lat: 30.8829,
    lng: 75.8320,
    phone: '+91 00000 00003',
    verified: false,
    type: 'community_kitchen',
    size: 'Grassroots',
    area: 'BRS Nagar',
    description: DEMO_LABEL,
    isDemo: true,
  },
  {
    id: 'demo-ngo-sarabha',
    name: 'Sarabha Food Bridge (Sample)',
    focus: 'Food relief and meal coordination',
    city: 'Sarabha Nagar',
    lat: 30.8928,
    lng: 75.8258,
    phone: '+91 00000 00004',
    verified: true,
    type: 'ngo',
    size: 'Grassroots',
    area: 'Sarabha Nagar',
    description: DEMO_LABEL,
    isDemo: true,
  },
  {
    id: 'demo-ngo-khanna',
    name: 'Khanna Meal Link (Sample)',
    focus: 'Food recovery partner',
    city: 'Khanna',
    lat: 30.7045,
    lng: 76.2196,
    phone: '+91 00000 00005',
    verified: true,
    type: 'ngo',
    size: 'Mid',
    area: 'Khanna',
    description: DEMO_LABEL,
    isDemo: true,
  },
  {
    id: 'demo-ngo-jalandhar',
    name: 'Jalandhar Community Pantry (Sample)',
    focus: 'Community food relief',
    city: 'Jalandhar',
    lat: 31.1998,
    lng: 75.7204,
    phone: '+91 00000 00006',
    verified: true,
    type: 'ngo',
    size: 'Mid',
    area: 'Jalandhar',
    description: DEMO_LABEL,
    isDemo: true,
  },
]

const demoDonor = (id, name, donorType, location, foodName, category, deadline) => ({
  id,
  donorId: `demo-donor-${id}`,
  donorName: `${name} (Sample)`,
  donorType,
  foodName,
  category,
  diet: 'veg',
  quantity: category === 'cooked' ? 60 : 30,
  cookedAt: at(-1 * HOUR),
  storage: category === 'cooked' ? 'hot-holding' : 'room',
  deadline,
  address: `${name} area, Ludhiana (approximate)`,
  location,
  photo: '',
  contactPhone: '+91 00000 00000',
  notes: `${DEMO_LABEL}. Confirm the handover details before pickup.`,
  status: 'available',
  createdAt: at(-30 * MINUTE),
  timeline: [{ status: 'available', at: at(-30 * MINUTE) }],
  alertedNgoIds: demoNgos.filter((ngo) => ngo.verified).slice(0, 3).map((ngo) => ngo.id),
  alertStage: 1,
  reports: [],
  veg: true,
  isSeed: true,
  isDemo: true,
  locationApproximate: donorType === 'individual',
})

export const demoDonations = [
  demoDonor(
    'demo-donation-3h',
    'Clock Tower Kitchen',
    'restaurant',
    { lat: 30.9117, lng: 75.8574 },
    'Rice and dal trays (Sample)',
    'cooked',
    at(3 * HOUR),
  ),
  demoDonor(
    'demo-donation-45m',
    'Model Town Meal Hall',
    'community_kitchen',
    { lat: 30.8980, lng: 75.8521 },
    'Packed rotis and sabzi (Sample)',
    'cooked',
    at(45 * MINUTE),
  ),
  demoDonor(
    'demo-donation-15m',
    'BRS Nagar Event Kitchen',
    'individual',
    { lat: 30.8829, lng: 75.8320 },
    'Fresh fruit boxes (Sample)',
    'raw',
    at(15 * MINUTE),
  ),
]

export function isDemoPlaceActive(place) {
  if (
    !place ||
    !Number.isFinite(Number(place.lat)) ||
    !Number.isFinite(Number(place.lng))
  ) {
    return false
  }
  return haversineKm(place, DEMO_CENTER) <= 25
}

export default demoNgos
