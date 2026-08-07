-- RLS for project lifecycle tables (tenant isolation).

ALTER TABLE platform_project_lifecycle ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_project_baseline ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_project_lifecycle_transition ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_project_lifecycle_waiver ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY platform_project_lifecycle_tenant_isolation ON platform_project_lifecycle
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_project_baseline_tenant_isolation ON platform_project_baseline
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_project_lifecycle_transition_tenant_isolation ON platform_project_lifecycle_transition
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_project_lifecycle_waiver_tenant_isolation ON platform_project_lifecycle_waiver
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
