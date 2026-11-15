// FRESH:FILE  src/db/migrate.js
// FRESH:AREA  DB

import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { db, pool } from './client.js'

await migrate(db, { migrationsFolder: './drizzle' })
await pool.end()
