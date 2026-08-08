-- APZQEP QX-PR-02: Durable SCM SoR. Additive only.

CREATE TABLE IF NOT EXISTS "qep_scm_repository" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "provider_id" varchar(64) NOT NULL,
  "full_name" text NOT NULL,
  "repository_json" jsonb NOT NULL,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),
  "registered_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_scm_repository_tenant_provider_name_uidx" ON "qep_scm_repository" ("tenant_id", "provider_id", "full_name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_scm_repository_tenant_idx" ON "qep_scm_repository" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_scm_repository_tenant_updated_idx" ON "qep_scm_repository" ("tenant_id", "updated_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_scm_webhook_audit" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "provider_id" varchar(64) NOT NULL,
  "idempotency_key" text NOT NULL,
  "audit_json" jsonb NOT NULL,
  "occurred_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_scm_webhook_audit_tenant_occurred_idx" ON "qep_scm_webhook_audit" ("tenant_id", "occurred_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_scm_webhook_audit_idempotency_idx" ON "qep_scm_webhook_audit" ("idempotency_key");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_scm_webhook_idempotency" (
  "idempotency_key" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "seen_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_scm_webhook_idempotency_tenant_idx" ON "qep_scm_webhook_idempotency" ("tenant_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_scm_traceability_link" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "repository_id" text NOT NULL,
  "link_json" jsonb NOT NULL,
  "created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_scm_traceability_link_repository_idx" ON "qep_scm_traceability_link" ("repository_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_scm_traceability_link_tenant_idx" ON "qep_scm_traceability_link" ("tenant_id");
