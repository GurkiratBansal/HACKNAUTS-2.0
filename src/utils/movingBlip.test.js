// FRESH:FILE  Tests for moving blip route interpolation and bearing math.
// FRESH:AREA  Routing

import { describe, expect, it } from 'vitest'
import {
  getPointDistanceKm,
  calculateBearing,
  interpolateRoutePosition,
  findClosestProgressOnRoute,
} from './movingBlip'

describe('movingBlip utils', () => {
  it('calculates point distance accurately', () => {
    const p1 = [30.901, 75.857]
    const p2 = [30.911, 75.867]
    const d = getPointDistanceKm(p1, p2)
    expect(d).toBeGreaterThan(1)
    expect(d).toBeLessThan(3)
  })

  it('calculates compass bearing between coordinates', () => {
    // Due North
    const northBearing = calculateBearing([30.0, 75.0], [31.0, 75.0])
    expect(Math.round(northBearing)).toBe(0)

    // Due East
    const eastBearing = calculateBearing([30.0, 75.0], [30.0, 76.0])
    expect(Math.round(eastBearing)).toBe(90)
  })

  it('interpolates route progress accurately along multi-segment coords', () => {
    const coords = [
      [30.9, 75.8],
      [30.91, 75.81],
      [30.92, 75.82],
    ]

    const start = interpolateRoutePosition(coords, 0)
    expect(start.position[0]).toBeCloseTo(30.9)
    expect(start.position[1]).toBeCloseTo(75.8)

    const mid = interpolateRoutePosition(coords, 0.5)
    expect(mid.position[0]).toBeGreaterThan(30.9)
    expect(mid.position[0]).toBeLessThan(30.92)
    expect(mid.traveledCoords.length).toBeGreaterThanOrEqual(2)

    const end = interpolateRoutePosition(coords, 1.0)
    expect(end.position[0]).toBeCloseTo(30.92)
    expect(end.position[1]).toBeCloseTo(75.82)
    expect(end.traveledCoords.length).toBe(3)
  })

  it('snaps real user GPS coordinates to closest route progress', () => {
    const coords = [
      [30.90, 75.80],
      [30.91, 75.81],
      [30.92, 75.82],
    ]
    const progressStart = findClosestProgressOnRoute(coords, 30.901, 75.801)
    expect(progressStart).toBeCloseTo(0, 1)

    const progressEnd = findClosestProgressOnRoute(coords, 30.919, 75.819)
    expect(progressEnd).toBeCloseTo(1, 1)
  })
})
