// FRESH:FILE  Shared UI component.
// FRESH:AREA  Layout

import { Globe, MapPin } from 'lucide-react'
import Button from './ui/Button'
import { useUserLocation } from '../context/LocationContext'

export default function IndiaOnlyScreen({ title = 'FRESH is currently available in India only' }) {
  const { openPicker } = useUserLocation()

  return (
    <main className="relative flex min-h-[calc(100dvh-4.5rem)] flex-col items-center justify-center bg-canvas px-4 py-16 text-center sm:px-6">
      <div className="mx-auto max-w-md rounded-3xl border border-line bg-surface p-8 shadow-card">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
          <Globe className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          We detected a location outside India. Surplus food sharing, registration, and live routing on FRESH are restricted to locations within India for now.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button type="button" variant="primary" icon={MapPin} onClick={openPicker}>
            Choose an Indian location
          </Button>
          <Button to="/" variant="outline">
            Back to home
          </Button>
        </div>
      </div>
    </main>
  )
}
