-- W009 / PX-06 — personal saved searches, bulk ops audit, productivity sessions.

CREATE TABLE IF NOT EXISTS platform_projects_saved_search (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  owner_user_id text NOT NULL,
  name text NOT NULL,
  query text NOT NULL,
  facets jsonb NOT NULL DEFAULT '{}'::jsonb,
  scope_mode text NOT NULL DEFAULT 'global',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_projects_saved_search_owner_idx
  ON platform_projects_saved_search (tenant_id, owner_user_id, updated_at DESC);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_projects_bulk_operation (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  kind text NOT NULL,
  object_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending_confirm',
  actor_user_id text NOT NULL,
  confirmation_token text NOT NULL,
  audit_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  executed_at timestamptz
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_projects_bulk_operation_actor_idx
  ON platform_projects_bulk_operation (tenant_id, actor_user_id, created_at DESC);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_projects_productivity_session (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  owner_user_id text NOT NULL,
  type text NOT NULL,
  name text,
  scope_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  opened_object_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_resumed_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_projects_productivity_session_owner_idx
  ON platform_projects_productivity_session (tenant_id, owner_user_id, last_resumed_at DESC);
