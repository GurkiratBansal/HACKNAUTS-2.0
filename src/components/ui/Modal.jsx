// FRESH:FILE  Accessible dialog primitive with 12px radius, hairline borders, and focus trap.
// FRESH:AREA  Layout

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

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined

    const previouslyFocused = document.activeElement
    const dialog = dialogRef.current
    const focusables = () =>
      Array.from(dialog?.querySelectorAll(FOCUSABLE) || [])

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
      className="fixed inset-0 z-[1300] flex items-center justify-center overflow-y-auto p-3 sm:p-6"
      role="presentation"
    >
      <div
        className="fixed inset-0 animate-fade-in bg-[#06130F]/70 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`relative z-10 my-auto flex flex-col max-h-[86vh] w-full animate-scale-in overflow-hidden rounded-[12px] border border-line bg-surface shadow-2xl focus:outline-none dark:border-white/15 dark:bg-[#0B2219] ${SIZES[size] || SIZES.md}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-line text-ink-muted transition hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3EE6B8] active:scale-95 dark:border-white/10 dark:text-[#A9BBB2] dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>
  )
}
