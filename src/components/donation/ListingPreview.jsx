// FRESH:FILE  Wizard final step: preview of the listing before publishing.
// FRESH:AREA  Donations

import { Camera, Sparkles, UtensilsCrossed } from 'lucide-react'
import { categoryLabel, storageLabel } from '../../utils/format'
import { URGENCY_DISCLAIMER } from '../../utils/urgency'
import AiNutritionCard from './AiNutritionCard'

/**
 * Sticky companion preview. It updates live from the form so donors can see how
 * the listing will read on an NGO dashboard.
 */
export default function ListingPreview({ form, preview, nutrition, safetyData }) {
  return (
    <aside className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
      <div className="overflow-hidden rounded-[12px] border border-fresh-border bg-fresh-light-card shadow-fresh-sm dark:bg-fresh-dark-card">
        <div className="relative aspect-[16/10] overflow-hidden bg-fresh-mint/10">
          {preview ? (
            <img
              src={preview}
              alt="Food preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-[12px] bg-white/40 text-fresh-mint border border-fresh-border backdrop-blur dark:bg-black/30">
                <Camera className="h-7 w-7" aria-hidden="true" />
              </span>
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur">
            Live preview
          </span>
        </div>

        <div className="p-5">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-fresh-mint">
            <UtensilsCrossed className="h-3.5 w-3.5" aria-hidden="true" />
            Donor listing
          </p>
          <h2 className="mt-1.5 font-display text-lg font-bold leading-snug text-fresh-ink dark:text-fresh-light-bg">
            {form.foodName || 'Your food name'}
          </h2>

          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
            <span className="rounded-[6px] border border-fresh-border bg-black/5 px-2 py-0.5 font-semibold text-fresh-ink-muted dark:bg-white/5 dark:text-fresh-ink-soft">
              {categoryLabel(form.category)}
            </span>
            <span className="rounded-[6px] border border-fresh-mint/30 bg-fresh-mint/15 px-2 py-0.5 font-semibold text-fresh-mint">
              {form.diet === 'veg' ? 'Veg' : 'Non-veg'}
            </span>
            <span className="rounded-[6px] border border-fresh-border bg-black/5 px-2 py-0.5 font-semibold text-fresh-ink-muted dark:bg-white/5 dark:text-fresh-ink-soft">
              {storageLabel(form.storage)}
            </span>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-fresh-ink-muted dark:text-fresh-ink-soft">
            <span className="font-semibold text-fresh-ink dark:text-fresh-light-bg">
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

      {/* AI Nutrition & Food Safety Card */}
      {nutrition ? (
        <AiNutritionCard
          nutrition={nutrition}
          safetyScore={safetyData?.safetyScore || 98}
          safetyVerdict={safetyData?.safetyVerdict}
          safetyChecks={safetyData?.safetyChecks}
          quantity={form.quantity || 1}
        />
      ) : (
        <div className="rounded-[12px] border border-fresh-border bg-fresh-light-card p-4 shadow-fresh-sm dark:bg-fresh-dark-card">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-fresh-mint">
            AI Food Vision &amp; Safety
          </p>
          <h3 className="mt-1 flex items-center gap-2 font-display text-sm font-bold text-fresh-ink dark:text-fresh-light-bg">
            <Sparkles className="h-4 w-4 text-fresh-mint" aria-hidden="true" />
            Upload a Photo to Auto-Scan
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-fresh-ink-muted dark:text-fresh-ink-soft">
            When you attach a photo, AI figures out the food name, category, portion count, and generates a full Nutrition Chart automatically!
          </p>
        </div>
      )}

      <p className="rounded-[10px] border border-fresh-border bg-fresh-light-card p-4 text-xs leading-relaxed text-fresh-ink-muted dark:bg-fresh-dark-card dark:text-fresh-ink-soft">
        {URGENCY_DISCLAIMER} Never list food you would not serve to your own
        family.
      </p>
    </aside>
  )
}
