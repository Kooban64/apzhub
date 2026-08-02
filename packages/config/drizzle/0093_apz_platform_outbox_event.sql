-- APZQEP-120-S08: Enterprise Platform Outbox (reliable event delivery).
-- Product-agnostic persistence for transport-neutral outbox drain.
CREATE TABLE IF NOT EXISTS "platform_outbox_event" (
  "outbox_event_id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "aggregate_type" varchar(64) NOT NULL,
  "aggregate_id" text NOT NULL,
  "event_type" varchar(128) NOT NULL,
  "payload" jsonb NOT NULL,
  "status" varchar(32) NOT NULL DEFAULT 'pending',
  "attempt_count" integer NOT NULL DEFAULT 0,
  "max_attempts" integer NOT NULL DEFAULT 5,
  "next_attempt_at" timestamp with time zone,
  "last_error" text,
  "correlation_id" text,
  "idempotency_key" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_outbox_event_tenant_idx"
  ON "platform_outbox_event" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_outbox_event_status_idx"
  ON "platform_outbox_event" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_outbox_event_claim_idx"
  ON "platform_outbox_event" ("status", "next_attempt_at", "created_at");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_outbox_event_idempotency_uidx"
  ON "platform_outbox_event" ("tenant_id", "idempotency_key")
  WHERE "idempotency_key" IS NOT NULL;
