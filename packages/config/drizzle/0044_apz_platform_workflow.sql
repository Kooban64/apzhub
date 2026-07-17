-- APZWORKFLOW-001: Platform Workflow metadata tables (no execution / queue / runtime)

CREATE TABLE IF NOT EXISTS "platform_workflow" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "lifecycle" varchar(32) DEFAULT 'draft' NOT NULL,
  "current_version_id" text,
  "category_id" text,
  "folder_id" text,
  "template_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "archived_at" timestamp with time zone,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_workflow_tenant_key_uidx"
  ON "platform_workflow" ("tenant_id", "key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_workflow_tenant_idx"
  ON "platform_workflow" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_workflow_version" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "workflow_id" text NOT NULL,
  "version_number" integer NOT NULL,
  "status" varchar(32) DEFAULT 'draft' NOT NULL,
  "lifecycle" varchar(32) DEFAULT 'draft' NOT NULL,
  "graph_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "variables_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "parameters_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "triggers_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "actions_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "conditions_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "connections_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "change_summary" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_workflow_version_tenant_workflow_number_uidx"
  ON "platform_workflow_version" ("tenant_id", "workflow_id", "version_number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_workflow_version_tenant_idx"
  ON "platform_workflow_version" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_workflow_version_tenant_workflow_idx"
  ON "platform_workflow_version" ("tenant_id", "workflow_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_workflow_template" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "lifecycle" varchar(32) DEFAULT 'draft' NOT NULL,
  "category_id" text,
  "graph_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "parameters_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "variables_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_workflow_template_tenant_key_uidx"
  ON "platform_workflow_template" ("tenant_id", "key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_workflow_template_tenant_idx"
  ON "platform_workflow_template" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_workflow_category" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "name" text NOT NULL,
  "description" text,
  "parent_category_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_workflow_category_tenant_idx"
  ON "platform_workflow_category" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_workflow_folder" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "name" text NOT NULL,
  "parent_folder_id" text,
  "path" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_workflow_folder_tenant_idx"
  ON "platform_workflow_folder" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_workflow_audit" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "workflow_id" text NOT NULL,
  "version_id" text,
  "action" text NOT NULL,
  "actor_user_id" text NOT NULL,
  "correlation_id" text,
  "detail_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_workflow_audit_tenant_idx"
  ON "platform_workflow_audit" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_workflow_audit_tenant_workflow_idx"
  ON "platform_workflow_audit" ("tenant_id", "workflow_id");
