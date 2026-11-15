/**
 * India-specific validators and small formatting helpers.
 *
 * These are client-side checks for a demo. They are not a substitute for
 * server-side validation in a production deployment.
 */

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
]

const PIN_RE = /^[1-9][0-9]{5}$/
const PHONE_RE = /^(?:91|0)?[6-9]\d{9}$/

export function isValidPin(value) {
  return PIN_RE.test(String(value ?? '').trim())
}

/**
 * Quick bounding-box pre-filter for India. This is deliberately coarse: it
 * keeps obviously foreign coordinates out before the country check, but it is
 * not a precise border test.
 */
export function inIndiaBox(point) {
  if (!point) return false
  const lat = Number(point.lat)
  const lng = Number(point.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false
  return lat >= 6.5 && lat <= 37.5 && lng >= 68 && lng <= 97.5
}

export function isIndianPhone(value) {
  const digits = normalizePhoneDigits(value)
  return PHONE_RE.test(digits)
}

export function normalizePhoneDigits(value) {
  return String(value ?? '').replace(/[\s-]/g, '').replace(/^\+/, '')
}

/** Format a valid Indian mobile as +91 XXXXX XXXXX. Invalid input is returned. */
export function formatIndianPhone(value) {
  let digits = normalizePhoneDigits(value)
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2)
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  if (!/^[6-9]\d{9}$/.test(digits)) return String(value ?? '').trim()
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
}
