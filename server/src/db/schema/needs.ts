import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid, varchar, index, geometry } from 'drizzle-orm/pg-core'
import { users } from './users'

export const needItem = pgEnum('need_item', ['cooked_meals', 'dry_ration', 'packaged_food', 'drinking_water', 'baby_food'])
export const needStatus = pgEnum('need_status', ['open', 'partly_pledged', 'fulfilled', 'expired', 'cancelled'])

export const needs = pgTable('needs', {
  id: uuid('id').defaultRandom().primaryKey(),
  requesterId: uuid('requester_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  item: needItem('item').notNull(),
  quantity: integer('quantity').notNull(),
  unit: varchar('unit', { length: 40 }).notNull(),
  pledged: integer('pledged').notNull().default(0),
  neededBy: timestamp('needed_by', { withTimezone: true }).notNull(),
  area: text('area'), state: text('state').notNull(),
  // PostGIS point: x is LONGITUDE and y is LATITUDE. Do not swap them.
  location: geometry('location', { type: 'point', mode: 'xy', srid: 4326 }).notNull(),
  status: needStatus('status').notNull().default('open'),
  isSample: boolean('is_sample').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(), updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({ locationIdx: index('needs_location_gist').using('gist', table.location), deadlineIdx: index('needs_status_deadline_idx').on(table.status, table.neededBy) }))

export const needPledges = pgTable('need_pledges', {
  id: uuid('id').defaultRandom().primaryKey(),
  needId: uuid('need_id').notNull().references(() => needs.id, { onDelete: 'cascade' }),
  pledgerId: uuid('pledger_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  quantity: integer('quantity').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
