-- APZQEP-ENG-020B: RLS for QEP Requirements metadata tables

ALTER TABLE "qep_requirement" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY qep_requirement_tenant_isolation ON "qep_requirement"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint

ALTER TABLE "qep_requirement_audit" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY qep_requirement_audit_tenant_isolation ON "qep_requirement_audit"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
