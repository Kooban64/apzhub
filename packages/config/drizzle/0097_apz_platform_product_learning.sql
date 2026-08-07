-- APZHUB-CONTEXT-LEARNING-001 — anonymous product-learning interaction events.
-- Platform metadata only. No business SoR. No user identifiers.

CREATE TABLE IF NOT EXISTS platform_product_learning_event (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  feature_key text NOT NULL,
  event_name text NOT NULL,
  properties_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL,
  correlation_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS platform_product_learning_event_tenant_feature_idx
  ON platform_product_learning_event (tenant_id, feature_key, occurred_at DESC);

CREATE INDEX IF NOT EXISTS platform_product_learning_event_tenant_name_idx
  ON platform_product_learning_event (tenant_id, event_name, occurred_at DESC);
