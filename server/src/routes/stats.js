import { Router } from 'express'
import { eq, sql } from 'drizzle-orm'
import { db } from '../db/client.js'
import { donations } from '../db/schema/donations.js'

const router = Router()

router.get('/impact', async (_req, res, next) => {
  try {
    const [row] = await db
      .select({
        meals: sql`coalesce(sum(${donations.quantityServings}), 0)`,
        completed: sql`count(*)`,
      })
      .from(donations)
      .where(eq(donations.status, 'distributed'))

    const meals = Number(row?.meals || 0)
    const kg = meals * 0.4
    return res.json({
      meals,
      kg,
      co2: kg * 2.5,
      completed: Number(row?.completed || 0),
    })
  } catch (error) {
    return next(error)
  }
})

export default router
