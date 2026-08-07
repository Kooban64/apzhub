ALTER TABLE platform_projects_saved_search ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_projects_bulk_operation ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_projects_productivity_session ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY platform_projects_saved_search_tenant_isolation
    ON platform_projects_saved_search
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_projects_bulk_operation_tenant_isolation
    ON platform_projects_bulk_operation
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_projects_productivity_session_tenant_isolation
    ON platform_projects_productivity_session
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
