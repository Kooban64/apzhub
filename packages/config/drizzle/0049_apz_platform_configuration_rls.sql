-- APZCONFIG-001: RLS for platform configuration metadata tables

ALTER TABLE "platform_configuration_namespace" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_configuration_group" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_configuration_key" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_configuration" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_configuration_audit" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

DO $$ BEGIN
  CREATE POLICY platform_configuration_namespace_tenant_isolation ON "platform_configuration_namespace"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_configuration_group_tenant_isolation ON "platform_configuration_group"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_configuration_key_tenant_isolation ON "platform_configuration_key"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_configuration_tenant_isolation ON "platform_configuration"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_configuration_audit_tenant_isolation ON "platform_configuration_audit"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
