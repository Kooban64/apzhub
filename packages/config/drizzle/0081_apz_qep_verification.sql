-- APZQEP-ENG-040B Part 2: Verification Engine persistence (ARCH-009 governed decision records).
CREATE TABLE IF NOT EXISTS "qep_verification" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "status" varchar(32) NOT NULL
    CHECK ("status" IN (
      'draft', 'requested', 'assigned', 'in_progress', 'verified', 'rejected',
      'expired', 'withdrawn', 'superseded', 'cancelled', 'retired'
    )),
  "outcome" varchar(32)
    CHECK ("outcome" IS NULL OR "outcome" IN (
      'verified', 'failed', 'partially_verified', 'blocked', 'deferred', 'waived', 'inconclusive'
    )),

  "subject_kind" varchar(64) NOT NULL,
  "subject_artefact_id" text NOT NULL,
  "subject_content_version_id" text,
  "subject_baseline_id" text,
  "subject_external_uri" text,
  "subject_owning_domain" text NOT NULL,

  "authority_kind" varchar(32) NOT NULL
    CHECK ("authority_kind" IN ('user', 'role', 'system', 'delegated')),
  "authority_actor_id" text NOT NULL,

  "context_baseline_id" text,
  "context_content_version_id" text,
  "context_immutable" boolean NOT NULL DEFAULT false,

  "scope_kind" varchar(32) NOT NULL
    CHECK ("scope_kind" IN ('product', 'project', 'release', 'baseline', 'tenant_global')),
  "scope_reference_id" text,

  "priority" varchar(16) NOT NULL
    CHECK ("priority" IN ('critical', 'high', 'medium', 'low')),
  "origin" varchar(32) NOT NULL
    CHECK ("origin" IN ('user', 'import', 'system_rule', 'ai_suggestion', 'migration')),

  "rationale" text,
  "reason" text,
  "comment" text,
  "result_summary" text,
  "metadata_json" jsonb NOT NULL DEFAULT '{}'::jsonb,

  "decision_outcome" varchar(32)
    CHECK ("decision_outcome" IS NULL OR "decision_outcome" IN (
      'verified', 'failed', 'partially_verified', 'blocked', 'deferred', 'waived', 'inconclusive'
    )),
  "decision_at" timestamp with time zone,
  "decision_by" text,
  "decision_rationale" text,
  "decision_comment" text,

  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),

  "assigned_to" text,
  "assigned_at" timestamp with time zone,
  "started_at" timestamp with time zone,
  "started_by" text,
  "completed_at" timestamp with time zone,
  "completed_by" text,
  "expired_at" timestamp with time zone,
  "withdrawn_at" timestamp with time zone,
  "cancelled_at" timestamp with time zone,
  "retired_at" timestamp with time zone,
  "superseded_at" timestamp with time zone,
  "superseded_by" text,
  "successor_verification_id" text,

  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL,
  "correlation_id" text NOT NULL,

  CONSTRAINT "qep_verification_scope_ref_chk"
    CHECK (
      ("scope_kind" = 'tenant_global' AND "scope_reference_id" IS NULL)
      OR ("scope_kind" <> 'tenant_global' AND "scope_reference_id" IS NOT NULL)
    )
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_verification_history" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "verification_id" text NOT NULL
    REFERENCES "qep_verification"("id"),
  "occurred_at" timestamp with time zone NOT NULL,
  "actor_user_id" text NOT NULL,
  "kind" text NOT NULL,
  "summary" text NOT NULL,
  "sequence" integer NOT NULL CHECK ("sequence" >= 1),
  CONSTRAINT "qep_verification_history_seq_uidx"
    UNIQUE ("tenant_id", "verification_id", "sequence")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_verification_tenant_id_idx"
  ON "qep_verification" ("tenant_id", "id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_verification_tenant_status_idx"
  ON "qep_verification" ("tenant_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_verification_tenant_outcome_idx"
  ON "qep_verification" ("tenant_id", "outcome");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_verification_tenant_subject_idx"
  ON "qep_verification" ("tenant_id", "subject_kind", "subject_artefact_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_verification_tenant_authority_idx"
  ON "qep_verification" ("tenant_id", "authority_kind", "authority_actor_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_verification_tenant_scope_idx"
  ON "qep_verification" ("tenant_id", "scope_kind", "scope_reference_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_verification_history_verification_idx"
  ON "qep_verification_history" ("tenant_id", "verification_id");
