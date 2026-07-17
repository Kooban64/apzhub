-- APZADMIN-001: Platform Administration metadata tables (no UI / runtime / user management)

CREATE TABLE IF NOT EXISTS "platform_admin_module" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" varchar(64) NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "status" varchar(32) DEFAULT 'draft' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_admin_module_tenant_key_uidx"
  ON "platform_admin_module" ("tenant_id", "key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_admin_module_tenant_idx"
  ON "platform_admin_module" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_admin_category" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "module_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "ordering" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_admin_section" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "category_id" text NOT NULL,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "ordering" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_admin_action" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "module_id" text,
  "section_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "kind" varchar(32) NOT NULL,
  "permission_keys_json" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_admin_permission" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_admin_audit" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "module_id" text,
  "action" varchar(64) NOT NULL,
  "actor_user_id" text NOT NULL,
  "detail" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_admin_audit_tenant_idx"
  ON "platform_admin_audit" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_admin_history" (
  "id" text PRIMARY KEY NOT NULL,
  "module_id" text NOT NULL,
  "summary" text NOT NULL,
  "actor_user_id" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_admin_diagnostic" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "module_id" text,
  "capability_id" text,
  "severity" varchar(32) NOT NULL,
  "code" text NOT NULL,
  "message" text NOT NULL,
  "detail" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_admin_registration" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "module_key" varchar(64) NOT NULL,
  "version" text NOT NULL,
  "status" varchar(32) NOT NULL,
  "registered_at" timestamp with time zone DEFAULT now() NOT NULL,
  "registered_by" text NOT NULL,
  "notes" text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_admin_registration_tenant_idx"
  ON "platform_admin_registration" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_admin_metadata" (
  "id" text PRIMARY KEY NOT NULL,
  "module_id" text NOT NULL,
  "labels_json" jsonb,
  "tags_json" jsonb,
  "notes" text
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_admin_policy" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "module_id" text,
  "kind" varchar(32) NOT NULL,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_admin_reference" (
  "id" text PRIMARY KEY NOT NULL,
  "module_id" text NOT NULL,
  "kind" varchar(32) NOT NULL,
  "resource_id" text NOT NULL,
  "label" text
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_admin_capability" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "module_id" text NOT NULL,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "enabled" boolean DEFAULT false NOT NULL,
  "available" boolean DEFAULT false NOT NULL,
  "healthy" boolean DEFAULT false NOT NULL,
  "certified" boolean DEFAULT false NOT NULL,
  "production_ready" boolean DEFAULT false NOT NULL,
  "limitations_json" jsonb,
  "owner" text NOT NULL,
  "version" text NOT NULL,
  "documentation" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_admin_navigation" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "module_id" text NOT NULL,
  "category_id" text,
  "section_id" text,
  "key" text NOT NULL,
  "label" text NOT NULL,
  "ordering" integer DEFAULT 0 NOT NULL,
  "visibility" varchar(32) NOT NULL,
  "permission_keys_json" jsonb,
  "icon_key" text,
  "route_path" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_admin_shortcut" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "module_id" text,
  "action_id" text,
  "key" text NOT NULL,
  "label" text NOT NULL,
  "ordering" integer DEFAULT 0 NOT NULL,
  "permission_keys_json" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_admin_dashboard" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "module_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "ordering" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_admin_widget" (
  "id" text PRIMARY KEY NOT NULL,
  "dashboard_id" text NOT NULL,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "kind" varchar(32) NOT NULL,
  "ordering" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
