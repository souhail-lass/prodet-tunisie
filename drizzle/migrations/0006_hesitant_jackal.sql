CREATE TYPE "public"."customer_document_kind" AS ENUM('purchase_order', 'invoice', 'delivery_note', 'erp_export', 'spreadsheet', 'other');--> statement-breakpoint
CREATE TABLE "customer_document" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"uploaded_by_user_id" uuid,
	"kind" "customer_document_kind" DEFAULT 'other' NOT NULL,
	"storage_path" text NOT NULL,
	"file_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"byte_size" bigint NOT NULL,
	"label" text,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customer_document_storage_path_unique" UNIQUE("storage_path")
);
--> statement-breakpoint
CREATE TABLE "order_draft_document" (
	"order_draft_id" uuid NOT NULL,
	"customer_document_id" uuid NOT NULL,
	"attached_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_draft_document_order_draft_id_customer_document_id_pk" PRIMARY KEY("order_draft_id","customer_document_id")
);
--> statement-breakpoint
ALTER TABLE "customer_document" ADD CONSTRAINT "customer_document_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_document" ADD CONSTRAINT "customer_document_uploaded_by_user_id_app_user_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."app_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_draft_document" ADD CONSTRAINT "order_draft_document_order_draft_id_order_draft_id_fk" FOREIGN KEY ("order_draft_id") REFERENCES "public"."order_draft"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_draft_document" ADD CONSTRAINT "order_draft_document_customer_document_id_customer_document_id_fk" FOREIGN KEY ("customer_document_id") REFERENCES "public"."customer_document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_draft_document" ADD CONSTRAINT "order_draft_document_attached_by_user_id_app_user_id_fk" FOREIGN KEY ("attached_by_user_id") REFERENCES "public"."app_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customer_document_customer_created_idx" ON "customer_document" USING btree ("customer_id","created_at");--> statement-breakpoint
CREATE INDEX "customer_document_customer_kind_idx" ON "customer_document" USING btree ("customer_id","kind");--> statement-breakpoint
CREATE INDEX "order_draft_document_document_idx" ON "order_draft_document" USING btree ("customer_document_id");