-- Flagship F1: durable SCM change heartbeat (commit / PR / push).

CREATE TABLE IF NOT EXISTS "qep_scm_change_event" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "repository_id" text,
  "provider_id" varchar(64) NOT NULL,
  "kind" varchar(32) NOT NULL,
  "external_key" text NOT NULL,
  "occurred_at" timestamp with time zone NOT NULL,
  "change_json" jsonb NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_scm_change_event_tenant_occurred_idx"
  ON "qep_scm_change_event" ("tenant_id", "occurred_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_scm_change_event_repository_occurred_idx"
  ON "qep_scm_change_event" ("repository_id", "occurred_at");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_scm_change_event_tenant_provider_key_uidx"
  ON "qep_scm_change_event" ("tenant_id", "provider_id", "external_key", "kind");
