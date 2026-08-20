-- APZQEP Phase 7: one typed AI Proposal aggregate (not a second SoR).
CREATE TABLE IF NOT EXISTS "qep_ai_proposal" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "environment_id" text,
  "proposal_type" varchar(32) NOT NULL,
  "status" varchar(16) NOT NULL,
  "target_id" text,
  "original_content" jsonb NOT NULL,
  "reviewed_content" jsonb NOT NULL,
  "context_refs" jsonb NOT NULL,
  "fingerprints" jsonb NOT NULL,
  "source_authorised" boolean NOT NULL,
  "evidence_extract_used" boolean NOT NULL,
  "provider" text NOT NULL,
  "model" text NOT NULL,
  "generated_at" timestamp with time zone NOT NULL,
  "generated_by" text NOT NULL,
  "reviewed_at" timestamp with time zone,
  "reviewed_by" text,
  "decision_note" text,
  "resulting_record_id" text,
  "resulting_record_kind" text,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_ai_proposal_app_idx"
  ON "qep_ai_proposal" ("tenant_id", "application_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_ai_proposal_status_idx"
  ON "qep_ai_proposal" ("tenant_id", "status");
