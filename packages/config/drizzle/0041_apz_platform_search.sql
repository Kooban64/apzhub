-- APZSEARCH-002: Platform Search metadata tables (no index content, no binary blobs)

CREATE TABLE IF NOT EXISTS "platform_search_provider" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "kind" varchar(64) NOT NULL,
  "label" text NOT NULL,
  "version" varchar(64) NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "active" boolean DEFAULT false NOT NULL,
  "capabilities_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "configuration_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_search_provider_tenant_id_uidx"
  ON "platform_search_provider" ("tenant_id", "id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_provider_tenant_idx"
  ON "platform_search_provider" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_search_provider_registration" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "provider_id" text NOT NULL,
  "kind" varchar(64) NOT NULL,
  "label" text NOT NULL,
  "version" varchar(64) NOT NULL,
  "registered_at" timestamp with time zone DEFAULT now() NOT NULL,
  "unregistered_at" timestamp with time zone,
  "registered_by" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_provider_registration_tenant_idx"
  ON "platform_search_provider_registration" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_provider_registration_tenant_provider_idx"
  ON "platform_search_provider_registration" ("tenant_id", "provider_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_search_provider_status" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "provider_id" text NOT NULL,
  "status" varchar(32) NOT NULL,
  "message" text,
  "checked_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_search_provider_status_tenant_provider_uidx"
  ON "platform_search_provider_status" ("tenant_id", "provider_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_provider_status_tenant_idx"
  ON "platform_search_provider_status" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_search_configuration" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "default_page_size" integer NOT NULL,
  "max_page_size" integer NOT NULL,
  "max_keyword_length" integer NOT NULL,
  "allowed_provider_kinds_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "enforce_tenant_isolation" boolean DEFAULT true NOT NULL,
  "enforce_organisation_isolation" boolean DEFAULT true NOT NULL,
  "enforce_permission_filter" boolean DEFAULT true NOT NULL,
  "current_version" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_search_configuration_tenant_uidx"
  ON "platform_search_configuration" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_search_configuration_version" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "configuration_id" text NOT NULL,
  "version" integer NOT NULL,
  "snapshot_json" jsonb NOT NULL,
  "changed_by" text NOT NULL,
  "change_reason" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_configuration_version_tenant_idx"
  ON "platform_search_configuration_version" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_configuration_version_tenant_config_idx"
  ON "platform_search_configuration_version" ("tenant_id", "configuration_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_search_profile" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "name" text NOT NULL,
  "default_scopes_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "default_collections_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "default_sorts_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_profile_tenant_idx"
  ON "platform_search_profile" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_search_collection" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "name" text NOT NULL,
  "scope" varchar(32) NOT NULL,
  "product_ids_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_collection_tenant_idx"
  ON "platform_search_collection" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_search_source" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "product_id" varchar(64) NOT NULL,
  "label" text NOT NULL,
  "entity_types_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_source_tenant_idx"
  ON "platform_search_source" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_search_scope" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "scope" varchar(32) NOT NULL,
  "label" text NOT NULL,
  "description" text,
  "enabled" boolean DEFAULT true NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_scope_tenant_idx"
  ON "platform_search_scope" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_search_metadata" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "entity_type" varchar(128) NOT NULL,
  "entity_id" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "keywords_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "product_id" varchar(64) NOT NULL,
  "source_id" text NOT NULL,
  "classification" varchar(32),
  "permissions_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "owner_user_id" text,
  "status" varchar(32),
  "entity_version" varchar(64),
  "navigation_target" text,
  "custom_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_metadata_tenant_idx"
  ON "platform_search_metadata" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_metadata_tenant_entity_idx"
  ON "platform_search_metadata" ("tenant_id", "entity_type", "entity_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_search_session" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "actor_user_id" text NOT NULL,
  "last_query_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_session_tenant_idx"
  ON "platform_search_session" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_search_audit" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "action" varchar(128) NOT NULL,
  "actor_user_id" text NOT NULL,
  "correlation_id" text,
  "detail_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_audit_tenant_idx"
  ON "platform_search_audit" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_audit_tenant_created_idx"
  ON "platform_search_audit" ("tenant_id", "created_at");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_search_diagnostics" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "provider_id" text,
  "snapshot_json" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_diagnostics_tenant_idx"
  ON "platform_search_diagnostics" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_search_health" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "provider_id" text,
  "status" varchar(32) NOT NULL,
  "message" text,
  "checked_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_health_tenant_idx"
  ON "platform_search_health" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_search_statistics" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "declared_index_count" integer DEFAULT 0 NOT NULL,
  "declared_provider_count" integer DEFAULT 0 NOT NULL,
  "declared_collection_count" integer DEFAULT 0 NOT NULL,
  "declared_source_count" integer DEFAULT 0 NOT NULL,
  "captured_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_statistics_tenant_idx"
  ON "platform_search_statistics" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_search_capabilities" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "provider_id" text NOT NULL,
  "capabilities_json" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_search_capabilities_tenant_provider_uidx"
  ON "platform_search_capabilities" ("tenant_id", "provider_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_capabilities_tenant_idx"
  ON "platform_search_capabilities" ("tenant_id");
