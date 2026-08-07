-- W006 / PX-03 — assignment history, RACI, continuity, stakeholders.

CREATE TABLE IF NOT EXISTS platform_delivery_assignment_event (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  assignment_id text NOT NULL,
  kind text NOT NULL,
  actor_user_id text NOT NULL,
  from_principal_id text,
  to_principal_id text,
  note text,
  at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_delivery_assignment_event_assignment_idx
  ON platform_delivery_assignment_event (tenant_id, assignment_id, at);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_responsibility (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  scope_type text NOT NULL,
  scope_id text NOT NULL,
  object_type text NOT NULL,
  object_id text NOT NULL,
  object_label text NOT NULL,
  dimension text NOT NULL,
  principal_type text NOT NULL,
  principal_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_responsibility_scope_idx
  ON platform_responsibility (tenant_id, scope_type, scope_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_continuity_case (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  principal_id text NOT NULL,
  scope_type text NOT NULL,
  scope_id text NOT NULL,
  acting_owner_user_id text,
  affected_commitments jsonb NOT NULL DEFAULT '[]'::jsonb,
  affected_milestones jsonb NOT NULL DEFAULT '[]'::jsonb,
  pending_decisions jsonb NOT NULL DEFAULT '[]'::jsonb,
  open_exceptions jsonb NOT NULL DEFAULT '[]'::jsonb,
  aged_waits_chasing jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommended_replacement_roles jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_continuity_case_scope_idx
  ON platform_continuity_case (tenant_id, scope_type, scope_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_stakeholder (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  scope_type text NOT NULL,
  scope_id text NOT NULL,
  principal_type text NOT NULL,
  principal_id text NOT NULL,
  interest text NOT NULL,
  influence text NOT NULL DEFAULT 'medium',
  engagement_cadence text,
  communication_preference text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_stakeholder_scope_idx
  ON platform_stakeholder (tenant_id, scope_type, scope_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_external_participant (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  display_name text NOT NULL,
  organisation text,
  email text,
  linked_user_id text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_external_participant_tenant_idx
  ON platform_external_participant (tenant_id);
