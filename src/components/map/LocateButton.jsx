import { LocateFixed } from 'lucide-react'

export default function LocateButton({ onClick, active = false, label = 'Re-center' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-soft transition hover:bg-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
    >
      <LocateFixed className="h-5 w-5" aria-hidden="true" />
    </button>
  )
}
