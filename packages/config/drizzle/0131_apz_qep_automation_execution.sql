-- APZQEP QX-PR-01: Durable Automation execution SoR. Additive only.

CREATE TABLE IF NOT EXISTS "qep_automation_execution" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "project_id" text,
  "provider_id" varchar(64) NOT NULL,
  "correlation_id" text NOT NULL,
  "requested_by" text NOT NULL,
  "state" varchar(32) NOT NULL,
  "attempt" integer NOT NULL DEFAULT 0 CHECK ("attempt" >= 0),
  "max_attempts" integer NOT NULL DEFAULT 1 CHECK ("max_attempts" >= 1),
  "execution_json" jsonb NOT NULL,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_automation_execution_tenant_idx" ON "qep_automation_execution" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_automation_execution_tenant_state_idx" ON "qep_automation_execution" ("tenant_id", "state");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_automation_execution_tenant_updated_idx" ON "qep_automation_execution" ("tenant_id", "updated_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_automation_execution_correlation_idx" ON "qep_automation_execution" ("tenant_id", "correlation_id");
