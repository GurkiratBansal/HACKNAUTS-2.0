// FRESH:FILE  Emergency alerts and hazard zones: public reads plus admin writes.
// FRESH:AREA  API

import { Router } from 'express'
import { and, eq, gt } from 'drizzle-orm'
import { db } from '../db/client.js'
import { emergencyAlerts, hazardZones } from '../db/schema/emergency.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// FRESH:EMERGENCY  List alerts that are still active and have not expired.
router.get('/alerts', async (_req, res, next) => {
  try {
    const alerts = await db.select().from(emergencyAlerts).where(
      and(eq(emergencyAlerts.isActive, true), gt(emergencyAlerts.expiresAt, new Date())),
    )
    return res.json(alerts)
  } catch (error) { return next(error) }
})

// FRESH:HAZARD  List reported hazard zones used for map circles and route warnings.
router.get('/hazards', async (_req, res, next) => {
  try {
    const zones = await db.select().from(hazardZones)
    return res.json(zones)
  } catch (error) { return next(error) }
})

// FRESH:EMERGENCY  Admin endpoint to publish an alert for one state.
router.post('/alerts', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const [alert] = await db.insert(emergencyAlerts).values({ ...req.body, createdBy: req.user.sub }).returning()
    return res.status(201).json(alert)
  } catch (error) { return next(error) }
})

// FRESH:EMERGENCY  Admin endpoint to create a short-lived simulated alert for demos.
router.post('/simulate', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { state, hazardType, severity, districts } = req.body
    const [alert] = await db.insert(emergencyAlerts).values({
      state,
      hazardType,
      severity,
      source: 'SIMULATED',
      issuedAt: new Date(),
      // WHY: simulated alerts expire after one day so demo state never sticks.
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      districts: districts || [],
      createdBy: req.user.sub,
      isActive: true,
    }).returning()
    return res.status(201).json(alert)
  } catch (error) { return next(error) }
})

export default router
