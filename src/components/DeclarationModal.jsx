import { useEffect, useState } from 'react'
import { ShieldCheck, X } from 'lucide-react'

export default function DeclarationModal({ open, onClose, onConfirm, foodName }) {
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!open) setChecked(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[1300] flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="declaration-title"
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="declaration-title" className="text-lg font-bold text-slate-900">
                Food Donation Declaration
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Required before publishing {foodName ? `“${foodName}”` : 'this listing'}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Close declaration"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm leading-relaxed text-slate-700">
              I confirm the information is accurate and the food was prepared
              and handled responsibly. The receiving organization will
              independently inspect it. FRESH is a technology connector and does
              not prepare, store, transport or inspect food.
            </span>
          </label>

          <p className="text-xs leading-relaxed text-slate-500">
            Urgency is guidance only. Final food safety verification rests with
            the donor and the receiving NGO. Never list food you would not serve
            to your own family.
          </p>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!checked}
              onClick={onConfirm}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              Confirm &amp; publish donation
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
