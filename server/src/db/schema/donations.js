// FRESH:FILE  src/db/schema/donations.js
// FRESH:AREA  DB

import { boolean, pgEnum, pgTable, text, timestamp, integer, uuid, varchar, index, geometry } from 'drizzle-orm/pg-core'
import { users } from './users'

export const donationStatus = pgEnum('donation_status', ['available', 'accepted', 'picked_up', 'distributed', 'expired', 'cancelled'])
export const donationCategory = pgEnum('donation_category', ['cooked_meal', 'snacks', 'bakery', 'raw_packaged', 'dry_ration', 'packaged_food', 'drinking_water', 'baby_food'])
export const storageCondition = pgEnum('storage_condition', ['room_temp', 'refrigerated', 'hot_holding'])
export const donationSource = pgEnum('donation_source', ['app', 'phone', 'voice_assistant'])

// FRESH:DB  Store surplus food listings and their current lifecycle state.
export const donations = pgTable('donations', {
  id: uuid('id').defaultRandom().primaryKey(),
  donorId: uuid('donor_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  foodName: text('food_name').notNull(),
  category: donationCategory('category').notNull(),
  vegType: varchar('veg_type', { length: 20 }),
  quantityServings: integer('quantity_servings').notNull(),
  cookedAt: timestamp('cooked_at', { withTimezone: true }).notNull(),
  pickupDeadline: timestamp('pickup_deadline', { withTimezone: true }).notNull(),
  storageCondition: storageCondition('storage_condition').notNull(),
  addressLine: text('address_line'), area: text('area'), city: text('city'), state: text('state'), pincode: varchar('pincode', { length: 6 }),
  // PostGIS point: x is LONGITUDE and y is LATITUDE. Do not swap them.
  location: geometry('location', { type: 'point', mode: 'xy', srid: 4326 }).notNull(),
  publicLocation: geometry('public_location', { type: 'point', mode: 'xy', srid: 4326 }), // Rounded location shown before acceptance.
  imageUrl: text('image_url'), contactPhone: varchar('contact_phone', { length: 15 }),
  declarationAccepted: boolean('declaration_accepted').notNull().default(false),
  declarationAcceptedAt: timestamp('declaration_accepted_at', { withTimezone: true }),
  declarationVersion: varchar('declaration_version', { length: 40 }),
  source: donationSource('source').notNull().default('app'),
  status: donationStatus('status').notNull().default('available'),
  acceptedBy: uuid('accepted_by').references(() => users.id, { onDelete: 'set null' }),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  isRelief: boolean('is_relief').notNull().default(false), isSample: boolean('is_sample').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(), updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({ locationIdx: index('donations_location_gist').using('gist', table.location), statusDeadlineIdx: index('donations_status_deadline_idx').on(table.status, table.pickupDeadline) }))

// FRESH:DB  Keep an immutable audit trail for donation status changes.
export const donationStatusHistory = pgTable('donation_status_history', {
  id: uuid('id').defaultRandom().primaryKey(), donationId: uuid('donation_id').notNull().references(() => donations.id, { onDelete: 'cascade' }), status: donationStatus('status').notNull(), at: timestamp('at', { withTimezone: true }).defaultNow().notNull(), byUserId: uuid('by_user_id').references(() => users.id, { onDelete: 'set null' }),
})
