import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { donations } from './donations'
import { users } from './users'

export const reports = pgTable('reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  donationId: uuid('donation_id').references(() => donations.id, { onDelete: 'cascade' }),
  reporterId: uuid('reporter_id').references(() => users.id, { onDelete: 'set null' }),
  reason: varchar('reason', { length: 80 }).notNull(), comment: text('comment'), status: varchar('status', { length: 30 }).notNull().default('open'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
