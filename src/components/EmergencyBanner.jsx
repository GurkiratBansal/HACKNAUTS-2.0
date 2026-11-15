// FRESH:FILE  Top banner shown only when an active alert matches the user's state; includes the concern report form.
// FRESH:AREA  Emergency

import { AlertTriangle, Clock3, ShieldAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useUserLocation } from '../context/LocationContext'
import { useEmergency } from '../context/EmergencyContext'

const HAZARDS = {
  flood: 'Flood',
  cyclone: 'Cyclone',
  earthquake: 'Earthquake',
  heatwave: 'Heatwave',
  landslide: 'Landslide',
  other: 'Emergency alert',
}

function formatTime(value) {
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function EmergencyBanner() {
  const { place } = useUserLocation()
  const { activeAlert, reportConcern, clear } = useEmergency()
  const [formOpen, setFormOpen] = useState(false)
  const [reason, setReason] = useState('Road access')
  const [comment, setComment] = useState('')
  const [reported, setReported] = useState(false)
  const alert = activeAlert(place)
  const [announcedId, setAnnouncedId] = useState(null)

  useEffect(() => {
    if (alert) setAnnouncedId(alert.id)
  }, [alert])

  if (!alert) return null

  return (
    <section
      role="alert"
      aria-live={announcedId === alert.id ? 'off' : 'assertive'}
      className="border-b border-warning-300 bg-warning-50 px-4 py-3 text-warning-950 dark:border-warning-800 dark:bg-warning-950/60 dark:text-warning-50 sm:px-6"
    >
      <div className="mx-auto flex max-w-7xl items-start gap-3 lg:items-center">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning-200 text-warning-900 dark:bg-warning-900/70 dark:text-warning-100" aria-hidden="true">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 text-xs leading-relaxed">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-extrabold">
            <span>Emergency mode: {HAZARDS[alert.hazardType] || 'Emergency alert'}</span>
            <span className="rounded-full border border-warning-400 px-2 py-0.5 text-[10px] uppercase tracking-wide">{alert.source === 'SIMULATED' ? 'Simulated' : 'SACHET'}</span>
            <span>{alert.state}</span>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
            <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" />Issued {formatTime(alert.issuedAt)}</span>
            <span>Expires {formatTime(alert.expiresAt)}</span>
          </p>
          <p className="mt-1.5 font-semibold">In danger, call 112. FRESH does not replace official emergency services. Follow instructions from your State Disaster Management Authority.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" className="min-h-11 rounded-xl border border-warning-400 px-3 text-xs font-bold" onClick={() => setFormOpen((value) => !value)}>
              Report a concern
            </button>
            {alert.source === 'SIMULATED' && (
              <button type="button" className="min-h-11 rounded-xl border border-warning-400 bg-warning-200/50 px-3 text-xs font-bold text-warning-950 dark:bg-warning-900/40 dark:text-warning-100" onClick={clear}>
                Dismiss simulation
              </button>
            )}
          </div>
          {formOpen && !reported && (
            <form className="mt-2 grid gap-2 sm:grid-cols-[170px_1fr_auto]" onSubmit={(event) => { event.preventDefault(); reportConcern({ reason, comment }); setReported(true) }}>
              <label className="sr-only" htmlFor="emergency-concern-reason">Concern reason</label>
              <select id="emergency-concern-reason" className="min-h-11 rounded-xl border border-warning-400 bg-surface px-2 text-xs text-ink" value={reason} onChange={(event) => setReason(event.target.value)}>
                <option>Road access</option><option>Incorrect alert</option><option>Other</option>
              </select>
              <label className="sr-only" htmlFor="emergency-concern-comment">Concern comment</label>
              <input id="emergency-concern-comment" className="min-h-11 rounded-xl border border-warning-400 bg-surface px-3 text-xs text-ink" required value={comment} onChange={(event) => setComment(event.target.value)} placeholder="What should we know?" />
              <button type="submit" className="min-h-11 rounded-xl bg-warning-600 px-3 text-xs font-bold text-white">Send report</button>
            </form>
          )}
          {reported && <p className="mt-2 text-xs font-semibold">Concern recorded locally. It does not change emergency mode.</p>}
        </div>
        <ShieldAlert className="hidden h-5 w-5 shrink-0 text-warning-700 dark:text-warning-300 sm:block" aria-label="Emergency safety notice" />
      </div>
    </section>
  )
}
