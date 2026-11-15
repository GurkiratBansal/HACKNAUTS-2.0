// FRESH:FILE  src/routes/donations.js
// FRESH:AREA  API

import { Router } from 'express'
import { and, eq, desc } from 'drizzle-orm'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../db/client.js'
import { donations, donationStatusHistory } from '../db/schema/donations.js'
import { users } from '../db/schema/users.js'
import { env } from '../config/env.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
const createInput = z.object({ foodName: z.string().min(1), category: z.enum(['cooked_meal', 'snacks', 'bakery', 'raw_packaged', 'dry_ration', 'packaged_food', 'drinking_water', 'baby_food']), quantityServings: z.number().int().min(1).max(10000), cookedAt: z.coerce.date(), pickupDeadline: z.coerce.date(), storageCondition: z.enum(['room_temp', 'refrigerated', 'hot_holding']), state: z.string().min(1), lat: z.number(), lng: z.number(), declarationAccepted: z.literal(true), declarationVersion: z.string().min(1) })

// FRESH:API  HTTP route or middleware registration.
router.get('/', async (req, res, next) => {
  try {
    const rows = await db.select().from(donations).where(eq(donations.status, req.query.status || 'available')).orderBy(desc(donations.createdAt))
    return res.json(rows)
  } catch (error) { return next(error) }
})

// FRESH:API  HTTP route or middleware registration.
router.post('/', async (req, res, next) => {
  try {
    const input = createInput.parse(req.body)
    if (input.pickupDeadline <= input.cookedAt) return res.status(400).json({ error: 'pickupDeadline must be after cookedAt.' })

    let donorId = null
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.slice(7), env.JWT_SECRET)
        if (decoded?.sub) donorId = decoded.sub
      } catch {
        // Fall back to demo/system donor
      }
    }

    if (!donorId) {
      const [existingUser] = await db.select({ id: users.id }).from(users).limit(1)
      if (existingUser) {
        donorId = existingUser.id
      } else {
        const [demoUser] = await db
          .insert(users)
          .values({
            name: 'Grand Punjab Banquet',
            email: 'donor@fresh.local',
            passwordHash: await bcrypt.hash('DemoPassword2026!', 10),
            role: 'donor',
            organizationName: 'Grand Punjab Banquet',
            city: 'Ludhiana',
            state: 'Punjab',
            pincode: '141001',
          })
          .returning({ id: users.id })
        donorId = demoUser.id
      }
    }

    const [donation] = await db.insert(donations).values({ donorId, foodName: input.foodName, category: input.category, quantityServings: input.quantityServings, cookedAt: input.cookedAt, pickupDeadline: input.pickupDeadline, storageCondition: input.storageCondition, state: input.state, location: { x: input.lng, y: input.lat }, publicLocation: { x: Math.round(input.lng * 100) / 100, y: Math.round(input.lat * 100) / 100 }, declarationAccepted: true, declarationAcceptedAt: new Date(), declarationVersion: input.declarationVersion }).returning()
    await db.insert(donationStatusHistory).values({ donationId: donation.id, status: 'available', byUserId: donorId })
    return res.status(201).json(donation)
  } catch (error) { return next(error) }
})

// FRESH:API  HTTP route or middleware registration.
router.post('/:id/accept', requireAuth, requireRole('ngo'), async (req, res, next) => {
  try {
    const [updated] = await db.update(donations).set({ status: 'accepted', acceptedBy: req.user.sub, acceptedAt: new Date(), updatedAt: new Date() }).where(and(eq(donations.id, req.params.id), eq(donations.status, 'available'))).returning()
    if (!updated) return res.status(409).json({ error: 'Donation is no longer available.' })
    await db.insert(donationStatusHistory).values({ donationId: updated.id, status: 'accepted', byUserId: req.user.sub })
    return res.json(updated)
  } catch (error) { return next(error) }
})

export default router
