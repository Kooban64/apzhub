-- RLS for enterprise delivery team directory.

ALTER TABLE platform_enterprise_delivery_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_enterprise_team_membership ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY platform_enterprise_delivery_team_tenant_isolation
    ON platform_enterprise_delivery_team
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_enterprise_team_membership_tenant_isolation
    ON platform_enterprise_team_membership
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
