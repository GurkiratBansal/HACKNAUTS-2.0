// FRESH:FILE  src/db/schema/users.js
// FRESH:AREA  DB

import { boolean, pgEnum, pgTable, text, timestamp, uuid, varchar, index, uniqueIndex, geometry } from 'drizzle-orm/pg-core'

export const userRole = pgEnum('user_role', ['donor', 'ngo', 'admin'])
export const orgType = pgEnum('org_type', ['ngo', 'community_kitchen', 'restaurant', 'wedding_hall', 'event', 'individual'])
export const verificationStatus = pgEnum('verification_status', ['pending', 'verified', 'rejected'])

// FRESH:DB  Store accounts, roles, organization details, and public map location.
// WHY: geometry uses x=longitude and y=latitude because that is PostGIS point order.
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 320 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  phone: varchar('phone', { length: 15 }), // +91 phone number; validated by the API.
  role: userRole('role').notNull().default('donor'),
  orgType: orgType('org_type'),
  organizationName: text('organization_name'),
  focusArea: text('focus_area'),
  darpanId: text('darpan_id'),
  verificationStatus: verificationStatus('verification_status').notNull().default('pending'), // NGO verification controls receiving/map visibility.
  addressLine: text('address_line'),
  area: text('area'),
  city: text('city'),
  state: text('state'),
  pincode: varchar('pincode', { length: 6 }),
  // PostGIS point: x is LONGITUDE and y is LATITUDE. Do not swap them.
  location: geometry('location', { type: 'point', mode: 'xy', srid: 4326 }), // x=longitude, y=latitude.
  isActive: boolean('is_active').notNull().default(true),
  isSample: boolean('is_sample').notNull().default(false),
  visibleOnMap: boolean('visible_on_map').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailUnique: uniqueIndex('users_email_unique').on(table.email),
  locationIdx: index('users_location_gist').using('gist', table.location),
}))
