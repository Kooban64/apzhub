-- APZQEP-ENG-030A Part 2: Traceability Engine persistence (ARCH-007 Trace Links).
-- Trace Links are distinct from Requirements Relationships (qep_requirements_relationship).
CREATE TABLE IF NOT EXISTS "qep_trace_link" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "trace_type" varchar(64) NOT NULL,
  "lifecycle_state" varchar(32) NOT NULL
    CHECK ("lifecycle_state" IN ('draft', 'validated', 'approved', 'retired', 'superseded')),
  "direction" varchar(16) NOT NULL
    CHECK ("direction" IN ('forward', 'reverse', 'symmetric')),
  "strength" varchar(32) NOT NULL
    CHECK ("strength" IN ('mandatory', 'recommended', 'informative')),
  "confidence" varchar(32) NOT NULL
    CHECK ("confidence" IN ('authoritative', 'asserted', 'inferred', 'provisional')),
  "origin" varchar(32) NOT NULL
    CHECK ("origin" IN ('user', 'import', 'system_rule', 'ai_suggestion', 'migration')),

  "source_kind" varchar(64) NOT NULL,
  "source_artefact_id" text NOT NULL,
  "source_content_version_id" text,
  "source_baseline_id" text,
  "source_external_uri" text,
  "source_owning_domain" text NOT NULL,

  "target_kind" varchar(64) NOT NULL,
  "target_artefact_id" text NOT NULL,
  "target_content_version_id" text,
  "target_baseline_id" text,
  "target_external_uri" text,
  "target_owning_domain" text NOT NULL,

  "authority_kind" varchar(16) NOT NULL
    CHECK ("authority_kind" IN ('user', 'system', 'role')),
  "authority_actor_id" text NOT NULL,

  "provenance_actor_id" text NOT NULL,
  "provenance_correlation_id" text NOT NULL,
  "provenance_source_system" text,
  "provenance_import_batch_id" text,
  "provenance_rationale_ref" text,

  "scope_kind" varchar(32) NOT NULL
    CHECK ("scope_kind" IN ('product', 'project', 'release', 'baseline', 'tenant_global')),
  "scope_reference_id" text,

  "context_baseline_id" text,
  "context_content_version_id" text,
  "context_immutable" boolean NOT NULL DEFAULT false,

  "rationale" text,
  "metadata_json" jsonb NOT NULL DEFAULT '{}'::jsonb,

  "duplicate_key" text NOT NULL,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),

  "successor_trace_id" text,

  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL,
  "validated_at" timestamp with time zone,
  "validated_by" text,
  "approved_at" timestamp with time zone,
  "approved_by" text,
  "retired_at" timestamp with time zone,
  "retired_by" text,
  "superseded_at" timestamp with time zone,
  "superseded_by" text,
  "correlation_id" text NOT NULL,

  CONSTRAINT "qep_trace_link_scope_ref_chk"
    CHECK (
      ("scope_kind" = 'tenant_global' AND "scope_reference_id" IS NULL)
      OR ("scope_kind" <> 'tenant_global' AND "scope_reference_id" IS NOT NULL)
    )
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_trace_link_history" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "trace_id" text NOT NULL
    REFERENCES "qep_trace_link"("id"),
  "occurred_at" timestamp with time zone NOT NULL,
  "actor_user_id" text NOT NULL,
  "kind" text NOT NULL,
  "summary" text NOT NULL,
  "sequence" integer NOT NULL CHECK ("sequence" >= 1),
  CONSTRAINT "qep_trace_link_history_seq_uidx"
    UNIQUE ("tenant_id", "trace_id", "sequence")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_trace_link_taxonomy" (
  "tenant_id" text NOT NULL,
  "trace_type" varchar(64) NOT NULL,
  "display_name" text NOT NULL,
  "description" text NOT NULL,
  "family" text NOT NULL,
  "allowed_source_kinds" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "allowed_target_kinds" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "direction_default" varchar(16) NOT NULL,
  "symmetric" varchar(8) NOT NULL,
  "governance_class" varchar(32) NOT NULL,
  "cycle_policy" varchar(32) NOT NULL,
  "rationale_policy" varchar(32) NOT NULL,
  "default_strength" varchar(32) NOT NULL,
  "projection_only" varchar(8) NOT NULL,
  "allows_self_link" varchar(8) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "qep_trace_link_taxonomy_uidx"
    UNIQUE ("tenant_id", "trace_type")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_trace_link_active_duplicate_uidx"
  ON "qep_trace_link" ("tenant_id", "duplicate_key")
  WHERE "lifecycle_state" IN ('draft', 'validated', 'approved');
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_trace_link_tenant_id_idx"
  ON "qep_trace_link" ("tenant_id", "id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_trace_link_tenant_type_idx"
  ON "qep_trace_link" ("tenant_id", "trace_type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_trace_link_tenant_lifecycle_idx"
  ON "qep_trace_link" ("tenant_id", "lifecycle_state");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_trace_link_tenant_source_idx"
  ON "qep_trace_link" ("tenant_id", "source_kind", "source_artefact_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_trace_link_tenant_target_idx"
  ON "qep_trace_link" ("tenant_id", "target_kind", "target_artefact_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_trace_link_tenant_scope_idx"
  ON "qep_trace_link" ("tenant_id", "scope_kind", "scope_reference_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_trace_link_history_trace_idx"
  ON "qep_trace_link_history" ("tenant_id", "trace_id");
