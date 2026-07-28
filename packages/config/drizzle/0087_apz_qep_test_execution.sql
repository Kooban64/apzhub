-- APZQEP-ENG-100D: Test Execution Infrastructure persistence (OES-ENG-090A PART-03).
CREATE TABLE IF NOT EXISTS "qep_test_execution" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "execution_number" text NOT NULL,
  "project_id" text NOT NULL,
  "workspace_id" text NOT NULL,
  "status" varchar(32) NOT NULL
    CHECK ("status" IN (
      'draft', 'ready', 'assigned', 'in_progress', 'paused', 'blocked',
      'completed', 'submitted_for_review', 'accepted', 'rejected',
      'cancelled', 'superseded'
    )),
  "mode" varchar(32) NOT NULL
    CHECK ("mode" IN ('manual', 'assisted_manual', 'automated', 'imported')),
  "outcome" varchar(32)
    CHECK ("outcome" IS NULL OR "outcome" IN ('passed', 'failed', 'blocked', 'inconclusive', 'cancelled')),
  "pre_review_derived_outcome" varchar(32)
    CHECK ("pre_review_derived_outcome" IS NULL OR "pre_review_derived_outcome" IN ('passed', 'failed', 'blocked', 'inconclusive', 'cancelled')),
  "plan_ref_capability" text,
  "plan_ref_id" text,
  "plan_ref_version_label" text,
  "spec_ref_capability" text,
  "spec_ref_id" text,
  "spec_ref_version_label" text,
  "plan_item_id" text,
  "context_json" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "owner_id" text NOT NULL,
  "executor_id" text,
  "reviewer_id" text,
  "agent_identity" text,
  "assignment_updated_at" timestamp with time zone NOT NULL,
  "assignment_updated_by" text NOT NULL,
  "block_reason" text,
  "cancel_reason" text,
  "supersedes_id" text,
  "superseded_by_id" text,
  "revision" integer NOT NULL DEFAULT 1 CHECK ("revision" >= 1),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_by" text NOT NULL,
  "correlation_id" text,
  CONSTRAINT "qep_test_execution_tenant_number_uidx" UNIQUE ("tenant_id", "execution_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_test_execution_manifest" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "execution_id" text NOT NULL
    REFERENCES "qep_test_execution"("id") ON DELETE CASCADE,
  "content_hash" text NOT NULL,
  "sealed_at" timestamp with time zone NOT NULL,
  "sealed_by" text NOT NULL,
  "preconditions_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "steps_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "qep_test_execution_manifest_execution_uidx" UNIQUE ("execution_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_test_execution_step" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "execution_id" text NOT NULL
    REFERENCES "qep_test_execution"("id") ON DELETE CASCADE,
  "order" integer NOT NULL,
  "instruction" text NOT NULL,
  "expected_result" text NOT NULL,
  "preconditions_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "require_actual_result" boolean NOT NULL DEFAULT true,
  "allow_unordered" boolean NOT NULL DEFAULT false,
  "actual_result" text,
  "outcome" varchar(32)
    CHECK ("outcome" IS NULL OR "outcome" IN (
      'passed', 'failed', 'blocked', 'skipped', 'not_applicable',
      'inconclusive', 'not_executed', 'cancelled'
    )),
  "evidence_ids_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "skip_reason" text,
  "block_reason" text,
  "not_applicable_reason" text,
  "comment" text,
  "attempt_count" integer NOT NULL DEFAULT 0,
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  CONSTRAINT "qep_test_execution_step_order_uidx" UNIQUE ("tenant_id", "execution_id", "order")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_test_execution_observation" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "execution_id" text NOT NULL
    REFERENCES "qep_test_execution"("id") ON DELETE CASCADE,
  "body" text NOT NULL,
  "actor_user_id" text NOT NULL,
  "recorded_at" timestamp with time zone NOT NULL,
  "severity_hint" varchar(16)
    CHECK ("severity_hint" IS NULL OR "severity_hint" IN ('info', 'warning', 'critical')),
  "structured_json" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_test_execution_evidence_reference" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "execution_id" text NOT NULL
    REFERENCES "qep_test_execution"("id") ON DELETE CASCADE,
  "uri" text NOT NULL,
  "integrity_hash" text,
  "associated_at" timestamp with time zone NOT NULL,
  "associated_by" text NOT NULL,
  "step_order" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_test_execution_review" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "execution_id" text NOT NULL
    REFERENCES "qep_test_execution"("id") ON DELETE CASCADE,
  "reviewer_id" text NOT NULL,
  "decision" varchar(16) NOT NULL CHECK ("decision" IN ('accepted', 'rejected')),
  "reason" text,
  "decided_at" timestamp with time zone NOT NULL,
  "pre_review_derived_outcome" varchar(32) NOT NULL,
  "outcome_override" varchar(32),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_test_execution_external_submission" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "execution_id" text NOT NULL
    REFERENCES "qep_test_execution"("id") ON DELETE CASCADE,
  "source_system_id" text NOT NULL,
  "agent_identity" text NOT NULL,
  "idempotency_key" text NOT NULL,
  "payload_hash" text NOT NULL,
  "signature_metadata" text,
  "is_complete" boolean NOT NULL DEFAULT false,
  "correlation_id" text,
  "received_at" timestamp with time zone NOT NULL,
  "received_by" text NOT NULL,
  "quarantine_reason" text,
  CONSTRAINT "qep_test_execution_external_submission_idem_uidx"
    UNIQUE ("tenant_id", "source_system_id", "idempotency_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_test_execution_history" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "execution_id" text NOT NULL
    REFERENCES "qep_test_execution"("id") ON DELETE CASCADE,
  "sequence" integer NOT NULL CHECK ("sequence" >= 1),
  "occurred_at" timestamp with time zone NOT NULL,
  "actor_user_id" text NOT NULL,
  "action" text NOT NULL,
  "summary" text NOT NULL,
  "from_status" varchar(32),
  "to_status" varchar(32),
  "correlation_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "qep_test_execution_history_seq_uidx"
    UNIQUE ("tenant_id", "execution_id", "sequence")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_test_execution_audit" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "execution_id" text NOT NULL,
  "action" text NOT NULL,
  "actor_user_id" text NOT NULL,
  "correlation_id" text NOT NULL,
  "prior_status" varchar(32),
  "resulting_status" varchar(32),
  "reason" text,
  "details_json" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_test_execution_outbox" (
  "outbox_event_id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "execution_id" text NOT NULL,
  "event_type" varchar(128) NOT NULL,
  "payload" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "published_at" timestamp with time zone,
  "status" varchar(32) NOT NULL DEFAULT 'pending',
  "attempt_count" integer NOT NULL DEFAULT 0,
  "max_attempts" integer NOT NULL DEFAULT 5,
  "next_attempt_at" timestamp with time zone,
  "last_error" text,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "correlation_id" text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_tenant_id_idx"
  ON "qep_test_execution" ("tenant_id", "id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_tenant_status_idx"
  ON "qep_test_execution" ("tenant_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_tenant_executor_idx"
  ON "qep_test_execution" ("tenant_id", "executor_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_tenant_owner_idx"
  ON "qep_test_execution" ("tenant_id", "owner_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_tenant_reviewer_idx"
  ON "qep_test_execution" ("tenant_id", "reviewer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_tenant_plan_ref_idx"
  ON "qep_test_execution" ("tenant_id", "plan_ref_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_tenant_spec_ref_idx"
  ON "qep_test_execution" ("tenant_id", "spec_ref_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_review_queue_idx"
  ON "qep_test_execution" ("tenant_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_tenant_updated_idx"
  ON "qep_test_execution" ("tenant_id", "updated_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_manifest_tenant_idx"
  ON "qep_test_execution_manifest" ("tenant_id", "execution_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_step_execution_idx"
  ON "qep_test_execution_step" ("tenant_id", "execution_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_observation_execution_idx"
  ON "qep_test_execution_observation" ("tenant_id", "execution_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_evidence_reference_execution_idx"
  ON "qep_test_execution_evidence_reference" ("tenant_id", "execution_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_review_execution_idx"
  ON "qep_test_execution_review" ("tenant_id", "execution_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_external_submission_execution_idx"
  ON "qep_test_execution_external_submission" ("tenant_id", "execution_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_history_execution_idx"
  ON "qep_test_execution_history" ("tenant_id", "execution_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_audit_tenant_idx"
  ON "qep_test_execution_audit" ("tenant_id", "execution_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_audit_created_idx"
  ON "qep_test_execution_audit" ("tenant_id", "created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_outbox_tenant_idx"
  ON "qep_test_execution_outbox" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_outbox_execution_idx"
  ON "qep_test_execution_outbox" ("tenant_id", "execution_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_outbox_status_idx"
  ON "qep_test_execution_outbox" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_test_execution_outbox_claim_idx"
  ON "qep_test_execution_outbox" ("status", "next_attempt_at", "created_at");
