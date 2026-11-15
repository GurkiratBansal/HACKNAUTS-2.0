// FRESH:FILE  Per-step validation for the donation wizard: servings 1-10000, Indian mobile, deadline after cooking, pickup point required.
// FRESH:AREA  Donations

import { isIndianPhone } from '../../utils/india'

// FRESH:Donation  Field groups per wizard step, used for error routing.
export const STEP_FIELDS = [
  ['foodName', 'quantity'],
  ['cookedAt', 'deadline', 'contactPhone'],
  ['address', 'location'],
  [],
]

// FRESH:Donation  Returns one validator per step; each returns an errors object.
/**
 * Validation rules for the donation wizard, grouped by step.
 * FRESH: Servings whole numbers 1 to 10000; contact phone validated with isIndianPhone.
 */
export function buildStepValidators(form, location) {
  return [
    () => {
      const next = {}
      if (!form.foodName.trim()) next.foodName = 'Give the food a clear name.'
      const qty = Number(form.quantity)
      if (!form.quantity || !Number.isFinite(qty) || qty <= 0) {
        next.quantity = 'Enter the number of servings.'
      } else if (!Number.isInteger(qty) || qty < 1 || qty > 10000) {
        next.quantity = 'Servings must be a whole number between 1 and 10000.'
      }
      return next
    },
    () => {
      const next = {}
      if (!form.cookedAt) next.cookedAt = 'When was the food prepared?'
      if (!form.deadline) next.deadline = 'Set a pickup deadline.'
      if (
        form.cookedAt &&
        form.deadline &&
        new Date(form.deadline) <= new Date(form.cookedAt)
      ) {
        next.deadline = 'Pickup deadline must be after the food was cooked.'
      }
      if (form.deadline && new Date(form.deadline).getTime() <= Date.now()) {
        next.deadline = 'Pickup deadline must be in the future.'
      }
      if (!form.contactPhone.trim()) {
        next.contactPhone = 'Enter a contact phone number.'
      } else if (!isIndianPhone(form.contactPhone)) {
        next.contactPhone = 'Enter a valid Indian mobile number (e.g. 9876543210 or +91 98765 43210).'
      }
      return next
    },
    () => {
      const next = {}
      if (!form.address.trim()) next.address = 'Add a pickup address or landmark.'
      if (!location) next.location = 'Pick a pickup point on the map.'
      return next
    },
  ]
}

// FRESH:Donation  Runs every step validator and merges the errors.
export function validateAll(validators) {
  return validators.reduce(
    (next, validator) => ({ ...next, ...validator() }),
    {},
  )
}

// FRESH:Donation  Finds the earliest step with an error so the wizard can jump back.
export function firstStepWithErrors(errors) {
  if (errors.foodName || errors.quantity) return 0
  if (errors.cookedAt || errors.deadline || errors.contactPhone) return 1
  if (errors.address || errors.location) return 2
  return 3
}
