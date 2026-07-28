-- APZQEP-ENG-020D: tenant isolation for append-only requirement content history.
ALTER TABLE "qep_requirement_content_version" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY qep_requirement_content_version_tenant_isolation
    ON "qep_requirement_content_version"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
