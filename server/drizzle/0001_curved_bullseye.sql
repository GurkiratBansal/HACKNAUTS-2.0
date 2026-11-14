CREATE TYPE "public"."need_item" AS ENUM('cooked_meals', 'dry_ration', 'packaged_food', 'drinking_water', 'baby_food');--> statement-breakpoint
CREATE TYPE "public"."need_status" AS ENUM('open', 'partly_pledged', 'fulfilled', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."emergency_hazard" AS ENUM('flood', 'cyclone', 'earthquake', 'heatwave', 'landslide', 'other');--> statement-breakpoint
CREATE TYPE "public"."emergency_severity" AS ENUM('low', 'moderate', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."emergency_source" AS ENUM('SIMULATED', 'SACHET');--> statement-breakpoint
CREATE TABLE "need_pledges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"need_id" uuid NOT NULL,
	"pledger_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "needs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" uuid NOT NULL,
	"item" "need_item" NOT NULL,
	"quantity" integer NOT NULL,
	"unit" varchar(40) NOT NULL,
	"pledged" integer DEFAULT 0 NOT NULL,
	"needed_by" timestamp with time zone NOT NULL,
	"area" text,
	"state" text NOT NULL,
	"location" geometry(point) NOT NULL,
	"status" "need_status" DEFAULT 'open' NOT NULL,
	"is_sample" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emergency_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"state" text NOT NULL,
	"hazard_type" "emergency_hazard" NOT NULL,
	"severity" "emergency_severity" NOT NULL,
	"source" "emergency_source" NOT NULL,
	"issued_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"districts" text[] DEFAULT '{}' NOT NULL,
	"created_by" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hazard_zones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text NOT NULL,
	"type" "emergency_hazard" NOT NULL,
	"location" geometry(point) NOT NULL,
	"radius_km" integer NOT NULL,
	"reported_at" timestamp with time zone NOT NULL,
	"state" text NOT NULL,
	"is_sample" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"donation_id" uuid,
	"reporter_id" uuid,
	"reason" varchar(80) NOT NULL,
	"comment" text,
	"status" varchar(30) DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "need_pledges" ADD CONSTRAINT "need_pledges_need_id_needs_id_fk" FOREIGN KEY ("need_id") REFERENCES "public"."needs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "need_pledges" ADD CONSTRAINT "need_pledges_pledger_id_users_id_fk" FOREIGN KEY ("pledger_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "needs" ADD CONSTRAINT "needs_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_alerts" ADD CONSTRAINT "emergency_alerts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_donation_id_donations_id_fk" FOREIGN KEY ("donation_id") REFERENCES "public"."donations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "needs_location_gist" ON "needs" USING gist ("location");--> statement-breakpoint
CREATE INDEX "needs_status_deadline_idx" ON "needs" USING btree ("status","needed_by");--> statement-breakpoint
CREATE INDEX "emergency_alerts_state_active_idx" ON "emergency_alerts" USING btree ("state","is_active","expires_at");--> statement-breakpoint
CREATE INDEX "hazard_zones_location_gist" ON "hazard_zones" USING gist ("location");