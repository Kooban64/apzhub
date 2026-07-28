-- APZQEP-ENG-020F Part 2: Requirements Relationship Engine persistence.
CREATE TABLE IF NOT EXISTS "qep_requirements_relationship" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "relationship_type" varchar(64) NOT NULL,
  "lifecycle_state" varchar(32) NOT NULL
    CHECK ("lifecycle_state" IN ('draft', 'active', 'deprecated', 'retired')),
  "source_mode" varchar(64) NOT NULL
    CHECK ("source_mode" IN ('requirement', 'content_version_pinned')),
  "source_requirement_id" text NOT NULL,
  "source_content_version_id" text,
  "target_mode" varchar(64) NOT NULL
    CHECK ("target_mode" IN ('requirement', 'content_version_pinned')),
  "target_requirement_id" text NOT NULL,
  "target_content_version_id" text,
  "strength" varchar(32) NOT NULL
    CHECK ("strength" IN ('mandatory', 'recommended', 'informational')),
  "criticality" varchar(32) NOT NULL
    CHECK ("criticality" IN ('critical', 'high', 'medium', 'low')),
  "classification" varchar(64) NOT NULL,
  "scope_kind" varchar(32) NOT NULL
    CHECK ("scope_kind" IN ('product', 'project', 'release', 'baseline')),
  "scope_reference_id" text,
  "rationale" text,
  "duplicate_key" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL,
  "activated_at" timestamp with time zone,
  "activated_by" text,
  "deprecated_at" timestamp with time zone,
  "deprecated_by" text,
  "retired_at" timestamp with time zone,
  "retired_by" text,
  "correlation_id" text NOT NULL,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),
  CONSTRAINT "qep_req_rel_self_ref_chk"
    CHECK (
      "source_requirement_id" <> "target_requirement_id"
      OR COALESCE("source_content_version_id", '') <> COALESCE("target_content_version_id", '')
    ),
  CONSTRAINT "qep_req_rel_pin_source_chk"
    CHECK (
      ("source_mode" = 'requirement' AND "source_content_version_id" IS NULL)
      OR ("source_mode" = 'content_version_pinned' AND "source_content_version_id" IS NOT NULL)
    ),
  CONSTRAINT "qep_req_rel_pin_target_chk"
    CHECK (
      ("target_mode" = 'requirement' AND "target_content_version_id" IS NULL)
      OR ("target_mode" = 'content_version_pinned' AND "target_content_version_id" IS NOT NULL)
    ),
  CONSTRAINT "qep_req_rel_scope_ref_chk"
    CHECK (
      ("scope_kind" = 'product' AND "scope_reference_id" IS NULL)
      OR ("scope_kind" <> 'product' AND "scope_reference_id" IS NOT NULL)
    )
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_requirements_relationship_history" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "relationship_id" text NOT NULL
    REFERENCES "qep_requirements_relationship"("id"),
  "occurred_at" timestamp with time zone NOT NULL,
  "actor_user_id" text NOT NULL,
  "kind" text NOT NULL,
  "summary" text NOT NULL,
  "sequence" integer NOT NULL CHECK ("sequence" >= 1),
  CONSTRAINT "qep_req_rel_history_seq_uidx"
    UNIQUE ("tenant_id", "relationship_id", "sequence")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_requirements_relationship_taxonomy" (
  "tenant_id" text NOT NULL,
  "relationship_type" varchar(64) NOT NULL,
  "display_name" text NOT NULL,
  "description" text NOT NULL,
  "symmetric" varchar(8) NOT NULL,
  "inverse_label" text NOT NULL,
  "cycle_policy" varchar(64) NOT NULL,
  "rationale_policy" varchar(32) NOT NULL,
  "default_strength" varchar(32) NOT NULL,
  "certification_relevant" varchar(32) NOT NULL,
  "baseline_projection_default" varchar(64) NOT NULL,
  "strict_traceability_default" varchar(8) NOT NULL,
  "highlight_in_traceability" varchar(8) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "qep_req_rel_taxonomy_uidx"
    UNIQUE ("tenant_id", "relationship_type")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_req_rel_active_duplicate_uidx"
  ON "qep_requirements_relationship" ("tenant_id", "duplicate_key")
  WHERE "lifecycle_state" IN ('active', 'deprecated');
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_req_rel_tenant_id_idx"
  ON "qep_requirements_relationship" ("tenant_id", "id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_req_rel_tenant_type_idx"
  ON "qep_requirements_relationship" ("tenant_id", "relationship_type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_req_rel_tenant_lifecycle_idx"
  ON "qep_requirements_relationship" ("tenant_id", "lifecycle_state");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_req_rel_tenant_source_idx"
  ON "qep_requirements_relationship" ("tenant_id", "source_requirement_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_req_rel_tenant_target_idx"
  ON "qep_requirements_relationship" ("tenant_id", "target_requirement_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_req_rel_tenant_scope_idx"
  ON "qep_requirements_relationship" ("tenant_id", "scope_kind", "scope_reference_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_req_rel_tenant_source_cv_idx"
  ON "qep_requirements_relationship" ("tenant_id", "source_content_version_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_req_rel_tenant_target_cv_idx"
  ON "qep_requirements_relationship" ("tenant_id", "target_content_version_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_req_rel_history_rel_idx"
  ON "qep_requirements_relationship_history" ("tenant_id", "relationship_id");
