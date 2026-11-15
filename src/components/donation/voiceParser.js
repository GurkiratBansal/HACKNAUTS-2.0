// FRESH:FILE  Speech and NLP parser for voice donation assistant.
// FRESH:AREA  Donations

import { toLocalDateTimeInput } from '../../utils/format'

const DIGIT_WORDS = {
  zero: '0',
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
}

const NUMBER_WORDS = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  fifteen: 15,
  twenty: 20,
  twentyfive: 25,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
  hundred: 100,
  thousand: 1000,
}

/** Normalize spoken digits like "nine eight seven six five..." to numerals. */
export function normalizeSpokenDigits(text) {
  if (!text) return ''
  let normalized = text.toLowerCase()
  // Replace "double X" -> "XX"
  normalized = normalized.replace(/double\s+(zero|one|two|three|four|five|six|seven|eight|nine)/gi, (_, word) => {
    const d = DIGIT_WORDS[word.toLowerCase()] || ''
    return d + d
  })
  // Replace individual digit words
  normalized = normalized.replace(/\b(zero|one|two|three|four|five|six|seven|eight|nine)\b/gi, (match) => {
    return DIGIT_WORDS[match.toLowerCase()] || match
  })
  return normalized
}

/** Extract Indian phone number (10 digits starting 6-9, optional +91 or 0 prefix). */
export function parseVoicePhone(text) {
  if (!text) return ''
  const normalized = normalizeSpokenDigits(text)
  const cleaned = normalized.replace(/[\s-]/g, '')
  const match = cleaned.match(/(?:(?:\+?91)|0)?([6-9]\d{9})/)
  return match ? match[1] : cleaned.replace(/\D/g, '').slice(0, 10)
}

/** Extract quantity (1 to 10000). */
export function parseVoiceQuantity(text) {
  if (!text) return ''
  const lower = text.toLowerCase().trim()
  
  // Direct word check
  for (const [w, n] of Object.entries(NUMBER_WORDS)) {
    if (new RegExp(`\\b${w}\\b`, 'i').test(lower)) {
      return String(n)
    }
  }

  const match = lower.match(/\b\d+\b/)
  if (match) {
    const val = parseInt(match[0], 10)
    if (val >= 1 && val <= 10000) return String(val)
  }
  return ''
}

/** Extract cooked time formatted as datetime-local string. */
export function parseVoiceCookedAt(text) {
  const now = new Date()
  if (!text) return toLocalDateTimeInput(new Date(now.getTime() - 60 * 60 * 1000))
  const lower = text.toLowerCase().trim()

  if (lower.includes('just now') || lower.includes('fresh') || lower.includes('now')) {
    return toLocalDateTimeInput(now)
  }

  const hrMatch = lower.match(/(\d+)\s*hour/i)
  if (hrMatch) {
    const hrs = parseInt(hrMatch[1], 10)
    return toLocalDateTimeInput(new Date(now.getTime() - hrs * 60 * 60 * 1000))
  }

  const minMatch = lower.match(/(\d+)\s*minute/i)
  if (minMatch) {
    const mins = parseInt(minMatch[1], 10)
    return toLocalDateTimeInput(new Date(now.getTime() - mins * 60 * 1000))
  }

  return toLocalDateTimeInput(new Date(now.getTime() - 60 * 60 * 1000))
}

/** Extract expiry / deadline time formatted as datetime-local string. */
export function parseVoiceDeadline(text) {
  const now = new Date()
  if (!text) return toLocalDateTimeInput(new Date(now.getTime() + 3 * 60 * 60 * 1000))
  const lower = text.toLowerCase().trim()

  const hrMatch = lower.match(/(\d+)\s*hour/i)
  if (hrMatch) {
    const hrs = parseInt(hrMatch[1], 10)
    return toLocalDateTimeInput(new Date(now.getTime() + hrs * 60 * 60 * 1000))
  }

  if (lower.includes('tonight')) {
    const tonight = new Date()
    tonight.setHours(22, 0, 0, 0)
    return toLocalDateTimeInput(tonight)
  }

  return toLocalDateTimeInput(new Date(now.getTime() + 3 * 60 * 60 * 1000))
}

/** Clean food name from conversational voice filler. */
export function parseVoiceFoodName(text) {
  if (!text) return ''
  let cleaned = text.trim()
  const fillerRegex = /^(?:it is|it's|we have|i have|i want to donate|want to donate|there is|donating|surplus|some|a|about)\s+/i
  while (fillerRegex.test(cleaned)) {
    cleaned = cleaned.replace(fillerRegex, '')
  }
  cleaned = cleaned.replace(/[.!?]+$/, '').trim()
  if (!cleaned) return ''
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

/** Full-sentence natural language voice parser. */
export function parseFullVoiceDonation(text) {
  const result = {}
  if (!text || typeof text !== 'string') return result

  // 1. Phone
  const phone = parseVoicePhone(text)
  if (phone && phone.length === 10) {
    result.contactPhone = phone
  }

  // 2. Quantity
  const qtyMatch = text.match(/(\d+)\s*(?:plates?|servings?|portions?|meals?|packs?|boxes?)?/i)
  if (qtyMatch && Number(qtyMatch[1]) >= 1 && Number(qtyMatch[1]) <= 10000) {
    result.quantity = qtyMatch[1]
  } else {
    const q = parseVoiceQuantity(text)
    if (q) result.quantity = q
  }

  // 3. Cooked At
  if (/just now|fresh|cooked now|minutes? ago|hours? ago/i.test(text)) {
    result.cookedAt = parseVoiceCookedAt(text)
  }

  // 4. Deadline / Expiry
  if (/expire|expiry|valid|hours? left|in \d+ hours?|tonight/i.test(text)) {
    result.deadline = parseVoiceDeadline(text)
  }

  // 5. Common food names
  const knownFoods = [
    'Vegetable Biryani', 'Veg Biryani', 'Chicken Biryani', 'Dal Makhani with Rice',
    'Dal Makhani', 'Dal Rice', 'Rajma Chawal', 'Paneer Butter Masala',
    'Roti and Sabzi', 'Mixed Veg Curry', 'Chole Bhature', 'Khichdi',
    'Idli Sambar', 'Sambar Rice', 'Curd Rice', 'Kheer', 'Gulab Jamun',
  ]
  for (const food of knownFoods) {
    if (new RegExp(`\\b${food}\\b`, 'i').test(text)) {
      result.foodName = food
      break
    }
  }

  // 6. Address / Location
  const locMatch = text.match(/(?:at|near|location|pickup at|address)\s+([A-Za-z0-9\s,.-]+?)(?:\s+(?:phone|contact|call|expires?|cooked|ready)|$)/i)
  if (locMatch && locMatch[1].trim().length >= 4) {
    result.address = locMatch[1].trim()
  }

  return result
}
