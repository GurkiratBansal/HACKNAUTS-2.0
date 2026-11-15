// FRESH:FILE  src/db/client.js
// FRESH:AREA  DB

import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { env } from '../config/env.js'
import * as schema from './schema/index.js'

const { Pool } = pg
const isCloud =
  env.DATABASE_URL?.includes('supabase.co') ||
  env.DATABASE_URL?.includes('neon.tech') ||
  env.DATABASE_URL?.includes('sslmode') ||
  env.NODE_ENV === 'production'

const cleanUrl = env.DATABASE_URL
  ? env.DATABASE_URL.replace(/[?&]sslmode=[^&]+/gi, '')
  : ''

export const pool = new Pool({
  connectionString: cleanUrl,
  ssl: isCloud ? { rejectUnauthorized: false } : undefined,
})
export const db = drizzle(pool, { schema })
