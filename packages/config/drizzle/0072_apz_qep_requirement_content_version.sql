-- APZQEP-ENG-020D: append-only requirement content history.
-- Parent rows must belong to the same tenant/requirement; that cross-row rule is enforced by the application.
CREATE TABLE IF NOT EXISTS "qep_requirement_content_version" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "requirement_id" text NOT NULL,
  "version_number" integer NOT NULL CHECK ("version_number" >= 1),
  "parent_version_number" integer,
  "parent_version_id" text,
  "snapshot_json" jsonb NOT NULL,
  "snapshot_schema_version" varchar(64) NOT NULL,
  "hash_algorithm" varchar(32) NOT NULL,
  "snapshot_hash" text NOT NULL,
  "change_reason" text NOT NULL,
  "actor_user_id" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "source_revision" integer NOT NULL,
  "correlation_id" text NOT NULL,
  CONSTRAINT "qep_requirement_content_version_requirement_number_uidx"
    UNIQUE("tenant_id", "requirement_id", "version_number")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_requirement_content_version_latest_idx"
  ON "qep_requirement_content_version" ("tenant_id", "requirement_id", "version_number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_requirement_content_version_id_idx"
  ON "qep_requirement_content_version" ("tenant_id", "id");
--> statement-breakpoint
-- Application repositories expose append/read operations only. Backfill is deliberately
-- performed by the TypeScript canonicaliser after migrations, never SQL JSON serialization.
