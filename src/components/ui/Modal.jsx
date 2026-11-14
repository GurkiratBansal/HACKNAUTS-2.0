import { useEffect } from 'react'
import { X } from 'lucide-react'

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-xl',
  xl: 'max-w-2xl',
}

/**
 * Shell for every dialog: blurred warm overlay, bottom sheet on mobile,
 * centered card on larger screens, Escape to close and scroll lock.
 */
export default function Modal({
  open,
  onClose,
  labelledBy,
  size = 'md',
  closeLabel = 'Close dialog',
  children,
}) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <div
        className="absolute inset-0 animate-fade-in bg-overlay/55 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`relative z-10 max-h-[92vh] w-full animate-scale-in overflow-y-auto rounded-t-3xl border border-line bg-surface shadow-lift sm:rounded-3xl ${SIZES[size] || SIZES.md}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition hover:bg-elevated hover:text-ink focus-visible:outline-brand-500 active:scale-95"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>
  )
}
