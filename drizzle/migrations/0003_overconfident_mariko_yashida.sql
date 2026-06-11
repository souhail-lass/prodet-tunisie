CREATE TYPE "public"."client_access_request_source" AS ENUM('espace_client');--> statement-breakpoint
CREATE TYPE "public"."client_access_request_status" AS ENUM('new', 'reviewing', 'approved', 'rejected', 'needs_info');--> statement-breakpoint
CREATE TABLE "client_access_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"company_name" text NOT NULL,
	"sector" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"city_or_zone" text NOT NULL,
	"need_type" text NOT NULL,
	"prodet_reference_optional" text,
	"message" text,
	"status" "client_access_request_status" DEFAULT 'new' NOT NULL,
	"source" "client_access_request_source" DEFAULT 'espace_client' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	"reviewer_note" text
);
--> statement-breakpoint
CREATE INDEX "client_access_request_status_created_idx" ON "client_access_request" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "client_access_request_email_created_idx" ON "client_access_request" USING btree ("email","created_at");