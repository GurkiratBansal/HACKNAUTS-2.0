import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-xl',
  xl: 'max-w-2xl',
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Shell for every dialog: blurred warm overlay, bottom sheet on mobile,
 * centered card on larger screens, Escape to close and scroll lock.
 * Focus moves into the dialog, stays trapped while it is open and returns
 * to the trigger on close.
 */
export default function Modal({
  open,
  onClose,
  labelledBy,
  size = 'md',
  closeLabel = 'Close dialog',
  children,
}) {
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)

  // Keep the latest close handler without restarting the focus effect each
  // time the parent re-renders (the donation page ticks every second).
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined

    const previouslyFocused = document.activeElement
    const dialog = dialogRef.current
    const focusables = () =>
      Array.from(dialog?.querySelectorAll(FOCUSABLE) || [])

    // Move focus into the dialog without scrolling the page behind it.
    const first = focusables()[0]
    ;(first || dialog)?.focus({ preventScroll: true })

    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current?.()
        return
      }
      if (event.key !== 'Tab') return

      const items = focusables()
      if (items.length === 0) {
        event.preventDefault()
        dialog?.focus({ preventScroll: true })
        return
      }

      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      const active = document.activeElement

      if (event.shiftKey) {
        if (active === firstEl || active === dialog || !dialog?.contains(active)) {
          event.preventDefault()
          lastEl.focus()
        }
      } else if (active === lastEl || !dialog?.contains(active)) {
        event.preventDefault()
        firstEl.focus()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus({ preventScroll: true })
      }
    }
  }, [open])

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
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`relative z-10 max-h-[92vh] w-full animate-scale-in overflow-y-auto rounded-t-3xl border border-line bg-surface shadow-lift focus:outline-none sm:rounded-3xl ${SIZES[size] || SIZES.md}`}
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
