import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import { env } from './config/env.js'
import { notFound, errorHandler } from './middleware/error.js'

export const app = express()
app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }))
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', { skip: (req) => req.path === '/health' }))

app.get('/health', (_req, res) => res.json({ ok: true, service: 'fresh-server' }))

app.use(notFound)
app.use(errorHandler)
