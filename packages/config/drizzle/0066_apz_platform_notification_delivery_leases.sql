-- Platform-1.4-ENG-001B-P0 / ADR-0073 Option A — additive lease & attempt identity columns.
-- Extends 0065 Notification Delivery plane. No DROP. No data migration. No provider secrets.

ALTER TABLE platform_notification_delivery_record
  ADD COLUMN IF NOT EXISTS claimed_by text,
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz,
  ADD COLUMN IF NOT EXISTS lease_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS requeue_reason text;

ALTER TABLE platform_notification_delivery_try
  ADD COLUMN IF NOT EXISTS provider_reference text,
  ADD COLUMN IF NOT EXISTS worker_id text;

CREATE INDEX IF NOT EXISTS platform_notification_delivery_record_lease_idx
  ON platform_notification_delivery_record (status, lease_expires_at)
  WHERE status = 'processing';

CREATE INDEX IF NOT EXISTS platform_notification_delivery_record_tenant_queue_idx
  ON platform_notification_delivery_record (tenant_id, status, next_attempt_at);

CREATE UNIQUE INDEX IF NOT EXISTS platform_notification_delivery_try_delivery_attempt_uidx
  ON platform_notification_delivery_try (delivery_id, attempt_number);
