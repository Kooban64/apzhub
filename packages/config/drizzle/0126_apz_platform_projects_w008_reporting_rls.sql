ALTER TABLE platform_operational_review ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_review_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_review_pack_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_review_executive_summary ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY platform_operational_review_tenant_isolation
    ON platform_operational_review
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_review_schedule_tenant_isolation
    ON platform_review_schedule
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_review_pack_snapshot_tenant_isolation
    ON platform_review_pack_snapshot
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_review_executive_summary_tenant_isolation
    ON platform_review_executive_summary
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
