-- APZTCMS-015: External CI/CD Integration Framework tables

CREATE TABLE IF NOT EXISTS "testing_pipeline" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" varchar(64) NOT NULL,
  "name" text NOT NULL,
  "provider_kind" varchar(32) NOT NULL,
  "external_pipeline_ref" text,
  "description" text,
  "status" varchar(32) NOT NULL DEFAULT 'active',
  "default_branch" text,
  "repository_ref" text,
  "variables_json" jsonb DEFAULT '[]'::jsonb,
  "secret_refs_json" jsonb DEFAULT '[]'::jsonb,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_pipeline_provider_chk" CHECK ("provider_kind" IN (
    'generic_ci','github_actions','gitlab_ci','azure_devops','jenkins','circleci','buildkite'
  )),
  CONSTRAINT "testing_pipeline_status_chk" CHECK ("status" IN ('active','archived')),
  CONSTRAINT "testing_pipeline_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "testing_pipeline_tenant_key_uidx"
  ON "testing_pipeline" ("tenant_id", "key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_pipeline_tenant_idx"
  ON "testing_pipeline" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_pipeline_provider_idx"
  ON "testing_pipeline" ("tenant_id", "provider_kind");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_pipeline_import" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "provider_kind" varchar(32) NOT NULL,
  "adapter_version" varchar(64) NOT NULL,
  "external_run_ref" text NOT NULL,
  "pipeline_id" text,
  "status" varchar(32) NOT NULL,
  "correlation_id" text,
  "checksum" text,
  "payload_fingerprint" text,
  "summary" jsonb DEFAULT '{}'::jsonb,
  "error_summary" text,
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "canonical_snapshot" jsonb,
  "pipeline_run_id" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_pipeline_import_provider_chk" CHECK ("provider_kind" IN (
    'generic_ci','github_actions','gitlab_ci','azure_devops','jenkins','circleci','buildkite'
  )),
  CONSTRAINT "testing_pipeline_import_status_chk" CHECK ("status" IN (
    'pending','validating','importing','completed','failed','duplicate','corrected'
  )),
  CONSTRAINT "testing_pipeline_import_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "testing_pipeline_import_tenant_provider_run_uidx"
  ON "testing_pipeline_import" ("tenant_id", "provider_kind", "external_run_ref");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "testing_pipeline_import_tenant_fingerprint_uidx"
  ON "testing_pipeline_import" ("tenant_id", "payload_fingerprint")
  WHERE "payload_fingerprint" IS NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_pipeline_import_tenant_idx"
  ON "testing_pipeline_import" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_pipeline_import_status_idx"
  ON "testing_pipeline_import" ("tenant_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_pipeline_import_pipeline_idx"
  ON "testing_pipeline_import" ("tenant_id", "pipeline_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_pipeline_run" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "pipeline_id" text NOT NULL,
  "import_id" text NOT NULL,
  "provider_kind" varchar(32) NOT NULL,
  "external_run_ref" text NOT NULL,
  "status" varchar(32) NOT NULL,
  "stages_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "jobs_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "artifacts_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "approvals_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "events_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "environment_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "links_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "summary_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "metrics_json" jsonb,
  "logs_json" jsonb DEFAULT '[]'::jsonb,
  "variables_json" jsonb DEFAULT '[]'::jsonb,
  "secret_refs_json" jsonb DEFAULT '[]'::jsonb,
  "trigger_json" jsonb,
  "source_json" jsonb,
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "duration_ms" integer,
  "correlation_id" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_pipeline_run_provider_chk" CHECK ("provider_kind" IN (
    'generic_ci','github_actions','gitlab_ci','azure_devops','jenkins','circleci','buildkite'
  )),
  CONSTRAINT "testing_pipeline_run_status_chk" CHECK ("status" IN (
    'queued','running','passed','failed','cancelled','skipped','timed_out','unknown'
  )),
  CONSTRAINT "testing_pipeline_run_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_pipeline_run_tenant_idx"
  ON "testing_pipeline_run" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_pipeline_run_pipeline_idx"
  ON "testing_pipeline_run" ("tenant_id", "pipeline_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_pipeline_run_import_idx"
  ON "testing_pipeline_run" ("tenant_id", "import_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_pipeline_run_external_idx"
  ON "testing_pipeline_run" ("tenant_id", "external_run_ref");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_pipeline_import_history" (
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
CREATE INDEX IF NOT EXISTS "testing_pipeline_import_history_tenant_import_idx"
  ON "testing_pipeline_import_history" ("tenant_id", "import_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_pipeline_import_history_occurred_idx"
  ON "testing_pipeline_import_history" ("tenant_id", "occurred_at");
--> statement-breakpoint

-- Allow release scope kind `pipeline` (APZTCMS-015 optional link).
ALTER TABLE "testing_release_scope" DROP CONSTRAINT IF EXISTS "testing_release_scope_kind_chk";
--> statement-breakpoint
ALTER TABLE "testing_release_scope" ADD CONSTRAINT "testing_release_scope_kind_chk" CHECK ("kind" IN (
  'plan','suite','case','execution','requirement','certification',
  'evidence','coverage','defect','risk','automation','pipeline','other'
));
