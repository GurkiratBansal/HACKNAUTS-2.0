import { describe, it, expect } from 'vitest'
import {
  formatIndianPhone,
  inIndiaBox,
  isIndianPhone,
  isValidPin,
} from './india'

describe('india validators', () => {
  it('validates six-digit Indian pincodes', () => {
    expect(isValidPin('141001')).toBe(true)
    expect(isValidPin(' 110001 ')).toBe(true)
    expect(isValidPin('012345')).toBe(false)
    expect(isValidPin('12345')).toBe(false)
    expect(isValidPin('1234567')).toBe(false)
    expect(isValidPin('abcdef')).toBe(false)
    expect(isValidPin('')).toBe(false)
  })

  it('uses the India bounding box as a coarse pre-filter', () => {
    expect(inIndiaBox({ lat: 6.5, lng: 68 })).toBe(true)
    expect(inIndiaBox({ lat: 37.5, lng: 97.5 })).toBe(true)
    expect(inIndiaBox({ lat: 30.9, lng: 75.85 })).toBe(true)
    expect(inIndiaBox({ lat: 6.49, lng: 75 })).toBe(false)
    expect(inIndiaBox({ lat: 37.51, lng: 75 })).toBe(false)
    expect(inIndiaBox({ lat: 28, lng: 67.99 })).toBe(false)
    expect(inIndiaBox({ lat: 28, lng: 97.51 })).toBe(false)
    expect(inIndiaBox(null)).toBe(false)
    expect(inIndiaBox({ lat: NaN, lng: 75 })).toBe(false)
  })

  it('validates Indian mobile numbers', () => {
    expect(isIndianPhone('9876543210')).toBe(true)
    expect(isIndianPhone('+91 98765 43210')).toBe(true)
    expect(isIndianPhone('+919876543210')).toBe(true)
    expect(isIndianPhone('98765 43210')).toBe(true)
    // Product rule: optional 0 prefix allowed for Indian mobiles
    expect(isIndianPhone('09876543210')).toBe(true)
    expect(isIndianPhone('5876543210')).toBe(false)
    expect(isIndianPhone('987654321')).toBe(false)
    // Product rule: 123 must be rejected
    expect(isIndianPhone('123')).toBe(false)
    expect(isIndianPhone('')).toBe(false)
  })

  it('formats Indian mobiles as +91 XXXXX XXXXX', () => {
    expect(formatIndianPhone('9876543210')).toBe('+91 98765 43210')
    expect(formatIndianPhone('+919876543210')).toBe('+91 98765 43210')
    expect(formatIndianPhone('+91 98765 43210')).toBe('+91 98765 43210')
    expect(formatIndianPhone('09876543210')).toBe('+91 98765 43210')
    expect(formatIndianPhone('123')).toBe('123')
  })
})
