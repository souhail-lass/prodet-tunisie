CREATE TYPE "public"."portal_invite_status" AS ENUM('prepared', 'sent', 'accepted', 'expired', 'revoked');--> statement-breakpoint
CREATE TABLE "portal_invite" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"access_request_id" uuid NOT NULL,
	"email" text NOT NULL,
	"company_name" text NOT NULL,
	"status" "portal_invite_status" DEFAULT 'prepared' NOT NULL,
	"token_hash" text,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "portal_invite" ADD CONSTRAINT "portal_invite_access_request_id_client_access_request_id_fk" FOREIGN KEY ("access_request_id") REFERENCES "public"."client_access_request"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "portal_invite_access_request_idx" ON "portal_invite" USING btree ("access_request_id");--> statement-breakpoint
CREATE INDEX "portal_invite_email_status_idx" ON "portal_invite" USING btree ("email","status");