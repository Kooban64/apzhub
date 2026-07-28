-- APZQEP-ENG-050B: Test Specifications Engine persistence (ARCH-011).
CREATE TABLE IF NOT EXISTS "qep_test_specifications" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "number" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "objective" text NOT NULL,
  "scope" text NOT NULL,
  "status" varchar(32) NOT NULL
    CHECK ("status" IN (
      'draft', 'under_review', 'approved', 'rejected',
      'withdrawn', 'superseded', 'cancelled', 'retired'
    )),
  "type" varchar(64) NOT NULL,
  "priority" varchar(16) NOT NULL
    CHECK ("priority" IN ('critical', 'high', 'medium', 'low')),
  "complexity" varchar(16) NOT NULL
    CHECK ("complexity" IN ('trivial', 'simple', 'moderate', 'complex', 'epic')),
  "classification" text NOT NULL,
  "owner" text NOT NULL,
  "author" text NOT NULL,
  "reviewer" text,
  "major_version" integer NOT NULL DEFAULT 0 CHECK ("major_version" >= 0),
  "minor_version" integer NOT NULL DEFAULT 1 CHECK ("minor_version" >= 0),
  "version_label" varchar(32) NOT NULL,
  "is_authoritative" boolean NOT NULL DEFAULT false,
  "preconditions_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "postconditions_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "acceptance_criteria_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "risks_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "dependencies_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "tags_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "metadata_json" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "predecessor_specification_id" text,
  "successor_specification_id" text,
  "comparison_notes" text,
  "approval_decision" varchar(16)
    CHECK ("approval_decision" IS NULL OR "approval_decision" IN ('approved', 'rejected')),
  "approval_decided_at" timestamp with time zone,
  "approval_decided_by" text,
  "approval_review_comment" text,
  "approval_approval_comment" text,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),
  "review_started_at" timestamp with time zone,
  "review_started_by" text,
  "withdrawn_at" timestamp with time zone,
  "cancelled_at" timestamp with time zone,
  "retired_at" timestamp with time zone,
  "superseded_at" timestamp with time zone,
  "version_lineage_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL,
  "correlation_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_test_specification_versions" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "specification_id" text NOT NULL
    REFERENCES "qep_test_specifications"("id"),
  "specification_number" text NOT NULL,
  "major_version" integer NOT NULL CHECK ("major_version" >= 0),
  "minor_version" integer NOT NULL CHECK ("minor_version" >= 0),
  "version_label" varchar(32) NOT NULL,
  "status" varchar(32) NOT NULL,
  "is_authoritative" boolean NOT NULL DEFAULT false,
  "predecessor_specification_id" text,
  "successor_specification_id" text,
  "comparison_notes" text,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL,
  CONSTRAINT "qep_test_specification_versions_lineage_uidx"
    UNIQUE ("tenant_id", "specification_number", "version_label")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_test_specification_relationships" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "specification_id" text NOT NULL
    REFERENCES "qep_test_specifications"("id"),
  "kind" varchar(64) NOT NULL,
  "artefact_id" text NOT NULL,
  "owning_domain" text,
  "label" text,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL,
  CONSTRAINT "qep_test_specification_relationships_uidx"
    UNIQUE ("tenant_id", "specification_id", "kind", "artefact_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_test_specification_history" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "specification_id" text NOT NULL
    REFERENCES "qep_test_specifications"("id"),
  "occurred_at" timestamp with time zone NOT NULL,
  "actor_user_id" text NOT NULL,
  "kind" text NOT NULL,
  "summary" text NOT NULL,
  "sequence" integer NOT NULL CHECK ("sequence" >= 1),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),
  CONSTRAINT "qep_test_specification_history_seq_uidx"
    UNIQUE ("tenant_id", "specification_id", "sequence")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_specifications_tenant_id_idx"
  ON "qep_test_specifications" ("tenant_id", "id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_specifications_tenant_status_idx"
  ON "qep_test_specifications" ("tenant_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_specifications_tenant_number_idx"
  ON "qep_test_specifications" ("tenant_id", "number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_specifications_tenant_owner_idx"
  ON "qep_test_specifications" ("tenant_id", "owner");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_specifications_tenant_class_idx"
  ON "qep_test_specifications" ("tenant_id", "classification");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_specifications_tenant_auth_idx"
  ON "qep_test_specifications" ("tenant_id", "is_authoritative");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_specification_versions_tenant_number_idx"
  ON "qep_test_specification_versions" ("tenant_id", "specification_number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_specification_relationships_spec_idx"
  ON "qep_test_specification_relationships" ("tenant_id", "specification_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_specification_history_spec_idx"
  ON "qep_test_specification_history" ("tenant_id", "specification_id");
