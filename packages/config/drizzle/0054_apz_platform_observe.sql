-- APZOBSERVE-001: Platform Observability metadata tables (no TSDB / log store / Grafana ownership)

CREATE TABLE IF NOT EXISTS "platform_observe_health_check" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "service_key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "status" varchar(32) NOT NULL,
  "checked_at" timestamp with time zone,
  "provider_kind" varchar(32) NOT NULL,
  "provider_ref" text,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_observe_health_check_tenant_idx" ON "platform_observe_health_check" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_observe_readiness_check" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "service_key" text NOT NULL,
  "name" text NOT NULL,
  "status" varchar(32) NOT NULL,
  "checked_at" timestamp with time zone,
  "provider_kind" varchar(32) NOT NULL,
  "provider_ref" text,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_observe_readiness_check_tenant_idx" ON "platform_observe_readiness_check" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_observe_liveness_check" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "service_key" text NOT NULL,
  "name" text NOT NULL,
  "status" varchar(32) NOT NULL,
  "checked_at" timestamp with time zone,
  "provider_kind" varchar(32) NOT NULL,
  "provider_ref" text,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_observe_liveness_check_tenant_idx" ON "platform_observe_liveness_check" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_observe_service_health" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "service_key" text NOT NULL,
  "display_name" text NOT NULL,
  "overall_status" varchar(32) NOT NULL,
  "readiness_status" varchar(32) NOT NULL,
  "liveness_status" varchar(32) NOT NULL,
  "last_evaluated_at" timestamp with time zone,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_observe_service_health_tenant_idx" ON "platform_observe_service_health" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_observe_service_status" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "service_key" text NOT NULL,
  "status" varchar(32) NOT NULL,
  "message" text,
  "observed_at" timestamp with time zone,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_observe_service_status_tenant_idx" ON "platform_observe_service_status" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_observe_component_status" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "service_key" text NOT NULL,
  "component_key" text NOT NULL,
  "name" text NOT NULL,
  "status" varchar(32) NOT NULL,
  "message" text,
  "observed_at" timestamp with time zone,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_observe_component_status_tenant_idx" ON "platform_observe_component_status" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_observe_metric_definition" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "kind" varchar(32) NOT NULL,
  "unit" text,
  "provider_kind" varchar(32) NOT NULL,
  "provider_ref" text,
  "status" varchar(32) NOT NULL,
  "labels_json" jsonb DEFAULT '{}'::jsonb,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_observe_metric_definition_tenant_idx" ON "platform_observe_metric_definition" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_observe_metric_sample" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "metric_definition_id" text NOT NULL,
  "sampled_at" timestamp with time zone NOT NULL,
  "value_label" text,
  "provider_kind" varchar(32) NOT NULL,
  "provider_ref" text,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_observe_metric_sample_tenant_idx" ON "platform_observe_metric_sample" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_observe_alert_definition" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "severity" varchar(32) NOT NULL,
  "provider_kind" varchar(32) NOT NULL,
  "provider_ref" text,
  "status" varchar(32) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_observe_alert_definition_tenant_idx" ON "platform_observe_alert_definition" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_observe_alert_state" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "alert_definition_id" text NOT NULL,
  "state" varchar(32) NOT NULL,
  "fired_at" timestamp with time zone,
  "resolved_at" timestamp with time zone,
  "message" text,
  "provider_kind" varchar(32) NOT NULL,
  "provider_ref" text,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_observe_alert_state_tenant_idx" ON "platform_observe_alert_state" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_observe_dashboard" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "provider_kind" varchar(32) NOT NULL,
  "provider_ref" text,
  "status" varchar(32) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_observe_dashboard_tenant_idx" ON "platform_observe_dashboard" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_observe_log_source" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "kind" varchar(32) NOT NULL,
  "provider_kind" varchar(32) NOT NULL,
  "provider_ref" text,
  "status" varchar(32) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_observe_log_source_tenant_idx" ON "platform_observe_log_source" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_observe_trace_definition" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "provider_kind" varchar(32) NOT NULL,
  "provider_ref" text,
  "status" varchar(32) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_observe_trace_definition_tenant_idx" ON "platform_observe_trace_definition" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_observe_trace_span" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "trace_definition_id" text NOT NULL,
  "span_name" text NOT NULL,
  "service_key" text,
  "started_at" timestamp with time zone,
  "ended_at" timestamp with time zone,
  "provider_kind" varchar(32) NOT NULL,
  "provider_ref" text,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_observe_trace_span_tenant_idx" ON "platform_observe_trace_span" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_observe_incident_reference" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "title" text NOT NULL,
  "service_key" text,
  "alert_definition_id" text,
  "status" varchar(32) NOT NULL,
  "external_ref" text,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_observe_incident_reference_tenant_idx" ON "platform_observe_incident_reference" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_observe_maintenance_window" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "service_key" text,
  "starts_at" timestamp with time zone NOT NULL,
  "ends_at" timestamp with time zone NOT NULL,
  "status" varchar(32) NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_observe_maintenance_window_tenant_idx" ON "platform_observe_maintenance_window" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_observe_health_summary" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "scope_key" text NOT NULL,
  "overall_status" varchar(32) NOT NULL,
  "healthy_count" integer NOT NULL,
  "degraded_count" integer NOT NULL,
  "unhealthy_count" integer NOT NULL,
  "evaluated_at" timestamp with time zone NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_observe_health_summary_tenant_idx" ON "platform_observe_health_summary" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_observe_diagnostic" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "service_key" text,
  "status" varchar(32) NOT NULL,
  "detail" text,
  "provider_kind" varchar(32) NOT NULL,
  "provider_ref" text,
  "metadata_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_observe_diagnostic_tenant_idx" ON "platform_observe_diagnostic" ("tenant_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_observe_metadata" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "category" text NOT NULL,
  "status" varchar(32) NOT NULL,
  "payload_json" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_observe_metadata_tenant_idx" ON "platform_observe_metadata" ("tenant_id");
--> statement-breakpoint

