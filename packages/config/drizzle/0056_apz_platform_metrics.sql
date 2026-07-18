-- APZMETRICS-001: Platform Metrics metadata tables (no collection / Prometheus / Grafana ownership)

CREATE TABLE IF NOT EXISTS "platform_metrics_metric" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "category_id" text,
  "group_id" text,
  "classification_id" text,
  "current_version_id" text,
  "owner_ref" text,
  "status" varchar(64) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_metrics_metric_tenant_idx" ON "platform_metrics_metric" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_metrics_definition" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "metric_id" text NOT NULL,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "kind" varchar(64) NOT NULL,
  "unit_id" text,
  "formula_id" text,
  "aggregation_id" text,
  "version_number" integer NOT NULL,
  "status" varchar(64) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_metrics_definition_tenant_idx" ON "platform_metrics_definition" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_metrics_version" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "metric_id" text NOT NULL,
  "version_number" integer NOT NULL,
  "status" varchar(64) NOT NULL,
  "change_summary" text,
  "effective_from" text,
  "effective_to" text,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_metrics_version_tenant_idx" ON "platform_metrics_version" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_metrics_category" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "parent_category_id" text,
  "status" varchar(64) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_metrics_category_tenant_idx" ON "platform_metrics_category" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_metrics_group" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "category_id" text,
  "status" varchar(64) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_metrics_group_tenant_idx" ON "platform_metrics_group" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_metrics_dimension" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "data_type" varchar(64) NOT NULL,
  "metric_id" text,
  "status" varchar(64) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_metrics_dimension_tenant_idx" ON "platform_metrics_dimension" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_metrics_label" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "metric_id" text,
  "status" varchar(64) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_metrics_label_tenant_idx" ON "platform_metrics_label" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_metrics_unit" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "symbol" text,
  "quantity_kind" text,
  "status" varchar(64) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_metrics_unit_tenant_idx" ON "platform_metrics_unit" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_metrics_formula" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "metric_id" text,
  "expression" text NOT NULL,
  "description" text,
  "language" varchar(64) NOT NULL,
  "status" varchar(64) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_metrics_formula_tenant_idx" ON "platform_metrics_formula" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_metrics_aggregation" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "method" varchar(64) NOT NULL,
  "window_hint" text,
  "status" varchar(64) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_metrics_aggregation_tenant_idx" ON "platform_metrics_aggregation" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_metrics_threshold" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "metric_id" text NOT NULL,
  "name" text NOT NULL,
  "operator" varchar(64) NOT NULL,
  "value_label" text NOT NULL,
  "severity" varchar(64) NOT NULL,
  "status" varchar(64) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_metrics_threshold_tenant_idx" ON "platform_metrics_threshold" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_metrics_owner" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "metric_id" text NOT NULL,
  "owner_type" varchar(64) NOT NULL,
  "owner_ref" text NOT NULL,
  "display_name" text,
  "status" varchar(64) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_metrics_owner_tenant_idx" ON "platform_metrics_owner" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_metrics_consumer" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "metric_id" text NOT NULL,
  "consumer_type" varchar(64) NOT NULL,
  "consumer_ref" text NOT NULL,
  "display_name" text,
  "status" varchar(64) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_metrics_consumer_tenant_idx" ON "platform_metrics_consumer" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_metrics_retention_policy" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "retention_days" integer NOT NULL,
  "metric_id" text,
  "status" varchar(64) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_metrics_retention_policy_tenant_idx" ON "platform_metrics_retention_policy" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_metrics_classification" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "level" varchar(64) NOT NULL,
  "description" text,
  "status" varchar(64) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_metrics_classification_tenant_idx" ON "platform_metrics_classification" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_metrics_dependency" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "metric_id" text NOT NULL,
  "depends_on_metric_id" text NOT NULL,
  "dependency_kind" varchar(64) NOT NULL,
  "status" varchar(64) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_metrics_dependency_tenant_idx" ON "platform_metrics_dependency" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_metrics_kpi" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "metric_id" text NOT NULL,
  "group_id" text,
  "classification_id" text,
  "status" varchar(64) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_metrics_kpi_tenant_idx" ON "platform_metrics_kpi" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_metrics_kpi_group" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "status" varchar(64) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_metrics_kpi_group_tenant_idx" ON "platform_metrics_kpi_group" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_metrics_kpi_target" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "kpi_id" text NOT NULL,
  "period_label" text NOT NULL,
  "target_value_label" text NOT NULL,
  "unit_id" text,
  "status" varchar(64) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_metrics_kpi_target_tenant_idx" ON "platform_metrics_kpi_target" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_metrics_relationship" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "from_metric_id" text NOT NULL,
  "to_metric_id" text NOT NULL,
  "relationship_kind" varchar(64) NOT NULL,
  "status" varchar(64) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_metrics_relationship_tenant_idx" ON "platform_metrics_relationship" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_metrics_metadata" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "subject_kind" text NOT NULL,
  "subject_id" text NOT NULL,
  "key" text NOT NULL,
  "value_label" text,
  "status" varchar(64) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_metrics_metadata_tenant_idx" ON "platform_metrics_metadata" ("tenant_id");
--> statement-breakpoint
