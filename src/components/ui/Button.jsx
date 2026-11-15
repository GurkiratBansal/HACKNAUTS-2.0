// FRESH:FILE  Styled button/link primitive: mint-to-teal gradient primary, dark secondary with light border, 8-12px radii.
// FRESH:AREA  Layout

import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary:
    'bg-gradient-to-r from-[#3EE6B8] to-[#19C8D8] text-[#04201A] font-bold shadow-sm hover:brightness-105 active:scale-[0.98] border border-transparent',
  secondary:
    'bg-[#0B2219] text-[#F2F7F4] border border-white/15 hover:bg-[#123427] hover:border-[#3EE6B8]/40 active:scale-[0.98]',
  outline:
    'border border-line bg-surface/80 text-ink hover:bg-elevated dark:border-white/15 dark:bg-[#0B2219]/60 dark:text-[#F2F7F4] dark:hover:bg-white/10 active:scale-[0.98]',
  ghost:
    'text-ink-soft hover:bg-elevated hover:text-ink dark:text-[#A9BBB2] dark:hover:bg-white/5 dark:hover:text-[#F2F7F4] active:scale-[0.98]',
  ghostDanger:
    'text-danger-700 hover:bg-danger-50 dark:text-danger-300 dark:hover:bg-danger-900/30 active:scale-[0.98]',
  onDark:
    'border border-white/20 bg-white/5 text-[#F2F7F4] hover:bg-white/10 active:scale-[0.98]',
  danger:
    'bg-danger-600 text-white shadow-sm hover:bg-danger-700 active:scale-[0.98]',
  'outline-danger':
    'border border-danger-200 bg-danger-50 text-danger-700 hover:bg-danger-100 dark:border-danger-800 dark:bg-danger-900/30 dark:text-danger-200 active:scale-[0.98]',
}

const SIZES = {
  sm: 'min-h-[40px] gap-1.5 rounded-[8px] px-3.5 text-xs',
  md: 'min-h-[44px] gap-2 rounded-[10px] px-4.5 text-sm',
  lg: 'min-h-[48px] gap-2 rounded-[10px] px-6 text-sm',
}

/**
 * One button language across the app: mint-to-teal gradient primary,
 * dark secondary with 1px border, 8-12px rounded rectangles, min 44px targets.
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
      className={`inline-flex shrink-0 items-center justify-center font-bold transition duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3EE6B8] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}
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
