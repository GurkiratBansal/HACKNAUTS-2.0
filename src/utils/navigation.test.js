import { describe, it, expect } from 'vitest'
import {
  snapToRoute,
  remainingDistance,
  bearing,
  isOffRoute,
  isArrived,
  progressPercent,
  remainingTimeMinutes,
  moveAlongRoute,
  OFF_ROUTE_THRESHOLD_M,
  ARRIVAL_THRESHOLD_M,
} from './navigation.js'

const route = [
  [28.633, 77.219],
  [28.634, 77.22],
  [28.635, 77.221],
]

describe('navigation utils', () => {
  it('snaps a point on the route to itself', () => {
    const point = { lat: 28.6335, lng: 77.2195 }
    const result = snapToRoute(point, route)
    expect(result.distanceMeters).toBeLessThan(5)
    expect(result.segmentIndex).toBe(0)
    expect(result.snapped.lat).toBeCloseTo(point.lat, 3)
  })

  it('reports a large distance for an off-route point', () => {
    const point = { lat: 28.633, lng: 77.23 }
    const result = snapToRoute(point, route)
    expect(result.distanceMeters).toBeGreaterThan(OFF_ROUTE_THRESHOLD_M)
    expect(isOffRoute(result.distanceMeters)).toBe(true)
  })

  it('computes remaining distance decreasing along the route', () => {
    const start = snapToRoute({ lat: route[0][0], lng: route[0][1] }, route)
    const mid = snapToRoute({ lat: route[1][0], lng: route[1][1] }, route)
    const full = remainingDistance(start.snapped, route, start.segmentIndex)
    const half = remainingDistance(mid.snapped, route, mid.segmentIndex)
    expect(full).toBeGreaterThan(half)
    expect(half).toBeGreaterThanOrEqual(0)
  })

  it('remainingDistance works with two arguments', () => {
    const snapped = { lat: route[0][0], lng: route[0][1] }
    const value = remainingDistance(snapped, route)
    expect(Number.isFinite(value)).toBe(true)
  })

  it('scales remaining time by the original ratio', () => {
    expect(remainingTimeMinutes(1, 2, 10)).toBeCloseTo(5, 5)
    expect(remainingTimeMinutes(0, 2, 10)).toBe(0)
  })

  it('computes a bearing in degrees', () => {
    const value = bearing({ lat: 0, lng: 0 }, { lat: 0, lng: 1 })
    expect(value).toBeGreaterThan(89)
    expect(value).toBeLessThan(91)
  })

  it('detects arrival within threshold', () => {
    expect(isArrived(20)).toBe(true)
    expect(isArrived(40)).toBe(false)
    expect(ARRIVAL_THRESHOLD_M).toBe(30)
  })

  it('computes progress percent', () => {
    expect(progressPercent(1, 2)).toBeCloseTo(50, 5)
    expect(progressPercent(0, 2)).toBe(100)
    expect(progressPercent(2, 2)).toBe(0)
  })

  it('moves a virtual point along the route', () => {
    const first = moveAlongRoute(route, 0)
    expect(first.position.lat).toBeCloseTo(route[0][0], 5)
    const last = moveAlongRoute(route, 100000)
    expect(last.position.lat).toBeCloseTo(route[route.length - 1][0], 5)
  })
})
