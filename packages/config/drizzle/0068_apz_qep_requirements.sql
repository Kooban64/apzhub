-- APZQEP-ENG-020B: QEP Requirements metadata tables

CREATE TABLE IF NOT EXISTS "qep_requirement" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "project_id" text NOT NULL,
  "key" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "type" varchar(64) NOT NULL,
  "status" varchar(64) NOT NULL,
  "priority" varchar(64) NOT NULL,
  "category" text,
  "owner_json" jsonb,
  "approval_state" varchar(64) NOT NULL,
  "version_major" integer DEFAULT 1 NOT NULL,
  "version_minor" integer DEFAULT 0 NOT NULL,
  "version_patch" integer DEFAULT 0 NOT NULL,
  "acceptance_criteria_json" jsonb,
  "attributes_json" jsonb DEFAULT '{"tags":[],"custom":{}}'::jsonb NOT NULL,
  "references_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "baseline_json" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "archived_at" timestamp with time zone,
  "archived_by" text,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_requirement_tenant_key_active_uidx"
  ON "qep_requirement" ("tenant_id", "key")
  WHERE "archived_at" IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_requirement_tenant_project_idx"
  ON "qep_requirement" ("tenant_id", "project_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_requirement_tenant_status_idx"
  ON "qep_requirement" ("tenant_id", "status");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "qep_requirement_audit" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "requirement_id" text NOT NULL,
  "action" text NOT NULL,
  "actor_user_id" text NOT NULL,
  "correlation_id" text NOT NULL,
  "details_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_requirement_audit_tenant_requirement_idx"
  ON "qep_requirement_audit" ("tenant_id", "requirement_id");
