-- APZ Projects Release 3.0 — Resource assignments (W006/PX-03) + Org Governance (W010/P3).

CREATE TABLE IF NOT EXISTS platform_delivery_assignment (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  scope_type text NOT NULL,
  scope_id text NOT NULL,
  principal_type text NOT NULL,
  principal_id text NOT NULL,
  assignment_type text NOT NULL DEFAULT 'core',
  from_at timestamptz NOT NULL,
  to_at timestamptz,
  allocation_percent integer,
  primary_role_key text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_delivery_assignment_scope_idx
  ON platform_delivery_assignment (tenant_id, scope_type, scope_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_org_governance_profile (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  key text NOT NULL,
  name text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  scope text NOT NULL DEFAULT 'organisation',
  status text NOT NULL DEFAULT 'draft',
  requires_hold_decision boolean NOT NULL DEFAULT false,
  requires_closure_approval boolean NOT NULL DEFAULT false,
  requires_evidence_on_close boolean NOT NULL DEFAULT true,
  initiation_requires_milestone boolean NOT NULL DEFAULT true,
  milestone_date_tolerance_days integer NOT NULL DEFAULT 7,
  waiting_breach_escalation_days integer NOT NULL DEFAULT 3,
  allowed_delivery_models jsonb NOT NULL DEFAULT '[]'::jsonb,
  allowed_classifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  bound_policy_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  effective_from timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_org_governance_profile_tenant_status_idx
  ON platform_org_governance_profile (tenant_id, status);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_operational_policy (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  key text NOT NULL,
  name text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft',
  areas jsonb NOT NULL DEFAULT '[]'::jsonb,
  rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  bound_profile_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  effective_from timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_operational_policy_tenant_status_idx
  ON platform_operational_policy (tenant_id, status);
