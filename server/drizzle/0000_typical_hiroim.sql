CREATE EXTENSION IF NOT EXISTS postgis;--> statement-breakpoint
CREATE TYPE "public"."org_type" AS ENUM('ngo', 'community_kitchen', 'restaurant', 'wedding_hall', 'event', 'individual');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('donor', 'ngo', 'admin');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."donation_category" AS ENUM('cooked_meal', 'snacks', 'bakery', 'raw_packaged', 'dry_ration', 'packaged_food', 'drinking_water', 'baby_food');--> statement-breakpoint
CREATE TYPE "public"."donation_source" AS ENUM('app', 'phone', 'voice_assistant');--> statement-breakpoint
CREATE TYPE "public"."donation_status" AS ENUM('available', 'accepted', 'picked_up', 'distributed', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."storage_condition" AS ENUM('room_temp', 'refrigerated', 'hot_holding');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" varchar(320) NOT NULL,
	"password_hash" text NOT NULL,
	"phone" varchar(15),
	"role" "user_role" DEFAULT 'donor' NOT NULL,
	"org_type" "org_type",
	"organization_name" text,
	"focus_area" text,
	"darpan_id" text,
	"verification_status" "verification_status" DEFAULT 'pending' NOT NULL,
	"address_line" text,
	"area" text,
	"city" text,
	"state" text,
	"pincode" varchar(6),
	"location" geometry(point),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_sample" boolean DEFAULT false NOT NULL,
	"visible_on_map" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donation_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"donation_id" uuid NOT NULL,
	"status" "donation_status" NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"by_user_id" uuid
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"donor_id" uuid NOT NULL,
	"food_name" text NOT NULL,
	"category" "donation_category" NOT NULL,
	"veg_type" varchar(20),
	"quantity_servings" integer NOT NULL,
	"cooked_at" timestamp with time zone NOT NULL,
	"pickup_deadline" timestamp with time zone NOT NULL,
	"storage_condition" "storage_condition" NOT NULL,
	"address_line" text,
	"area" text,
	"city" text,
	"state" text,
	"pincode" varchar(6),
	"location" geometry(point) NOT NULL,
	"public_location" geometry(point),
	"image_url" text,
	"contact_phone" varchar(15),
	"declaration_accepted" boolean DEFAULT false NOT NULL,
	"declaration_accepted_at" timestamp with time zone,
	"declaration_version" varchar(40),
	"source" "donation_source" DEFAULT 'app' NOT NULL,
	"status" "donation_status" DEFAULT 'available' NOT NULL,
	"accepted_by" uuid,
	"accepted_at" timestamp with time zone,
	"is_relief" boolean DEFAULT false NOT NULL,
	"is_sample" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "donation_status_history" ADD CONSTRAINT "donation_status_history_donation_id_donations_id_fk" FOREIGN KEY ("donation_id") REFERENCES "public"."donations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation_status_history" ADD CONSTRAINT "donation_status_history_by_user_id_users_id_fk" FOREIGN KEY ("by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_donor_id_users_id_fk" FOREIGN KEY ("donor_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_accepted_by_users_id_fk" FOREIGN KEY ("accepted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_location_gist" ON "users" USING gist ("location");--> statement-breakpoint
CREATE INDEX "donations_location_gist" ON "donations" USING gist ("location");--> statement-breakpoint
CREATE INDEX "donations_status_deadline_idx" ON "donations" USING btree ("status","pickup_deadline");
