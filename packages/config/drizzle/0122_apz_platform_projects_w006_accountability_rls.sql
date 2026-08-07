ALTER TABLE platform_delivery_assignment_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_responsibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_continuity_case ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_stakeholder ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_external_participant ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY platform_delivery_assignment_event_tenant_isolation
    ON platform_delivery_assignment_event
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_responsibility_tenant_isolation ON platform_responsibility
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_continuity_case_tenant_isolation ON platform_continuity_case
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_stakeholder_tenant_isolation ON platform_stakeholder
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_external_participant_tenant_isolation
    ON platform_external_participant
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
