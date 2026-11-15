// FRESH:FILE  Switches the map page between food, partners and combined views.
// FRESH:AREA  Map

import { Building2, UtensilsCrossed } from 'lucide-react'

const OPTIONS = [
  { value: 'ngos', label: 'NGOs', icon: Building2 },
  { value: 'donations', label: 'Food', icon: UtensilsCrossed },
]

export default function MapViewToggle({ value, onChange, className = '' }) {
  return (
    <div
      role="group"
      aria-label="Map layer"
      className={`grid grid-cols-2 gap-1 rounded-xl bg-elevated p-1 ring-1 ring-inset ring-line ${className}`}
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 ${
              active
                ? 'bg-surface text-brand-800 shadow-soft dark:text-brand-200'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
