-- W004 Milestone Engine — extend Wave A milestone table.

ALTER TABLE platform_project_milestone
  ADD COLUMN IF NOT EXISTS owner_user_id text;
--> statement-breakpoint
ALTER TABLE platform_project_milestone
  ADD COLUMN IF NOT EXISTS confidence text NOT NULL DEFAULT 'medium';
--> statement-breakpoint
ALTER TABLE platform_project_milestone
  ADD COLUMN IF NOT EXISTS failure_consequence text;
--> statement-breakpoint
ALTER TABLE platform_project_milestone
  ADD COLUMN IF NOT EXISTS exit_criteria text;
--> statement-breakpoint
ALTER TABLE platform_project_milestone
  ADD COLUMN IF NOT EXISTS baseline_due_at timestamptz;
--> statement-breakpoint
ALTER TABLE platform_project_milestone
  ADD COLUMN IF NOT EXISTS sort_key integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE platform_project_milestone
  ADD COLUMN IF NOT EXISTS achievement_evidence jsonb NOT NULL DEFAULT '[]'::jsonb;
--> statement-breakpoint
ALTER TABLE platform_project_milestone
  ADD COLUMN IF NOT EXISTS variance_days integer;
--> statement-breakpoint
-- Migrate legacy statuses toward W004 canonical values.
UPDATE platform_project_milestone SET status = 'planned' WHERE status = 'open';
--> statement-breakpoint
UPDATE platform_project_milestone SET status = 'achieved' WHERE status = 'completed';
--> statement-breakpoint
UPDATE platform_project_milestone SET status = 'slipped' WHERE status = 'missed';
