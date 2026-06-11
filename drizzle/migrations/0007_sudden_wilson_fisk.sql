CREATE TABLE "swiver_webhook_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" text,
	"event_type" text,
	"payload" jsonb NOT NULL,
	"signature" text,
	"signature_verified" boolean DEFAULT false NOT NULL,
	"source_ip" text,
	"user_agent" text,
	"status" text DEFAULT 'received' NOT NULL,
	"error" text,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "swiver_webhook_event_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE INDEX "swiver_webhook_event_status_idx" ON "swiver_webhook_event" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "swiver_webhook_event_type_idx" ON "swiver_webhook_event" USING btree ("event_type","created_at");