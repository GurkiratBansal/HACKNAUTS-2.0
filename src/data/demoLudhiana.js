import { haversineKm } from '../utils/distance.js'

/**
 * Fictional sample data for the Ludhiana demo.
 * Labels are plain; phone numbers are obviously fake.
 * Starting points are APPROXIMATE: Clock Tower, Civil Lines, Model Town,
 * Sarabha Nagar, BRS Nagar, Dugri, Haibowal, Ferozepur Road, Focal Point,
 * Railway station area.
 */
export const demoLudhiana = [
  {
    id: 'demo-ngo-1',
    name: 'Feeding India',
    focus: 'Large-scale meal recovery',
    type: 'ngo',
    lat: 30.9117,
    lng: 75.8574,
    phone: '+91 00000 00001',
    verified: true,
  },
  {
    id: 'demo-ngo-2',
    name: 'Robin Hood Army',
    focus: 'Volunteer-led surplus food collection',
    type: 'ngo',
    lat: 30.9048,
    lng: 75.8445,
    phone: '+91 00000 00002',
    verified: true,
  },
  {
    id: 'demo-ngo-3',
    name: 'India Food Banking Network',
    focus: 'Food banking & hunger relief',
    type: 'ngo',
    lat: 30.8980,
    lng: 75.8521,
    phone: '+91 00000 00003',
    verified: true,
  },
  {
    id: 'demo-ngo-4',
    name: 'Sarabha Nagar Kitchen',
    focus: 'Community kitchen',
    type: 'ngo',
    lat: 30.8928,
    lng: 75.8258,
    phone: '+91 00000 00004',
    verified: false,
  },
  {
    id: 'demo-donation-1',
    name: 'Veg Biryani donation',
    focus: 'cooked',
    type: 'donation',
    lat: 30.8828,
    lng: 75.8190,
    phone: '+91 00000 00005',
    urgency: 'urgent',
    deadline: new Date(Date.now() + 2 * 60 * 60 * 1000),
  },
  {
    id: 'demo-donation-2',
    name: 'Fresh fruit surplus',
    focus: 'raw',
    type: 'donation',
    lat: 30.9230,
    lng: 75.8181,
    phone: '+91 00000 00006',
    urgency: 'soon',
    deadline: new Date(Date.now() + 8 * 60 * 60 * 1000),
  },
  {
    id: 'demo-ngo-5',
    name: 'Model Town NGO',
    focus: 'Local food distribution',
    type: 'ngo',
    lat: 30.8980,
    lng: 75.8521,
    phone: '+91 00000 00007',
    verified: true,
  },
  {
    id: 'demo-ngo-6',
    name: 'BRS Nagar Food Collectors',
    focus: 'Community fridge',
    type: 'ngo',
    lat: 30.8829,
    lng: 75.8320,
    phone: '+91 00000 00008',
    verified: false,
  },
  {
    id: 'demo-donation-3',
    name: 'Bread surplus',
    focus: 'bakery',
    type: 'donation',
    lat: 30.8829,
    lng: 75.8320,
    phone: '+91 00000 00009',
    urgency: 'fresh',
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
  {
    id: 'demo-ngo-7',
    name: 'Focal Point Charity',
    focus: 'Hunger relief',
    type: 'ngo',
    lat: 30.9002,
    lng: 75.9001,
    phone: '+91 00000 00010',
    verified: true,
  },
]

/**
 * Helper: check if the active place is within ~25 km of Ludhiana's center (30.9010, 75.8573).
 */
export function isDemoPlaceActive(place) {
  if (
    !place ||
    !Number.isFinite(Number(place.lat)) ||
    !Number.isFinite(Number(place.lng))
  ) {
    return false
  }
  const center = { lat: 30.9010, lng: 75.8573 }
  return haversineKm(place, center) < 25
}

export default demoLudhiana
