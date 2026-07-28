-- APZQEP-ENG-020F Part 2: tenant isolation for Requirements Relationships.
ALTER TABLE "qep_requirements_relationship" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY qep_requirements_relationship_tenant_isolation
    ON "qep_requirements_relationship"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
ALTER TABLE "qep_requirements_relationship_history" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY qep_requirements_relationship_history_tenant_isolation
    ON "qep_requirements_relationship_history"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
ALTER TABLE "qep_requirements_relationship_taxonomy" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY qep_requirements_relationship_taxonomy_tenant_isolation
    ON "qep_requirements_relationship_taxonomy"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
