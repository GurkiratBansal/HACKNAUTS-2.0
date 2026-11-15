// FRESH:FILE  src/middleware/auth.js
// FRESH:AREA  API

import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

// FRESH:API  Function: requireAuth.
export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null
  if (!token) return res.status(401).json({ error: 'Authentication required' })
  try {
    req.user = jwt.verify(token, env.JWT_SECRET)
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// FRESH:API  Function: requireRole.
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'Insufficient permissions' })
    return next()
  }
}
