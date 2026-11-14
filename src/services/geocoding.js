import { inIndiaBox } from '../utils/india'

const NOMINATIM = 'https://nominatim.openstreetmap.org'
const PHOTON = 'https://photon.komoot.io/api/'
const REQUEST_TIMEOUT_MS = 10000
const PHOTON_BBOX = '68,6,98,38'

export class GeocodeError extends Error {
  constructor(reason, message) {
    super(message)
    this.name = 'GeocodeError'
    this.reason = reason
  }
}

function abortError() {
  const error = new Error('Aborted')
  error.name = 'AbortError'
  return error
}

async function fetchJson(url, signal) {
  const controller = new AbortController()
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, REQUEST_TIMEOUT_MS)

  const onAbort = () => controller.abort()
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', onAbort, { once: true })
  }

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) {
      throw new GeocodeError(
        'http',
        `The location service returned HTTP ${response.status}.`,
      )
    }
    return await response.json()
  } catch (error) {
    if (signal?.aborted) throw abortError()
    if (error instanceof GeocodeError) throw error
    if (timedOut || error?.name === 'AbortError') {
      throw new GeocodeError('timeout', 'The location service took too long.')
    }
    throw new GeocodeError(
      'network',
      'The location service could not be reached.',
    )
  } finally {
    clearTimeout(timer)
    if (signal) signal.removeEventListener('abort', onAbort)
  }
}

function normaliseNominatim(result) {
  const address = result?.address || {}
  const countryCode = String(address.country_code || '').toUpperCase()
  const place = {
    lat: Number(result?.lat),
    lng: Number(result?.lon),
    label: result?.display_name || '',
    city:
      address.city ||
      address.town ||
      address.village ||
      address.suburb ||
      address.county ||
      '',
    state: address.state || '',
    pincode: address.postcode || '',
    countryCode,
  }
  if (!Number.isFinite(place.lat) || !Number.isFinite(place.lng)) return null
  return place
}

function normalisePhoton(feature) {
  const coordinates = feature?.geometry?.coordinates || []
  const properties = feature?.properties || {}
  const countryCode = String(properties.countrycode || '').toUpperCase()
  const place = {
    lat: Number(coordinates[1]),
    lng: Number(coordinates[0]),
    label: [properties.name, properties.city, properties.state, properties.country]
      .filter(Boolean)
      .join(', '),
    city: properties.city || properties.name || '',
    state: properties.state || '',
    pincode: properties.postcode || '',
    countryCode,
  }
  if (!Number.isFinite(place.lat) || !Number.isFinite(place.lng)) return null
  return place
}

function failure(reason, message) {
  return { ok: false, reason, message }
}

/**
 * Resolve a 6-digit Indian pincode. Nominatim first, Photon text search as a
 * fallback. Called on submit only by the picker.
 */
export async function searchPincode(pincode, signal) {
  try {
    const url = `${NOMINATIM}/search?postalcode=${encodeURIComponent(
      pincode,
    )}&countrycodes=in&format=json&limit=1&addressdetails=1`
    const data = await fetchJson(url, signal)
    const result = Array.isArray(data) ? data[0] : null
    const place = result ? normaliseNominatim(result) : null
    if (place) return { ok: true, place }

    const photonUrl = `${PHOTON}?q=${encodeURIComponent(
      pincode,
    )}&bbox=${PHOTON_BBOX}&limit=5`
    const photon = await fetchJson(photonUrl, signal)
    const features = Array.isArray(photon?.features) ? photon.features : []
    const indian = features
      .map(normalisePhoton)
      .find((item) => item && item.countryCode === 'IN')
    if (indian) return { ok: true, place: indian }

    return failure(
      'not_found',
      'We could not find that pincode in India. Check the digits and try again.',
    )
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    return failure(
      'error',
      error?.message || 'We could not check that pincode. Please try again.',
    )
  }
}

/**
 * Debounced address search used by the picker. Photon is queried with an
 * India-focused bounding box so suggestions stay useful for an India-only app.
 */
export async function searchAddress(query, signal) {
  const text = String(query || '').trim()
  if (text.length < 3) return { ok: true, suggestions: [] }
  try {
    const url = `${PHOTON}?q=${encodeURIComponent(
      text,
    )}&bbox=${PHOTON_BBOX}&limit=5`
    const data = await fetchJson(url, signal)
    const features = Array.isArray(data?.features) ? data.features : []
    const suggestions = features
      .map(normalisePhoton)
      .filter((item) => item && item.countryCode === 'IN')
      .map((item) => ({
        ...item,
        label: item.label || item.city || 'Suggested place',
      }))
    return { ok: true, suggestions }
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    return failure(
      'error',
      error?.message || 'Address search failed. Please try again.',
    )
  }
}

/** Reverse geocode a GPS coordinate so the country can be confirmed. */
export async function reverseGeocode(lat, lng, signal) {
  try {
    const url = `${NOMINATIM}/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
    const data = await fetchJson(url, signal)
    const place = normaliseNominatim(data)
    if (!place) {
      return failure('not_found', 'We could not name that location.')
    }
    return { ok: true, place }
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    return failure(
      'error',
      error?.message || 'We could not confirm that location. Please try again.',
    )
  }
}

/**
 * Geocode an explicitly typed place (city/area + state) as a last resort.
 * The picker still resolves pincodes first.
 */
export async function searchPlace(text, signal) {
  try {
    const url = `${NOMINATIM}/search?q=${encodeURIComponent(
      text,
    )}&countrycodes=in&format=json&limit=1&addressdetails=1`
    const data = await fetchJson(url, signal)
    const result = Array.isArray(data) ? data[0] : null
    const place = result ? normaliseNominatim(result) : null
    if (place) return { ok: true, place }
    return failure('not_found', 'We could not find that place in India.')
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    return failure(
      'error',
      error?.message || 'We could not check that place. Please try again.',
    )
  }
}

export { inIndiaBox }
