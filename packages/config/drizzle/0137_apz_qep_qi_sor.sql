-- APZQEP QX-PR-03: Durable Quality Intelligence SoR. Additive only.

CREATE TABLE IF NOT EXISTS "qep_qi_observation" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "correlation_id" text NOT NULL,
  "recorded_at" timestamp with time zone NOT NULL,
  "observation_json" jsonb NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_qi_observation_tenant_idx" ON "qep_qi_observation" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_qi_observation_tenant_recorded_idx" ON "qep_qi_observation" ("tenant_id", "recorded_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_qi_observation_correlation_idx" ON "qep_qi_observation" ("tenant_id", "correlation_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_qi_signal" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "kind" varchar(64) NOT NULL,
  "calculated_at" timestamp with time zone NOT NULL,
  "signal_json" jsonb NOT NULL,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_qi_signal_tenant_idx" ON "qep_qi_signal" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_qi_signal_tenant_kind_idx" ON "qep_qi_signal" ("tenant_id", "kind");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_qi_signal_tenant_calculated_idx" ON "qep_qi_signal" ("tenant_id", "calculated_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_qi_recommendation" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "status" varchar(32) NOT NULL,
  "provider_id" varchar(64) NOT NULL,
  "explanation_id" text NOT NULL,
  "correlation_id" text NOT NULL,
  "recommendation_json" jsonb NOT NULL,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),
  "proposed_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_qi_recommendation_tenant_idx" ON "qep_qi_recommendation" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_qi_recommendation_tenant_status_idx" ON "qep_qi_recommendation" ("tenant_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_qi_recommendation_tenant_updated_idx" ON "qep_qi_recommendation" ("tenant_id", "updated_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_qi_recommendation_explanation_idx" ON "qep_qi_recommendation" ("explanation_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_qi_explanation" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "provider_id" varchar(64) NOT NULL,
  "explanation_json" jsonb NOT NULL,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),
  "created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_qi_explanation_tenant_idx" ON "qep_qi_explanation" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_qi_explanation_tenant_provider_idx" ON "qep_qi_explanation" ("tenant_id", "provider_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_qi_score" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "dimension" varchar(32) NOT NULL,
  "calculated_at" timestamp with time zone NOT NULL,
  "score_json" jsonb NOT NULL,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_qi_score_tenant_idx" ON "qep_qi_score" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_qi_score_tenant_dimension_idx" ON "qep_qi_score" ("tenant_id", "dimension");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_qi_score_tenant_calculated_idx" ON "qep_qi_score" ("tenant_id", "calculated_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_qi_audit" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "recommendation_id" text NOT NULL,
  "occurred_at" timestamp with time zone NOT NULL,
  "audit_json" jsonb NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_qi_audit_tenant_idx" ON "qep_qi_audit" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_qi_audit_tenant_occurred_idx" ON "qep_qi_audit" ("tenant_id", "occurred_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_qi_audit_recommendation_idx" ON "qep_qi_audit" ("recommendation_id");
