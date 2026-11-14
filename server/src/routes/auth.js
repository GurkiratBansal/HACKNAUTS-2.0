// FRESH:FILE  src/routes/auth.js
// FRESH:AREA  API

import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { users } from '../db/schema/users.js'
import { env } from '../config/env.js'
import { serializeUser } from '../serializers/index.js'

const router = Router()
const credentials = z.object({ email: z.string().email(), password: z.string().min(8) })
const registration = credentials.extend({ name: z.string().min(1).max(120), role: z.enum(['donor', 'ngo']).default('donor'), organizationName: z.string().max(180).optional(), state: z.string().max(80).optional(), pincode: z.string().regex(/^[1-9][0-9]{5}$/).optional() })

// FRESH:API  Function: tokenFor.`r`n
function tokenFor(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN })
}

// FRESH:API  HTTP route or middleware registration.`r`n
router.post('/register', async (req, res, next) => {
  try {
    const input = registration.parse(req.body)
    const email = input.email.trim().toLowerCase()
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
    if (existing.length) return res.status(409).json({ error: 'An account with this email already exists.' })
    const [user] = await db.insert(users).values({ name: input.name.trim(), email, passwordHash: await bcrypt.hash(input.password, 12), role: input.role, organizationName: input.organizationName?.trim(), state: input.state, pincode: input.pincode }).returning()
    return res.status(201).json({ user: serializeUser(user), token: tokenFor(user) })
  } catch (error) { return next(error) }
})

// FRESH:API  HTTP route or middleware registration.`r`n
router.post('/login', async (req, res, next) => {
  try {
    const input = credentials.parse(req.body)
    const [user] = await db.select().from(users).where(eq(users.email, input.email.trim().toLowerCase())).limit(1)
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) return res.status(401).json({ error: 'Invalid email or password.' })
    return res.json({ user: serializeUser(user), token: tokenFor(user) })
  } catch (error) { return next(error) }
})

export default router
