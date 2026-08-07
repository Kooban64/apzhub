-- APZ-WORKFLOW-CAPABILITY-001 — Business process excellence (Workflow-owned metadata).
-- Describes business intent only. No automation execution / queues / engine state.

CREATE TABLE IF NOT EXISTS platform_business_journey (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  name text NOT NULL,
  summary text NOT NULL,
  outcomes jsonb NOT NULL DEFAULT '[]'::jsonb,
  stages jsonb NOT NULL DEFAULT '[]'::jsonb,
  transitions jsonb NOT NULL DEFAULT '[]'::jsonb,
  process_owner text NOT NULL,
  business_steward text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  publication_status text NOT NULL,
  review_cycle_days integer,
  next_review_at timestamptz,
  template_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_business_journey_tenant_idx
  ON platform_business_journey (tenant_id, publication_status, updated_at DESC);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_business_process_template (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  key text NOT NULL,
  name text NOT NULL,
  summary text NOT NULL,
  default_outcomes jsonb NOT NULL DEFAULT '[]'::jsonb,
  default_stages jsonb NOT NULL DEFAULT '[]'::jsonb,
  default_transitions jsonb NOT NULL DEFAULT '[]'::jsonb,
  version integer NOT NULL DEFAULT 1,
  editable boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS platform_business_process_template_tenant_key_idx
  ON platform_business_process_template (tenant_id, key);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_business_process_instance (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  journey_id text NOT NULL,
  title text NOT NULL,
  current_stage_id text NOT NULL,
  status text NOT NULL,
  entered_stage_at timestamptz NOT NULL,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_business_process_instance_journey_idx
  ON platform_business_process_instance (tenant_id, journey_id, status);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_business_process_audit (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  journey_id text NOT NULL,
  action text NOT NULL,
  from_status text,
  to_status text,
  actor text NOT NULL,
  notes text,
  at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_business_process_audit_journey_idx
  ON platform_business_process_audit (tenant_id, journey_id, at DESC);
