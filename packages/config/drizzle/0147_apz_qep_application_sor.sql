-- APZQEP Phase 1E: Durable Application SoR. Additive only. No secrets.

CREATE TABLE IF NOT EXISTS "qep_application" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_key" varchar(32) NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "status" varchar(32) NOT NULL,
  "owner_user_id" text,
  "legacy_quality_project_id" text,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_application_tenant_key_uidx" ON "qep_application" ("tenant_id", "application_key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_application_tenant_idx" ON "qep_application" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_application_tenant_updated_idx" ON "qep_application" ("tenant_id", "updated_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_application_legacy_project_idx" ON "qep_application" ("tenant_id", "legacy_quality_project_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_application_repository" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "scm_repository_id" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_application_repository_uidx" ON "qep_application_repository" ("application_id", "scm_repository_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_application_repository_tenant_idx" ON "qep_application_repository" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_application_repository_application_idx" ON "qep_application_repository" ("application_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_application_environment" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "name" text NOT NULL,
  "category" varchar(32) NOT NULL,
  "description" text,
  "base_url" text,
  "status" varchar(32) NOT NULL,
  "metadata_json" jsonb,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_application_environment_name_uidx" ON "qep_application_environment" ("application_id", "name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_application_environment_tenant_idx" ON "qep_application_environment" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_application_environment_application_idx" ON "qep_application_environment" ("application_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_application_execution_target" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "environment_id" text,
  "name" text NOT NULL,
  "target_type" varchar(64) NOT NULL,
  "status" varchar(32) NOT NULL,
  "config_json" jsonb NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_application_execution_target_tenant_idx" ON "qep_application_execution_target" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_application_execution_target_application_idx" ON "qep_application_execution_target" ("application_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_application_execution_target_environment_idx" ON "qep_application_execution_target" ("environment_id");
