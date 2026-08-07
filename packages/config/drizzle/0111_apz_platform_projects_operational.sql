-- APZ Projects Release 3.0 — Operational Delivery SoR (W004).

CREATE TABLE IF NOT EXISTS platform_project_commitment (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  project_id text NOT NULL,
  statement text NOT NULL,
  owner_user_id text NOT NULL,
  due_at timestamptz,
  status text NOT NULL,
  waiters jsonb NOT NULL DEFAULT '[]'::jsonb,
  failure_consequence text,
  milestone_id text,
  waiting_id text,
  baseline_version_id text,
  blocked_by_dependency_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  priority text NOT NULL DEFAULT 'normal',
  completion_evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  blocks_go_live boolean NOT NULL DEFAULT false,
  cancel_reason text,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_project_commitment_project_idx
  ON platform_project_commitment (tenant_id, project_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_project_waiting (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  project_id text NOT NULL,
  subject text NOT NULL,
  category text NOT NULL,
  since timestamptz NOT NULL,
  chase_owner_user_id text NOT NULL,
  status text NOT NULL,
  party_label text,
  sla_days integer NOT NULL DEFAULT 7,
  failure_consequence text,
  linked_commitment_id text,
  linked_decision_id text,
  linked_milestone_id text,
  resolved_at timestamptz,
  resolve_note text,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_project_waiting_project_idx
  ON platform_project_waiting (tenant_id, project_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_project_dependency (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  project_id text NOT NULL,
  from_ref jsonb NOT NULL,
  to_ref jsonb NOT NULL,
  kind text NOT NULL,
  status text NOT NULL,
  failure_consequence text,
  owner_user_id text,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_project_dependency_project_idx
  ON platform_project_dependency (tenant_id, project_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_project_ops_decision (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  project_id text NOT NULL,
  title text NOT NULL,
  status text NOT NULL,
  decision_maker_user_id text NOT NULL,
  due_at timestamptz,
  context text,
  outcome text,
  failure_consequence text,
  links jsonb NOT NULL DEFAULT '[]'::jsonb,
  defer_reason text,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_project_ops_decision_project_idx
  ON platform_project_ops_decision (tenant_id, project_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_project_checkpoint (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  project_id text NOT NULL,
  key text NOT NULL,
  name text NOT NULL,
  status text NOT NULL,
  required_by_profile boolean NOT NULL DEFAULT true,
  release_class boolean NOT NULL DEFAULT false,
  workflow_binding text,
  due_at timestamptz,
  anchor_milestone_id text,
  decision_id text,
  waiver_actor text,
  waiver_reason text,
  waived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_project_checkpoint_project_idx
  ON platform_project_checkpoint (tenant_id, project_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_project_exception (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  project_id text NOT NULL,
  type text NOT NULL,
  severity text NOT NULL,
  status text NOT NULL,
  outcome text,
  subject_ref jsonb NOT NULL,
  detected_at timestamptz NOT NULL,
  reason text NOT NULL,
  impact_summary text NOT NULL,
  failure_consequence text,
  required_decision_id text,
  escalation_state text NOT NULL DEFAULT 'none',
  resolution_note text,
  concluded_at timestamptz,
  concluded_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_project_exception_project_idx
  ON platform_project_exception (tenant_id, project_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_project_operational_history (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  project_id text NOT NULL,
  object_type text NOT NULL,
  object_id text NOT NULL,
  kind text NOT NULL,
  summary text NOT NULL,
  detail text,
  actor_user_id text NOT NULL,
  at timestamptz NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_project_ops_history_object_idx
  ON platform_project_operational_history (tenant_id, project_id, object_type, object_id);
--> statement-breakpoint
ALTER TABLE platform_project_risk
  ADD COLUMN IF NOT EXISTS failure_consequence text;
--> statement-breakpoint
ALTER TABLE platform_project_risk
  ADD COLUMN IF NOT EXISTS watch_band boolean NOT NULL DEFAULT false;
