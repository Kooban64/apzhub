-- APZTCMS-007: Automation result ingestion domain tables

CREATE TABLE IF NOT EXISTS "testing_automation_import" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "adapter_kind" varchar(32) NOT NULL,
  "adapter_version" varchar(64) NOT NULL,
  "external_run_ref" text NOT NULL,
  "status" varchar(32) NOT NULL,
  "correlation_id" text,
  "checksum" text,
  "payload_fingerprint" text,
  "summary" jsonb DEFAULT '{}'::jsonb,
  "error_summary" text,
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "canonical_snapshot" jsonb,
  "automated_execution_id" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_automation_import_adapter_chk" CHECK ("adapter_kind" IN (
    'vitest','playwright','junit_xml','generic_json','generic_tap','allure_metadata'
  )),
  CONSTRAINT "testing_automation_import_status_chk" CHECK ("status" IN (
    'pending','validating','importing','completed','failed','duplicate','corrected'
  )),
  CONSTRAINT "testing_automation_import_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "testing_automation_import_tenant_adapter_run_uidx"
  ON "testing_automation_import" ("tenant_id", "adapter_kind", "external_run_ref");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "testing_automation_import_tenant_fingerprint_uidx"
  ON "testing_automation_import" ("tenant_id", "payload_fingerprint")
  WHERE "payload_fingerprint" IS NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_automation_import_tenant_idx"
  ON "testing_automation_import" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_automation_import_status_idx"
  ON "testing_automation_import" ("tenant_id", "status");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_automated_execution" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "session_id" text,
  "import_id" text NOT NULL,
  "automation_type" varchar(32) NOT NULL,
  "status" varchar(32) NOT NULL,
  "adapter_source_id" text,
  "external_run_ref" text NOT NULL,
  "environment" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "overall_status" varchar(32) NOT NULL,
  "duration_ms" integer,
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "adapter_kind" varchar(32) NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_automated_execution_type_chk" CHECK ("automation_type" IN (
    'unit','integration','e2e','api','performance','security','accessibility','other'
  )),
  CONSTRAINT "testing_automated_execution_overall_chk" CHECK ("overall_status" IN (
    'pass','fail','skipped','blocked','timed_out','cancelled','errored','unknown'
  )),
  CONSTRAINT "testing_automated_execution_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_automated_execution_tenant_idx"
  ON "testing_automated_execution" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_automated_execution_import_idx"
  ON "testing_automated_execution" ("tenant_id", "import_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_automated_execution_external_idx"
  ON "testing_automated_execution" ("tenant_id", "external_run_ref");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_automation_run" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "execution_id" text NOT NULL,
  "suite_key" text,
  "case_key" text,
  "title" text NOT NULL,
  "status" varchar(32) NOT NULL,
  "duration_ms" integer,
  "message" text,
  "stack" text,
  "result" jsonb,
  "tags" jsonb DEFAULT '[]'::jsonb,
  "requirement_refs" jsonb DEFAULT '[]'::jsonb,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_automation_run_status_chk" CHECK ("status" IN (
    'pass','fail','skipped','blocked','timed_out','cancelled','errored','unknown'
  )),
  CONSTRAINT "testing_automation_run_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_automation_run_tenant_idx"
  ON "testing_automation_run" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_automation_run_execution_idx"
  ON "testing_automation_run" ("tenant_id", "execution_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_automation_result_item" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "run_id" text NOT NULL,
  "status" varchar(32) NOT NULL,
  "step_payload" jsonb,
  "name" text,
  "duration_ms" integer,
  "message" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_automation_result_item_status_chk" CHECK ("status" IN (
    'pass','fail','skipped','blocked','timed_out','cancelled','errored','unknown'
  )),
  CONSTRAINT "testing_automation_result_item_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_automation_result_item_tenant_idx"
  ON "testing_automation_result_item" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_automation_result_item_run_idx"
  ON "testing_automation_result_item" ("tenant_id", "run_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_automation_import_history" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "import_id" text NOT NULL,
  "event_type" varchar(128) NOT NULL,
  "occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
  "actor_user_id" text,
  "summary" text NOT NULL,
  "details" jsonb DEFAULT '{}'::jsonb,
  "adapter_version" varchar(64),
  "normalization_notes" text,
  "correlation_id" text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_automation_import_history_tenant_import_idx"
  ON "testing_automation_import_history" ("tenant_id", "import_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_automation_import_history_occurred_idx"
  ON "testing_automation_import_history" ("tenant_id", "occurred_at");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_automation_coverage_snapshot" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "import_id" text,
  "execution_id" text,
  "summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "covered_count" integer,
  "total_count" integer,
  "percentage" real,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_automation_coverage_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_automation_coverage_tenant_idx"
  ON "testing_automation_coverage_snapshot" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_automation_coverage_import_idx"
  ON "testing_automation_coverage_snapshot" ("tenant_id", "import_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_automation_coverage_execution_idx"
  ON "testing_automation_coverage_snapshot" ("tenant_id", "execution_id");
