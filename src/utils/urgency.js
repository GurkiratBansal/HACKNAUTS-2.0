// FRESH:FILE  Rule-based pickup urgency ladder: fresh (>2h), soon (30min-2h), urgent (<30min), expired (past deadline). An emergency factor shortens the safe windows.
// FRESH:AREA  Donations

// Rule-based pickup urgency. There is no AI or model call here.
export const URGENCY_DISCLAIMER =
  'Urgency is guidance only. Final food safety verification rests with the donor and the receiving NGO.'

// FRESH:Donation  The four urgency levels with labels, badge styles and map-marker colors.
export const URGENCY = {
  fresh: {
    key: 'fresh',
    label: 'Fresh',
    description: 'More than 2 hours to the pickup deadline',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-700',
    marker: '#059669',
  },
  soon: {
    key: 'soon',
    label: 'Pickup Soon',
    description: 'Between 30 minutes and 2 hours left',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-800 ring-amber-200',
    iconBg: 'bg-amber-100 text-amber-700',
    marker: '#d97706',
  },
  urgent: {
    key: 'urgent',
    label: 'Urgent',
    description: 'Under 30 minutes left',
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-800 ring-red-200',
    iconBg: 'bg-red-100 text-red-700',
    marker: '#dc2626',
  },
  expired: {
    key: 'expired',
    label: 'Expired',
    description: 'The pickup deadline has passed',
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-600 ring-slate-200',
    iconBg: 'bg-slate-100 text-slate-600',
    marker: '#64748b',
  },
}

// FRESH:Donation  Maps ms-to-deadline to a level; thresholdFactor (emergency mode) shortens the 2h/30m windows.
export function getUrgency(deadline, now = Date.now(), thresholdFactor = 1) {
  const msLeft = new Date(deadline).getTime() - now
  if (Number.isNaN(msLeft) || msLeft <= 0) {
    return { ...URGENCY.expired, msLeft: Math.min(0, msLeft || 0), hoursLeft: 0 }
  }
  const factor = Number.isFinite(Number(thresholdFactor)) ? Number(thresholdFactor) : 1
  // A lower factor makes the safe/fresh window shorter during emergencies.
  const twoHours = (2 * 60 * 60 * 1000) / factor
  const thirtyMinutes = (30 * 60 * 1000) / factor
  if (msLeft > twoHours) {
    return { ...URGENCY.fresh, msLeft, hoursLeft: msLeft / 3600000 }
  }
  if (msLeft > thirtyMinutes) {
    return { ...URGENCY.soon, msLeft, hoursLeft: msLeft / 3600000 }
  }
  return { ...URGENCY.urgent, msLeft, hoursLeft: msLeft / 3600000 }
}

const SENSITIVE_CATEGORIES = new Set(['cooked', 'snacks'])

// FRESH:Donation  Conservative food-safety hint by category and storage; never claims food is safe.
/**
 * Plain-language safety hint, deliberately conservative. It never asserts
 * the food is safe; it points the receiver to the relevant risk.
 */
export function getSafetyHint(category, storage) {
  if (category === 'raw') {
    return 'Packaged or raw food is generally less time-critical, but check seals, labels and storage conditions before accepting.'
  }
  if (category === 'bakery') {
    return 'Bakery items are lower risk than cooked meals, but cream-filled items should be kept cool and inspected before distribution.'
  }
  if (storage === 'refrigerated') {
    return 'Cooked food kept refrigerated should stay cold until pickup. Ask the donor when it was cooked and how it was stored.'
  }
  if (storage === 'hot-holding') {
    return 'Hot-held cooked food should remain above safe holding temperature. The receiving organisation must inspect it on arrival.'
  }
  if (SENSITIVE_CATEGORIES.has(category) && storage === 'room') {
    return 'Cooked food at room temperature is time-sensitive. This listing should be treated as a priority and inspected carefully.'
  }
  return 'Inspect the food, its packaging and its temperature on arrival. The receiving NGO makes the final safety decision.'
}

// FRESH:Donation  Sort rank: urgent first, expired last.
export function urgencyRank(key) {
  return { urgent: 0, soon: 1, fresh: 2, expired: 3 }[key] ?? 4
}
