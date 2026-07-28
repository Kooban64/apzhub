-- APZQEP-ENG-020E Part 2: tenant isolation for requirement baselines.
ALTER TABLE "qep_requirement_baseline" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY qep_requirement_baseline_tenant_isolation
    ON "qep_requirement_baseline"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
ALTER TABLE "qep_requirement_baseline_item" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY qep_requirement_baseline_item_tenant_isolation
    ON "qep_requirement_baseline_item"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
