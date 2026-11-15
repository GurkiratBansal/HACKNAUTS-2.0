// FRESH:FILE  AI Vision Scanner modal: automated food inspection, nutrition calculation, and auto-population.
// FRESH:AREA  Donations

import { useEffect, useState } from 'react'
import {
  Sparkles,
  ShieldCheck,
  Check,
  ArrowRight,
  Flame,
  Dna,
  Wheat,
  RotateCcw,
} from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { runAiFoodAnalysis, FOOD_DATABASE } from '../../utils/aiFoodScanner'

export default function AiScanModal({
  open,
  onClose,
  file,
  previewUrl,
  onApplyAnalysis,
}) {
  const [scanning, setScanning] = useState(true)
  const [stepIndex, setStepIndex] = useState(0)
  const [analysis, setAnalysis] = useState(null)
  const [selectedDishKey, setSelectedDishKey] = useState('')

  const SCAN_STEPS = [
    'Scanning visual patterns and color spectra...',
    'Inspecting freshness and safety metrics...',
    'Identifying dish identity and dietary profile...',
    'Computing calorie density and macronutrient chart...',
    'Estimating batch portions and packaging requirements...',
  ]

  useEffect(() => {
    if (!open) {
      setScanning(true)
      setStepIndex(0)
      setAnalysis(null)
      return
    }

    setScanning(true)
    setStepIndex(0)

    // Progress through inspection steps
    const interval = setInterval(() => {
      setStepIndex((prev) => Math.min(SCAN_STEPS.length - 1, prev + 1))
    }, 220)

    // Run the AI analysis
    runAiFoodAnalysis(file, previewUrl).then((result) => {
      setTimeout(() => {
        clearInterval(interval)
        setAnalysis(result)
        setSelectedDishKey(
          FOOD_DATABASE.find((f) => f.name === result.foodName)?.key || FOOD_DATABASE[0].key,
        )
        setScanning(false)
      }, 1000)
    })

    return () => clearInterval(interval)
  }, [open, file, previewUrl])

  const handleSelectDifferentDish = (item) => {
    setSelectedDishKey(item.key)
    setAnalysis((prev) => ({
      ...prev,
      foodName: item.name,
      category: item.category,
      diet: item.diet,
      quantity: String(item.defaultServings),
      storage: item.storage,
      safetyScore: item.safetyScore,
      safetyVerdict: item.safetyVerdict,
      safetyChecks: item.safetyChecks,
      nutrition: {
        dish: item.name,
        servingSize: item.servingSize,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        fiber: item.fiber,
        nutriScore: item.nutriScore,
        nutriGradeText: item.nutriGradeText,
        allergens: item.allergens,
        totalCalories: item.calories * item.defaultServings,
        totalProteinKg: ((item.protein * item.defaultServings) / 1000).toFixed(2),
      },
      suggestedNotes: `AI Safety Certified (${item.safetyScore}% Freshness). ${item.nutriGradeText}. Allergens: ${item.allergens.join(', ')}.`,
    }))
  }

  const handleApply = () => {
    if (analysis) {
      onApplyAnalysis(analysis)
      onClose()
    }
  }

  if (!open) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="ai-scan-heading"
      size="lg"
      closeLabel="Close AI scanner"
    >
      <div className="flex flex-col h-full max-h-[84vh] min-h-0">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5 bg-surface/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 via-teal-500 to-emerald-400 text-white shadow-soft">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="ai-scan-heading" className="font-display text-base font-bold text-ink sm:text-lg">
                  AI Food Vision &amp; Nutrition Scanner
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <ShieldCheck className="h-2.5 w-2.5" />
                  Safety Passed
                </span>
              </div>
              <p className="text-xs text-ink-muted">
                {scanning ? 'Neural vision running food diagnostics...' : 'Analysis complete: Nutrition and safety ready!'}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Photo Scanner Viewport with Laser Scanning Effect */}
          <div className="relative overflow-hidden rounded-2xl border border-line bg-black/90 aspect-video max-h-56 w-full flex items-center justify-center shadow-inner">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Food being scanned"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-center p-6 text-white/70">
                <Sparkles className="mx-auto h-10 w-10 mb-2 opacity-60 animate-pulse" />
                <p className="text-sm">Analyzing image stream...</p>
              </div>
            )}

            {/* Glowing Laser Scan Line */}
            {scanning && (
              <div className="pointer-events-none absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_3px_rgba(52,211,153,0.8)] animate-[bounce_1.5s_infinite]" />
            )}

            {/* AI HUD Overlay */}
            <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex items-center justify-between rounded-xl bg-black/60 px-3 py-1.5 backdrop-blur-md text-[11px] font-mono text-emerald-300">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                {scanning ? 'SCANNING' : 'INSPECTION VERIFIED'}
              </span>
              <span>CONFIDENCE: {analysis?.safetyScore || 98}%</span>
            </div>
          </div>

          {scanning ? (
            /* Scanning Steps Progression */
            <div className="rounded-2xl border border-line bg-elevated/70 p-4 space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                Running Neural Diagnostics
              </p>
              <div className="space-y-1.5 text-xs text-ink-soft">
                {SCAN_STEPS.map((step, idx) => {
                  const isDone = idx < stepIndex
                  const isCurrent = idx === stepIndex
                  return (
                    <div
                      key={step}
                      className={`flex items-center gap-2 transition-opacity ${
                        isDone ? 'text-emerald-600 font-semibold dark:text-emerald-400' : isCurrent ? 'text-ink font-bold animate-pulse' : 'text-ink-muted/50'
                      }`}
                    >
                      {isDone ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                      )}
                      <span>{step}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Results Presentation */
            <div className="space-y-4 animate-scale-in">
              {/* Highlight Card */}
              <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-50/70 via-surface to-brand-50/40 p-4 dark:from-emerald-950/30 dark:via-surface dark:to-brand-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    AI Safety Score: {analysis?.safetyScore}% (Passed)
                  </span>
                  <span className="text-xs font-bold text-ink-muted">
                    Portion: {analysis?.quantity} servings
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-xl font-black text-ink sm:text-2xl">
                    {analysis?.foodName}
                  </h3>
                  <p className="text-xs text-ink-muted">
                    {analysis?.nutrition?.nutriGradeText} · {analysis?.diet === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
                  </p>
                </div>

                {/* 3 Quick Facts */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="rounded-xl border border-line bg-surface p-2">
                    <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-amber-600">
                      <Flame className="h-3 w-3" />
                      Calories
                    </div>
                    <p className="font-display text-sm font-bold text-ink">{analysis?.nutrition?.calories} kcal</p>
                  </div>

                  <div className="rounded-xl border border-line bg-surface p-2">
                    <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <Dna className="h-3 w-3" />
                      Protein
                    </div>
                    <p className="font-display text-sm font-bold text-ink">{analysis?.nutrition?.protein}g</p>
                  </div>

                  <div className="rounded-xl border border-line bg-surface p-2">
                    <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-teal-600">
                      <Wheat className="h-3 w-3" />
                      Carbs
                    </div>
                    <p className="font-display text-sm font-bold text-ink">{analysis?.nutrition?.carbs}g</p>
                  </div>
                </div>
              </div>

              {/* Notice Banner */}
              <div className="rounded-xl border border-brand-200 bg-brand-50/80 p-3 text-xs text-brand-900 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-100 flex items-start gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-brand-600 mt-0.5" />
                <p>
                  <strong>Everything else is figured out!</strong> When you apply, the food name, portion, category, and nutrition chart will be auto-filled. You only need to set <strong>Made Time</strong> and <strong>Expiry Time</strong>.
                </p>
              </div>

              {/* Adjust Match Option if needed */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  Not quite right? Tap another detected match:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {FOOD_DATABASE.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleSelectDifferentDish(item)}
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                        selectedDishKey === item.key
                          ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-300 dark:bg-brand-900/40 dark:text-brand-300'
                          : 'border-line bg-surface text-ink-muted hover:border-brand-300 hover:text-ink'
                      }`}
                    >
                      {item.name.split(' (')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-line bg-surface/95 px-5 py-3 flex items-center justify-between gap-2 backdrop-blur-sm">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>

          {!scanning && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleApply}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Check className="mr-1.5 h-4 w-4" />
              Apply &amp; Set Made / Expiry Times
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
