-- APZTCMS-009: Certification engine tables + expanded certification status CHECK

ALTER TABLE "testing_certification_record" DROP CONSTRAINT IF EXISTS "testing_certification_status_chk";
--> statement-breakpoint
ALTER TABLE "testing_certification_record" ADD CONSTRAINT "testing_certification_status_chk"
  CHECK ("status" IN (
    'draft','preparing','awaiting_evidence','awaiting_review','in_review',
    'changes_required','awaiting_approval','approved','conditionally_approved',
    'rejected','expired','archived',
    'development_ready','qa_ready','regression_ready','uat_ready',
    'production_ready','certified','failed_certification','conditional_approval'
  ));
--> statement-breakpoint

ALTER TABLE "testing_certification_record"
  ADD COLUMN IF NOT EXISTS "expires_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "testing_certification_record"
  ADD COLUMN IF NOT EXISTS "gate_evaluation_ids" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "testing_certification_record"
  ADD COLUMN IF NOT EXISTS "current_recommendation" varchar(64);
--> statement-breakpoint
ALTER TABLE "testing_certification_record"
  ADD COLUMN IF NOT EXISTS "recommendation_json" jsonb;
--> statement-breakpoint
ALTER TABLE "testing_certification_record"
  ADD COLUMN IF NOT EXISTS "evidence_links_json" jsonb DEFAULT '{}'::jsonb;
--> statement-breakpoint
ALTER TABLE "testing_certification_record"
  ADD COLUMN IF NOT EXISTS "rule_id" text;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_certification_gate_definition" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "gate_key" varchar(64) NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "kind" varchar(64) NOT NULL DEFAULT 'builtin',
  "required" boolean DEFAULT true NOT NULL,
  "config_json" jsonb DEFAULT '{}'::jsonb,
  "template_key" text,
  "ordinal" integer DEFAULT 0,
  "enabled" boolean DEFAULT true NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_cert_gate_def_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_cert_gate_def_tenant_idx"
  ON "testing_certification_gate_definition" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_cert_gate_def_key_idx"
  ON "testing_certification_gate_definition" ("tenant_id", "gate_key");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_certification_gate_evaluation" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "certification_record_id" text NOT NULL,
  "gate_definition_id" text,
  "gate_key" varchar(64) NOT NULL,
  "status" varchar(32) NOT NULL,
  "reason" text NOT NULL,
  "supporting_evidence" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "evaluated_at" timestamp with time zone NOT NULL,
  "evaluator_user_id" text,
  "traceability_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "details_json" jsonb DEFAULT '{}'::jsonb,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_cert_gate_eval_status_chk" CHECK ("status" IN (
    'pass','fail','warning','not_applicable','unknown','pending'
  )),
  CONSTRAINT "testing_cert_gate_eval_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_cert_gate_eval_tenant_idx"
  ON "testing_certification_gate_evaluation" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_cert_gate_eval_cert_idx"
  ON "testing_certification_gate_evaluation" ("tenant_id", "certification_record_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_certification_rule" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" varchar(64) NOT NULL,
  "name" text NOT NULL,
  "certification_record_id" text,
  "plan_id" text,
  "product_label" text,
  "required_gate_keys" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "optional_gate_keys" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "approval_stages_json" jsonb,
  "enabled" boolean DEFAULT true NOT NULL,
  "config_json" jsonb DEFAULT '{}'::jsonb,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_cert_rule_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "testing_cert_rule_tenant_key_uidx"
  ON "testing_certification_rule" ("tenant_id", "key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_cert_rule_tenant_idx"
  ON "testing_certification_rule" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_cert_rule_cert_idx"
  ON "testing_certification_rule" ("tenant_id", "certification_record_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_certification_audit" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "certification_record_id" text NOT NULL,
  "occurred_at" timestamp with time zone NOT NULL,
  "actor_user_id" text,
  "action" text NOT NULL,
  "summary" text NOT NULL,
  "details_json" jsonb DEFAULT '{}'::jsonb,
  "correlation_id" text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_cert_audit_tenant_idx"
  ON "testing_certification_audit" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_cert_audit_cert_idx"
  ON "testing_certification_audit" ("tenant_id", "certification_record_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_cert_audit_occurred_idx"
  ON "testing_certification_audit" ("tenant_id", "occurred_at");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_certification_history" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "certification_record_id" text NOT NULL,
  "occurred_at" timestamp with time zone NOT NULL,
  "actor_user_id" text,
  "from_status" varchar(64),
  "to_status" varchar(64) NOT NULL,
  "reason" text,
  "correlation_id" text,
  "details_json" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_cert_history_tenant_idx"
  ON "testing_certification_history" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_cert_history_cert_idx"
  ON "testing_certification_history" ("tenant_id", "certification_record_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_cert_history_occurred_idx"
  ON "testing_certification_history" ("tenant_id", "occurred_at");
