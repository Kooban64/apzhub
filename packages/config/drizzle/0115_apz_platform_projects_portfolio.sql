-- APZ Projects Release 3.0 — Portfolio hierarchy SoR (W005 / PX-02).

CREATE TABLE IF NOT EXISTS platform_portfolio_enterprise (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  initiative_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_portfolio_enterprise_tenant_idx
  ON platform_portfolio_enterprise (tenant_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_strategic_initiative (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  name text NOT NULL,
  sponsor_user_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  governance_profile_id text,
  strategic_objective_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  programme_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  project_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_strategic_initiative_tenant_status_idx
  ON platform_strategic_initiative (tenant_id, status);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_programme (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  name text NOT NULL,
  owner_user_id text NOT NULL,
  strategic_initiative_id text,
  classification text,
  governance_profile_id text,
  status text NOT NULL DEFAULT 'active',
  strategic_importance text NOT NULL DEFAULT 'normal',
  strategic_objective_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  member_project_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  target_end_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_programme_tenant_status_idx
  ON platform_programme (tenant_id, status);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_programme_tenant_initiative_idx
  ON platform_programme (tenant_id, strategic_initiative_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_strategic_objective (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  name text NOT NULL,
  statement text NOT NULL,
  owner_user_id text NOT NULL,
  status text NOT NULL DEFAULT 'on_track',
  progress integer NOT NULL DEFAULT 0,
  initiative_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  programme_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  contributing_project_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_strategic_objective_tenant_status_idx
  ON platform_strategic_objective (tenant_id, status);
