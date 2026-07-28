-- Additive Notification Delivery plane (Platform-1.3-ENG-004 / ADR-0071).
-- Extends APZNOTIFY ownership. No provider secrets. No mailbox / inbound email.

CREATE TABLE IF NOT EXISTS platform_notification_intent (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  organisation_id text,
  source_product varchar(32) NOT NULL,
  source_event text,
  category text NOT NULL,
  priority varchar(32) NOT NULL DEFAULT 'normal',
  subject text NOT NULL,
  summary text,
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  recipient_hints_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  mandatory boolean NOT NULL DEFAULT false,
  correlation_id text NOT NULL,
  idempotency_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  requested_by text NOT NULL,
  expires_at timestamptz,
  template_id text,
  template_version integer,
  metadata_json jsonb,
  status varchar(32) NOT NULL DEFAULT 'requested',
  suppression_reason text,
  policy_ref text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS platform_notification_intent_tenant_idem_uidx
  ON platform_notification_intent (tenant_id, idempotency_key);

CREATE TABLE IF NOT EXISTS platform_notification_delivery_record (
  id text PRIMARY KEY,
  intent_id text NOT NULL,
  tenant_id text NOT NULL,
  organisation_id text,
  user_id text NOT NULL,
  channel varchar(32) NOT NULL DEFAULT 'in_app',
  provider_id varchar(64) NOT NULL DEFAULT 'in_app',
  status varchar(32) NOT NULL DEFAULT 'requested',
  receipt_level varchar(32) NOT NULL DEFAULT 'requested',
  idempotency_key text NOT NULL,
  correlation_id text NOT NULL,
  attempt_count integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 5,
  next_attempt_at timestamptz,
  last_failure_class varchar(64),
  last_failure_code text,
  in_app_notification_id text,
  terminal_at timestamptz,
  dead_letter boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS platform_notification_delivery_record_idem_uidx
  ON platform_notification_delivery_record (tenant_id, idempotency_key);

CREATE INDEX IF NOT EXISTS platform_notification_delivery_record_queue_idx
  ON platform_notification_delivery_record (status, next_attempt_at);

CREATE TABLE IF NOT EXISTS platform_notification_delivery_try (
  id text PRIMARY KEY,
  delivery_id text NOT NULL,
  attempt_number integer NOT NULL,
  provider_id varchar(64) NOT NULL DEFAULT 'in_app',
  started_at timestamptz NOT NULL,
  finished_at timestamptz,
  receipt_level varchar(32) NOT NULL,
  failure_class varchar(64),
  failure_code text,
  note text
);

CREATE INDEX IF NOT EXISTS platform_notification_delivery_try_delivery_idx
  ON platform_notification_delivery_try (delivery_id);

CREATE TABLE IF NOT EXISTS platform_notification_in_app_item (
  id text PRIMARY KEY,
  delivery_id text NOT NULL,
  intent_id text NOT NULL,
  tenant_id text NOT NULL,
  organisation_id text,
  user_id text NOT NULL,
  category text NOT NULL,
  priority varchar(32) NOT NULL DEFAULT 'normal',
  title text NOT NULL,
  summary text,
  body text,
  source_product varchar(32) NOT NULL,
  source_object_ref text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

CREATE INDEX IF NOT EXISTS platform_notification_in_app_item_user_idx
  ON platform_notification_in_app_item (tenant_id, user_id, created_at DESC);
