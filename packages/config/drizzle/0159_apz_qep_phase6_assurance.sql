-- APZQEP Phase 6: Quality Risk, Quality Gate definition/evaluation, Certification Exception.
CREATE TABLE IF NOT EXISTS "qep_quality_risk" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "number" varchar(32) NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "severity" varchar(16) NOT NULL,
  "status" varchar(16) NOT NULL,
  "owner" text,
  "domain" text,
  "impact" varchar(16),
  "likelihood" varchar(16),
  "waiver_note" text,
  "evidence_ref" text,
  "legacy_risk_id" text,
  "created_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_quality_risk_number_uidx"
  ON "qep_quality_risk" ("tenant_id", "application_id", "number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_quality_risk_app_idx"
  ON "qep_quality_risk" ("tenant_id", "application_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_quality_risk_history" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "risk_id" text NOT NULL,
  "action" varchar(64) NOT NULL,
  "from_status" varchar(16),
  "to_status" varchar(16),
  "from_severity" varchar(16),
  "to_severity" varchar(16),
  "note" text,
  "actor_id" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_quality_risk_history_risk_idx"
  ON "qep_quality_risk_history" ("tenant_id", "risk_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_quality_risk_signal" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "risk_id" text NOT NULL,
  "kind" varchar(32) NOT NULL,
  "target_id" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_quality_risk_signal_risk_idx"
  ON "qep_quality_risk_signal" ("tenant_id", "risk_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_quality_gate_definition" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "number" varchar(32) NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "gate_type" varchar(16) NOT NULL,
  "lifecycle" varchar(16) NOT NULL,
  "version" integer NOT NULL,
  "condition_kind" varchar(64) NOT NULL,
  "condition_operator" varchar(8) NOT NULL,
  "condition_value" integer NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_quality_gate_definition_number_uidx"
  ON "qep_quality_gate_definition" ("tenant_id", "application_id", "number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_quality_gate_definition_app_idx"
  ON "qep_quality_gate_definition" ("tenant_id", "application_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_quality_gate_evaluation" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "gate_definition_id" text NOT NULL,
  "definition_version" integer NOT NULL,
  "definition_snapshot" jsonb NOT NULL,
  "environment_id" text NOT NULL,
  "environment_snapshot" jsonb NOT NULL,
  "change_event_id" text NOT NULL,
  "scm_identity" jsonb,
  "facts_used" jsonb NOT NULL,
  "observed_value" integer,
  "result" varchar(24) NOT NULL,
  "reason" text NOT NULL,
  "evaluated_at" timestamp with time zone NOT NULL,
  "evaluated_by" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_quality_gate_evaluation_app_idx"
  ON "qep_quality_gate_evaluation" ("tenant_id", "application_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_quality_gate_evaluation_gate_idx"
  ON "qep_quality_gate_evaluation" ("tenant_id", "gate_definition_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_quality_gate_evaluation_ctx_idx"
  ON "qep_quality_gate_evaluation" ("tenant_id", "application_id", "change_event_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_certification_exception" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "environment_id" text NOT NULL,
  "change_event_id" text NOT NULL,
  "gate_definition_id" text NOT NULL,
  "gate_evaluation_id" text NOT NULL,
  "reason" text NOT NULL,
  "status" varchar(16) NOT NULL,
  "authorised_by" text NOT NULL,
  "authorised_at" timestamp with time zone NOT NULL,
  "revoked_by" text,
  "revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_certification_exception_ctx_idx"
  ON "qep_certification_exception" ("tenant_id", "application_id", "change_event_id");
