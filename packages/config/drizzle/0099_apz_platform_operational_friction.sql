-- APZHUB-PRODUCT-BOARD-001 — Operational Friction Register (Product Board metadata).

CREATE TABLE IF NOT EXISTS platform_operational_friction (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  title text NOT NULL,
  reported_at timestamptz NOT NULL,
  reporter text NOT NULL,
  products_affected jsonb NOT NULL DEFAULT '[]'::jsonb,
  user_role text NOT NULL,
  frustration text NOT NULL,
  who_experiences text NOT NULL,
  evidence text NOT NULL,
  non_engineering_options text NOT NULL,
  smallest_capability text NOT NULL,
  board_decision text NOT NULL,
  engineering_status text NOT NULL,
  source text NOT NULL,
  outcome_faster boolean,
  outcome_clearer boolean,
  outcome_safer boolean,
  outcome_better_decision boolean,
  outcome_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by_user_id text,
  updated_by_user_id text
);

CREATE INDEX IF NOT EXISTS platform_operational_friction_tenant_idx
  ON platform_operational_friction (tenant_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS platform_operational_friction_decision_idx
  ON platform_operational_friction (tenant_id, board_decision, updated_at DESC);

CREATE TABLE IF NOT EXISTS platform_operational_friction_audit (
  id text PRIMARY KEY,
  friction_id text NOT NULL,
  tenant_id text NOT NULL,
  actor_user_id text NOT NULL,
  action text NOT NULL,
  detail_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS platform_operational_friction_audit_friction_idx
  ON platform_operational_friction_audit (friction_id, created_at DESC);
