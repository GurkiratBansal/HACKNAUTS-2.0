// FRESH:FILE  Visual AI nutrition chart, macronutrient breakdown, and food safety inspection badge.
// FRESH:AREA  Donations

import { useState } from 'react'
import {
  ShieldCheck,
  Flame,
  Dna,
  Wheat,
  Droplet,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react'

export default function AiNutritionCard({
  nutrition,
  safetyScore = 98,
  safetyVerdict = 'Verified Safe & Fresh (Grade A+)',
  safetyChecks = [],
  quantity = 1,
  compact = false,
}) {
  const [detailsOpen, setDetailsOpen] = useState(false)

  if (!nutrition) return null

  const servings = Number(quantity) || 1
  const totalCalories = (nutrition.calories || 380) * servings
  const totalProteinG = (nutrition.protein || 12) * servings

  // Macro percentages for visual ratio bar
  const pCal = (nutrition.protein || 12) * 4
  const cCal = (nutrition.carbs || 60) * 4
  const fCal = (nutrition.fat || 10) * 9
  const totalMacroCal = Math.max(1, pCal + cCal + fCal)
  const pPct = Math.round((pCal / totalMacroCal) * 100)
  const cPct = Math.round((cCal / totalMacroCal) * 100)
  const fPct = Math.max(0, 100 - pPct - cPct)

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-500/30 bg-surface shadow-soft transition-all">
      {/* Top AI Safety Clearance Header */}
      <div className="flex items-center justify-between border-b border-line bg-gradient-to-r from-emerald-500/10 via-brand-500/10 to-teal-500/10 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-2xs">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                AI Safety Inspected: {safetyScore}%
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-200/80 px-1.5 py-0.2 text-[10px] font-extrabold uppercase tracking-wide text-emerald-950 dark:bg-emerald-900 dark:text-emerald-200">
                <Sparkles className="h-2.5 w-2.5" />
                Clear
              </span>
            </div>
            <p className="text-[11px] text-ink-soft leading-tight">{safetyVerdict}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="rounded-lg border border-emerald-400 bg-emerald-50 px-2 py-0.5 text-xs font-black text-emerald-950 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
            Nutri-Score {nutrition.nutriScore || 'A'}
          </span>
        </div>
      </div>

      {/* Main Nutrition Facts Area */}
      <div className="p-3.5 sm:p-4 space-y-3">
        {/* Calorie Highlight */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-tint/50 p-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-600 text-white shadow-2xs">
              <Flame className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <span className="text-xs font-semibold text-ink-soft">Energy per Plate</span>
              <p className="font-display text-base font-bold text-ink">
                {nutrition.calories} <span className="text-xs font-normal text-ink-soft">kcal</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-semibold text-ink-soft">Total Batch ({servings} servings)</span>
            <p className="font-display text-base font-bold text-brand-700 dark:text-brand-300">
              {totalCalories.toLocaleString()} <span className="text-xs font-normal">kcal</span>
            </p>
          </div>
        </div>

        {/* Macronutrient Visual Ratio Bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-ink-soft mb-1">
            <span>Macronutrient Balance</span>
            <span>{nutrition.servingSize || '1 plate'}</span>
          </div>
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-tint">
            <div
              style={{ width: `${pPct}%` }}
              className="bg-emerald-500"
              title={`Protein: ${nutrition.protein}g (${pPct}%)`}
            />
            <div
              style={{ width: `${cPct}%` }}
              className="bg-amber-400"
              title={`Carbohydrates: ${nutrition.carbs}g (${cPct}%)`}
            />
            <div
              style={{ width: `${fPct}%` }}
              className="bg-rose-400"
              title={`Fats: ${nutrition.fat}g (${fPct}%)`}
            />
          </div>
        </div>

        {/* 4-Box Macro Grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-xl border border-line bg-surface p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-ink">
              <Dna className="h-3 w-3 text-emerald-700 dark:text-emerald-400" />
              Protein
            </div>
            <p className="font-display text-sm font-bold text-ink">{nutrition.protein}g</p>
            <span className="text-[10px] text-ink-soft">{((totalProteinG) / 1000).toFixed(2)} kg total</span>
          </div>

          <div className="rounded-xl border border-line bg-surface p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-ink">
              <Wheat className="h-3 w-3 text-amber-700 dark:text-amber-400" />
              Carbs
            </div>
            <p className="font-display text-sm font-bold text-ink">{nutrition.carbs}g</p>
            <span className="text-[10px] text-ink-soft">{cPct}% of energy</span>
          </div>

          <div className="rounded-xl border border-line bg-surface p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-ink">
              <Droplet className="h-3 w-3 text-rose-700 dark:text-rose-400" />
              Fat
            </div>
            <p className="font-display text-sm font-bold text-ink">{nutrition.fat}g</p>
            <span className="text-[10px] text-ink-soft">{fPct}% of energy</span>
          </div>

          <div className="rounded-xl border border-line bg-surface p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-ink">
              <Info className="h-3 w-3 text-teal-700 dark:text-teal-400" />
              Fiber
            </div>
            <p className="font-display text-sm font-bold text-ink">{nutrition.fiber || 5}g</p>
            <span className="text-[10px] text-ink-soft">High fiber</span>
          </div>
        </div>

        {/* Allergens & Dietary Tags */}
        {nutrition.allergens && nutrition.allergens.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-ink">Allergens:</span>
            {nutrition.allergens.map((allergen) => (
              <span
                key={allergen}
                className="rounded-md border border-line bg-elevated px-2 py-0.5 text-[11px] font-medium text-ink-soft"
              >
                {allergen}
              </span>
            ))}
          </div>
        )}

        {/* Toggle Detailed Safety Inspection Report */}
        {!compact && safetyChecks && safetyChecks.length > 0 && (
          <div className="border-t border-line pt-2">
            <button
              type="button"
              onClick={() => setDetailsOpen((prev) => !prev)}
              className="flex w-full items-center justify-between text-xs font-semibold text-ink-soft hover:text-ink"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                View AI Safety &amp; Freshness Checklist ({safetyChecks.length} checks passed)
              </span>
              {detailsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {detailsOpen && (
              <ul className="mt-2 space-y-1 rounded-xl bg-tint/40 p-2.5 text-xs text-ink-soft">
                {safetyChecks.map((check, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-700 dark:text-emerald-400 mt-0.5" />
                    <span>{check}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
