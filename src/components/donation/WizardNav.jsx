import { ArrowLeft, ArrowRight, Upload } from 'lucide-react'
import Button from '../ui/Button'

export default function WizardNav({ step, onBack }) {
  return (
    <div className="mt-6 border-t border-line pt-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-2">
          {step > 0 ? (
            <Button type="button" variant="outline" icon={ArrowLeft} onClick={onBack}>
              Back
            </Button>
          ) : (
            <Button to="/donor" variant="ghost">
              Cancel
            </Button>
          )}
          <span className="text-xs font-semibold text-ink-muted sm:hidden">
            Step {step + 1} of 4
          </span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <span className="hidden text-xs font-semibold text-ink-muted sm:block">
            Step {step + 1} of 4
          </span>
          {step < 3 ? (
            <Button type="submit" iconRight={ArrowRight} className="w-full sm:w-auto">
              Continue
            </Button>
          ) : (
            <Button type="submit" icon={Upload} className="w-full sm:w-auto">
              Review &amp; publish
            </Button>
          )}
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-ink-muted">
        {step < 3
          ? 'Your details are kept as you move between steps.'
          : 'You will confirm the Food Donation Declaration before publishing.'}
      </p>
    </div>
  )
}
