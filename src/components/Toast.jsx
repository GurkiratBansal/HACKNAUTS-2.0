// FRESH:FILE  Renders transient success/warning/error messages from app state.
// FRESH:AREA  Layout

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'

const STYLES = {
  success: {
    icon: CheckCircle2,
    border: 'border-l-fresh-mint',
    tile: 'bg-fresh-mint/15 text-fresh-mint',
  },
  info: {
    icon: Info,
    border: 'border-l-fresh-teal',
    tile: 'bg-fresh-teal/15 text-fresh-teal',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-l-amber-500',
    tile: 'bg-amber-500/15 text-amber-500 dark:text-amber-400',
  },
  error: {
    icon: XCircle,
    border: 'border-l-red-500',
    tile: 'bg-red-500/15 text-red-500 dark:text-red-400',
  },
}

export default function Toast() {
  const { toasts, removeToast } = useApp()

  return (
    <div
      className="pointer-events-none fixed inset-x-4 top-20 z-[1200] flex flex-col items-end gap-2 sm:left-auto sm:right-4 sm:w-96"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => {
        const style = STYLES[toast.type] || STYLES.success
        const Icon = style.icon
        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex w-full animate-toast-in items-start gap-3 rounded-[12px] border border-l-4 border-fresh-border bg-fresh-light-card p-3.5 shadow-fresh-sm dark:bg-fresh-dark-card ${style.border}`}
          >
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] ${style.tile}`}>
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="flex-1 pt-0.5 text-[13px] font-medium leading-relaxed text-fresh-ink dark:text-fresh-light-bg">
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="rounded-[6px] p-1.5 text-fresh-ink-muted transition hover:bg-black/5 hover:text-fresh-ink dark:hover:bg-white/10 dark:hover:text-fresh-light-bg focus-visible:outline-fresh-mint active:scale-95"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
