-- APZQEP Phase 4: additive execution composition relationships.
CREATE TABLE IF NOT EXISTS "qep_execution_strategy_snapshot" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "execution_id" text NOT NULL,
  "execution_kind" varchar(32) NOT NULL,
  "plan_id" text,
  "strategy_group_id" text,
  "verification_capability" varchar(64),
  "execution_surface" varchar(32),
  "environment_id" text,
  "environment_name" text,
  "infrastructure_target_type" varchar(32),
  "infrastructure_target_id" text,
  "infrastructure_target_name" text,
  "automation_mapping_id" text,
  "provider_id" text,
  "asset_ref" text,
  "test_data_ref" text,
  "created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_execution_strategy_snapshot_exec_idx"
  ON "qep_execution_strategy_snapshot" ("tenant_id", "execution_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_test_execution_relation" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "execution_id" text NOT NULL,
  "relation_kind" varchar(16) NOT NULL,
  "previous_execution_id" text NOT NULL,
  "triggering_defect_id" text,
  "created_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_relation_exec_idx"
  ON "qep_test_execution_relation" ("tenant_id", "execution_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_relation_prev_idx"
  ON "qep_test_execution_relation" ("tenant_id", "previous_execution_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_test_execution_automation_link" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "test_execution_id" text NOT NULL,
  "automation_execution_id" text NOT NULL,
  "correlation_id" text,
  "created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_test_execution_automation_link_uidx"
  ON "qep_test_execution_automation_link" ("test_execution_id", "automation_execution_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_automation_link_tenant_idx"
  ON "qep_test_execution_automation_link" ("tenant_id", "test_execution_id");
