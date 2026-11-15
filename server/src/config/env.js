// FRESH:FILE  src/config/env.js
// FRESH:AREA  CONFIG

import 'dotenv/config'
import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  TEST_DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  COOKIE_SECURE: z.string().default('false'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  SACHET_ENABLED: z.string().default('false'),
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  console.error('Invalid server environment:', parsed.error.flatten().fieldErrors)
  throw new Error('Invalid server environment')
}

export const env = parsed.data
