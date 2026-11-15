// FRESH:FILE  Wizard photo step: attach an optional photo.
// FRESH:AREA  Donations

import {
  ClipboardCheck,
  ImagePlus,
  Loader2,
  Trash2,
} from 'lucide-react'
import Button from '../ui/Button'
import Field from '../ui/Field'
import { categoryLabel, formatDate, storageLabel } from '../../utils/format'
import StepHeading from './StepHeading'

export default function PhotoStep({
  form,
  set,
  preview,
  photoBusy,
  onPhoto,
  clearPhoto,
}) {
  return (
    <section aria-labelledby="wizard-step-title">
      <StepHeading eyebrow="Step 4 · Finish" title="Add a photo and final notes">
        Optional, but a real photo and clear handling notes build trust faster.
      </StepHeading>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="food-photo"
            className="mb-1.5 block text-sm font-semibold text-ink"
          >
            Food photo{' '}
            <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <label
            htmlFor="food-photo"
            className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-elevated/60 px-4 py-6 text-center transition hover:border-brand-400 hover:bg-brand-50/40 dark:hover:border-brand-600 dark:hover:bg-brand-900/20"
          >
            {preview ? (
              <img
                src={preview}
                alt="Selected food preview"
                className="h-36 w-full rounded-xl object-cover"
              />
            ) : (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-brand-700 shadow-soft ring-1 ring-inset ring-line dark:text-brand-300">
                  <ImagePlus className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="mt-3 text-sm font-semibold text-ink">
                  Upload a photo
                </span>
                <span className="mt-0.5 text-xs text-ink-muted">
                  JPG or PNG, shown to NGOs
                </span>
              </>
            )}
            <input
              id="food-photo"
              type="file"
              accept="image/*"
              onChange={onPhoto}
              className="sr-only"
            />
          </label>
          {photoBusy && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Preparing preview…
            </p>
          )}
          {preview && (
            <Button
              type="button"
              variant="ghostDanger"
              size="sm"
              icon={Trash2}
              onClick={clearPhoto}
              className="mt-2"
            >
              Remove photo
            </Button>
          )}
        </div>

        <Field
          as="textarea"
          id="food-notes"
          label="Notes for the NGO (optional)"
          rows={6}
          value={form.notes}
          onChange={set('notes')}
          placeholder="Packaging, allergens, entrance instructions…"
        />
      </div>

      <div className="mt-5 rounded-2xl border border-brand-200/70 bg-brand-50/60 p-4 dark:border-brand-800 dark:bg-brand-900/25">
        <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
          <ClipboardCheck
            className="h-4 w-4 text-brand-700 dark:text-brand-300"
            aria-hidden="true"
          />
          Review before publishing
        </h3>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              Food
            </dt>
            <dd className="mt-0.5 font-semibold text-ink">
              {form.foodName || 'Not named yet'} · {form.quantity || 0} servings
            </dd>
            <dd className="text-xs text-ink-soft">
              {categoryLabel(form.category)} ·{' '}
              {form.diet === 'veg' ? 'Veg' : 'Non-veg'} ·{' '}
              {storageLabel(form.storage)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              Pickup deadline
            </dt>
            <dd className="mt-0.5 font-semibold text-ink">
              {formatDate(form.deadline)}
            </dd>
            <dd className="text-xs text-ink-soft">
              The countdown starts when you publish.
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              Pickup point
            </dt>
            <dd className="mt-0.5 font-semibold text-ink">
              {form.address || 'No address yet'}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
