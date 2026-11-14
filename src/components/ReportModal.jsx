import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

const REASONS = [
  'Temperature concern',
  'Packaging damaged or open',
  'Past a safe time window',
  'Allergen not disclosed',
  'Photo or description looks misleading',
  'Other safety concern',
]

export default function ReportModal({ open, onClose, onSubmit, foodName }) {
  const [reason, setReason] = useState('')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) {
      setReason('')
      setComment('')
      setError('')
    }
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

  const submit = (e) => {
    e.preventDefault()
    if (!reason) {
      setError('Choose a reason so the safety team can triage this report.')
      return
    }
    onSubmit({ reason, comment: comment.trim() })
  }

  return (
    <div className="fixed inset-0 z-[1300] flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="report-title" className="text-lg font-bold text-slate-900">
                Report unsafe food
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {foodName ? `About “${foodName}”` : 'Flag this listing for review.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Close report form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5">
          <div>
            <label htmlFor="report-reason" className="mb-1 block text-sm font-semibold text-slate-700">
              Reason <span className="text-red-600">*</span>
            </label>
            <select
              id="report-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setError('')
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="">Select a reason</option>
              {REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
          </div>

          <div>
            <label htmlFor="report-comment" className="mb-1 block text-sm font-semibold text-slate-700">
              Comment <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="report-comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you observe? Do not include personal medical information."
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <p className="rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
            Reports are reviewed by the FRESH safety team in a real deployment.
            In this demo, reports are stored locally and shown to the donor.
          </p>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              Submit report
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
