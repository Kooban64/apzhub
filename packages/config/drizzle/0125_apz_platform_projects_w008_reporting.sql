-- W008 / PX-05 — operational reviews, schedules, pack snapshots, executive summaries.

CREATE TABLE IF NOT EXISTS platform_operational_review (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  type text NOT NULL,
  scope_type text NOT NULL,
  scope_id text NOT NULL,
  period_from timestamptz NOT NULL,
  period_to timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  chair_principal_id text NOT NULL,
  attendee_principal_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  agenda jsonb NOT NULL DEFAULT '[]'::jsonb,
  pack_snapshot_id text,
  executive_summary_id text,
  outcomes jsonb,
  meeting_outcome_id text,
  follow_up_review_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_operational_review_scope_idx
  ON platform_operational_review (tenant_id, scope_type, scope_id, status);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_review_schedule (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  type text NOT NULL,
  scope_type text NOT NULL,
  scope_id text NOT NULL,
  cadence text NOT NULL,
  next_run_at timestamptz NOT NULL,
  previous_review_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  chair_role_key text NOT NULL,
  audience text NOT NULL DEFAULT 'core',
  auto_open_pack boolean NOT NULL DEFAULT true,
  digest_on_complete boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_review_schedule_scope_idx
  ON platform_review_schedule (tenant_id, scope_type, scope_id, status);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_review_pack_snapshot (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  review_id text NOT NULL,
  as_of timestamptz NOT NULL,
  correlation_id text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_review_pack_snapshot_review_idx
  ON platform_review_pack_snapshot (tenant_id, review_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_review_executive_summary (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  review_id text NOT NULL,
  current_position text NOT NULL,
  key_changes text NOT NULL,
  principal_risks text NOT NULL,
  decisions_required text NOT NULL,
  recommended_actions text NOT NULL,
  editable boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_review_executive_summary_review_idx
  ON platform_review_executive_summary (tenant_id, review_id);
