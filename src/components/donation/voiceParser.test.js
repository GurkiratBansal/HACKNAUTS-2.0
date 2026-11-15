// FRESH:FILE  Tests for voice parser helpers.
// FRESH:AREA  Donations

import { describe, expect, it } from 'vitest'
import {
  normalizeSpokenDigits,
  parseVoicePhone,
  parseVoiceQuantity,
  parseVoiceCookedAt,
  parseVoiceDeadline,
  parseVoiceFoodName,
  parseFullVoiceDonation,
} from './voiceParser'

describe('voiceParser', () => {
  it('normalizes spoken digit words to numbers', () => {
    expect(normalizeSpokenDigits('nine eight seven six five four three two one zero')).toBe(
      '9 8 7 6 5 4 3 2 1 0',
    )
    expect(normalizeSpokenDigits('double nine eight seven')).toBe('99 8 7')
  })

  it('parses valid Indian phone numbers from speech', () => {
    expect(parseVoicePhone('my phone is 9876543210')).toBe('9876543210')
    expect(parseVoicePhone('+91 98765 43210')).toBe('9876543210')
    expect(parseVoicePhone('0 9876543210')).toBe('9876543210')
    expect(parseVoicePhone('nine eight seven six five four three two one zero')).toBe('9876543210')
  })

  it('parses quantity from words and numbers', () => {
    expect(parseVoiceQuantity('we have fifty plates')).toBe('50')
    expect(parseVoiceQuantity('about 120 servings')).toBe('120')
    expect(parseVoiceQuantity('twenty')).toBe('20')
  })

  it('parses cooked time', () => {
    const resNow = parseVoiceCookedAt('just now')
    expect(typeof resNow).toBe('string')
    expect(resNow.length).toBeGreaterThan(10)

    const res1hr = parseVoiceCookedAt('cooked 2 hours ago')
    expect(typeof res1hr).toBe('string')
  })

  it('parses deadline', () => {
    const res3hr = parseVoiceDeadline('in 4 hours')
    expect(typeof res3hr).toBe('string')
  })

  it('cleans food name from conversational filler', () => {
    expect(parseVoiceFoodName('we have some vegetable biryani.')).toBe('Vegetable biryani')
    expect(parseVoiceFoodName("it's rajma chawal")).toBe('Rajma chawal')
  })

  it('parses a full natural sentence', () => {
    const sentence =
      'I want to donate 60 plates of Vegetable Biryani cooked 1 hour ago expiring in 4 hours at Model Town Ludhiana phone 9876543210'
    const parsed = parseFullVoiceDonation(sentence)

    expect(parsed.foodName).toBe('Vegetable Biryani')
    expect(parsed.quantity).toBe('60')
    expect(parsed.contactPhone).toBe('9876543210')
    expect(parsed.address).toContain('Model Town')
    expect(parsed.cookedAt).toBeDefined()
    expect(parsed.deadline).toBeDefined()
  })
})
