import { useState } from 'react'
import { Siren } from 'lucide-react'
import { EMERGENCY_HAZARDS, useEmergency } from '../context/EmergencyContext'

const STATES = ['Punjab', 'Haryana', 'Delhi', 'Himachal Pradesh', 'Uttarakhand']

export default function EmergencySimulator({ embedded = false, collapsed = false }) {
  const { simulatorVisible, simulate, clear, alert } = useEmergency()
  const [state, setState] = useState('Punjab')
  const [hazardType, setHazardType] = useState('flood')
  if (!simulatorVisible) return null

  if (embedded && collapsed) {
    return (
      <div className="mt-3 flex justify-center" title="Emergency simulator">
        <Siren className="h-5 w-5 text-warning-600" aria-label="Emergency simulator" />
      </div>
    )
  }

  return (
    <aside className={embedded ? 'mt-3 rounded-2xl border border-warning-200 bg-surface p-3 shadow-soft dark:border-warning-800 dark:bg-surface' : 'fixed bottom-4 right-4 z-[1800] w-[min(92vw,320px)] rounded-2xl border border-warning-200 bg-surface/95 p-3 shadow-lift backdrop-blur dark:border-warning-800'}>
      <div className="flex items-center gap-2 text-sm font-bold text-ink">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning-100 text-warning-700 dark:bg-warning-900/50 dark:text-warning-200">
          <Siren className="h-4 w-4" aria-hidden="true" />
        </span>
        Emergency simulator
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">Simulated emergency only. It never replaces official alerts.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="text-[11px] font-semibold text-ink-soft">
          State
          <select className="mt-1 min-h-11 w-full rounded-lg border border-line bg-elevated px-2 text-xs text-ink" value={state} onChange={(event) => setState(event.target.value)}>
            {STATES.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="text-[11px] font-semibold text-ink-soft">
          Hazard
          <select className="mt-1 min-h-11 w-full rounded-lg border border-line bg-elevated px-2 text-xs text-ink" value={hazardType} onChange={(event) => setHazardType(event.target.value)}>
            {EMERGENCY_HAZARDS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" className="min-h-11 flex-1 rounded-xl bg-warning-500 px-3 text-xs font-bold text-warning-950" onClick={() => simulate({ state, hazardType })}>
          {alert ? 'Restart simulation' : 'Simulate emergency'}
        </button>
        {alert && <button type="button" className="min-h-11 rounded-xl border border-line px-3 text-xs font-bold text-ink" onClick={clear}>Clear</button>}
      </div>
    </aside>
  )
}
