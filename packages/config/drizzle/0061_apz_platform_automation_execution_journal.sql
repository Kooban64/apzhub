-- APZHUB-ENG-0001 / R12-PERSIST-01: Automation execution journal PostgreSQL SoR

CREATE TABLE IF NOT EXISTS "platform_automation_execution_journal" (
  "id" text PRIMARY KEY NOT NULL,
  "registration_id" text NOT NULL,
  "registration_key" text NOT NULL,
  "event_id" text NOT NULL,
  "envelope_id" text NOT NULL,
  "status" varchar(32) NOT NULL,
  "reason" text,
  "correlation_id" text NOT NULL,
  "tenant_id" text,
  "executed_at" timestamp with time zone NOT NULL,
  "details_json" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "platform_automation_exec_journal_idempotency_uidx"
  ON "platform_automation_execution_journal" ("envelope_id", "registration_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_automation_exec_journal_envelope_idx"
  ON "platform_automation_execution_journal" ("envelope_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_automation_exec_journal_registration_idx"
  ON "platform_automation_execution_journal" ("registration_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_automation_exec_journal_event_idx"
  ON "platform_automation_execution_journal" ("event_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_automation_exec_journal_tenant_idx"
  ON "platform_automation_execution_journal" ("tenant_id");
