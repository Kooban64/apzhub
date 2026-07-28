-- Platform-1.4-ENG-001B-P4 — additive admin audit for durable delivery operations.
-- No DROP. No provider secrets. Immutable append-only audit rows.

CREATE TABLE IF NOT EXISTS platform_notification_delivery_admin_audit (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  organisation_id text,
  actor_user_id text NOT NULL,
  operation text NOT NULL,
  delivery_id text NOT NULL,
  reason text,
  result text NOT NULL,
  detail text,
  correlation_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS platform_notification_delivery_admin_audit_tenant_idx
  ON platform_notification_delivery_admin_audit (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS platform_notification_delivery_admin_audit_delivery_idx
  ON platform_notification_delivery_admin_audit (delivery_id, created_at DESC);
