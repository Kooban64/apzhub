-- APZCONFIG-001: Platform Configuration metadata tables (no secrets / runtime / env injection)

CREATE TABLE IF NOT EXISTS "platform_configuration_namespace" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_configuration_namespace_tenant_key_uidx"
  ON "platform_configuration_namespace" ("tenant_id", "key");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_configuration_group" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "namespace_id" text NOT NULL,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_configuration_key" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "namespace_id" text NOT NULL,
  "group_id" text,
  "key" text NOT NULL,
  "display_name" text NOT NULL,
  "description" text,
  "value_kind" varchar(32) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_configuration" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "namespace_id" text NOT NULL,
  "group_id" text,
  "key_id" text NOT NULL,
  "hierarchy_level" varchar(32) NOT NULL,
  "scope_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "status" varchar(32) DEFAULT 'draft' NOT NULL,
  "current_version_id" text,
  "inherits_from_configuration_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_configuration_tenant_idx"
  ON "platform_configuration" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_configuration_value" (
  "id" text PRIMARY KEY NOT NULL,
  "configuration_id" text NOT NULL,
  "version_id" text,
  "value_kind" varchar(32) NOT NULL,
  "payload" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_configuration_version" (
  "id" text PRIMARY KEY NOT NULL,
  "configuration_id" text NOT NULL,
  "version_number" integer NOT NULL,
  "immutable" boolean DEFAULT true NOT NULL,
  "is_current" boolean DEFAULT false NOT NULL,
  "label" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "rollback_from_version_id" text
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_configuration_override" (
  "id" text PRIMARY KEY NOT NULL,
  "configuration_id" text NOT NULL,
  "hierarchy_level" varchar(32) NOT NULL,
  "scope_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "value_id" text NOT NULL,
  "precedence_rank" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_configuration_validation" (
  "id" text PRIMARY KEY NOT NULL,
  "configuration_key_id" text NOT NULL,
  "kind" varchar(32) NOT NULL,
  "rule_ref" text,
  "pattern" text,
  "min" integer,
  "max" integer,
  "enum_values_json" jsonb,
  "required" boolean,
  "custom_validator_key" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_configuration_reference" (
  "id" text PRIMARY KEY NOT NULL,
  "configuration_id" text NOT NULL,
  "kind" varchar(32) NOT NULL,
  "resource_id" text NOT NULL,
  "label" text
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_configuration_history" (
  "id" text PRIMARY KEY NOT NULL,
  "configuration_id" text NOT NULL,
  "version_id" text,
  "summary" text NOT NULL,
  "actor_user_id" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_configuration_audit" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "configuration_id" text,
  "action" varchar(64) NOT NULL,
  "actor_user_id" text NOT NULL,
  "detail" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_configuration_audit_tenant_idx"
  ON "platform_configuration_audit" ("tenant_id");
