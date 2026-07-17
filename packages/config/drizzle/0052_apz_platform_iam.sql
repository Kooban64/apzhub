-- APZIDENTITY-001: Platform Identity Administration metadata tables
-- Distinct from Authentication scaffolding (0011_platform_identity.sql).
-- Metadata only — no credentials, sessions, tokens, or provisioning.

CREATE TABLE IF NOT EXISTS "platform_iam_user" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "auth_subject_ref" text,
  "email" text,
  "display_name" text NOT NULL,
  "status" varchar(64) DEFAULT 'draft' NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_iam_user_tenant_idx" ON "platform_iam_user" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_iam_group" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "status" varchar(64) DEFAULT 'draft' NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_iam_group_tenant_idx" ON "platform_iam_group" ("tenant_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_iam_group_tenant_key_uidx" ON "platform_iam_group" ("tenant_id", "key");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_iam_role" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "status" varchar(64) DEFAULT 'draft' NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_iam_role_tenant_idx" ON "platform_iam_role" ("tenant_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_iam_role_tenant_key_uidx" ON "platform_iam_role" ("tenant_id", "key");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_iam_permission_assignment" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "subject_kind" varchar(64) NOT NULL,
  "subject_id" text NOT NULL,
  "permission_key" text NOT NULL,
  "role_id" text,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_iam_permission_assignment_tenant_idx" ON "platform_iam_permission_assignment" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_iam_organization" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "status" varchar(64) DEFAULT 'draft' NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_iam_organization_tenant_idx" ON "platform_iam_organization" ("tenant_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_iam_organization_tenant_key_uidx" ON "platform_iam_organization" ("tenant_id", "key");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_iam_tenant" (
  "id" text PRIMARY KEY NOT NULL,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "status" varchar(64) DEFAULT 'draft' NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_iam_tenant_key_uidx" ON "platform_iam_tenant" ("key");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_iam_department" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text NOT NULL,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "status" varchar(64) DEFAULT 'draft' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_iam_department_tenant_idx" ON "platform_iam_department" ("tenant_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_iam_department_tenant_key_uidx" ON "platform_iam_department" ("tenant_id", "key");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_iam_position" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "status" varchar(64) DEFAULT 'draft' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_iam_position_tenant_idx" ON "platform_iam_position" ("tenant_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_iam_position_tenant_key_uidx" ON "platform_iam_position" ("tenant_id", "key");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_iam_employment" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "user_id" text NOT NULL,
  "organisation_id" text NOT NULL,
  "department_id" text,
  "position_id" text,
  "status" varchar(64) DEFAULT 'draft' NOT NULL,
  "started_at" text,
  "ended_at" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_iam_employment_tenant_idx" ON "platform_iam_employment" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_iam_service_assignment" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "subject_kind" varchar(64) NOT NULL,
  "subject_id" text NOT NULL,
  "service_capability" varchar(64) NOT NULL,
  "status" varchar(64) DEFAULT 'draft' NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_iam_service_assignment_tenant_idx" ON "platform_iam_service_assignment" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_iam_membership" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "user_id" text NOT NULL,
  "kind" varchar(64) NOT NULL,
  "target_id" text NOT NULL,
  "status" varchar(64) DEFAULT 'draft' NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_iam_membership_tenant_idx" ON "platform_iam_membership" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_iam_invitation" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "email" text NOT NULL,
  "invited_user_id" text,
  "status" varchar(64) DEFAULT 'draft' NOT NULL,
  "expires_at" text,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_iam_invitation_tenant_idx" ON "platform_iam_invitation" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_iam_activation" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "user_id" text NOT NULL,
  "activated_at" text NOT NULL,
  "actor_user_id" text NOT NULL,
  "reason" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_iam_activation_tenant_idx" ON "platform_iam_activation" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_iam_deactivation" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "user_id" text NOT NULL,
  "deactivated_at" text NOT NULL,
  "actor_user_id" text NOT NULL,
  "reason" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_iam_deactivation_tenant_idx" ON "platform_iam_deactivation" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_iam_status" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "subject_kind" varchar(64) NOT NULL,
  "subject_id" text NOT NULL,
  "status" varchar(64) NOT NULL,
  "effective_at" text NOT NULL,
  "actor_user_id" text NOT NULL,
  "detail" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_iam_status_tenant_idx" ON "platform_iam_status" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_iam_policy" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "kind" varchar(64) NOT NULL,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_iam_policy_tenant_idx" ON "platform_iam_policy" ("tenant_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_iam_policy_tenant_key_uidx" ON "platform_iam_policy" ("tenant_id", "key");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_iam_audit" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "user_id" text,
  "action" varchar(64) NOT NULL,
  "actor_user_id" text NOT NULL,
  "detail" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_iam_audit_tenant_idx" ON "platform_iam_audit" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_iam_history" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "user_id" text,
  "summary" text NOT NULL,
  "actor_user_id" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_iam_history_tenant_idx" ON "platform_iam_history" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_iam_reference" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "user_id" text,
  "kind" varchar(64) NOT NULL,
  "target" text NOT NULL,
  "label" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_iam_reference_tenant_idx" ON "platform_iam_reference" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_iam_metadata" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "user_id" text,
  "key" text NOT NULL,
  "value" text NOT NULL,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_iam_metadata_tenant_idx" ON "platform_iam_metadata" ("tenant_id");
--> statement-breakpoint

