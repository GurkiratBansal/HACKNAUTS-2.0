import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'

const STYLES = {
  success: {
    icon: CheckCircle2,
    border: 'border-l-brand-500',
    tile: 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200',
  },
  info: {
    icon: Info,
    border: 'border-l-info-500',
    tile: 'bg-info-50 text-info-700 dark:bg-info-900/30 dark:text-info-200',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-l-warning-500',
    tile: 'bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-200',
  },
  error: {
    icon: XCircle,
    border: 'border-l-danger-500',
    tile: 'bg-danger-50 text-danger-700 dark:bg-danger-900/30 dark:text-danger-200',
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
            className={`pointer-events-auto flex w-full animate-toast-in items-start gap-3 rounded-2xl border border-l-4 border-line bg-surface p-3.5 shadow-card ${style.border}`}
          >
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.tile}`}>
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="flex-1 pt-0.5 text-[13px] font-medium leading-relaxed text-ink-soft">
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="rounded-lg p-1.5 text-ink-muted transition hover:bg-elevated hover:text-ink focus-visible:outline-brand-500 active:scale-95"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
