// FRESH:FILE  Aggregates community impact numbers for the impact dashboard.
// FRESH:AREA  API

import { Router } from 'express'
import { eq, sql } from 'drizzle-orm'
import { db } from '../db/client.js'
import { donations } from '../db/schema/donations.js'

const router = Router()

// FRESH:STATS  Total meals, food weight, CO2 saved and completed distributions.
router.get('/impact', async (_req, res, next) => {
  try {
    // Sum every distributed donation; kg and CO2 use fixed conversion factors.
    const [row] = await db.select({ meals: sql`coalesce(sum(${donations.quantityServings}), 0)`, completed: sql`count(*)` }).from(donations).where(eq(donations.status, 'distributed'))
    return res.json({ meals: Number(row.meals), kg: Number(row.meals) * 0.4, co2: Number(row.meals) * 0.4 * 2.5, completed: Number(row.completed) })
  } catch (error) { return next(error) }
})

export default router
