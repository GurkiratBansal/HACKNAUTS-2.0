// FRESH:FILE  Wizard step 1: food name, category, diet and quantity.
// FRESH:AREA  Donations

import { Check, Sparkles } from 'lucide-react'
import Field from '../ui/Field'
import StepHeading from './StepHeading'

const CATEGORIES = [
  { value: 'cooked', label: 'Cooked meal' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'raw', label: 'Raw / packaged' },
]

const DIETS = [
  { value: 'veg', label: 'Veg' },
  { value: 'non-veg', label: 'Non-veg' },
]

export default function BasicsStep({ form, set, errors, emergencyActive = false, onTriggerAiScan }) {
  const activeCategories = emergencyActive ? [
    ...CATEGORIES,
    { value: 'dry_ration', label: 'Dry ration' },
    { value: 'packaged_food', label: 'Packaged food' },
    { value: 'drinking_water', label: 'Drinking water' },
    { value: 'baby_food', label: 'Baby food' },
  ] : CATEGORIES
  return (
    <section aria-labelledby="wizard-step-title">
      <StepHeading eyebrow="Step 1 · The food" title="What are you sharing?">
        A clear name and an honest quantity help a nearby NGO decide in seconds.
      </StepHeading>

      {onTriggerAiScan && (
        <button
          type="button"
          onClick={onTriggerAiScan}
          className="mt-4 flex w-full items-center justify-between rounded-2xl border border-dashed border-emerald-400 bg-gradient-to-r from-emerald-50/80 via-teal-50/60 to-brand-50/80 p-3.5 text-left transition hover:border-emerald-600 hover:shadow-soft active:scale-[0.99] dark:border-emerald-700 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-brand-950/30"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-2xs">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                ✨ Have a food photo? Tap to scan with AI
              </p>
              <p className="text-[11px] text-ink-muted">
                AI detects food item, portion count &amp; nutrition chart automatically!
              </p>
            </div>
          </div>
          <span className="rounded-xl bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-xs">
            Scan Photo
          </span>
        </button>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field
          id="food-name"
          label="Food name"
          value={form.foodName}
          onChange={set('foodName')}
          error={errors.foodName}
          placeholder="Veg biryani, sandwiches, fruit boxes…"
          required
          className="sm:col-span-2"
        />
        <Field
          as="select"
          id="food-category"
          label="Category"
          value={form.category}
          onChange={set('category')}
          required
        >
          {activeCategories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </Field>
        <Field
          id="food-quantity"
          label="Quantity (servings)"
          type="number"
          min="1"
          value={form.quantity}
          onChange={set('quantity')}
          error={errors.quantity}
          placeholder="80"
          required
        />

        <fieldset className="sm:col-span-2">
          <legend className="mb-1.5 block text-sm font-semibold text-ink">
            Diet
            <span className="ml-0.5 text-danger-600" aria-hidden="true">
              *
            </span>
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {DIETS.map((diet) => {
              const selected = form.diet === diet.value
              return (
                <label
                  key={diet.value}
                  className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition focus-within:ring-2 focus-within:ring-brand-500/30 ${
                    selected
                      ? 'border-brand-500 bg-brand-50 text-brand-800 dark:border-brand-400 dark:bg-brand-900/40 dark:text-brand-100'
                      : 'border-line-strong bg-surface text-ink-soft hover:border-brand-300 hover:bg-brand-50/40 dark:hover:border-brand-700 dark:hover:bg-brand-900/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="diet"
                    value={diet.value}
                    checked={selected}
                    onChange={set('diet')}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      selected
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-line-strong bg-surface'
                    }`}
                    aria-hidden="true"
                  >
                    {selected && <Check className="h-2.5 w-2.5" />}
                  </span>
                  {diet.label}
                </label>
              )
            })}
          </div>
        </fieldset>
      </div>

      <p className="mt-5 flex items-start gap-2 rounded-xl border border-brand-200/70 bg-brand-50/60 p-3 text-xs leading-relaxed text-brand-900 dark:border-brand-800 dark:bg-brand-900/25 dark:text-brand-100">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Name the dish the way an NGO would search for it, and count the servings
        you can actually hand over.
      </p>
      {emergencyActive && (
        <p className="mt-3 rounded-xl border border-warning-200 bg-warning-50 p-3 text-xs leading-relaxed text-warning-950 dark:border-warning-800 dark:bg-warning-900/25 dark:text-warning-100">
          Weather and conditions can make food unsafe faster. Final food safety checking rests with the donor and the receiving organization.
        </p>
      )}
    </section>
  )
}
