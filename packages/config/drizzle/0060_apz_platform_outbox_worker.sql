-- PCv2-02: Outbox worker lifecycle columns on law_outbox_event
-- Extends LAW-012-02 write-only skeleton for retry / DLQ / claim processing.

ALTER TABLE "law_outbox_event"
  ADD COLUMN IF NOT EXISTS "status" varchar(32) NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "attempt_count" integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "max_attempts" integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS "next_attempt_at" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "last_error" text,
  ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS "correlation_id" text;
--> statement-breakpoint
UPDATE "law_outbox_event"
SET "status" = CASE
  WHEN "published_at" IS NOT NULL THEN 'published'
  ELSE 'pending'
END
WHERE "status" = 'pending' OR "status" IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "law_outbox_event_claim_idx"
  ON "law_outbox_event" ("status", "next_attempt_at", "created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "law_outbox_event_status_idx"
  ON "law_outbox_event" ("status");
