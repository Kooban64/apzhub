-- APZQEP Phase 5: Exploratory Session, Experience Plan, Verification Activity, shared capture.
CREATE TABLE IF NOT EXISTS "qep_exploratory_session" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "number" varchar(32) NOT NULL,
  "name" text NOT NULL,
  "status" varchar(32) NOT NULL,
  "tester_id" text NOT NULL,
  "tester_name" text,
  "environment_id" text,
  "environment_name" text,
  "mission" text NOT NULL,
  "scope" text NOT NULL,
  "session_notes" text,
  "started_at" timestamp with time zone,
  "paused_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "elapsed_ms" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_exploratory_session_number_uidx"
  ON "qep_exploratory_session" ("tenant_id", "application_id", "number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_exploratory_session_app_idx"
  ON "qep_exploratory_session" ("tenant_id", "application_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_exploratory_area" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "session_id" text NOT NULL,
  "prompt" text NOT NULL,
  "sequence" integer NOT NULL DEFAULT 0,
  "explored" boolean NOT NULL DEFAULT false,
  "explored_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_exploratory_area_session_idx"
  ON "qep_exploratory_area" ("tenant_id", "session_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_experience_plan" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "number" varchar(32) NOT NULL,
  "name" text NOT NULL,
  "status" varchar(32) NOT NULL,
  "owner_id" text NOT NULL,
  "owner_name" text,
  "environment_id" text,
  "environment_name" text,
  "mission" text NOT NULL,
  "scope" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_experience_plan_number_uidx"
  ON "qep_experience_plan" ("tenant_id", "application_id", "number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_experience_plan_app_idx"
  ON "qep_experience_plan" ("tenant_id", "application_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_experience_plan_discipline" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "plan_id" text NOT NULL,
  "discipline" varchar(32) NOT NULL,
  "sequence" integer NOT NULL DEFAULT 0
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_experience_plan_discipline_uidx"
  ON "qep_experience_plan_discipline" ("plan_id", "discipline");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_experience_context" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "plan_id" text NOT NULL,
  "label" text NOT NULL,
  "device_class" varchar(16) NOT NULL,
  "viewport_width" integer,
  "viewport_height" integer,
  "orientation" varchar(16),
  "browser" text,
  "browser_version" text,
  "operating_system" text,
  "device_profile" text,
  "sequence" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_experience_context_plan_idx"
  ON "qep_experience_context" ("tenant_id", "plan_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_experience_criterion" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "plan_id" text NOT NULL,
  "discipline" varchar(32) NOT NULL,
  "statement" text NOT NULL,
  "sequence" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_experience_criterion_plan_idx"
  ON "qep_experience_criterion" ("tenant_id", "plan_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_experience_verification_activity" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "plan_id" text NOT NULL,
  "number" varchar(32) NOT NULL,
  "status" varchar(32) NOT NULL,
  "tester_id" text NOT NULL,
  "tester_name" text,
  "current_context_id" text,
  "environment_id" text,
  "environment_name" text,
  "started_at" timestamp with time zone,
  "paused_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "elapsed_ms" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_experience_activity_number_uidx"
  ON "qep_experience_verification_activity" ("tenant_id", "application_id", "number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_experience_activity_plan_idx"
  ON "qep_experience_verification_activity" ("tenant_id", "plan_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_experience_criterion_result" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "activity_id" text NOT NULL,
  "criterion_id" text NOT NULL,
  "context_id" text NOT NULL,
  "state" varchar(32) NOT NULL,
  "concern_found" boolean NOT NULL DEFAULT false,
  "note" text,
  "recorded_at" timestamp with time zone NOT NULL,
  "recorded_by" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_experience_criterion_result_uidx"
  ON "qep_experience_criterion_result" ("activity_id", "criterion_id", "context_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_experience_criterion_result_activity_idx"
  ON "qep_experience_criterion_result" ("tenant_id", "activity_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_experience_context_activity" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "activity_id" text NOT NULL,
  "context_id" text NOT NULL,
  "activated_at" timestamp with time zone NOT NULL,
  "completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_experience_context_activity_uidx"
  ON "qep_experience_context_activity" ("activity_id", "context_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_quality_observation" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "host_kind" varchar(32) NOT NULL,
  "host_id" text NOT NULL,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "context_id" text,
  "criterion_id" text,
  "created_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_quality_observation_host_idx"
  ON "qep_quality_observation" ("tenant_id", "host_kind", "host_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_quality_issue" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "host_kind" varchar(32) NOT NULL,
  "host_id" text NOT NULL,
  "observation_id" text,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "priority" varchar(16) NOT NULL DEFAULT 'medium',
  "status" varchar(32) NOT NULL,
  "context_id" text,
  "criterion_id" text,
  "defect_id" text,
  "created_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_quality_issue_host_idx"
  ON "qep_quality_issue" ("tenant_id", "host_kind", "host_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_quality_note" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "host_kind" varchar(32) NOT NULL,
  "host_id" text NOT NULL,
  "body" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_quality_note_host_idx"
  ON "qep_quality_note" ("tenant_id", "host_kind", "host_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_quality_evidence_link" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "evidence_id" text NOT NULL,
  "target_kind" varchar(32) NOT NULL,
  "target_id" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_quality_evidence_link_uidx"
  ON "qep_quality_evidence_link" ("evidence_id", "target_kind", "target_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_quality_evidence_link_target_idx"
  ON "qep_quality_evidence_link" ("tenant_id", "target_kind", "target_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_exploratory_session_history" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "session_id" text NOT NULL,
  "event_type" varchar(64) NOT NULL,
  "detail" text,
  "payload" jsonb,
  "actor_id" text NOT NULL,
  "occurred_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_exploratory_session_history_idx"
  ON "qep_exploratory_session_history" ("tenant_id", "session_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_experience_plan_history" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "plan_id" text NOT NULL,
  "event_type" varchar(64) NOT NULL,
  "detail" text,
  "payload" jsonb,
  "actor_id" text NOT NULL,
  "occurred_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_experience_plan_history_idx"
  ON "qep_experience_plan_history" ("tenant_id", "plan_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_experience_activity_history" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "activity_id" text NOT NULL,
  "event_type" varchar(64) NOT NULL,
  "detail" text,
  "payload" jsonb,
  "actor_id" text NOT NULL,
  "occurred_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_experience_activity_history_idx"
  ON "qep_experience_activity_history" ("tenant_id", "activity_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qep_quality_trace_link" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "application_id" text NOT NULL,
  "from_kind" varchar(32) NOT NULL,
  "from_id" text NOT NULL,
  "to_kind" varchar(32) NOT NULL,
  "to_id" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "created_by" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "qep_quality_trace_link_uidx"
  ON "qep_quality_trace_link" ("from_kind", "from_id", "to_kind", "to_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qep_quality_trace_link_from_idx"
  ON "qep_quality_trace_link" ("tenant_id", "from_kind", "from_id");
