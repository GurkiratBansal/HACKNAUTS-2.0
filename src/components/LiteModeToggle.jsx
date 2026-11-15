// FRESH:FILE  Button that toggles lite mode (less imagery and animation).
// FRESH:AREA  Layout

import { ImageOff, Image as ImageIcon } from 'lucide-react'
import { useLiteMode } from '../context/LiteModeContext'

export default function LiteModeToggle() {
  const { liteMode, toggleLiteMode } = useLiteMode()
  return (
    <button type="button" onClick={toggleLiteMode} aria-pressed={liteMode} className="fixed bottom-4 left-4 z-[1700] inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface/95 px-3 text-xs font-bold text-ink shadow-soft backdrop-blur focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500">
      {liteMode ? <ImageOff className="h-4 w-4" aria-hidden="true" /> : <ImageIcon className="h-4 w-4" aria-hidden="true" />}
      {liteMode ? 'Lite mode on' : 'Lite mode'}
    </button>
  )
}
