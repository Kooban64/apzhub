-- RLS for W004 Operational Delivery tables.

ALTER TABLE platform_project_commitment ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_project_waiting ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_project_dependency ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_project_ops_decision ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_project_checkpoint ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_project_exception ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_project_operational_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY platform_project_commitment_tenant ON platform_project_commitment
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_project_waiting_tenant ON platform_project_waiting
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_project_dependency_tenant ON platform_project_dependency
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_project_ops_decision_tenant ON platform_project_ops_decision
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_project_checkpoint_tenant ON platform_project_checkpoint
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_project_exception_tenant ON platform_project_exception
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_project_ops_history_tenant ON platform_project_operational_history
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
