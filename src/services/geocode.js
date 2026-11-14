import { inIndiaBox } from '../utils/india'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org'
const PHOTON_URL = 'https://photon.komoot.io/api/'
const INDIA_BBOX = '68,6,98,38'
const CACHE_LIMIT = 100
const cache = new Map()

function readCache(key) {
  return cache.get(key)
}

function writeCache(key, value) {
  if (cache.has(key)) cache.delete(key)
  cache.set(key, value)
  while (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value)
  return value
}

function serviceError(status) {
  return new Error(
    `The location service returned HTTP ${status}. Please check your connection and try again.`,
  )
}

async function fetchJson(url, signal) {
  let response
  try {
    response = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new Error('The location service could not be reached. Please try again.', {
      cause: error,
    })
  }

  if (!response.ok) throw serviceError(response.status)

  try {
    return await response.json()
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new Error(
      'The location service returned an unreadable response. Please try again.',
      { cause: error },
    )
  }
}

function normalizeNominatim(result) {
  const lat = Number(result?.lat)
  const lng = Number(result?.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  const address = result?.address || {}
  const label =
    result?.display_name ||
    [address.city, address.town, address.village, address.state, address.country]
      .filter(Boolean)
      .join(', ')

  return {
    lat,
    lng,
    label: label || 'Your location',
    city: address.city || address.town || address.village || address.suburb || '',
    state: address.state || '',
    pincode: address.postcode || '',
    countryCode: String(address.country_code || '').toUpperCase(),
  }
}

function normalizePhoton(feature) {
  const coordinates = feature?.geometry?.coordinates || []
  const properties = feature?.properties || {}
  const lat = Number(coordinates[1])
  const lng = Number(coordinates[0])
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  const countryCode = String(properties.countrycode || '').toUpperCase()
  if (countryCode && countryCode !== 'IN') return null
  if (!inIndiaBox({ lat, lng })) return null

  const label = [properties.name, properties.city, properties.state, properties.country]
    .filter(Boolean)
    .join(', ')

  return {
    lat,
    lng,
    label: label || 'Suggested place',
    city: properties.city || properties.name || '',
    state: properties.state || '',
    pincode: properties.postcode || '',
    countryCode: countryCode || 'IN',
  }
}

/** Resolve a readable label for a GPS coordinate. */
export async function reversePlace(lat, lng, signal) {
  const place = await reversePlaceDetails(lat, lng, signal)
  return place.label
}

/** Resolve a readable place, including the Indian state for emergency scope. */
export async function reversePlaceDetails(lat, lng, signal) {
  const numberLat = Number(lat)
  const numberLng = Number(lng)
  if (!Number.isFinite(numberLat) || !Number.isFinite(numberLng)) {
    throw new Error('Start or destination location is missing')
  }

  const key = `reverse:${numberLat.toFixed(5)},${numberLng.toFixed(5)}`
  const cached = readCache(key)
  if (cached) return cached

  const url = `${NOMINATIM_URL}/reverse?lat=${encodeURIComponent(
    numberLat,
  )}&lon=${encodeURIComponent(numberLng)}&format=jsonv2&addressdetails=1`
  const data = await fetchJson(url, signal)
  const place = normalizeNominatim(data)
  return writeCache(key, place || {
    lat: numberLat,
    lng: numberLng,
    label: 'Your location',
    state: '',
  })
}

/** Resolve an Indian pincode to matching places. */
export async function searchPincode(pin, signal) {
  const pincode = String(pin || '').trim()
  if (!/^[1-9][0-9]{5}$/.test(pincode)) {
    throw new Error('Enter a valid 6-digit pincode')
  }

  const key = `pincode:${pincode}`
  const cached = readCache(key)
  if (cached) return cached

  const url = `${NOMINATIM_URL}/search?postalcode=${encodeURIComponent(
    pincode,
  )}&countrycodes=in&format=jsonv2&addressdetails=1&limit=5`
  const data = await fetchJson(url, signal)
  const rows = Array.isArray(data) ? data : []
  const places = rows
    .map(normalizeNominatim)
    .filter(Boolean)
    .filter((place) => inIndiaBox(place))
  return writeCache(key, places)
}

/** Search for an area, street or city inside India. */
export async function searchPlaces(query, signal) {
  const text = String(query || '').trim()
  if (text.length < 3) return []

  const key = `places:${text.toLowerCase()}`
  const cached = readCache(key)
  if (cached) return cached

  const url = `${PHOTON_URL}?q=${encodeURIComponent(
    text,
  )}&bbox=${INDIA_BBOX}&limit=8`
  const data = await fetchJson(url, signal)
  const features = Array.isArray(data?.features) ? data.features : []
  const places = features.map(normalizePhoton).filter(Boolean)
  return writeCache(key, places)
}

export function clearGeocodeCache() {
  cache.clear()
}
