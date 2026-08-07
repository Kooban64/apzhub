-- APZ-KNOWLEDGE-CAPABILITY-001 — Organisational memory (Knowledge-owned metadata).
-- Knowledge owns memory objects only — never operational truth.

CREATE TABLE IF NOT EXISTS platform_knowledge_object (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  kind text NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  body jsonb NOT NULL DEFAULT '{}'::jsonb,
  owner text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  related_products jsonb NOT NULL DEFAULT '[]'::jsonb,
  related_capabilities jsonb NOT NULL DEFAULT '[]'::jsonb,
  library_category text,
  decision_ref text,
  review_date timestamptz,
  expires_at timestamptz,
  version_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_knowledge_object_tenant_idx
  ON platform_knowledge_object (tenant_id, kind, status, updated_at DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS platform_knowledge_object_title_idx
  ON platform_knowledge_object (tenant_id, title);
