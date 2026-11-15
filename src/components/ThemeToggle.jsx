// FRESH:FILE  Button toggling dark/light theme.
// FRESH:AREA  Layout

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggle } = useTheme()

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`fresh-theme-toggle inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition hover:bg-elevated hover:text-ink active:scale-95 focus-visible:outline-brand-500 ${className}`}
    >
      {isDark ? (
        <Sun className="fresh-theme-icon fresh-theme-icon--sun h-[18px] w-[18px]" aria-hidden="true" />
      ) : (
        <Moon className="fresh-theme-icon fresh-theme-icon--moon h-[18px] w-[18px]" aria-hidden="true" />
      )}
    </button>
  )
}
