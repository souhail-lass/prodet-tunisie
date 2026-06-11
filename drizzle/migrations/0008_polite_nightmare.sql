CREATE TABLE "swiver_hidden_product" (
	"swiver_id" text PRIMARY KEY NOT NULL,
	"sku" text,
	"name" text,
	"hidden_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "swiver_hidden_product" ADD CONSTRAINT "swiver_hidden_product_hidden_by_user_id_app_user_id_fk" FOREIGN KEY ("hidden_by_user_id") REFERENCES "public"."app_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "swiver_hidden_product_created_idx" ON "swiver_hidden_product" USING btree ("created_at");