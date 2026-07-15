-- APZTCMS-021: Engineering Intelligence tables

CREATE TABLE IF NOT EXISTS "testing_engineering_snapshot" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "scope" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "quality_score_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "health_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "risk_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "indicators_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "trends_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "computed_at" timestamp with time zone NOT NULL,
  "label" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_engineering_snapshot_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_engineering_snapshot_tenant_idx"
  ON "testing_engineering_snapshot" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_engineering_snapshot_computed_idx"
  ON "testing_engineering_snapshot" ("tenant_id", "computed_at");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_engineering_historical_snapshot" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "scope" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "period_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "quality_score" real DEFAULT 0 NOT NULL,
  "engineering_health_score" real DEFAULT 0 NOT NULL,
  "indicators_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "metrics_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "source_refs_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "computed_at" timestamp with time zone NOT NULL,
  "immutable" boolean DEFAULT true NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_engineering_historical_snapshot_revision_chk" CHECK ("revision" >= 1),
  CONSTRAINT "testing_engineering_historical_snapshot_immutable_chk" CHECK ("immutable" = true)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_engineering_historical_snapshot_tenant_idx"
  ON "testing_engineering_historical_snapshot" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_engineering_historical_snapshot_computed_idx"
  ON "testing_engineering_historical_snapshot" ("tenant_id", "computed_at");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_engineering_trend_series" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "kind" varchar(64) NOT NULL,
  "scope" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "period_kind" varchar(64) NOT NULL,
  "points_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "direction" varchar(32) NOT NULL,
  "delta" real DEFAULT 0 NOT NULL,
  "computed_at" timestamp with time zone NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_engineering_trend_series_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_engineering_trend_series_tenant_idx"
  ON "testing_engineering_trend_series" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_engineering_trend_series_computed_idx"
  ON "testing_engineering_trend_series" ("tenant_id", "computed_at");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_engineering_benchmark" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "scope" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "metric_key" varchar(128) NOT NULL,
  "comparison_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "computed_at" timestamp with time zone NOT NULL,
  "label" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_engineering_benchmark_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_engineering_benchmark_tenant_idx"
  ON "testing_engineering_benchmark" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_engineering_benchmark_computed_idx"
  ON "testing_engineering_benchmark" ("tenant_id", "computed_at");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_engineering_baseline" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "scope" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "kind" varchar(64) NOT NULL,
  "metric_key" varchar(128) NOT NULL,
  "value" real DEFAULT 0 NOT NULL,
  "source_snapshot_id" text,
  "period_json" jsonb DEFAULT '{}'::jsonb,
  "computed_at" timestamp with time zone NOT NULL,
  "label" text,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_engineering_baseline_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_engineering_baseline_tenant_idx"
  ON "testing_engineering_baseline" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_engineering_baseline_computed_idx"
  ON "testing_engineering_baseline" ("tenant_id", "computed_at");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_engineering_quality_summary" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "scope" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "quality_score_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "indicators_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "computed_at" timestamp with time zone NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_engineering_quality_summary_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_engineering_quality_summary_tenant_idx"
  ON "testing_engineering_quality_summary" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_engineering_quality_summary_computed_idx"
  ON "testing_engineering_quality_summary" ("tenant_id", "computed_at");
