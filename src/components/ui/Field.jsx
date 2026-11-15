// FRESH:FILE  Labeled input/select primitive with 44px min height, mint focus ring, and inline error icon.
// FRESH:AREA  Layout

import { AlertCircle } from 'lucide-react'

/**
 * Shared control surface: 44px minimum height, 10px radius, 1px hairline border,
 * and a mint focus ring that turns red when the field has an error.
 */
export function controlClass(error) {
  return [
    'min-h-11 w-full rounded-[10px] border px-3.5 py-2.5 text-sm shadow-sm transition duration-150',
    'bg-surface text-ink placeholder:text-ink-muted/70 dark:bg-[#0B2219] dark:text-[#F2F7F4] dark:placeholder:text-[#A9BBB2]/60',
    'focus:outline-none disabled:cursor-not-allowed disabled:opacity-60',
    error
      ? 'border-danger-400 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/25'
      : 'border-line dark:border-white/15 hover:border-line-strong dark:hover:border-white/30 focus:border-[#3EE6B8] focus:ring-2 focus:ring-[#3EE6B8]/30',
  ].join(' ')
}

export default function Field({
  id,
  label,
  error,
  hint,
  required = false,
  className = '',
  controlClassName = '',
  as = 'input',
  type = 'text',
  rows,
  children,
  ...props
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  const shared = {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    className: `${controlClass(error)} ${controlClassName}`.trim(),
  }

  let control
  if (as === 'select') {
    control = (
      <select {...shared} {...props}>
        {children}
      </select>
    )
  } else if (as === 'textarea') {
    control = (
      <textarea {...shared} rows={rows} {...props}>
        {children}
      </textarea>
    )
  } else if (children) {
    control = children
  } else {
    control = <input {...shared} type={type} {...props} />
  }

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink dark:text-[#F2F7F4]">
        {label}
        {required && (
          <span className="ml-0.5 text-danger-600 dark:text-danger-400" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {control}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-danger-600 dark:text-danger-400"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-muted dark:text-[#A9BBB2]">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
