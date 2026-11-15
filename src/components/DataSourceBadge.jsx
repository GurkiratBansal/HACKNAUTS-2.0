// FRESH:FILE  DataSourceBadge: explicit sample data demo indicator.
// FRESH:AREA  Layout & Data

import { Database } from 'lucide-react'

export default function DataSourceBadge({
  label = 'Sample data for demo',
  className = '',
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[6px] border border-line bg-elevated px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted dark:border-white/10 dark:bg-[#06130F] dark:text-[#A9BBB2] ${className}`}
    >
      <Database className="h-3 w-3 text-[#3EE6B8]" aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}
