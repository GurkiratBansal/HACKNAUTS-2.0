export const STEP_FIELDS = [
  ['foodName', 'quantity'],
  ['cookedAt', 'deadline', 'contactPhone'],
  ['address', 'location'],
  [],
]

/**
 * Validation rules carried over unchanged from the original single-page form,
 * grouped by the wizard step that owns each field.
 */
export function buildStepValidators(form, location) {
  return [
    () => {
      const next = {}
      if (!form.foodName.trim()) next.foodName = 'Give the food a clear name.'
      const qty = Number(form.quantity)
      if (!form.quantity || !Number.isFinite(qty) || qty <= 0) {
        next.quantity = 'Enter the number of servings.'
      } else if (qty < 1 || qty > 250) {
        next.quantity = 'Servings must be between 1 and 250.'
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
      if (
        !form.contactPhone.trim() ||
        form.contactPhone.replace(/\D/g, '').length < 10
      ) {
        next.contactPhone = 'Enter a phone number with at least 10 digits.'
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

export function validateAll(validators) {
  return validators.reduce(
    (next, validator) => ({ ...next, ...validator() }),
    {},
  )
}

export function firstStepWithErrors(errors) {
  if (errors.foodName || errors.quantity) return 0
  if (errors.cookedAt || errors.deadline || errors.contactPhone) return 1
  if (errors.address || errors.location) return 2
  return 3
}
