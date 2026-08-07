-- APZ Projects Release 3.0 — Enterprise Delivery Team Directory (W006 / P2).
-- Also persists lifecycle delivery_team_id + operational_role_id.

CREATE TABLE IF NOT EXISTS platform_enterprise_delivery_team (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  name text NOT NULL,
  description text,
  lead_user_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  skill_tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  org_unit_label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_enterprise_delivery_team_tenant_status_idx
  ON platform_enterprise_delivery_team (tenant_id, status);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_enterprise_team_membership (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  team_id text NOT NULL,
  user_id text NOT NULL,
  role_in_team text NOT NULL DEFAULT 'member',
  from_at timestamptz NOT NULL,
  to_at timestamptz,
  allocation_percent integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_enterprise_team_membership_team_idx
  ON platform_enterprise_team_membership (tenant_id, team_id);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS platform_enterprise_team_membership_active_uidx
  ON platform_enterprise_team_membership (tenant_id, team_id, user_id, from_at);
--> statement-breakpoint
ALTER TABLE platform_project_lifecycle
  ADD COLUMN IF NOT EXISTS operational_role_id text;
--> statement-breakpoint
ALTER TABLE platform_project_lifecycle
  ADD COLUMN IF NOT EXISTS delivery_team_id text;
