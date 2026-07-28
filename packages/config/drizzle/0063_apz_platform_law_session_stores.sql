-- APZHUB-ENG-0002 / R12-PERSIST-02: Law activity + notification session PostgreSQL SoR

CREATE TABLE IF NOT EXISTS "platform_law_activity_session" (
  "tenant_id" text NOT NULL,
  "user_id" text NOT NULL,
  "payload_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("tenant_id", "user_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_law_activity_session_updated_idx"
  ON "platform_law_activity_session" ("updated_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "platform_law_notification_session" (
  "tenant_id" text NOT NULL,
  "user_id" text NOT NULL,
  "payload_json" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("tenant_id", "user_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_law_notification_session_updated_idx"
  ON "platform_law_notification_session" ("updated_at");
