// FRESH:FILE  Slim meter summarising pledged relief during an active emergency.
// FRESH:AREA  Emergency

import { HandHeart, Users, Utensils } from 'lucide-react'
import { useUserLocation } from '../context/LocationContext'
import { useEmergency } from '../context/EmergencyContext'
import ReliefTag from './ReliefTag'

export default function ReliefMeter() {
  const { place } = useUserLocation()
  const { activeAlert, needs } = useEmergency()
  if (!activeAlert(place)) return null
  const pledged = needs.reduce((sum, need) => sum + Number(need.pledged || 0), 0)
  const fulfilled = needs.filter((need) => need.status === 'fulfilled').length
  const partners = new Set(needs.map((need) => need.requesterId)).size
  return (
    <section className="border-b border-warning-200 bg-warning-50/60 px-4 py-3 dark:border-warning-900 dark:bg-warning-950/25 sm:px-6" aria-label="Relief meter">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 text-xs text-warning-950 dark:text-warning-100">
        <ReliefTag />
        <span className="inline-flex items-center gap-1.5"><Utensils className="h-3.5 w-3.5" aria-hidden="true" /><strong>{pledged}</strong> pledged</span>
        <span className="inline-flex items-center gap-1.5"><HandHeart className="h-3.5 w-3.5" aria-hidden="true" /><strong>{fulfilled}</strong> needs fulfilled</span>
        <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" aria-hidden="true" /><strong>{partners}</strong> relief partners</span>
        <span className="text-[10px] font-semibold opacity-70">Sample coordination data</span>
      </div>
    </section>
  )
}
