-- APZTCMS-006: Manual execution & evidence domain engine schema expansions

ALTER TABLE "testing_manual_execution" DROP CONSTRAINT IF EXISTS "testing_manual_execution_status_chk";
--> statement-breakpoint
ALTER TABLE "testing_manual_execution" ADD CONSTRAINT "testing_manual_execution_status_chk" CHECK ("status" in (
  'draft','assigned','ready','in_progress','paused','blocked','completed',
  'under_review','approved','rejected','cancelled','archived',
  'planned','queued','aborted','failed'
));
--> statement-breakpoint
ALTER TABLE "testing_execution_session" DROP CONSTRAINT IF EXISTS "testing_execution_session_status_chk";
--> statement-breakpoint
ALTER TABLE "testing_execution_session" ADD CONSTRAINT "testing_execution_session_status_chk" CHECK ("status" in (
  'draft','assigned','ready','in_progress','paused','blocked','completed',
  'under_review','approved','rejected','cancelled','archived',
  'planned','queued','aborted','failed'
));
--> statement-breakpoint
ALTER TABLE "testing_manual_execution" ADD COLUMN IF NOT EXISTS "parameter_overrides" jsonb DEFAULT '{}'::jsonb;
--> statement-breakpoint
ALTER TABLE "testing_manual_execution" ADD COLUMN IF NOT EXISTS "block_reason" text;
--> statement-breakpoint
ALTER TABLE "testing_evidence" ADD COLUMN IF NOT EXISTS "lifecycle_status" varchar(32) DEFAULT 'pending' NOT NULL;
--> statement-breakpoint
ALTER TABLE "testing_evidence" ADD COLUMN IF NOT EXISTS "verification_state" varchar(64);
--> statement-breakpoint
ALTER TABLE "testing_evidence" ADD COLUMN IF NOT EXISTS "evidence_approval_state" varchar(64);
--> statement-breakpoint
ALTER TABLE "testing_evidence" ADD COLUMN IF NOT EXISTS "capture_time" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "testing_evidence" ADD COLUMN IF NOT EXISTS "author_user_id" text;
--> statement-breakpoint
ALTER TABLE "testing_evidence" DROP CONSTRAINT IF EXISTS "testing_evidence_lifecycle_chk";
--> statement-breakpoint
ALTER TABLE "testing_evidence" ADD CONSTRAINT "testing_evidence_lifecycle_chk" CHECK ("lifecycle_status" in (
  'pending','captured','submitted','verified','rejected','approved','archived'
));
--> statement-breakpoint
ALTER TABLE "testing_approval" ADD COLUMN IF NOT EXISTS "stages_json" jsonb;
--> statement-breakpoint
ALTER TABLE "testing_approval" ADD COLUMN IF NOT EXISTS "current_stage_ordinal" integer;
--> statement-breakpoint
ALTER TABLE "testing_approval" ADD COLUMN IF NOT EXISTS "stage_decisions_json" jsonb;
--> statement-breakpoint
ALTER TABLE "testing_manual_step_actual" ADD COLUMN IF NOT EXISTS "parent_step_id" text;
--> statement-breakpoint
ALTER TABLE "testing_manual_step_actual" ADD COLUMN IF NOT EXISTS "nest_level" integer;
--> statement-breakpoint
ALTER TABLE "testing_manual_step_actual" ADD COLUMN IF NOT EXISTS "repeat_index" integer;
--> statement-breakpoint
ALTER TABLE "testing_manual_step_actual" ADD COLUMN IF NOT EXISTS "parameters" jsonb;
--> statement-breakpoint
ALTER TABLE "testing_manual_step_actual" ADD COLUMN IF NOT EXISTS "attachment_ids" jsonb DEFAULT '[]'::jsonb;
--> statement-breakpoint
ALTER TABLE "testing_manual_step_actual" ADD COLUMN IF NOT EXISTS "expected_result" text;
--> statement-breakpoint
ALTER TABLE "testing_manual_step_actual" ADD COLUMN IF NOT EXISTS "ordinal" integer;
