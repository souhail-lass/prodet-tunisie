CREATE TABLE "catalogue_product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text DEFAULT 'swiver' NOT NULL,
	"swiver_id" text,
	"sku" text,
	"name" text NOT NULL,
	"base_image_url" text,
	"base_category" text,
	"base_description" text,
	"unit_price" numeric(12, 3),
	"display_name" text,
	"tagline" text,
	"description" text,
	"how_to_use" text,
	"dosage" text,
	"specs" jsonb,
	"technical_sheet_url" text,
	"image_url" text,
	"hidden" boolean DEFAULT false NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"synced_at" timestamp with time zone,
	"updated_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "catalogue_product_swiver_id_unique" UNIQUE("swiver_id")
);
--> statement-breakpoint
DROP TABLE "swiver_hidden_product" CASCADE;--> statement-breakpoint
ALTER TABLE "catalogue_product" ADD CONSTRAINT "catalogue_product_updated_by_user_id_app_user_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."app_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "catalogue_product_hidden_idx" ON "catalogue_product" USING btree ("hidden");--> statement-breakpoint
CREATE INDEX "catalogue_product_category_idx" ON "catalogue_product" USING btree ("base_category");--> statement-breakpoint
CREATE INDEX "catalogue_product_sku_idx" ON "catalogue_product" USING btree ("sku");