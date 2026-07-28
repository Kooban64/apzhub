-- APZQEP-ENG-020C: QEP requirement lifecycle history

CREATE TABLE IF NOT EXISTS "qep_requirement_lifecycle_history" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "requirement_id" text NOT NULL,
  "previous_state" varchar(64) NOT NULL,
  "new_state" varchar(64) NOT NULL,
  "action" varchar(64) NOT NULL,
  "actor_user_id" text NOT NULL,
  "reason" text,
  "comments" text,
  "correlation_id" text NOT NULL,
  "revision" integer,
  "metadata_json" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_requirement_lifecycle_history_requirement_idx"
  ON "qep_requirement_lifecycle_history" ("tenant_id", "requirement_id", "created_at");
