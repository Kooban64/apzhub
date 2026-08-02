-- APZQEP-120-S06: Evidence Lifecycle & Governance (additive).
-- Logical lifecycle state hooks + append-only transition history.
-- Does not delete content bytes or rewrite evidence identifiers.
ALTER TABLE "qep_evidence"
  ADD COLUMN IF NOT EXISTS "lifecycle_governance_json" jsonb NOT NULL DEFAULT '{}'::jsonb;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_evidence_lifecycle_history" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "evidence_id" text NOT NULL,
  "project_id" text,
  "workspace_id" text,
  "source_state" varchar(32) NOT NULL,
  "target_state" varchar(32) NOT NULL,
  "action" varchar(64) NOT NULL,
  "reason_code" varchar(64) NOT NULL,
  "reason_text" text,
  "actor_id" text NOT NULL,
  "actor_type" varchar(32) NOT NULL DEFAULT 'user',
  "occurred_at" timestamp with time zone NOT NULL,
  "correlation_id" text,
  "causation_id" text,
  "revision_before" integer,
  "revision_after" integer,
  "policy_decision_json" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "metadata_json" jsonb NOT NULL DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_evidence_lifecycle_history_evidence_idx"
  ON "qep_evidence_lifecycle_history" ("tenant_id", "evidence_id", "occurred_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_evidence_lifecycle_history_tenant_occurred_idx"
  ON "qep_evidence_lifecycle_history" ("tenant_id", "occurred_at");
