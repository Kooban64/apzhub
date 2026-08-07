-- APZ Projects Release 3.0 — Project Lifecycle metadata (W003).
-- Plane remains project shell SoR; these tables own lifecycle stages, governance bind, baselines.

CREATE TABLE IF NOT EXISTS platform_project_lifecycle (
  project_id text PRIMARY KEY,
  tenant_id text NOT NULL,
  stage text NOT NULL,
  classification text,
  delivery_model text,
  execution_characteristic text NOT NULL DEFAULT 'unspecified',
  governance_profile_id text,
  governance_profile_version integer,
  template_id text,
  template_version integer,
  owner_user_id text,
  programme_id text,
  customer_label text,
  target_end_at timestamptz,
  success_criteria text,
  next_milestone_intent text,
  continuous_delivery_waiver boolean NOT NULL DEFAULT false,
  milestone_free_waiver boolean NOT NULL DEFAULT false,
  core_team_user_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  closure_outcome text,
  closure_summary text,
  hold_reason text,
  active_baseline_id text,
  wizard_step integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_project_lifecycle_tenant_stage_idx
  ON platform_project_lifecycle (tenant_id, stage);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_project_baseline (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  project_id text NOT NULL,
  version integer NOT NULL,
  kind text NOT NULL,
  target_end_at timestamptz,
  success_criteria text,
  milestone_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  reason text,
  approved_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS platform_project_baseline_project_version_uidx
  ON platform_project_baseline (tenant_id, project_id, version);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_project_lifecycle_transition (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  project_id text NOT NULL,
  from_stage text NOT NULL,
  to_stage text NOT NULL,
  reason text,
  outcome text,
  actor_user_id text NOT NULL,
  at timestamptz NOT NULL DEFAULT now(),
  audit_note text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_project_lifecycle_transition_project_idx
  ON platform_project_lifecycle_transition (tenant_id, project_id, at);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_project_lifecycle_waiver (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  project_id text NOT NULL,
  policy_key text NOT NULL,
  reason text NOT NULL,
  authorised_by text NOT NULL,
  at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_project_lifecycle_waiver_project_idx
  ON platform_project_lifecycle_waiver (tenant_id, project_id);
