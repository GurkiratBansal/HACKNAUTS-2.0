// FRESH:FILE  Wizard final step: preview of the listing before publishing.
// FRESH:AREA  Donations

import { Camera, Sparkles, UtensilsCrossed } from 'lucide-react'
import { categoryLabel, storageLabel } from '../../utils/format'
import { URGENCY_DISCLAIMER } from '../../utils/urgency'

/**
 * Sticky companion preview. It updates live from the form so donors can see how
 * the listing will read on an NGO dashboard.
 */
export default function ListingPreview({ form, preview }) {
  return (
    <aside className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand-100 via-cream to-saffron-100 dark:from-brand-900 dark:via-brand-950 dark:to-saffron-900/40">
          {preview ? (
            <img
              src={preview}
              alt="Food preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface/60 text-brand-700/60 ring-1 ring-inset ring-brand-900/10 backdrop-blur dark:text-brand-300/70 dark:ring-white/10">
                <Camera className="h-7 w-7" aria-hidden="true" />
              </span>
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-brand-950/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur">
            Live preview
          </span>
        </div>

        <div className="p-5">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
            <UtensilsCrossed className="h-3.5 w-3.5" aria-hidden="true" />
            Donor listing
          </p>
          <h2 className="mt-1.5 font-display text-lg font-bold leading-snug text-ink">
            {form.foodName || 'Your food name'}
          </h2>

          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
            <span className="rounded-full bg-elevated px-2 py-0.5 font-semibold text-ink-soft ring-1 ring-inset ring-line">
              {categoryLabel(form.category)}
            </span>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 font-semibold text-brand-700 ring-1 ring-inset ring-brand-200 dark:bg-brand-900/40 dark:text-brand-200 dark:ring-brand-700">
              {form.diet === 'veg' ? 'Veg' : 'Non-veg'}
            </span>
            <span className="rounded-full bg-elevated px-2 py-0.5 font-semibold text-ink-soft ring-1 ring-inset ring-line">
              {storageLabel(form.storage)}
            </span>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-ink-soft">
            <span className="font-semibold text-ink">
              {form.quantity || '0'} servings
            </span>{' '}
            · {form.address || 'Pickup address'}
          </p>

          <p className="mt-4 flex items-start gap-2 rounded-xl bg-elevated p-3 text-xs leading-relaxed text-ink-soft ring-1 ring-inset ring-line">
            <Sparkles
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600 dark:text-brand-300"
              aria-hidden="true"
            />
            After publishing, the 3 nearest verified NGOs are alerted
            automatically.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-dashed border-brand-300 bg-brand-50/60 p-5 dark:border-brand-700 dark:bg-brand-900/20">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">
          Future feature
        </p>
        <h3 className="mt-1 flex items-center gap-2 font-display text-base font-bold text-ink">
          <Sparkles
            className="h-4 w-4 text-brand-700 dark:text-brand-300"
            aria-hidden="true"
          />
          AI Food Safety Assistant
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          Coming soon: photo-based freshness checks and handling prompts. This
          FRESH does not fake AI output — inspection always stays with the NGO.
        </p>
      </div>

      <p className="rounded-2xl border border-line bg-surface p-4 text-xs leading-relaxed text-ink-muted">
        {URGENCY_DISCLAIMER} Never list food you would not serve to your own
        family.
      </p>
    </aside>
  )
}
