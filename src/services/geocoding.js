import {
  reversePlace,
  searchPincode as findPincode,
  searchPlaces,
} from './geocode'

function failure(reason, message) {
  return { ok: false, reason, message }
}

/** Compatibility wrapper around the single geocode service module. */
export async function reverseGeocode(lat, lng, signal) {
  try {
    const label = await reversePlace(lat, lng, signal)
    return {
      ok: true,
      place: { lat: Number(lat), lng: Number(lng), label, countryCode: 'IN' },
    }
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    return failure('error', error?.message || 'We could not confirm that location. Please try again.')
  }
}

/** Compatibility wrapper around the single geocode service module. */
export async function searchPincode(pincode, signal) {
  try {
    const places = await findPincode(pincode, signal)
    if (!places.length) {
      return failure(
        'not_found',
        'We could not find that pincode in India. Check the digits and try again.',
      )
    }
    return { ok: true, place: places[0] }
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    return failure('error', error?.message || 'We could not check that pincode. Please try again.')
  }
}

/** Compatibility wrapper around the single geocode service module. */
export async function searchAddress(query, signal) {
  try {
    return { ok: true, suggestions: await searchPlaces(query, signal) }
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    return failure('error', error?.message || 'Address search failed. Please try again.')
  }
}

/** Compatibility wrapper around the single geocode service module. */
export async function searchPlace(text, signal) {
  try {
    const places = await searchPlaces(text, signal)
    if (!places.length) {
      return failure('not_found', 'We could not find that place in India.')
    }
    return { ok: true, place: places[0] }
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    return failure('error', error?.message || 'We could not check that place. Please try again.')
  }
}
