import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid, geometry, index } from 'drizzle-orm/pg-core'
import { users } from './users'

export const emergencySource = pgEnum('emergency_source', ['SIMULATED', 'SACHET'])
export const emergencyHazard = pgEnum('emergency_hazard', ['flood', 'cyclone', 'earthquake', 'heatwave', 'landslide', 'other'])
export const emergencySeverity = pgEnum('emergency_severity', ['low', 'moderate', 'high', 'critical'])

export const emergencyAlerts = pgTable('emergency_alerts', {
  id: uuid('id').defaultRandom().primaryKey(), state: text('state').notNull(), hazardType: emergencyHazard('hazard_type').notNull(), severity: emergencySeverity('severity').notNull(), source: emergencySource('source').notNull(), issuedAt: timestamp('issued_at', { withTimezone: true }).notNull(), expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(), districts: text('districts').array().notNull().default([]), createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }), isActive: boolean('is_active').notNull().default(true), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({ activeStateIdx: index('emergency_alerts_state_active_idx').on(table.state, table.isActive, table.expiresAt) }))

export const hazardZones = pgTable('hazard_zones', {
  id: uuid('id').defaultRandom().primaryKey(), label: text('label').notNull(), type: emergencyHazard('type').notNull(),
  // PostGIS point: x is LONGITUDE and y is LATITUDE. Do not swap them.
  location: geometry('location', { type: 'point', mode: 'xy', srid: 4326 }).notNull(), radiusKm: integer('radius_km').notNull(), reportedAt: timestamp('reported_at', { withTimezone: true }).notNull(), state: text('state').notNull(), isSample: boolean('is_sample').notNull().default(false), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({ locationIdx: index('hazard_zones_location_gist').using('gist', table.location) }))
