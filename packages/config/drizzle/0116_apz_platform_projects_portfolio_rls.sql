-- RLS for portfolio hierarchy tables (tenant isolation).

ALTER TABLE platform_portfolio_enterprise ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_strategic_initiative ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_programme ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_strategic_objective ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY platform_portfolio_enterprise_tenant_isolation ON platform_portfolio_enterprise
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_strategic_initiative_tenant_isolation ON platform_strategic_initiative
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_programme_tenant_isolation ON platform_programme
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_strategic_objective_tenant_isolation ON platform_strategic_objective
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
