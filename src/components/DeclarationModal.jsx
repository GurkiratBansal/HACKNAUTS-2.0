import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import Button from './ui/Button'
import Modal from './ui/Modal'

export default function DeclarationModal({ open, onClose, onConfirm, foodName }) {
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!open) setChecked(false)
  }, [open])

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="declaration-title"
      size="lg"
      closeLabel="Close declaration"
    >
      <div className="flex items-start gap-3 border-b border-line p-5 pr-14">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id="declaration-title" className="font-display text-lg font-bold text-ink">
            Food Donation Declaration
          </h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Required before publishing {foodName ? `“${foodName}”` : 'this listing'}.
          </p>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-elevated p-4 transition hover:border-brand-300 dark:hover:border-brand-700">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-line-strong accent-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm leading-relaxed text-ink-soft">
            I confirm the information is accurate and the food was prepared and
            handled responsibly. The receiving organization will independently
            inspect it. FRESH is a technology connector and does not prepare,
            store, transport or inspect food.
          </span>
        </label>

        <p className="rounded-xl border border-warning-200 bg-warning-50 p-3 text-xs leading-relaxed text-warning-900 dark:border-warning-800 dark:bg-warning-900/30 dark:text-warning-100">
          Urgency is guidance only. Final food safety verification rests with
          the donor and the receiving NGO. Never list food you would not serve
          to your own family.
        </p>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!checked}
            onClick={onConfirm}
          >
            Confirm &amp; publish donation
          </Button>
        </div>
      </div>
    </Modal>
  )
}
