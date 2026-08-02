-- APZQEP-151: Durable Core QE persistence (Caps A–F). Additive only.
-- Ephemeral in-memory process state is NOT migrated as production data.

CREATE TABLE IF NOT EXISTS "qep_suite" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "project_id" text,
  "parent_suite_id" text,
  "folder_path" text NOT NULL DEFAULT '/',
  "name" text NOT NULL,
  "description" text NOT NULL DEFAULT '',
  "owner_id" text NOT NULL,
  "kind" varchar(32) NOT NULL,
  "status" varchar(32) NOT NULL,
  "version" integer NOT NULL DEFAULT 1 CHECK ("version" >= 1),
  "priority" varchar(32) NOT NULL DEFAULT 'normal',
  "category" text,
  "tags_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "risk" text,
  "business_area" text,
  "application" text,
  "component" text,
  "classification" text,
  "favourite_user_ids_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "pinned_user_ids_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "published_at" timestamp with time zone,
  "archived_at" timestamp with time zone,
  "retired_at" timestamp with time zone,
  "deleted_at" timestamp with time zone,
  "custom_metadata_json" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "history_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_suite_tenant_idx" ON "qep_suite" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_suite_tenant_project_idx" ON "qep_suite" ("tenant_id", "project_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_suite_tenant_status_idx" ON "qep_suite" ("tenant_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_suite_tenant_parent_idx" ON "qep_suite" ("tenant_id", "parent_suite_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_suite_tenant_updated_idx" ON "qep_suite" ("tenant_id", "updated_at");

CREATE TABLE IF NOT EXISTS "qep_execution_plan" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "project_id" text,
  "name" text NOT NULL,
  "description" text NOT NULL DEFAULT '',
  "owner_id" text NOT NULL,
  "status" varchar(32) NOT NULL,
  "priority" varchar(32),
  "risk" text,
  "suite_id" text NOT NULL,
  "suite_version" integer,
  "suite_name" text,
  "handoff_id" text,
  "version" integer NOT NULL DEFAULT 1 CHECK ("version" >= 1),
  "plan_json" jsonb NOT NULL,
  "history_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  CONSTRAINT "qep_execution_plan_tenant_handoff_uidx" UNIQUE ("tenant_id", "handoff_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_execution_plan_tenant_idx" ON "qep_execution_plan" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_execution_plan_tenant_status_idx" ON "qep_execution_plan" ("tenant_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_execution_plan_tenant_suite_idx" ON "qep_execution_plan" ("tenant_id", "suite_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_execution_plan_tenant_project_idx" ON "qep_execution_plan" ("tenant_id", "project_id");

CREATE TABLE IF NOT EXISTS "qep_execution_session" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "project_id" text,
  "name" text NOT NULL,
  "owner_id" text NOT NULL,
  "status" varchar(32) NOT NULL,
  "plan_id" text,
  "handoff_id" text,
  "suite_id" text,
  "session_json" jsonb NOT NULL,
  "history_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  CONSTRAINT "qep_execution_session_tenant_handoff_uidx" UNIQUE ("tenant_id", "handoff_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_execution_session_tenant_idx" ON "qep_execution_session" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_execution_session_tenant_status_idx" ON "qep_execution_session" ("tenant_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_execution_session_tenant_plan_idx" ON "qep_execution_session" ("tenant_id", "plan_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_execution_session_tenant_project_idx" ON "qep_execution_session" ("tenant_id", "project_id");

CREATE TABLE IF NOT EXISTS "qep_defect" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "project_id" text,
  "title" text NOT NULL,
  "description" text NOT NULL DEFAULT '',
  "status" varchar(32) NOT NULL,
  "severity" varchar(32) NOT NULL,
  "priority" varchar(32) NOT NULL,
  "reporter_id" text NOT NULL,
  "assignee_id" text,
  "session_id" text,
  "suite_id" text,
  "defect_json" jsonb NOT NULL,
  "history_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_defect_tenant_idx" ON "qep_defect" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_defect_tenant_status_idx" ON "qep_defect" ("tenant_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_defect_tenant_project_idx" ON "qep_defect" ("tenant_id", "project_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_defect_tenant_session_idx" ON "qep_defect" ("tenant_id", "session_id");

CREATE TABLE IF NOT EXISTS "qep_enterprise_requirement" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "project_id" text,
  "title" text NOT NULL,
  "description" text NOT NULL DEFAULT '',
  "status" varchar(32) NOT NULL,
  "category" text,
  "priority" varchar(32),
  "criticality" varchar(32),
  "risk" varchar(32),
  "owner_id" text NOT NULL,
  "version" integer NOT NULL DEFAULT 1 CHECK ("version" >= 1),
  "requirement_json" jsonb NOT NULL,
  "history_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_enterprise_requirement_tenant_idx" ON "qep_enterprise_requirement" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_enterprise_requirement_tenant_status_idx" ON "qep_enterprise_requirement" ("tenant_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_enterprise_requirement_tenant_project_idx" ON "qep_enterprise_requirement" ("tenant_id", "project_id");

CREATE TABLE IF NOT EXISTS "qep_saved_report" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "project_id" text,
  "owner_id" text NOT NULL,
  "name" text NOT NULL,
  "template_id" text NOT NULL,
  "report_json" jsonb NOT NULL,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_saved_report_tenant_idx" ON "qep_saved_report" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_saved_report_tenant_owner_idx" ON "qep_saved_report" ("tenant_id", "owner_id");

CREATE TABLE IF NOT EXISTS "qep_reporting_trend_sample" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "sampled_at" timestamp with time zone NOT NULL,
  "sample_json" jsonb NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_reporting_trend_tenant_sampled_idx" ON "qep_reporting_trend_sample" ("tenant_id", "sampled_at");

CREATE TABLE IF NOT EXISTS "qep_core_qe_idempotency" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "scope" text NOT NULL,
  "idempotency_key" text NOT NULL,
  "resource_id" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "qep_core_qe_idempotency_uidx" UNIQUE ("tenant_id", "scope", "idempotency_key")
);
