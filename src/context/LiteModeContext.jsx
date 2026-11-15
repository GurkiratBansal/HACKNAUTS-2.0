// FRESH:FILE  Lite-mode toggle: persists in localStorage and toggles the fresh-lite-mode class on <html> to reduce imagery and animation.
// FRESH:AREA  Layout

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const KEY = 'fresh.v1.lite-mode'
const LiteModeContext = createContext(null)

// FRESH:Layout  Reads the persisted lite-mode preference.
function readInitial() {
  try { return localStorage.getItem(KEY) === 'on' } catch { return false }
}

// FRESH:Layout  Owns lite-mode state and applies/removes the CSS class.
export function LiteModeProvider({ children }) {
  const [liteMode, setLiteMode] = useState(readInitial)

  useEffect(() => {
    document.documentElement.classList.toggle('fresh-lite-mode', liteMode)
    try { localStorage.setItem(KEY, liteMode ? 'on' : 'off') } catch { /* optional */ }
    return () => document.documentElement.classList.remove('fresh-lite-mode')
  }, [liteMode])

  const value = useMemo(() => ({ liteMode, toggleLiteMode: () => setLiteMode((value) => !value) }), [liteMode])
  return <LiteModeContext.Provider value={value}>{children}</LiteModeContext.Provider>
}

// FRESH:Layout  Hook: read lite-mode and toggle it.
export function useLiteMode() {
  const context = useContext(LiteModeContext)
  if (!context) throw new Error('useLiteMode must be used inside LiteModeProvider')
  return context
}
