import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

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

function validAlert(alert) {
  return alert && alert.state && alert.expiresAt > Date.now()
}

export function EmergencyProvider({ children }) {
  const [alert, setAlert] = useState(null)
  const [reportedConcerns, setReportedConcerns] = useState([])

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

  useEffect(() => {
    if (!alert) return undefined
    const delay = Math.max(0, alert.expiresAt - Date.now())
    const timer = window.setTimeout(() => setAlert(null), delay)
    return () => window.clearTimeout(timer)
  }, [alert])

  const value = useMemo(() => ({
    alert,
    activeAlert: (place) => {
      if (!validAlert(alert) || !place?.state) return null
      return alert.state.toLowerCase() === place.state.toLowerCase() ? alert : null
    },
    simulate,
    clear,
    reportConcern,
    reportedConcerns,
    simulatorVisible: isDemoVisible(),
  }), [alert, simulate, clear, reportConcern, reportedConcerns])

  return <EmergencyContext.Provider value={value}>{children}</EmergencyContext.Provider>
}

export function useEmergency() {
  const context = useContext(EmergencyContext)
  if (!context) throw new Error('useEmergency must be used inside EmergencyProvider')
  return context
}
