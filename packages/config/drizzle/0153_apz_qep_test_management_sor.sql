-- APZQEP Phase 3: Test management additive extensions.
-- Extends Specification, Suite, Test Plan, Execution Plan, Test Execution.
-- Does not create qep_test_case. Does not create Release. Does not invent
-- Web/API/Repository as infrastructure target types.

ALTER TABLE "qep_test_specifications"
  ADD COLUMN IF NOT EXISTS "application_id" text,
  ADD COLUMN IF NOT EXISTS "definition_version" integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "manual_capable" boolean NOT NULL DEFAULT true;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_specifications_tenant_application_idx"
  ON "qep_test_specifications" ("tenant_id", "application_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_test_specification_step" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "specification_id" text NOT NULL,
  "step_order" integer NOT NULL,
  "action" text NOT NULL,
  "test_data_ref" text,
  "expected_result" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_test_specification_step_order_uidx"
  ON "qep_test_specification_step" ("tenant_id", "specification_id", "step_order");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_specification_step_spec_idx"
  ON "qep_test_specification_step" ("tenant_id", "specification_id");
--> statement-breakpoint
ALTER TABLE "qep_suite"
  ADD COLUMN IF NOT EXISTS "application_id" text,
  ADD COLUMN IF NOT EXISTS "suite_key" varchar(32);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_suite_tenant_app_key_uidx"
  ON "qep_suite" ("tenant_id", "application_id", "suite_key")
  WHERE "suite_key" IS NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_suite_tenant_application_idx"
  ON "qep_suite" ("tenant_id", "application_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_suite_item" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "suite_id" text NOT NULL,
  "specification_id" text NOT NULL,
  "sequence" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_suite_item_membership_uidx"
  ON "qep_suite_item" ("suite_id", "specification_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_suite_item_tenant_suite_idx"
  ON "qep_suite_item" ("tenant_id", "suite_id");
--> statement-breakpoint
ALTER TABLE "qep_test_plans"
  ADD COLUMN IF NOT EXISTS "application_id" text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_plans_tenant_application_idx"
  ON "qep_test_plans" ("tenant_id", "application_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_test_plan_suite_item" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "plan_id" text NOT NULL,
  "suite_id" text NOT NULL,
  "sequence" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_test_plan_suite_item_uidx"
  ON "qep_test_plan_suite_item" ("plan_id", "suite_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_plan_suite_item_plan_idx"
  ON "qep_test_plan_suite_item" ("tenant_id", "plan_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_test_plan_strategy_group" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "plan_id" text NOT NULL,
  "name" text NOT NULL,
  "verification_capability" varchar(64) NOT NULL,
  "execution_surface" varchar(32),
  "environment_id" text,
  "infrastructure_target_type" varchar(32),
  "infrastructure_target_id" text,
  "automation_mapping_id" text,
  "test_data_ref" text,
  "schedule_note" text,
  "sequence" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "updated_by" text NOT NULL,
  CONSTRAINT "qep_test_plan_strategy_infra_type_chk"
    CHECK (
      "infrastructure_target_type" IS NULL
      OR "infrastructure_target_type" IN ('ci_pipeline', 'managed_runner', 'remote_host')
    )
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_plan_strategy_group_plan_idx"
  ON "qep_test_plan_strategy_group" ("tenant_id", "plan_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_test_case_automation_mapping" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "specification_id" text NOT NULL,
  "verification_capability" varchar(64) NOT NULL,
  "provider_id" text,
  "asset_ref" text,
  "created_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_case_automation_mapping_spec_idx"
  ON "qep_test_case_automation_mapping" ("tenant_id", "specification_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_execution_definition_snapshot" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "execution_id" text NOT NULL,
  "execution_kind" varchar(32) NOT NULL,
  "specification_id" text NOT NULL,
  "specification_number" text NOT NULL,
  "definition_version" integer NOT NULL,
  "steps_json" jsonb NOT NULL,
  "created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_execution_definition_snapshot_exec_idx"
  ON "qep_execution_definition_snapshot" ("tenant_id", "execution_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_execution_scope_snapshot" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "execution_id" text NOT NULL,
  "execution_kind" varchar(32) NOT NULL,
  "plan_id" text,
  "suite_id" text,
  "member_specification_ids_json" jsonb NOT NULL,
  "created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_execution_scope_snapshot_exec_idx"
  ON "qep_execution_scope_snapshot" ("tenant_id", "execution_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_test_execution_defect" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "test_execution_id" text NOT NULL,
  "defect_id" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_test_execution_defect_uidx"
  ON "qep_test_execution_defect" ("test_execution_id", "defect_id");
--> statement-breakpoint
ALTER TABLE "qep_execution_plan"
  ADD COLUMN IF NOT EXISTS "application_id" text;
--> statement-breakpoint
ALTER TABLE "qep_execution_session"
  ADD COLUMN IF NOT EXISTS "application_id" text;
--> statement-breakpoint
ALTER TABLE "qep_test_execution"
  ADD COLUMN IF NOT EXISTS "application_id" text;
--> statement-breakpoint
ALTER TABLE "qep_defect"
  ADD COLUMN IF NOT EXISTS "test_execution_id" text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_defect_tenant_test_execution_idx"
  ON "qep_defect" ("tenant_id", "test_execution_id");
