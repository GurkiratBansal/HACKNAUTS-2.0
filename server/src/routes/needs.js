// FRESH:FILE  src/routes/needs.js
// FRESH:AREA  API

import { Router } from 'express'
import { asc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db/client.js'
import { needs, needPledges } from '../db/schema/needs.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
const needInput = z.object({ item: z.enum(['cooked_meals', 'dry_ration', 'packaged_food', 'drinking_water', 'baby_food']), quantity: z.number().int().min(1).max(100000), unit: z.string().min(1).max(40), neededBy: z.coerce.date(), area: z.string().max(160).optional(), state: z.string().min(1), lat: z.number().min(6.5).max(37.5), lng: z.number().min(68).max(97.5) })

// FRESH:API  HTTP route or middleware registration.
router.get('/', requireAuth, async (_req, res, next) => {
  try { return res.json(await db.select().from(needs).where(eq(needs.status, 'open')).orderBy(asc(needs.neededBy))) } catch (error) { return next(error) }
})

// FRESH:API  HTTP route or middleware registration.
router.post('/', requireAuth, requireRole('ngo'), async (req, res, next) => {
  try {
    const input = needInput.parse(req.body)
    if (input.neededBy <= new Date()) return res.status(400).json({ error: 'neededBy must be in the future.' })
    const [need] = await db.insert(needs).values({ requesterId: req.user.sub, item: input.item, quantity: input.quantity, unit: input.unit, neededBy: input.neededBy, area: input.area, state: input.state, location: { x: input.lng, y: input.lat } }).returning()
    return res.status(201).json(need)
  } catch (error) { return next(error) }
})

// FRESH:API  HTTP route or middleware registration.
router.post('/:id/pledges', requireAuth, async (req, res, next) => {
  try {
    const amount = z.object({ quantity: z.number().int().min(1).max(100000) }).parse(req.body).quantity
    const result = await db.transaction(async (tx) => {
      const [need] = await tx.select().from(needs).where(eq(needs.id, req.params.id)).limit(1)
      if (!need) return { status: 404, body: { error: 'Need not found.' } }
      const remaining = need.quantity - need.pledged
      if (amount > remaining || need.status === 'fulfilled' || need.status === 'cancelled') return { status: 400, body: { error: `Pledge must be between 1 and ${remaining}.` } }
      const pledged = need.pledged + amount
      await tx.insert(needPledges).values({ needId: need.id, pledgerId: req.user.sub, quantity: amount })
      const [updated] = await tx.update(needs).set({ pledged, status: pledged >= need.quantity ? 'fulfilled' : 'partly_pledged', updatedAt: new Date() }).where(eq(needs.id, need.id)).returning()
      return { status: 200, body: updated }
    })
    return res.status(result.status).json(result.body)
  } catch (error) { return next(error) }
})

export default router
