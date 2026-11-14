import { useState } from 'react'
import { HandHeart, Plus, Users } from 'lucide-react'
import { useEmergency } from '../context/EmergencyContext'
import { useUserLocation } from '../context/LocationContext'
import ReliefTag from './ReliefTag'

function remaining(need) {
  return Math.max(0, Number(need.quantity) - Number(need.pledged || 0))
}

export default function NeedsBoard() {
  const { place } = useUserLocation()
  const { activeAlert, needs, pledgeNeed, postNeed } = useEmergency()
  const [open, setOpen] = useState(false)
  const [pledgeFor, setPledgeFor] = useState(null)
  const [amount, setAmount] = useState('')
  const [postOpen, setPostOpen] = useState(false)
  const [message, setMessage] = useState('')
  const alert = activeAlert(place)

  if (!alert) return null

  const sorted = [...needs].sort((a, b) => new Date(a.neededBy) - new Date(b.neededBy))
  const submitPledge = (need) => {
    const result = pledgeNeed(need.id, amount)
    setMessage(result.ok ? 'Pledge recorded.' : result.message)
    if (result.ok) {
      setPledgeFor(null)
      setAmount('')
    }
  }

  return (
    <aside className="pointer-events-auto absolute bottom-4 right-4 z-[1002] w-[min(calc(100vw-2rem),380px)] rounded-2xl border border-warning-300 bg-surface/95 p-4 shadow-lift backdrop-blur">
      <button type="button" className="flex min-h-11 w-full items-center justify-between text-left" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span className="flex items-center gap-2"><HandHeart className="h-5 w-5 text-warning-700" aria-hidden="true" /><span className="font-display text-sm font-bold text-ink">Relief needs</span><ReliefTag /></span>
        <span className="text-xs font-bold text-ink-muted">{open ? 'Hide' : `${sorted.length} open`}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-3" aria-live="polite">
          <p className="text-[11px] text-ink-muted">Sample needs are sorted by deadline. Requester contact details stay hidden until a pledge.</p>
          {sorted.map((need) => {
            const left = remaining(need)
            const percent = Math.min(100, (Number(need.pledged || 0) / Number(need.quantity)) * 100)
            return (
              <article key={need.id} className="rounded-xl border border-line bg-elevated/60 p-3">
                <div className="flex items-start justify-between gap-2"><div><p className="text-xs font-bold text-ink">{need.item.replace('_', ' ')}</p><p className="text-[11px] text-ink-muted">{need.area} · by {new Date(need.neededBy).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</p></div><span className="text-[10px] font-bold uppercase text-warning-700">{need.status.replace('_', ' ')}</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-warning-500" style={{ width: `${percent}%` }} /></div>
                <p className="mt-1 text-[11px] font-semibold text-ink-soft">{need.pledged || 0} of {need.quantity} {need.unit} pledged</p>
                <div className="mt-2 flex gap-2">
                  {left > 0 && <button type="button" className="min-h-11 flex-1 rounded-xl bg-warning-500 px-3 text-xs font-bold text-warning-950" onClick={() => setPledgeFor(need.id)}>Pledge</button>}
                  {need.isSample && <span className="inline-flex min-h-11 items-center gap-1 px-2 text-[10px] font-semibold text-ink-muted"><Users className="h-3.5 w-3.5" aria-hidden="true" />Sample data</span>}
                </div>
                {pledgeFor === need.id && <div className="mt-2 flex gap-2"><label className="sr-only" htmlFor={`pledge-${need.id}`}>Amount to pledge</label><input id={`pledge-${need.id}`} className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 text-sm" inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value.replace(/\D/g, ''))} placeholder={`1-${left}`} /><button type="button" className="min-h-11 rounded-xl border border-line px-3 text-xs font-bold" onClick={() => submitPledge(need)}>Confirm</button></div>}
              </article>
            )
          })}
          <button type="button" className="inline-flex min-h-11 w-full items-center justify-center gap-1 rounded-xl border border-line text-xs font-bold text-ink" onClick={() => setPostOpen((value) => !value)}><Plus className="h-4 w-4" aria-hidden="true" />Post a need</button>
          {postOpen && <button type="button" className="min-h-11 w-full rounded-xl bg-brand-600 px-3 text-xs font-bold text-white" onClick={() => { postNeed({ requesterId: 'local-user', requesterName: 'Local relief partner', requesterType: 'kitchen', item: 'cooked_meals', quantity: 100, unit: 'meals', neededBy: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), area: place?.label || 'Nearby', lat: place.lat, lng: place.lng }); setMessage('Need posted.') }}>Post sample need</button>}
          {message && <p className="text-xs font-semibold text-emerald-700" role="status">{message}</p>}
        </div>
      )}
    </aside>
  )
}
