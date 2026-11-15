// FRESH:FILE  Styled button/link primitive with variants and loading state.
// FRESH:AREA  Layout

import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary:
    'bg-saffron-500 text-brand-950 shadow-glow hover:bg-saffron-400 focus-visible:outline-brand-500',
  secondary:
    'bg-brand-600 text-white shadow-soft hover:bg-brand-700 focus-visible:outline-brand-500',
  outline:
    'border border-brand-600 bg-surface/70 text-brand-700 hover:bg-brand-50 dark:border-brand-400 dark:text-brand-200 dark:hover:bg-brand-900/40',
  ghost:
    'text-ink-soft hover:bg-elevated hover:text-ink focus-visible:outline-brand-500',
  ghostDanger:
    'text-danger-700 hover:bg-danger-50 dark:text-danger-300 dark:hover:bg-danger-900/30 focus-visible:outline-danger-500',
  onDark:
    'border border-white/30 bg-white/5 text-white hover:bg-white/10 focus-visible:outline-white',
  danger:
    'bg-danger-600 text-white shadow-soft hover:bg-danger-700 focus-visible:outline-danger-500',
  'outline-danger':
    'border border-danger-200 bg-danger-50 text-danger-700 hover:bg-danger-100 dark:border-danger-800 dark:bg-danger-900/30 dark:text-danger-200 dark:hover:bg-danger-900/50',
}

const SIZES = {
  sm: 'h-10 gap-1.5 rounded-lg px-3 text-xs',
  md: 'h-11 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-12 gap-2 rounded-xl px-5 text-sm',
}

/**
 * One button language across the app: saffron primary, emerald secondary,
 * outlined/ghost utilities. Links and anchors share the same styling.
 */
export default function Button({
  children,
  to,
  href,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  const Tag = to ? Link : href ? 'a' : 'button'
  const isDisabled = disabled || loading
  const isButton = Tag === 'button'

  return (
    <Tag
      {...(to ? { to } : {})}
      {...(href ? { href } : {})}
      {...(isButton ? { type, disabled: isDisabled } : {})}
      aria-busy={loading || undefined}
      aria-disabled={!isButton && isDisabled ? true : undefined}
      className={`inline-flex shrink-0 items-center justify-center font-bold transition duration-150 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : Icon ? (
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      ) : null}
      {children}
      {IconRight && !loading ? (
        <IconRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      ) : null}
    </Tag>
  )
}
