CREATE TABLE "customer_usual_product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"default_quantity" integer DEFAULT 1 NOT NULL,
	"note" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customer_usual_product_default_quantity_positive" CHECK ("customer_usual_product"."default_quantity" >= 1)
);
--> statement-breakpoint
ALTER TABLE "customer_usual_product" ADD CONSTRAINT "customer_usual_product_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_usual_product" ADD CONSTRAINT "customer_usual_product_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "customer_usual_product_customer_product_idx" ON "customer_usual_product" USING btree ("customer_id","product_id");--> statement-breakpoint
CREATE INDEX "customer_usual_product_customer_active_idx" ON "customer_usual_product" USING btree ("customer_id","is_active");