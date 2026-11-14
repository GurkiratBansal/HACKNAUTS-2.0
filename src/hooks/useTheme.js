import { useEffect, useState } from 'react'

const THEME_KEY = 'fresh_theme_v1'

/**
 * Small, self-contained appearance preference. It never touches app data.
 * The inline script in index.html applies the stored class before paint.
 */
export function useTheme() {
  const [theme, setTheme] = useState(() =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light',
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // Theme persistence is a nice-to-have; the UI still works without it.
    }
  }, [theme])

  return {
    theme,
    isDark: theme === 'dark',
    toggle: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
  }
}
