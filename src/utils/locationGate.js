// FRESH:FILE  India-only gate: coarse bounding-box prefilter, then reverse-geocode country confirmation. Fails closed when unconfirmed.
// FRESH:AREA  Location

import { inIndiaBox } from './india'

// FRESH:Location  Confirms a candidate is in India before it can be saved or used.
/**
 * Confirm that a candidate place is in India.
 *
 * The bounding box is only a cheap pre-filter. A country check is still
 * required: a geocoder result can carry `countryCode` directly, while GPS
 * coordinates need reverse geocoding. If the country cannot be confirmed the
 * gate fails closed so an unverified place is never accepted or stored.
 */
export async function verifyInIndia(
  candidate,
  { reverseGeocode, signal } = {},
) {
  const point = {
    lat: Number(candidate?.lat),
    lng: Number(candidate?.lng),
  }

  if (!inIndiaBox(point)) {
    return {
      ok: false,
      code: 'outside',
      message: 'That location is outside India. FRESH is available in India only for now.',
    }
  }

  let countryCode = String(candidate?.countryCode || '').toUpperCase()
  let resolved = {}

  if (!countryCode && typeof reverseGeocode === 'function') {
    try {
      const result = await reverseGeocode(point.lat, point.lng, signal)
      if (result?.ok) {
        countryCode = String(result.place?.countryCode || '').toUpperCase()
        resolved = {
          label: result.place?.label || candidate?.label,
          city: result.place?.city || candidate?.city,
          state: result.place?.state || candidate?.state,
          pincode: result.place?.pincode || candidate?.pincode,
        }
      } else {
        return {
          ok: false,
          code: 'unconfirmed',
          message:
            result?.message ||
            'We could not confirm that this location is in India. Check your connection and try again.',
        }
      }
    } catch (error) {
      if (error?.name === 'AbortError') throw error
      return {
        ok: false,
        code: 'unconfirmed',
        message: 'We could not confirm that this location is in India. Try again.',
      }
    }
  }

  if (!countryCode) {
    return {
      ok: false,
      code: 'unconfirmed',
      message: 'We could not confirm that this location is in India. Try again.',
    }
  }

  if (countryCode !== 'IN') {
    return {
      ok: false,
      code: 'outside',
      message: 'That location is outside India. FRESH is available in India only for now.',
    }
  }

  return {
    ok: true,
    place: {
      ...candidate,
      ...resolved,
      lat: point.lat,
      lng: point.lng,
      countryCode: 'IN',
    },
  }
}
