// FRESH:FILE  Labeled input/select primitive with error text.
// FRESH:AREA  Layout

import { AlertCircle } from 'lucide-react'

/**
 * Shared control surface: 44px minimum height, soft border and an emerald
 * focus ring that turns red when the field has an error.
 */
export function controlClass(error) {
  return [
    'min-h-11 w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink shadow-sm transition',
    'placeholder:text-ink-muted/70 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60',
    error
      ? 'border-danger-400 focus:border-danger-500 focus:ring-danger-500/25'
      : 'border-line-strong hover:border-line-strong focus:border-brand-500 focus:ring-brand-500/25',
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
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
        {required && (
          <span className="ml-0.5 text-danger-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {control}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 text-[13px] font-medium text-danger-600 dark:text-danger-400"
        >
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
