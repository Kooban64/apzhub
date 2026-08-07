-- APZ-ANALYTICS-CAPABILITY-001 — Decision Intelligence (insight metadata only).
-- Analytics consumes SoRs; never stores authoritative operational facts.

CREATE TABLE IF NOT EXISTS platform_analytics_decision_pack (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  question_id text NOT NULL,
  question text NOT NULL,
  audience_role text NOT NULL,
  indicators jsonb NOT NULL DEFAULT '[]'::jsonb,
  supporting_evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  trend_summary text NOT NULL,
  recommended_actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  generated_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_analytics_decision_pack_tenant_idx
  ON platform_analytics_decision_pack (tenant_id, generated_at DESC);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_analytics_trend_point (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  domain text NOT NULL,
  label text NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  value double precision NOT NULL,
  unit text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_analytics_trend_point_domain_idx
  ON platform_analytics_trend_point (tenant_id, domain, period_start);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_analytics_decision_kpi (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  owner text NOT NULL,
  target_value double precision NOT NULL,
  current_value double precision NOT NULL,
  unit text NOT NULL,
  domain text NOT NULL,
  status text NOT NULL,
  history jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_analytics_decision_kpi_tenant_idx
  ON platform_analytics_decision_kpi (tenant_id, domain, updated_at DESC);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS platform_analytics_decision_timeline (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  title text NOT NULL,
  decision text NOT NULL,
  rationale text NOT NULL,
  decided_by text NOT NULL,
  decided_at timestamptz NOT NULL,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  related_question_id text,
  related_product text,
  source_record_ref text,
  created_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_analytics_decision_timeline_tenant_idx
  ON platform_analytics_decision_timeline (tenant_id, decided_at DESC);
