import { describe, it, expect } from 'vitest'
import { buildStepValidators } from './validators'

describe('donation validators', () => {
  const baseForm = {
    foodName: 'Surplus Rice & Dal',
    quantity: '50',
    cookedAt: '2026-11-15T08:00',
    deadline: '2026-11-15T18:00',
    contactPhone: '9876543210',
    address: 'Clock Tower, Ludhiana',
  }
  const location = { lat: 30.901, lng: 75.8573 }

  describe('step 0 - basics & quantity', () => {
    it('accepts valid whole number servings from 1 to 10000', () => {
      const validCases = ['1', '50', '250', '500', '1000', '10000']
      for (const qty of validCases) {
        const [validateBasics] = buildStepValidators({ ...baseForm, quantity: qty }, location)
        expect(validateBasics()).toEqual({})
      }
    })

    it('rejects out of range servings (e.g. 20000) and non-integers', () => {
      const invalidCases = [
        ['20000', 'Servings must be a whole number between 1 and 10000.'],
        ['0', 'Enter the number of servings.'],
        ['-5', 'Enter the number of servings.'],
        ['2.5', 'Servings must be a whole number between 1 and 10000.'],
        ['', 'Enter the number of servings.'],
      ]
      for (const [qty, expectedMsg] of invalidCases) {
        const [validateBasics] = buildStepValidators({ ...baseForm, quantity: qty }, location)
        const errors = validateBasics()
        expect(errors.quantity).toBe(expectedMsg)
      }
    })

    it('requires a clear food name', () => {
      const [validateBasics] = buildStepValidators({ ...baseForm, foodName: '   ' }, location)
      expect(validateBasics().foodName).toBe('Give the food a clear name.')
    })
  })

  describe('step 1 - handling & contact phone', () => {
    it('accepts valid Indian mobile numbers with or without +91 or 0 prefix', () => {
      const validPhones = [
        '9876543210',
        '+91 98765 43210',
        '+919876543210',
        '09876543210',
        '6123456789',
        '7890123456',
        '8901234567',
      ]
      for (const phone of validPhones) {
        const [, validateHandling] = buildStepValidators(
          { ...baseForm, contactPhone: phone },
          location,
        )
        expect(validateHandling()).toEqual({})
      }
    })

    it('rejects invalid phones such as "123" and non-Indian prefixes', () => {
      const [, validateHandling123] = buildStepValidators(
        { ...baseForm, contactPhone: '123' },
        location,
      )
      expect(validateHandling123().contactPhone).toMatch(/valid Indian mobile/i)

      const [, validateHandlingNonIndian] = buildStepValidators(
        { ...baseForm, contactPhone: '5876543210' },
        location,
      )
      expect(validateHandlingNonIndian().contactPhone).toMatch(/valid Indian mobile/i)

      const [, validateEmpty] = buildStepValidators(
        { ...baseForm, contactPhone: '  ' },
        location,
      )
      expect(validateEmpty().contactPhone).toBe('Enter a contact phone number.')
    })
  })
})
