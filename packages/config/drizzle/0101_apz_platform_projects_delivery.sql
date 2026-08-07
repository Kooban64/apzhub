-- APZ-PROJECTS-CAPABILITY-001 — Projects delivery registers (platform metadata).
-- Projects remains SoR for projects/tasks; these tables are Projects-owned delivery artefacts.

CREATE TABLE IF NOT EXISTS platform_project_milestone (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  project_id text NOT NULL,
  name text NOT NULL,
  description text,
  target_date timestamptz,
  owner text,
  status text NOT NULL,
  dependency_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  progress_percent integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_project_milestone_project_idx
  ON platform_project_milestone (tenant_id, project_id, target_date);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_project_risk (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  project_id text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  probability text NOT NULL,
  impact text NOT NULL,
  mitigation text NOT NULL,
  owner text NOT NULL,
  review_date timestamptz,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_project_risk_project_idx
  ON platform_project_risk (tenant_id, project_id, status);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_project_decision (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  project_id text NOT NULL,
  decision text NOT NULL,
  rationale text NOT NULL,
  owner text NOT NULL,
  decided_at timestamptz NOT NULL,
  outcome text NOT NULL,
  related_work text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_project_decision_project_idx
  ON platform_project_decision (tenant_id, project_id, decided_at DESC);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_project_action (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  project_id text NOT NULL,
  title text NOT NULL,
  owner text NOT NULL,
  due_date timestamptz,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_project_action_project_idx
  ON platform_project_action (tenant_id, project_id, status, due_date);
