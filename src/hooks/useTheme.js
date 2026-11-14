import { useEffect, useState } from 'react'

const THEME_KEY = 'fresh_theme_v1'

let currentTheme =
  typeof document !== 'undefined' &&
  document.documentElement.classList.contains('dark')
    ? 'dark'
    : 'light'
const listeners = new Set()

function applyTheme(next) {
  currentTheme = next
  document.documentElement.classList.toggle('dark', next === 'dark')
  document.body.classList.remove('fresh-theme-transition')
  // Force a new animation cycle when the user changes appearance.
  void document.body.offsetWidth
  document.body.classList.add('fresh-theme-transition')
  window.setTimeout(() => {
    document.body.classList.remove('fresh-theme-transition')
  }, 650)
  try {
    localStorage.setItem(THEME_KEY, next)
  } catch {
    // Theme persistence is a nice-to-have; the UI still works without it.
  }
  listeners.forEach((listener) => listener())
}

/**
 * Shared appearance preference. Any toggle updates every mounted control
 * without involving app state or touching the donation data flow.
 */
export function useTheme() {
  const [theme, setTheme] = useState(currentTheme)

  useEffect(() => {
    const listener = () => setTheme(currentTheme)
    listeners.add(listener)
    listener()
    return () => listeners.delete(listener)
  }, [])

  return {
    theme,
    isDark: theme === 'dark',
    toggle: () => applyTheme(currentTheme === 'dark' ? 'light' : 'dark'),
  }
}
