// FRESH:FILE  Wires security middleware and mounts every API route.
// FRESH:AREA  API

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import { env } from './config/env.js'
import { notFound, errorHandler } from './middleware/error.js'
import authRoutes from './routes/auth.js'
import donationRoutes from './routes/donations.js'
import needRoutes from './routes/needs.js'
import emergencyRoutes from './routes/emergency.js'
import statsRoutes from './routes/stats.js'
import { voiceRouter } from './routes/voice.js'
import { aiExtractionRouter } from './routes/aiExtraction.js'

// FRESH:API  Build the Express app: security headers, CORS, JSON parsing, rate limit, logging.
export const app = express()
app.disable('x-powered-by')
app.use(helmet())
// WHY: only the Vite dev origin may call the API with credentials.
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }))
app.use(express.json({ limit: '1mb' }))
// WHY: one global cap slows obvious abuse without blocking normal use.
app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }))
// WHY: /health is skipped so uptime probes do not flood the log.
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', { skip: (req) => req.path === '/health' }))

// FRESH:API  Liveness probe used by smoke tests and uptime checks.
app.get('/health', (_req, res) => res.json({ ok: true, service: 'fresh-server' }))

// FRESH:AUTH  Registration and login endpoints.
app.use('/api/auth', authRoutes)
// FRESH:DONATION  Create, list and accept food donations.
app.use('/api/donations', donationRoutes)
// FRESH:NEEDS  Relief needs board with pledge tracking.
app.use('/api/needs', needRoutes)
// FRESH:EMERGENCY  Active alerts, hazard zones and the simulated trigger.
app.use('/api/emergency', emergencyRoutes)
// FRESH:STATS  Aggregate impact numbers for dashboards.
app.use('/api/stats', statsRoutes)
// FRESH:VOICE  Speech-to-text and audio fallback transcription.
app.use('/api/v1/voice', voiceRouter)
app.use('/api/voice', voiceRouter)
// FRESH:AI  Food parameter extraction from speech transcripts.
app.use('/api/v1/ai-extraction', aiExtractionRouter)
app.use('/api/ai-extraction', aiExtractionRouter)

app.use(notFound)
app.use(errorHandler)
