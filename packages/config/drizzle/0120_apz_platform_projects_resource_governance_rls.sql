ALTER TABLE platform_delivery_assignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_org_governance_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_operational_policy ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY platform_delivery_assignment_tenant_isolation ON platform_delivery_assignment
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_org_governance_profile_tenant_isolation ON platform_org_governance_profile
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_operational_policy_tenant_isolation ON platform_operational_policy
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
