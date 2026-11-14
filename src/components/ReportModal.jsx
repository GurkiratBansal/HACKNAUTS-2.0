import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Button from './ui/Button'
import Field from './ui/Field'
import Modal from './ui/Modal'

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
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="report-title"
      size="md"
      closeLabel="Close report form"
    >
      <div className="flex items-start gap-3 border-b border-line p-5 pr-14">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger-50 text-danger-700 dark:bg-danger-900/30 dark:text-danger-200">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id="report-title" className="font-display text-lg font-bold text-ink">
            Report unsafe food
          </h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            {foodName ? `About “${foodName}”` : 'Flag this listing for review.'}
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4 p-5">
        <Field
          as="select"
          id="report-reason"
          label="Reason"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value)
            setError('')
          }}
          error={error}
          required
        >
          <option value="">Select a reason</option>
          {REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Field>

        <Field
          as="textarea"
          id="report-comment"
          label="Comment (optional)"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you observe? Do not include personal medical information."
        />

        <p className="rounded-xl border border-line bg-elevated p-3 text-xs leading-relaxed text-ink-muted">
          Reports are reviewed by the FRESH safety team in a real deployment. In
          this demo, reports are stored locally and shown to the donor.
        </p>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="danger">
            Submit report
          </Button>
        </div>
      </form>
    </Modal>
  )
}
