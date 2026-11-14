/**
 * Pure helpers for ranking OSRM route alternatives.
 *
 * Alternatives are a later feature. The live map currently draws the single
 * fastest route returned by services/routing.js, so nothing imports this in
 * the app; the helpers and their tests are kept for future route options.
 */

const EASIER_TIME_TOLERANCE_RATIO = 0.1
const EASIER_TIME_TOLERANCE_MIN = 2
const FEWEST_TURNS_EXTRA_RATIO = 0.2
const FEWEST_TURNS_EXTRA_MIN = 5

function labelFor(route, fastest, shortest, fewest) {
  const labels = []
  if (route.id === fastest.id) labels.push('Fastest')
  if (shortest && route.id === shortest.id && route.id !== fastest.id) {
    labels.push('Shortest')
  }
  if (fewest && route.id === fewest.id && route.id !== fastest.id) {
    labels.push('Fewest turns')
  }
  return labels
}

export function recommendRoute(routes) {
  if (!Array.isArray(routes) || routes.length === 0) {
    return { recommended: null, labels: {}, reason: null }
  }

  const sortedByTime = [...routes].sort(
    (a, b) =>
      a.durationMin - b.durationMin ||
      a.distanceKm - b.distanceKm ||
      a.turnCount - b.turnCount,
  )
  const fastest = sortedByTime[0]

  const shortest = [...routes].reduce((best, route) =>
    !best || route.distanceKm < best.distanceKm ? route : best,
  )

  // Fewest turns only counts if it is not the fastest and its extra time is
  // small enough to be worth the easier drive.
  let fewest = [...routes].reduce((best, route) =>
    !best || route.turnCount < best.turnCount ? route : best,
  )
  if (
    fewest.id === fastest.id ||
    fewest.durationMin - fastest.durationMin >
      Math.max(FEWEST_TURNS_EXTRA_MIN, fastest.durationMin * FEWEST_TURNS_EXTRA_RATIO)
  ) {
    fewest = null
  }

  const labels = {}
  for (const route of routes) {
    labels[String(route.id)] = labelFor(route, fastest, shortest, fewest)
  }

  // Recommend the easiest route if it is close enough to the fastest time.
  let recommended = fastest
  let reason = null
  if (fewest) {
    const extra = fewest.durationMin - fastest.durationMin
    const tolerance = Math.max(
      EASIER_TIME_TOLERANCE_MIN,
      fastest.durationMin * EASIER_TIME_TOLERANCE_RATIO,
    )
    if (extra <= tolerance) {
      recommended = fewest
      const turnDiff = fastest.turnCount - fewest.turnCount
      reason =
        extra <= 1
          ? `${turnDiff} fewer turn${turnDiff === 1 ? '' : 's'}, same time`
          : `${extra} min slower, ${turnDiff} fewer turn${turnDiff === 1 ? '' : 's'}`
    }
  }

  const recommendedLabels = new Set(labels[recommended.id] || [])
  recommendedLabels.add('Recommended')

  return {
    recommended,
    labels,
    recommendedLabels: Object.fromEntries(
      Object.entries(labels).map(([id, value]) => [
        id,
        id === String(recommended.id) ? [...value, 'Recommended'] : value,
      ]),
    ),
    reason,
  }
}
