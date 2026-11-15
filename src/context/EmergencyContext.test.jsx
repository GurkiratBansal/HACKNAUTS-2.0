// FRESH:FILE  Unit tests for emergency activation rules, sample needs and pledge math.
// FRESH:AREA  Emergency

import { describe, expect, it } from 'vitest'
import { makeSampleNeeds, pledgeNeedAmount } from '../data/emergencyNeeds'
import { isEmergencyActive } from './EmergencyContext'
import { routeNearHazard } from '../utils/hazards'
import { getUrgency } from '../utils/urgency'

describe('emergency utilities', () => {
  it('activates only for a matching known state and a live alert', () => {
    const alert = { state: 'Punjab', expiresAt: 2000 }
    expect(isEmergencyActive(alert, { state: 'Punjab' }, 1000)).toBe(true)
    expect(isEmergencyActive(alert, { state: 'Haryana' }, 1000)).toBe(false)
    expect(isEmergencyActive(alert, {}, 1000)).toBe(false)
    expect(isEmergencyActive(alert, { state: 'Punjab' }, 3000)).toBe(false)
  })

  it('creates sample needs near the active place', () => {
    const needs = makeSampleNeeds({ lat: 30.901, lng: 75.857, state: 'Punjab' })
    expect(needs).toHaveLength(4)
    expect(needs.every((need) => need.isSample)).toBe(true)
  })

  it('validates pledge math and transitions status', () => {
    const need = { quantity: 10, pledged: 7, status: 'partly_pledged' }
    expect(pledgeNeedAmount(need, 4).ok).toBe(false)
    expect(pledgeNeedAmount(need, 3).need.status).toBe('fulfilled')
    expect(pledgeNeedAmount(need, 3).need.pledged).toBe(10)
  })

  it('detects routes near hazards and ignores far routes', () => {
    const zone = { lat: 30.901, lng: 75.857, radiusKm: 1 }
    expect(routeNearHazard([[30.901, 75.857], [30.91, 75.86]], [zone])).toBe(true)
    expect(routeNearHazard([[31.5, 76.5], [31.6, 76.6]], [zone])).toBe(false)
  })

  it('tightens urgency thresholds only when a factor is supplied', () => {
    const deadline = Date.now() + 130 * 60 * 1000
    expect(getUrgency(deadline).key).toBe('fresh')
    expect(getUrgency(deadline, Date.now(), 0.5).key).toBe('soon')
  })
})
