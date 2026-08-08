-- APZQEP QX-PR-05: Durable Orchestration SoR documents. Additive only.

CREATE TABLE IF NOT EXISTS "qep_qo_document" (
  "id" text PRIMARY KEY NOT NULL,
  "artefact_kind" varchar(64) NOT NULL,
  "artefact_key" text NOT NULL,
  "tenant_id" text NOT NULL,
  "project_id" text,
  "orchestration_id" text NOT NULL DEFAULT 'orch_default',
  "correlation_id" text,
  "status" varchar(64),
  "payload_json" jsonb NOT NULL,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL DEFAULT 'system',
  "updated_by" text NOT NULL DEFAULT 'system',
  CONSTRAINT "qep_qo_document_kind_key_uidx" UNIQUE ("artefact_kind", "artefact_key")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_qo_document_tenant_kind_idx" ON "qep_qo_document" ("tenant_id", "artefact_kind");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_qo_document_tenant_updated_idx" ON "qep_qo_document" ("tenant_id", "updated_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_qo_document_correlation_idx" ON "qep_qo_document" ("tenant_id", "correlation_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_qo_document_orch_kind_idx" ON "qep_qo_document" ("orchestration_id", "artefact_kind");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "qep_qo_trigger_idempotency" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "trigger_id" text NOT NULL,
  "seen_at" timestamp with time zone NOT NULL,
  CONSTRAINT "qep_qo_trigger_idempotency_uidx" UNIQUE ("tenant_id", "trigger_id")
);
