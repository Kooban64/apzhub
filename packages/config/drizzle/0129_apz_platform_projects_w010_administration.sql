-- W010 / PX-07 — operational administration registries.

CREATE TABLE IF NOT EXISTS platform_projects_delegation (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  from_principal_id text NOT NULL,
  to_principal_id text NOT NULL,
  scope_type text NOT NULL,
  scope_id text NOT NULL,
  permission_set jsonb NOT NULL DEFAULT '[]'::jsonb,
  role_keys jsonb NOT NULL DEFAULT '[]'::jsonb,
  valid_from timestamptz NOT NULL,
  valid_to timestamptz NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  revoked_by text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_projects_delegation_scope_idx
  ON platform_projects_delegation (tenant_id, scope_type, scope_id, status);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_projects_retention_policy (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  key text NOT NULL,
  name text NOT NULL,
  classification text NOT NULL,
  retain_years integer NOT NULL,
  archive_behaviour text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS platform_projects_retention_policy_key_idx
  ON platform_projects_retention_policy (tenant_id, key);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_projects_legal_hold (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  scope_type text NOT NULL,
  scope_id text NOT NULL,
  reason text NOT NULL,
  placed_by text NOT NULL,
  placed_at timestamptz NOT NULL DEFAULT now(),
  released_at timestamptz,
  released_by text,
  status text NOT NULL DEFAULT 'active'
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_projects_legal_hold_scope_idx
  ON platform_projects_legal_hold (tenant_id, scope_type, scope_id, status);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_projects_governed_search (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  key text NOT NULL,
  name text NOT NULL,
  query text NOT NULL,
  facets jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  audience text NOT NULL DEFAULT 'organisation',
  scope_id text,
  published_at timestamptz,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS platform_projects_governed_search_key_idx
  ON platform_projects_governed_search (tenant_id, key);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_projects_operational_role (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  key text NOT NULL,
  label text NOT NULL,
  description text NOT NULL DEFAULT '',
  accountability_hint text NOT NULL DEFAULT 'Responsible',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS platform_projects_operational_role_key_idx
  ON platform_projects_operational_role (tenant_id, key);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_projects_admin_audit (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  type text NOT NULL,
  actor_principal_id text NOT NULL,
  summary text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  correlation_id text,
  at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_projects_admin_audit_at_idx
  ON platform_projects_admin_audit (tenant_id, at DESC);
