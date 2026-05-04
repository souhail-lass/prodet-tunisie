CREATE TYPE "public"."alias_scope" AS ENUM('global', 'customer');--> statement-breakpoint
CREATE TYPE "public"."alias_validation_status" AS ENUM('proposed', 'confirmed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."customer_status" AS ENUM('active', 'inactive', 'prospect');--> statement-breakpoint
CREATE TYPE "public"."extraction_status" AS ENUM('success', 'failure', 'partial');--> statement-breakpoint
CREATE TYPE "public"."locale" AS ENUM('fr', 'ar', 'en');--> statement-breakpoint
CREATE TYPE "public"."match_reason" AS ENUM('alias', 'exact_code', 'trigram', 'vector', 'llm_rerank');--> statement-breakpoint
CREATE TYPE "public"."order_attachment_kind" AS ENUM('email_pdf', 'email_image', 'web_upload', 'other');--> statement-breakpoint
CREATE TYPE "public"."order_source" AS ENUM('phone', 'email', 'pdf', 'web_quote', 'portal');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('parsing', 'review', 'approved', 'exported', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."product_asset_kind" AS ENUM('image', 'fiche_technique', 'sds', 'other');--> statement-breakpoint
CREATE TYPE "public"."swiver_export_status" AS ENUM('none', 'manual_pending', 'manual_done', 'api_pushed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."user_customer_role" AS ENUM('owner', 'purchaser', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'admin', 'operator', 'reviewer', 'customer_user');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"actor_role" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"diff" jsonb,
	"metadata" jsonb,
	"ip_hash" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"swiver_id" text,
	"name" text NOT NULL,
	"display_name" text,
	"email" text,
	"phone" text,
	"whatsapp" text,
	"address_line1" text,
	"address_line2" text,
	"city" text,
	"postal_code" text,
	"country" text DEFAULT 'Tunisia' NOT NULL,
	"default_locale" "locale" DEFAULT 'fr' NOT NULL,
	"sector_key" text,
	"status" "customer_status" DEFAULT 'prospect' NOT NULL,
	"tags" text[],
	"notes_internal" text,
	"needs_review" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customer_swiver_id_unique" UNIQUE("swiver_id")
);
--> statement-breakpoint
CREATE TABLE "customer_contact" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"name" text NOT NULL,
	"role" text,
	"email" text,
	"phone" text,
	"whatsapp" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name_fr" text NOT NULL,
	"name_ar" text,
	"name_en" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "category_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "family" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"category_id" uuid NOT NULL,
	"name_fr" text NOT NULL,
	"name_ar" text,
	"name_en" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "family_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "product_sector" (
	"product_id" uuid NOT NULL,
	"sector_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_sector_product_id_sector_id_pk" PRIMARY KEY("product_id","sector_id")
);
--> statement-breakpoint
CREATE TABLE "sector" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name_fr" text NOT NULL,
	"name_ar" text,
	"name_en" text,
	"description_fr" text,
	"description_ar" text,
	"description_en" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sector_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"swiver_id" text,
	"code" text NOT NULL,
	"slug" text NOT NULL,
	"name_canonical" text NOT NULL,
	"category_id" uuid,
	"family_id" uuid,
	"is_manufactured_by_prodet" boolean DEFAULT false NOT NULL,
	"is_visible_public" boolean DEFAULT false NOT NULL,
	"conditionnement" text,
	"unit_of_sale" text,
	"search_text" text DEFAULT '' NOT NULL,
	"notes_internal" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_swiver_id_unique" UNIQUE("swiver_id"),
	CONSTRAINT "product_code_unique" UNIQUE("code"),
	CONSTRAINT "product_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_alias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"alias_text" text NOT NULL,
	"alias_text_normalized" text DEFAULT '' NOT NULL,
	"scope" "alias_scope" NOT NULL,
	"customer_id" uuid,
	"validation_status" "alias_validation_status" DEFAULT 'proposed' NOT NULL,
	"confidence" numeric(4, 3),
	"created_by" uuid,
	"validated_by" uuid,
	"source_order_draft_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"validated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "product_asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"kind" "product_asset_kind" NOT NULL,
	"locale" "locale",
	"storage_path" text NOT NULL,
	"mime_type" text,
	"byte_size" integer,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_embedding" (
	"product_id" uuid PRIMARY KEY NOT NULL,
	"model" text NOT NULL,
	"dimensions" integer NOT NULL,
	"vector" vector(1536) NOT NULL,
	"source_text_hash" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_translation" (
	"product_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"name" text NOT NULL,
	"short_description" text,
	"long_description" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_translation_product_id_locale_pk" PRIMARY KEY("product_id","locale")
);
--> statement-breakpoint
CREATE TABLE "app_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_id" uuid,
	"email" text NOT NULL,
	"full_name" text,
	"role" "user_role" DEFAULT 'operator' NOT NULL,
	"default_locale" "locale" DEFAULT 'fr' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_user_auth_id_unique" UNIQUE("auth_id"),
	CONSTRAINT "app_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_customer" (
	"user_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"role" "user_customer_role" DEFAULT 'purchaser' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_customer_user_id_customer_id_pk" PRIMARY KEY("user_id","customer_id")
);
--> statement-breakpoint
CREATE TABLE "extraction_job" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_draft_id" uuid NOT NULL,
	"input_hash" text NOT NULL,
	"model_name" text NOT NULL,
	"prompt_version" text NOT NULL,
	"raw_output" jsonb,
	"zod_errors" jsonb,
	"status" "extraction_status" NOT NULL,
	"duration_ms" integer,
	"input_tokens" integer,
	"output_tokens" integer,
	"cost_usd" numeric(10, 4),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_attachment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_draft_id" uuid NOT NULL,
	"kind" "order_attachment_kind" NOT NULL,
	"storage_path" text NOT NULL,
	"mime_type" text,
	"byte_size" integer,
	"file_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_draft" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference_code" text NOT NULL,
	"customer_id" uuid,
	"customer_snapshot" jsonb,
	"source" "order_source" NOT NULL,
	"status" "order_status" DEFAULT 'parsing' NOT NULL,
	"swiver_export_status" "swiver_export_status" DEFAULT 'none' NOT NULL,
	"swiver_document_ref" text,
	"raw_inbound" jsonb,
	"extraction_confidence" numeric(4, 3),
	"requested_delivery_at" timestamp with time zone,
	"notes_internal" text,
	"created_by" uuid,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"exported_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_draft_reference_code_unique" UNIQUE("reference_code")
);
--> statement-breakpoint
CREATE TABLE "order_line" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_draft_id" uuid NOT NULL,
	"line_number" integer NOT NULL,
	"raw_text" text NOT NULL,
	"quantity" numeric(12, 3) NOT NULL,
	"unit" text,
	"matched_product_id" uuid,
	"match_confidence" numeric(4, 3),
	"match_reason" "match_reason",
	"candidates" jsonb,
	"operator_override" jsonb,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference_code" text NOT NULL,
	"locale" "locale" DEFAULT 'fr' NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"sector_key" text,
	"message" text,
	"requested_items" jsonb,
	"source_page" text,
	"utm" jsonb,
	"ip_hash" text,
	"user_agent" text,
	"customer_id" uuid,
	"handled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quote_request_reference_code_unique" UNIQUE("reference_code")
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_app_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."app_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_contact" ADD CONSTRAINT "customer_contact_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family" ADD CONSTRAINT "family_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_sector" ADD CONSTRAINT "product_sector_sector_id_sector_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sector"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_family_id_family_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."family"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_alias" ADD CONSTRAINT "product_alias_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_alias" ADD CONSTRAINT "product_alias_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_alias" ADD CONSTRAINT "product_alias_created_by_app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_alias" ADD CONSTRAINT "product_alias_validated_by_app_user_id_fk" FOREIGN KEY ("validated_by") REFERENCES "public"."app_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_asset" ADD CONSTRAINT "product_asset_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_embedding" ADD CONSTRAINT "product_embedding_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_translation" ADD CONSTRAINT "product_translation_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_customer" ADD CONSTRAINT "user_customer_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_customer" ADD CONSTRAINT "user_customer_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extraction_job" ADD CONSTRAINT "extraction_job_order_draft_id_order_draft_id_fk" FOREIGN KEY ("order_draft_id") REFERENCES "public"."order_draft"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_attachment" ADD CONSTRAINT "order_attachment_order_draft_id_order_draft_id_fk" FOREIGN KEY ("order_draft_id") REFERENCES "public"."order_draft"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_draft" ADD CONSTRAINT "order_draft_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_draft" ADD CONSTRAINT "order_draft_created_by_app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_draft" ADD CONSTRAINT "order_draft_approved_by_app_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."app_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_line" ADD CONSTRAINT "order_line_order_draft_id_order_draft_id_fk" FOREIGN KEY ("order_draft_id") REFERENCES "public"."order_draft"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_line" ADD CONSTRAINT "order_line_matched_product_id_product_id_fk" FOREIGN KEY ("matched_product_id") REFERENCES "public"."product"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_request" ADD CONSTRAINT "quote_request_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_entity_idx" ON "audit_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_log_actor_idx" ON "audit_log" USING btree ("actor_user_id","created_at");--> statement-breakpoint
CREATE INDEX "customer_status_idx" ON "customer" USING btree ("status");--> statement-breakpoint
CREATE INDEX "product_visible_category_idx" ON "product" USING btree ("is_visible_public","category_id");--> statement-breakpoint
CREATE INDEX "product_search_trgm_idx" ON "product" USING gin ("search_text" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "alias_normalized_trgm_idx" ON "product_alias" USING gin ("alias_text_normalized" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "alias_scope_customer_idx" ON "product_alias" USING btree ("scope","customer_id");--> statement-breakpoint
CREATE INDEX "order_draft_status_created_idx" ON "order_draft" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "order_draft_customer_idx" ON "order_draft" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "order_line_draft_line_idx" ON "order_line" USING btree ("order_draft_id","line_number");--> statement-breakpoint
CREATE INDEX "quote_request_created_idx" ON "quote_request" USING btree ("created_at");