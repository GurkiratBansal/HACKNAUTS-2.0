// FRESH:FILE  Modal where the donor accepts the food-safety declaration before publishing (exact text preserved).
// FRESH:AREA  Donations

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
      <div className="flex items-start gap-3 border-b border-line p-5 pr-14 dark:border-white/10">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-[#3EE6B8] dark:border-emerald-700">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id="declaration-title" className="font-display text-lg font-bold text-ink dark:text-[#F2F7F4]">
            Food Donation Declaration
          </h2>
          <p className="mt-0.5 text-xs text-ink-muted dark:text-[#A9BBB2]">
            Required before publishing {foodName ? `“${foodName}”` : 'this listing'}.
          </p>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <label className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-line bg-elevated p-4 transition hover:border-[#3EE6B8]/40 dark:border-white/10 dark:bg-[#06130F]">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded-[4px] border-line-strong accent-[#3EE6B8] focus:ring-[#3EE6B8]"
          />
          <span className="text-xs sm:text-sm leading-relaxed text-ink-soft dark:text-[#A9BBB2]">
            I confirm the information is accurate and the food was prepared and
            handled responsibly. The receiving organization will independently
            inspect it. FRESH is a technology connector and does not prepare,
            store, transport or inspect food.
          </span>
        </label>

        <p className="rounded-[10px] border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/20 dark:text-amber-200">
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
