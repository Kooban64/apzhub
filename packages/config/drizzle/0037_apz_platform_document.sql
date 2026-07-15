-- APZDOCS-001: Platform Document canonical metadata tables (no binary blobs)

CREATE TABLE IF NOT EXISTS "platform_document" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "document_type" varchar(64) NOT NULL,
  "status" varchar(32) NOT NULL,
  "classification_code" varchar(64) NOT NULL,
  "classification_label" text,
  "classification_custom_code" varchar(128),
  "title" text NOT NULL,
  "description" text,
  "owner_user_id" text,
  "creator_user_id" text NOT NULL,
  "mime_type" varchar(255),
  "byte_length" integer,
  "checksum_algorithm" varchar(32),
  "checksum_hex" varchar(128),
  "storage_provider_id" text,
  "storage_key" text,
  "category_id" text,
  "folder_id" text,
  "retention_id" text,
  "current_version_id" text,
  "tag_ids_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "permissions_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "lifecycle_state" varchar(32) NOT NULL,
  "lifecycle_changed_at" timestamp with time zone NOT NULL,
  "lifecycle_changed_by" text NOT NULL,
  "lifecycle_reason" text,
  "template_ref_json" jsonb,
  "generation_ref_json" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "archived_at" timestamp with time zone,
  "deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_document_tenant_id_uidx"
  ON "platform_document" ("tenant_id", "id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_document_tenant_status_idx"
  ON "platform_document" ("tenant_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_document_tenant_classification_idx"
  ON "platform_document" ("tenant_id", "classification_code");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_document_metadata" (
  "id" text PRIMARY KEY NOT NULL,
  "document_id" text NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "title" text NOT NULL,
  "description" text,
  "mime_type" varchar(255),
  "byte_length" integer,
  "language" varchar(32),
  "custom_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_document_metadata_document_idx"
  ON "platform_document_metadata" ("tenant_id", "document_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_document_tag" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_document_tag_tenant_name_uidx"
  ON "platform_document_tag" ("tenant_id", "name");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_document_category" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "parent_category_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_document_relationship" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "source_document_id" text NOT NULL,
  "target_document_id" text,
  "kind" varchar(64) NOT NULL,
  "reference_product" varchar(64),
  "reference_external_id" text,
  "reference_label" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_document_relationship_source_idx"
  ON "platform_document_relationship" ("tenant_id", "source_document_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_document_retention" (
  "id" text PRIMARY KEY NOT NULL,
  "document_id" text NOT NULL,
  "tenant_id" text NOT NULL,
  "policy_key" text NOT NULL,
  "retain_until" timestamp with time zone,
  "legal_hold" boolean DEFAULT false NOT NULL,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_document_audit" (
  "id" text PRIMARY KEY NOT NULL,
  "document_id" text NOT NULL,
  "tenant_id" text NOT NULL,
  "action" text NOT NULL,
  "actor_user_id" text NOT NULL,
  "correlation_id" text,
  "details_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_document_audit_document_idx"
  ON "platform_document_audit" ("tenant_id", "document_id", "created_at");
