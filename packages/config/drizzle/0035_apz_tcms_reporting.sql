-- APZTCMS-024: Reporting persistence tables

CREATE TABLE IF NOT EXISTS "testing_report_template" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "report_type" varchar(64) NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "version" varchar(32) NOT NULL,
  "title" text NOT NULL,
  "subtitle" text,
  "header" text,
  "footer" text,
  "branding_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "metric_keys_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "sections_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "builtin" boolean DEFAULT false NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_report_template_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_report_template_tenant_idx"
  ON "testing_report_template" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_report_template_tenant_type_idx"
  ON "testing_report_template" ("tenant_id", "report_type");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "testing_report_generation_metadata" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "request_id" text NOT NULL,
  "template_id" text NOT NULL,
  "report_type" varchar(64) NOT NULL,
  "output_format" varchar(32) NOT NULL,
  "parameters_json" text NOT NULL,
  "generated_at" timestamp with time zone NOT NULL,
  "generated_by" text NOT NULL,
  "version" varchar(32) NOT NULL,
  "checksum_sha256" varchar(64) NOT NULL,
  "byte_length" integer NOT NULL,
  "preview" boolean DEFAULT false NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text,
  "updated_by" text,
  "archived_at" timestamp with time zone,
  CONSTRAINT "testing_report_generation_metadata_revision_chk" CHECK ("revision" >= 1)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_report_generation_metadata_tenant_idx"
  ON "testing_report_generation_metadata" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_report_generation_metadata_generated_idx"
  ON "testing_report_generation_metadata" ("tenant_id", "generated_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testing_report_generation_metadata_template_idx"
  ON "testing_report_generation_metadata" ("tenant_id", "template_id");
