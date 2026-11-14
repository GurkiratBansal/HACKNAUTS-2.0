import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useUserLocation } from './LocationContext'
import { makeSampleNeeds, pledgeNeedAmount } from '../data/emergencyNeeds'

const EmergencyContext = createContext(null)

export const EMERGENCY_HAZARDS = [
  ['flood', 'Flood'],
  ['cyclone', 'Cyclone'],
  ['earthquake', 'Earthquake'],
  ['heatwave', 'Heatwave'],
  ['landslide', 'Landslide'],
  ['other', 'Other'],
]

const isDemoVisible = () => {
  if (import.meta.env.DEV) return true
  return new URLSearchParams(window.location.search).get('demo') === '1'
}

export function isEmergencyActive(alert, place, now = Date.now()) {
  if (!alert || !place?.state || alert.expiresAt <= now) return false
  return alert.state.toLowerCase() === place.state.toLowerCase()
}

function validAlert(alert) {
  return alert && alert.state && alert.expiresAt > Date.now()
}

export function EmergencyProvider({ children }) {
  const { place } = useUserLocation()
  const [alert, setAlert] = useState(null)
  const [reportedConcerns, setReportedConcerns] = useState([])
  const [needs, setNeeds] = useState([])

  const simulate = useCallback(({ state, hazardType, severity = 'moderate', districts = [] }) => {
    const now = Date.now()
    setAlert({
      id: `simulated-${now}`,
      state,
      hazardType,
      severity,
      source: 'SIMULATED',
      issuedAt: now,
      expiresAt: now + 2 * 60 * 60 * 1000,
      districts,
    })
  }, [])

  const clear = useCallback(() => setAlert(null), [])

  const reportConcern = useCallback((concern) => {
    setReportedConcerns((items) => [
      ...items,
      { ...concern, id: `concern-${Date.now()}`, createdAt: Date.now() },
    ])
  }, [])

  const postNeed = useCallback((need) => {
    const item = {
      ...need,
      id: `relief-need-${Date.now()}`,
      status: 'open',
      pledged: 0,
      createdAt: Date.now(),
    }
    setNeeds((items) => [item, ...items])
    return item
  }, [])

  const pledgeNeed = useCallback((id, amount) => {
    let result = { ok: false, message: 'Need not found.' }
    setNeeds((items) => items.map((need) => {
      if (need.id !== id) return need
      const update = pledgeNeedAmount(need, amount)
      if (!update.ok) {
        result = update
        return need
      }
      result = { ok: true }
      return update.need
    }))
    return result
  }, [])

  useEffect(() => {
    if (!alert || !place?.state || alert.state.toLowerCase() !== place.state.toLowerCase()) return
    setNeeds((items) => items.length ? items : makeSampleNeeds(place))
  }, [alert, place])

  useEffect(() => {
    if (!alert) return undefined
    const delay = Math.max(0, alert.expiresAt - Date.now())
    const timer = window.setTimeout(() => setAlert(null), delay)
    return () => window.clearTimeout(timer)
  }, [alert])

  const value = useMemo(() => ({
    alert,
    activeAlert: (place) => {
      if (!validAlert(alert) || !isEmergencyActive(alert, place)) return null
      return alert
    },
    simulate,
    clear,
    reportConcern,
    reportedConcerns,
    needs,
    postNeed,
    pledgeNeed,
    simulatorVisible: isDemoVisible(),
  }), [alert, simulate, clear, reportConcern, reportedConcerns, needs, postNeed, pledgeNeed])

  return <EmergencyContext.Provider value={value}>{children}</EmergencyContext.Provider>
}

export function useEmergency() {
  const context = useContext(EmergencyContext)
  if (!context) throw new Error('useEmergency must be used inside EmergencyProvider')
  return context
}
