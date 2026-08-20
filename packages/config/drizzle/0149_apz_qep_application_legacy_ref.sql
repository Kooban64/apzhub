-- APZQEP Phase 1E closure: durable Application ↔ legacy projectId mapping.
-- Additive only. Does not rewrite Cap/QEP historical records.

CREATE TABLE IF NOT EXISTS "qep_application_legacy_ref" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "project_ref" text NOT NULL,
  "application_id" text,
  "origin" varchar(64) NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_application_legacy_ref_tenant_ref_uidx"
  ON "qep_application_legacy_ref" ("tenant_id", "project_ref");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_application_legacy_ref_tenant_idx"
  ON "qep_application_legacy_ref" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_application_legacy_ref_application_idx"
  ON "qep_application_legacy_ref" ("application_id");
