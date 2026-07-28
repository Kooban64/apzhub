-- APZQEP-ENG-020C: RLS for QEP requirement lifecycle history

ALTER TABLE "qep_requirement_lifecycle_history" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY qep_requirement_lifecycle_history_tenant_isolation
    ON "qep_requirement_lifecycle_history"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
