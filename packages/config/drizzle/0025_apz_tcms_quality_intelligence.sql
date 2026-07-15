-- APZTCMS-008: Quality intelligence domain tables

CREATE TABLE IF NOT EXISTS "testing_defect_link" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "provider_kind" varchar(32) NOT NULL,
  "provider_key" text,
  "status" varchar(32) NOT NULL,
  "internal_ref" text,
  "external_ref" text,
  "severity" varchar(32),
  "priority" varchar(32),
  "owner_user_id" text,
  "resolution" text,
  "verification_state" text,
  "summary" text,
  "url" text,
  "requirement_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "plan_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "suite_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "case_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "manual_execution_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "automation_execution_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "evidence_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "release_label" text,
  "risk_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "work_item_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "target" varchar(32),
  "external_id" text,
  "result_id" text,
  "run_id" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_defect_link_provider_chk" CHECK ("provider_kind" IN (
    'internal','projects','support','external_generic'
  )),
  CONSTRAINT "testing_defect_link_status_chk" CHECK ("status" IN (
    'open','in_progress','resolved','verified','closed','reopened','cancelled'
  )),
  CONSTRAINT "testing_defect_link_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_defect_link_tenant_idx"
  ON "testing_defect_link" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_defect_link_status_idx"
  ON "testing_defect_link" ("tenant_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_defect_link_provider_idx"
  ON "testing_defect_link" ("tenant_id", "provider_kind");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_defect_link_release_idx"
  ON "testing_defect_link" ("tenant_id", "release_label");
--> statement-breakpoint

-- Expand coverage kind CHECK to include quality intelligence kinds
ALTER TABLE "testing_coverage_record" DROP CONSTRAINT IF EXISTS "testing_coverage_kind_chk";
--> statement-breakpoint
ALTER TABLE "testing_coverage_record" ADD CONSTRAINT "testing_coverage_kind_chk"
  CHECK ("kind" IN (
    'requirement','risk','suite','plan','code_ref',
    'feature','story','case','manual','automation','execution','release'
  ));
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_quality_snapshot" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "scope" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "metrics" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "computed_at" timestamp with time zone NOT NULL,
  "label" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_quality_snapshot_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_quality_snapshot_tenant_idx"
  ON "testing_quality_snapshot" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_quality_snapshot_computed_idx"
  ON "testing_quality_snapshot" ("tenant_id", "computed_at");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_regression_analysis" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "baseline_label" text NOT NULL,
  "current_label" text NOT NULL,
  "new_failures" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "resolved_failures" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "reopened_failures" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "coverage_delta" real DEFAULT 0 NOT NULL,
  "execution_delta" real DEFAULT 0 NOT NULL,
  "computed_at" timestamp with time zone NOT NULL,
  "details" jsonb DEFAULT '{}'::jsonb,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_regression_analysis_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_regression_analysis_tenant_idx"
  ON "testing_regression_analysis" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_regression_analysis_computed_idx"
  ON "testing_regression_analysis" ("tenant_id", "computed_at");
