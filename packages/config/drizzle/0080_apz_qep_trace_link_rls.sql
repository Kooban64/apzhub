-- APZQEP-ENG-030A Part 2: tenant isolation for Trace Links.
ALTER TABLE "qep_trace_link" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY qep_trace_link_tenant_isolation
    ON "qep_trace_link"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
ALTER TABLE "qep_trace_link_history" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY qep_trace_link_history_tenant_isolation
    ON "qep_trace_link_history"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
ALTER TABLE "qep_trace_link_taxonomy" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY qep_trace_link_taxonomy_tenant_isolation
    ON "qep_trace_link_taxonomy"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
