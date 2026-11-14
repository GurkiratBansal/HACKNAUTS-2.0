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

const allowedOrigins = env.CLIENT_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

export const app = express()
app.disable('x-powered-by')

app.use(helmet())
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }
      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
  }),
)
app.use(
  morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    skip: (req) => req.path === '/health',
  }),
)

app.get('/health', (_req, res) => res.json({ ok: true, service: 'fresh-server' }))
app.use('/api/auth', authRoutes)
app.use('/api/donations', donationRoutes)
app.use('/api/needs', needRoutes)
app.use('/api/emergency', emergencyRoutes)
app.use('/api/stats', statsRoutes)

app.use(notFound)
app.use(errorHandler)
