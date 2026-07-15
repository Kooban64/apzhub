-- APZTCMS-005: Plan/suite version tables + approval history

CREATE TABLE IF NOT EXISTS "testing_test_plan_version" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "plan_id" text NOT NULL,
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
  CONSTRAINT "testing_test_plan_version_reason_chk" CHECK ("reason" in ('created','edited','cloned','status_change','template_applied','rework','manual_version')),
  CONSTRAINT "testing_test_plan_version_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "testing_test_plan_version_plan_ver_uidx" ON "testing_test_plan_version" ("tenant_id","plan_id","version_number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_test_plan_version_plan_idx" ON "testing_test_plan_version" ("tenant_id","plan_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_test_suite_version" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "suite_id" text NOT NULL,
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
  CONSTRAINT "testing_test_suite_version_reason_chk" CHECK ("reason" in ('created','edited','cloned','status_change','template_applied','rework','manual_version')),
  CONSTRAINT "testing_test_suite_version_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "testing_test_suite_version_suite_ver_uidx" ON "testing_test_suite_version" ("tenant_id","suite_id","version_number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_test_suite_version_suite_idx" ON "testing_test_suite_version" ("tenant_id","suite_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testing_approval_history" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "approval_id" text NOT NULL,
  "event_type" varchar(64) NOT NULL,
  "occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
  "actor_user_id" text,
  "correlation_id" text,
  "summary" text NOT NULL,
  "details" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "from_status" varchar(32),
  "to_status" varchar(32)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_approval_history_tenant_approval_idx" ON "testing_approval_history" ("tenant_id","approval_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_approval_history_occurred_idx" ON "testing_approval_history" ("tenant_id","occurred_at");
