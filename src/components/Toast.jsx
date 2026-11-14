import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'

const STYLES = {
  success: {
    icon: CheckCircle2,
    ring: 'ring-emerald-200',
    iconColor: 'text-emerald-600',
    bg: 'bg-white',
  },
  info: {
    icon: Info,
    ring: 'ring-sky-200',
    iconColor: 'text-sky-600',
    bg: 'bg-white',
  },
  warning: {
    icon: AlertTriangle,
    ring: 'ring-amber-200',
    iconColor: 'text-amber-600',
    bg: 'bg-white',
  },
  error: {
    icon: XCircle,
    ring: 'ring-red-200',
    iconColor: 'text-red-600',
    bg: 'bg-white',
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
            className={`pointer-events-auto flex w-full items-start gap-3 rounded-xl ${style.bg} p-3.5 shadow-lg ring-1 ${style.ring} animate-toast-in`}
            role="status"
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconColor}`} aria-hidden="true" />
            <p className="flex-1 text-sm font-medium text-slate-700">{toast.message}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
