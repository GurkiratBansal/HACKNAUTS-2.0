import { describe, it, expect } from 'vitest'
import { recommendRoute } from './routeScore'

const routes = [
  { id: 0, distanceKm: 5, durationMin: 10, turnCount: 8 },
  { id: 1, distanceKm: 4.5, durationMin: 11, turnCount: 4 },
  { id: 2, distanceKm: 6, durationMin: 9, turnCount: 12 },
]

describe('routeScore', () => {
  it('recommends fastest by default', () => {
    const result = recommendRoute([
      { id: 0, distanceKm: 5, durationMin: 10, turnCount: 8 },
      { id: 1, distanceKm: 6, durationMin: 13, turnCount: 4 },
    ])
    expect(result.recommended.id).toBe(0)
    expect(result.recommendedLabels['0']).toContain('Recommended')
    expect(result.recommendedLabels['0']).toContain('Fastest')
  })

  it('recommends easier route when close in time', () => {
    const result = recommendRoute(routes)
    // route 1 is 1 min slower but 4 fewer turns
    expect(result.recommended.id).toBe(1)
    expect(result.reason).toMatch(/fewer turn/i)
  })

  it('labels shortest only when different', () => {
    const result = recommendRoute([
      { id: 0, distanceKm: 5, durationMin: 10, turnCount: 8 },
      { id: 1, distanceKm: 4, durationMin: 12, turnCount: 4 },
    ])
    expect(result.recommendedLabels['1']).toContain('Shortest')
  })

  it('handles one route', () => {
    const result = recommendRoute([{ id: 0, distanceKm: 5, durationMin: 10, turnCount: 8 }])
    expect(result.recommended.id).toBe(0)
    expect(result.reason).toBeNull()
  })
})
