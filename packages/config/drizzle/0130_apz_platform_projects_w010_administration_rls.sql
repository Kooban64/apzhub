ALTER TABLE platform_projects_delegation ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_projects_retention_policy ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_projects_legal_hold ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_projects_governed_search ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_projects_operational_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_projects_admin_audit ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY platform_projects_delegation_tenant_isolation
    ON platform_projects_delegation
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_projects_retention_policy_tenant_isolation
    ON platform_projects_retention_policy
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_projects_legal_hold_tenant_isolation
    ON platform_projects_legal_hold
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_projects_governed_search_tenant_isolation
    ON platform_projects_governed_search
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_projects_operational_role_tenant_isolation
    ON platform_projects_operational_role
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_projects_admin_audit_tenant_isolation
    ON platform_projects_admin_audit
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
