-- APZTCMS-004: Manual execution result tables + additive columns

ALTER TABLE "testing_test_plan" ADD COLUMN IF NOT EXISTS "owner_id" text;
--> statement-breakpoint
ALTER TABLE "testing_test_plan" ADD COLUMN IF NOT EXISTS "assignee_id" text;
--> statement-breakpoint
ALTER TABLE "testing_test_plan" ADD COLUMN IF NOT EXISTS "version_number" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "testing_test_plan" ADD COLUMN IF NOT EXISTS "parent_plan_id" text;
--> statement-breakpoint
ALTER TABLE "testing_test_plan" DROP CONSTRAINT IF EXISTS "testing_test_plan_status_chk";
--> statement-breakpoint
ALTER TABLE "testing_test_plan" ADD CONSTRAINT "testing_test_plan_status_chk" CHECK ("status" in ('draft','review','ready','approved','deprecated','archived'));
--> statement-breakpoint
ALTER TABLE "testing_test_suite" ADD COLUMN IF NOT EXISTS "owner_id" text;
--> statement-breakpoint
ALTER TABLE "testing_test_suite" ADD COLUMN IF NOT EXISTS "parent_suite_id" text;
--> statement-breakpoint
ALTER TABLE "testing_test_suite" ADD COLUMN IF NOT EXISTS "sort_order" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "testing_test_suite" ADD COLUMN IF NOT EXISTS "version_number" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "testing_test_suite" ADD COLUMN IF NOT EXISTS "group_key" varchar(128);
--> statement-breakpoint
ALTER TABLE "testing_test_suite" DROP CONSTRAINT IF EXISTS "testing_test_suite_status_chk";
--> statement-breakpoint
ALTER TABLE "testing_test_suite" ADD CONSTRAINT "testing_test_suite_status_chk" CHECK ("status" in ('draft','review','ready','approved','deprecated','archived'));
--> statement-breakpoint
ALTER TABLE "testing_test_case" ADD COLUMN IF NOT EXISTS "preconditions" text;
--> statement-breakpoint
ALTER TABLE "testing_test_case" ADD COLUMN IF NOT EXISTS "postconditions" text;
--> statement-breakpoint
ALTER TABLE "testing_test_case" ADD COLUMN IF NOT EXISTS "expected_results_summary" text;
--> statement-breakpoint
ALTER TABLE "testing_test_case" ADD COLUMN IF NOT EXISTS "template_key" varchar(128);
--> statement-breakpoint
ALTER TABLE "testing_test_case" ADD COLUMN IF NOT EXISTS "parameters" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "testing_test_case" ADD COLUMN IF NOT EXISTS "components" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "testing_test_case" ADD COLUMN IF NOT EXISTS "owner_id" text;
--> statement-breakpoint
ALTER TABLE "testing_test_case" ADD COLUMN IF NOT EXISTS "reviewer_id" text;
--> statement-breakpoint
ALTER TABLE "testing_test_case" ADD COLUMN IF NOT EXISTS "version_number" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "testing_test_case" ADD COLUMN IF NOT EXISTS "parent_case_id" text;
--> statement-breakpoint
ALTER TABLE "testing_test_case" ADD COLUMN IF NOT EXISTS "risk_level" varchar(32);
--> statement-breakpoint
ALTER TABLE "testing_test_case" DROP CONSTRAINT IF EXISTS "testing_test_case_status_chk";
--> statement-breakpoint
ALTER TABLE "testing_test_case" ADD CONSTRAINT "testing_test_case_status_chk" CHECK ("status" in ('draft','review','ready','approved','deprecated','archived'));
--> statement-breakpoint
ALTER TABLE "testing_risk" ADD COLUMN IF NOT EXISTS "severity" varchar(32);
--> statement-breakpoint
ALTER TABLE "testing_risk" ADD COLUMN IF NOT EXISTS "likelihood" varchar(32);
--> statement-breakpoint
ALTER TABLE "testing_risk" ADD COLUMN IF NOT EXISTS "impact" varchar(32);
--> statement-breakpoint
ALTER TABLE "testing_risk" ADD COLUMN IF NOT EXISTS "business_criticality" varchar(32);
--> statement-breakpoint
ALTER TABLE "testing_risk" ADD COLUMN IF NOT EXISTS "regression_importance" varchar(32);
--> statement-breakpoint
ALTER TABLE "testing_risk" ADD COLUMN IF NOT EXISTS "owner_id" text;
--> statement-breakpoint
ALTER TABLE "testing_regression_set" ADD COLUMN IF NOT EXISTS "owner_id" text;
--> statement-breakpoint
ALTER TABLE "testing_execution_session" DROP CONSTRAINT IF EXISTS "testing_execution_session_status_chk";
--> statement-breakpoint
ALTER TABLE "testing_execution_session" ADD CONSTRAINT "testing_execution_session_status_chk" CHECK ("status" in ('planned','queued','in_progress','paused','completed','aborted','failed'));
--> statement-breakpoint
ALTER TABLE "testing_evidence" ADD COLUMN IF NOT EXISTS "url" text;
--> statement-breakpoint
ALTER TABLE "testing_evidence" ADD COLUMN IF NOT EXISTS "checksum" text;
--> statement-breakpoint
ALTER TABLE "testing_evidence" ADD COLUMN IF NOT EXISTS "mime_type" varchar(128);
--> statement-breakpoint
ALTER TABLE "testing_evidence" ADD COLUMN IF NOT EXISTS "relationships" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "testing_evidence" ADD COLUMN IF NOT EXISTS "execution_id" text;
--> statement-breakpoint
ALTER TABLE "testing_evidence" DROP CONSTRAINT IF EXISTS "testing_evidence_type_chk";
--> statement-breakpoint
ALTER TABLE "testing_evidence" ADD CONSTRAINT "testing_evidence_type_chk" CHECK ("type" in ('screenshot','log','video','trace','report','note','attachment','url','other'));
--> statement-breakpoint
ALTER TABLE "testing_approval" ADD COLUMN IF NOT EXISTS "author_user_id" text;
--> statement-breakpoint
ALTER TABLE "testing_approval" ADD COLUMN IF NOT EXISTS "reviewer_user_id" text;
--> statement-breakpoint
ALTER TABLE "testing_approval" ADD COLUMN IF NOT EXISTS "approver_user_id" text;
--> statement-breakpoint
ALTER TABLE "testing_approval" ADD COLUMN IF NOT EXISTS "history_json" jsonb;
--> statement-breakpoint
ALTER TABLE "testing_approval" ADD COLUMN IF NOT EXISTS "subject_kind" varchar(64);
--> statement-breakpoint
ALTER TABLE "testing_approval" ADD COLUMN IF NOT EXISTS "subject_id" text;
--> statement-breakpoint
ALTER TABLE "testing_approval" DROP CONSTRAINT IF EXISTS "testing_approval_status_chk";
--> statement-breakpoint
ALTER TABLE "testing_approval" ADD CONSTRAINT "testing_approval_status_chk" CHECK ("status" in ('pending','approved','rejected','withdrawn','conditional','rework'));
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_manual_execution" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "session_id" text NOT NULL,
  "case_id" text NOT NULL,
  "status" varchar(32) NOT NULL,
  "assignee_id" text,
  "tester_id" text,
  "reviewer_id" text,
  "started_at" timestamp with time zone,
  "paused_at" timestamp with time zone,
  "resumed_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "approval_state" varchar(32) DEFAULT 'none' NOT NULL,
  "comments" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "step_actuals" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "overall_result" varchar(32),
  "restart_of_id" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_manual_execution_status_chk" CHECK ("status" in ('planned','queued','in_progress','paused','completed','aborted','failed')),
  CONSTRAINT "testing_manual_execution_approval_chk" CHECK ("approval_state" in ('none','pending_review','approved','rejected')),
  CONSTRAINT "testing_manual_execution_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_manual_execution_tenant_idx" ON "testing_manual_execution" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_manual_execution_session_idx" ON "testing_manual_execution" ("tenant_id","session_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_manual_execution_case_idx" ON "testing_manual_execution" ("tenant_id","case_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_manual_step_actual" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "execution_id" text NOT NULL,
  "step_id" text NOT NULL,
  "actual_result" text,
  "status" varchar(32),
  "evidence_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "notes" text,
  "comment" text,
  "recorded_at" timestamp with time zone,
  "expected_snapshot" text,
  "recorded_by_user_id" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_manual_step_actual_status_chk" CHECK ("status" is null or "status" in ('pass','fail','blocked','skipped','retest','not_executed')),
  CONSTRAINT "testing_manual_step_actual_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "testing_manual_step_actual_exec_step_uidx" ON "testing_manual_step_actual" ("tenant_id","execution_id","step_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_manual_step_actual_exec_idx" ON "testing_manual_step_actual" ("tenant_id","execution_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_test_case_version" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "case_id" text NOT NULL,
  "version_number" integer NOT NULL,
  "reason" varchar(32) NOT NULL,
  "snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "changed_by_user_id" text,
  "change_summary" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_test_case_version_reason_chk" CHECK ("reason" in ('created','edited','cloned','status_change','template_applied','rework','manual_version')),
  CONSTRAINT "testing_test_case_version_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "testing_test_case_version_case_ver_uidx" ON "testing_test_case_version" ("tenant_id","case_id","version_number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_test_case_version_case_idx" ON "testing_test_case_version" ("tenant_id","case_id");
