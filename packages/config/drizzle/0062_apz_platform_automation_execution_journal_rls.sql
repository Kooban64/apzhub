-- APZHUB-ENG-0001 / R12-PERSIST-01: RLS for automation execution journal

ALTER TABLE "platform_automation_execution_journal" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_automation_execution_journal_tenant_isolation
    ON "platform_automation_execution_journal"
    USING (
      tenant_id IS NULL
      OR tenant_id = current_setting('app.tenant_id', true)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
