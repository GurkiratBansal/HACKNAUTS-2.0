// FRESH:FILE  Small tag marking a listing as emergency-relief relevant.
// FRESH:AREA  Emergency

import { HeartPulse } from 'lucide-react'

export default function ReliefTag({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border border-warning-300 bg-warning-50 px-2 py-1 text-[10px] font-bold text-warning-900 dark:border-warning-700 dark:bg-warning-900/30 dark:text-warning-100 ${className}`}>
      <HeartPulse className="h-3 w-3" aria-hidden="true" />
      Relief
    </span>
  )
}
