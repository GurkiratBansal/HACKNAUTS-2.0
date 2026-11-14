import { useCallback, useEffect, useRef, useState } from 'react'
import { getRoute } from '../services/routing'
import { recommendRoute } from '../utils/routeScore'
import {
  snapToRoute,
  remainingDistance,
  remainingTimeMinutes,
  bearing,
  isOffRoute,
  isArrived,
  progressPercent,
  moveAlongRoute,
  OFF_ROUTE_THRESHOLD_M,
  ARRIVAL_THRESHOLD_M,
  MIN_GPS_MOVE_M,
  MAX_GPS_ACCURACY_M,
} from '../utils/navigation'

const STATES = {
  IDLE: 'idle',
  ROUTING: 'routing',
  NAVIGATING: 'navigating',
  OFF_ROUTE: 'off_route',
  ARRIVED: 'arrived',
  ERROR: 'error',
}

function now() {
  return Date.now()
}

function distanceMeters(a, b) {
  if (!a || !b) return Infinity
  const R = 6371000
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

export function useNavigation({
  route,
  destination,
  destinationName = 'destination',
  role = 'donor',
  mode = 'drive',
  destinationValid = true,
  onArrive,
} = {}) {
  const [state, setState] = useState(STATES.IDLE)
  const [currentRoute, setCurrentRoute] = useState(route || null)
  const [position, setPosition] = useState(null)
  const [snappedPosition, setSnappedPosition] = useState(null)
  const [remainingKm, setRemainingKm] = useState(route?.distanceKm || 0)
  const [remainingMin, setRemainingMin] = useState(route?.durationMin || 0)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [announcement, setAnnouncement] = useState('')

  // simulation
  const [simulationActive, setSimulationActive] = useState(false)
  const [simulationSpeed, setSimulationSpeed] = useState(1)
  const [simulationPaused, setSimulationPaused] = useState(false)

  const watchIdRef = useRef(null)
  const abortRef = useRef(null)
  const lastUiUpdateRef = useRef(0)
  const lastProcessedPosRef = useRef(null)
  const offRouteCountRef = useRef(0)
  const lastRerouteRef = useRef(0)
  const simulationTimerRef = useRef(null)
  const simulationTravelledRef = useRef(0)
  const simulationOffRouteNudgeRef = useRef(null)
  const mountedRef = useRef(true)

  // Keep the route in sync when the caller switches destination.
  useEffect(() => {
    if (state !== STATES.IDLE) {
      stopAll()
    }
    setCurrentRoute(route || null)
    setRemainingKm(route?.distanceKm || 0)
    setRemainingMin(route?.durationMin || 0)
    setProgress(0)
    setSnappedPosition(null)
    setPosition(null)
    setError(null)
    setState(STATES.IDLE)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.coords, route?.distanceKm, route?.durationMin])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      stopAll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stopGeolocation = useCallback(() => {
    if (watchIdRef.current != null && navigator?.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }, [])

  const stopSimulationTimer = useCallback(() => {
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current)
      simulationTimerRef.current = null
    }
  }, [])

  function stopAll() {
    stopGeolocation()
    stopSimulationTimer()
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
  }

  const announce = useCallback((message) => {
    setAnnouncement(message)
    // Clear after a short delay so repeated identical messages can re-announce.
    window.setTimeout(() => {
      if (mountedRef.current) setAnnouncement('')
    }, 4000)
  }, [])

  const reroute = useCallback(
    async (fromPosition, force = false) => {
      if (!currentRoute || !destination) return
      const nowTime = now()
      if (!force && nowTime - lastRerouteRef.current < 15000) return
      lastRerouteRef.current = nowTime

      setState(STATES.ROUTING)
      setError(null)
      setAnnouncement('Recalculating route...')

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const routes = await getRoute(
          { lat: fromPosition.lat, lng: fromPosition.lng },
          destination,
          controller.signal,
          mode,
        )
        if (!mountedRef.current) return
        const result = recommendRoute(routes)
        const next = result.recommended || routes[0]
        if (!next) throw new Error('No road route found between these points.')
        setCurrentRoute(next)
        setRemainingKm(next.distanceKm)
        setRemainingMin(next.durationMin)
        setProgress(0)
        offRouteCountRef.current = 0
        setState(STATES.NAVIGATING)
        setAnnouncement('Route updated.')
      } catch (err) {
        if (err?.name === 'AbortError') return
        if (!mountedRef.current) return
        setError('Could not recalculate the route. You are still on the last known route.')
        setState(STATES.OFF_ROUTE)
        setAnnouncement('Recalculation failed. Retry when ready.')
      } finally {
        abortRef.current = null
      }
    },
    [currentRoute, destination, mode],
  )

  const processPosition = useCallback(
    (pos) => {
      if (!pos || !currentRoute || !destination) return
      if (state === STATES.IDLE || state === STATES.ARRIVED) return

      // Accuracy filter
      if (Number.isFinite(pos.accuracy) && pos.accuracy > MAX_GPS_ACCURACY_M) return

      // Movement filter
      if (lastProcessedPosRef.current) {
        const moved = distanceMeters(lastProcessedPosRef.current, pos)
        if (moved < MIN_GPS_MOVE_M) return
      }
      lastProcessedPosRef.current = pos

      const snapped = snapToRoute(pos, currentRoute.coords)
      const remaining = remainingDistance(snapped.snapped, currentRoute.coords, snapped.segmentIndex)
      const total = currentRoute.distanceKm || 1
      const mins = remainingTimeMinutes(remaining, total, currentRoute.durationMin || 0)
      const pct = progressPercent(remaining, total)

      // Off-route tracking
      if (isOffRoute(snapped.distanceMeters, OFF_ROUTE_THRESHOLD_M)) {
        offRouteCountRef.current += 1
      } else {
        offRouteCountRef.current = 0
      }

      // Throttle UI updates to 1/sec, but always check arrival.
      const t = now()
      const shouldUpdateUi = t - lastUiUpdateRef.current >= 1000
      if (shouldUpdateUi) {
        lastUiUpdateRef.current = t
        setPosition(pos)
        setSnappedPosition(snapped.snapped)
        setRemainingKm(remaining)
        setRemainingMin(mins)
        setProgress(pct)
      }

      // Arrival check every update
      const toDest = distanceMeters(pos, destination) / 1000
      if (isArrived(toDest * 1000, ARRIVAL_THRESHOLD_M)) {
        setState(STATES.ARRIVED)
        stopAll()
        setSnappedPosition(snapped.snapped)
        setRemainingKm(0)
        setRemainingMin(0)
        setProgress(100)
        setAnnouncement(`You have arrived at ${destinationName}.`)
        if (onArrive) onArrive()
        return
      }

      // Off-route trigger
      if (offRouteCountRef.current >= 3) {
        offRouteCountRef.current = 0
        if (state !== STATES.ROUTING) {
          reroute(pos, false)
        }
      }
    },
    [state, currentRoute, destination, destinationName, onArrive, reroute],
  )

  const ingestPosition = useCallback(
    (pos) => {
      processPosition(pos)
    },
    [processPosition],
  )

  // Geolocation watch
  const startGeolocation = useCallback(() => {
    if (!navigator?.geolocation) {
      setError('Geolocation is not available in this browser.')
      return false
    }
    if (!window.isSecureContext && location?.hostname !== 'localhost' && location?.hostname !== '127.0.0.1') {
      setError('Location needs a secure (HTTPS) context. Use simulation mode instead.')
      return false
    }
    stopGeolocation()
    watchIdRef.current = navigator.geolocation.watchPosition(
      (p) => {
        if (simulationActive) return
        ingestPosition({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          accuracy: p.coords.accuracy,
          speed: p.coords.speed,
          heading: p.coords.heading,
          timestamp: p.timestamp,
        })
      },
      (err) => {
        if (err.code === 1) setError('Location permission denied. Use simulation mode or the Google Maps link.')
        else if (err.code === 2) setError('Location unavailable. Try again or use simulation mode.')
        else setError('Location request timed out. Try again.')
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    )
    return true
  }, [simulationActive, ingestPosition, stopGeolocation])

  const start = useCallback(() => {
    if (!currentRoute || !destination) {
      setError('No route or destination available.')
      return
    }
    if (!destinationValid) {
      setError('This destination is no longer available.')
      return
    }
    if ((currentRoute.distanceKm || 0) * 1000 < 100) {
      setState(STATES.ARRIVED)
      setProgress(100)
      setRemainingKm(0)
      setRemainingMin(0)
      setAnnouncement(`You have arrived at ${destinationName}.`)
      if (onArrive) onArrive()
      return
    }
    setError(null)
    offRouteCountRef.current = 0
    lastProcessedPosRef.current = null
    lastUiUpdateRef.current = 0
    setState(STATES.NAVIGATING)
    setAnnouncement('Navigation started.')
    if (!simulationActive) startGeolocation()
  }, [currentRoute, destination, destinationValid, destinationName, onArrive, simulationActive, startGeolocation])

  const stop = useCallback(() => {
    stopAll()
    setSimulationActive(false)
    stopSimulationTimer()
    setState(STATES.IDLE)
    setPosition(null)
    setSnappedPosition(null)
    offRouteCountRef.current = 0
    setAnnouncement('Navigation stopped.')
  }, [stopAll, stopSimulationTimer])

  const recalculate = useCallback(() => {
    const base = snappedPosition || position
    if (!base) return
    reroute(base, true)
  }, [snappedPosition, position, reroute])

  // Simulation controls
  const startSimulation = useCallback(() => {
    if (!currentRoute) return
    setSimulationActive(true)
    setSimulationPaused(false)
    simulationTravelledRef.current = 0
    const startPt = { lat: currentRoute.coords[0][0], lng: currentRoute.coords[0][1] }
    ingestPosition({ ...startPt, accuracy: 5, speed: 0, heading: null, timestamp: Date.now() })
    if (state === STATES.IDLE) {
      setState(STATES.NAVIGATING)
      setAnnouncement('Simulation started.')
    }
  }, [currentRoute, ingestPosition, state])

  const stopSimulation = useCallback(() => {
    setSimulationActive(false)
    setSimulationPaused(false)
    stopSimulationTimer()
    if (!simulationActive) return
    // keep navigating with real GPS if available
    if (state === STATES.NAVIGATING) startGeolocation()
  }, [simulationActive, state, startGeolocation, stopSimulationTimer])

  const pauseSimulation = useCallback(() => setSimulationPaused(true), [])
  const resumeSimulation = useCallback(() => setSimulationPaused(false), [])
  const setSpeed = useCallback((value) => setSimulationSpeed(value), [])

  const jumpNearDestination = useCallback(() => {
    if (!currentRoute) return
    simulationTravelledRef.current = Math.max(0, currentRoute.distanceKm * 1000 - 50)
  }, [currentRoute])

  const triggerOffRouteTest = useCallback(() => {
    if (!snappedPosition || !currentRoute) return
    // nudge ~120m east
    const offset = { lat: snappedPosition.lat, lng: snappedPosition.lng + 120 / (111139 * Math.cos((snappedPosition.lat * Math.PI) / 180)) }
    simulationOffRouteNudgeRef.current = offset
  }, [snappedPosition, currentRoute])

  // Simulation timer
  useEffect(() => {
    if (!simulationActive || simulationPaused || state !== STATES.NAVIGATING) {
      stopSimulationTimer()
      return undefined
    }
    simulationTimerRef.current = setInterval(() => {
      if (!currentRoute) return
      const speedKmh = 40 * simulationSpeed
      const metersPerSecond = (speedKmh * 1000) / 3600
      const nudge = simulationOffRouteNudgeRef.current
      if (nudge) {
        simulationOffRouteNudgeRef.current = null
        ingestPosition({ ...nudge, accuracy: 5, speed: speedKmh, heading: bearing(nudge, destination || nudge), timestamp: Date.now() })
        return
      }
      simulationTravelledRef.current += metersPerSecond
      const moved = moveAlongRoute(currentRoute.coords, simulationTravelledRef.current)
      if (moved.position) {
        ingestPosition({
          lat: moved.position.lat,
          lng: moved.position.lng,
          accuracy: 5,
          speed: speedKmh,
          heading: bearing(moved.position, destination || moved.position),
          timestamp: Date.now(),
        })
      }
    }, 1000)
    return () => stopSimulationTimer()
  }, [simulationActive, simulationPaused, state, currentRoute, simulationSpeed, destination, ingestPosition, stopSimulationTimer])

  // Page visibility handling
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible' && state === STATES.NAVIGATING && !simulationActive) {
        startGeolocation()
      }
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [state, simulationActive, startGeolocation])

  // Destination validity
  useEffect(() => {
    if (!destinationValid && (state === STATES.NAVIGATING || state === STATES.OFF_ROUTE)) {
      setError('This destination is no longer available.')
      stop()
    }
  }, [destinationValid, state, stop])

  return {
    state,
    route: currentRoute,
    position,
    snappedPosition,
    remainingKm,
    remainingMin,
    progressPercent: progress,
    nextInstruction: null,
    error,
    announcement,
    simulation: {
      active: simulationActive,
      speed: simulationSpeed,
      paused: simulationPaused,
    },
    actions: {
      start,
      stop,
      recalculate,
      ingestPosition,
      startSimulation,
      stopSimulation,
      pauseSimulation,
      resumeSimulation: resumeSimulation,
      setSimulationSpeed: setSpeed,
      jumpNearDestination,
      triggerOffRouteTest,
    },
  }
}
