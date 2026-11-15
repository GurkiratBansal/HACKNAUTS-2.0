// FRESH:FILE  Wizard step 2: cooked time, storage, deadline and contact phone.
// FRESH:AREA  Donations

import { Clock } from 'lucide-react'
import Field from '../ui/Field'
import StepHeading from './StepHeading'

const STORAGE = [
  { value: 'room', label: 'Room temperature' },
  { value: 'refrigerated', label: 'Refrigerated' },
  { value: 'hot-holding', label: 'Hot holding' },
]

export default function HandlingStep({ form, set, errors, safetyHint }) {
  return (
    <section aria-labelledby="wizard-step-title">
      <StepHeading eyebrow="Step 2 · Timing" title="Handling & pickup window">
        The deadline drives urgency on NGO dashboards, so keep it realistic.
      </StepHeading>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field
          id="food-cooked"
          label="Cooked / packed at"
          type="datetime-local"
          value={form.cookedAt}
          onChange={set('cookedAt')}
          error={errors.cookedAt}
          required
        />
        <Field
          as="select"
          id="food-storage"
          label="Storage condition"
          value={form.storage}
          onChange={set('storage')}
          required
        >
          {STORAGE.map((storage) => (
            <option key={storage.value} value={storage.value}>
              {storage.label}
            </option>
          ))}
        </Field>
        <Field
          id="food-deadline"
          label="Pickup deadline"
          type="datetime-local"
          value={form.deadline}
          onChange={set('deadline')}
          error={errors.deadline}
          required
        />
        <Field
          id="food-phone"
          label="Contact phone"
          type="tel"
          value={form.contactPhone}
          onChange={set('contactPhone')}
          error={errors.contactPhone}
          placeholder="+91 98765 43210"
          hint="Shared only after an NGO accepts."
          required
        />
      </div>

      <p className="mt-5 flex items-start gap-2 rounded-xl border border-warning-200 bg-warning-50 p-3 text-xs leading-relaxed text-warning-900 dark:border-warning-800 dark:bg-warning-900/30 dark:text-warning-100">
        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {safetyHint}
      </p>
    </section>
  )
}
