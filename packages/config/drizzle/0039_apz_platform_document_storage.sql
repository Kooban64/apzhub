-- APZDOCS-002: Document content version + storage object metadata (no binary blobs)

CREATE TABLE IF NOT EXISTS "platform_document_version" (
  "id" text PRIMARY KEY NOT NULL,
  "document_id" text NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "version_number" integer NOT NULL,
  "mime_type" varchar(255) NOT NULL,
  "byte_length" integer NOT NULL,
  "checksum_algorithm" varchar(32) NOT NULL,
  "checksum_hex" varchar(128) NOT NULL,
  "storage_provider_id" text NOT NULL,
  "storage_key" text NOT NULL,
  "storage_status" varchar(64) NOT NULL,
  "etag" text,
  "encryption_key_ref" text,
  "immutable" boolean DEFAULT true NOT NULL,
  "display_filename" text,
  "declared_mime_type" varchar(255),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "verified_at" timestamp with time zone,
  "revision" integer DEFAULT 1 NOT NULL,
  CONSTRAINT "platform_document_version_revision_chk" CHECK ("revision" >= 1),
  CONSTRAINT "platform_document_version_immutable_chk" CHECK ("immutable" = true)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_document_version_doc_num_uidx"
  ON "platform_document_version" ("tenant_id", "document_id", "version_number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_document_version_checksum_idx"
  ON "platform_document_version" ("tenant_id", "checksum_hex");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_document_version_document_idx"
  ON "platform_document_version" ("tenant_id", "document_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_document_storage_object" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "document_id" text NOT NULL,
  "version_id" text NOT NULL,
  "provider_id" text NOT NULL,
  "storage_key" text NOT NULL,
  "byte_length" integer NOT NULL,
  "mime_type" varchar(255) NOT NULL,
  "checksum_hex" varchar(128) NOT NULL,
  "checksum_algorithm" varchar(32) NOT NULL,
  "status" varchar(64) NOT NULL,
  "etag" text,
  "encryption_key_ref" text,
  "verified_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  CONSTRAINT "platform_document_storage_object_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_document_storage_object_version_idx"
  ON "platform_document_storage_object" ("tenant_id", "version_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_document_storage_object_status_idx"
  ON "platform_document_storage_object" ("tenant_id", "status");

-- Add optimistic concurrency revision to platform_document if missing
ALTER TABLE "platform_document" ADD COLUMN IF NOT EXISTS "revision" integer DEFAULT 1 NOT NULL;
