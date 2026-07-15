-- APZSEARCH-002: RLS for platform search metadata tables

ALTER TABLE "platform_search_provider" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_search_provider_registration" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_search_provider_status" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_search_configuration" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_search_configuration_version" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_search_profile" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_search_collection" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_search_source" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_search_scope" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_search_metadata" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_search_session" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_search_audit" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_search_diagnostics" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_search_health" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_search_statistics" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_search_capabilities" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

DO $$ BEGIN
  CREATE POLICY platform_search_provider_tenant_isolation ON "platform_search_provider"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_search_provider_registration_tenant_isolation ON "platform_search_provider_registration"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_search_provider_status_tenant_isolation ON "platform_search_provider_status"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_search_configuration_tenant_isolation ON "platform_search_configuration"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_search_configuration_version_tenant_isolation ON "platform_search_configuration_version"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_search_profile_tenant_isolation ON "platform_search_profile"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_search_collection_tenant_isolation ON "platform_search_collection"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_search_source_tenant_isolation ON "platform_search_source"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_search_scope_tenant_isolation ON "platform_search_scope"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_search_metadata_tenant_isolation ON "platform_search_metadata"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_search_session_tenant_isolation ON "platform_search_session"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_search_audit_tenant_isolation ON "platform_search_audit"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_search_diagnostics_tenant_isolation ON "platform_search_diagnostics"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_search_health_tenant_isolation ON "platform_search_health"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_search_statistics_tenant_isolation ON "platform_search_statistics"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_search_capabilities_tenant_isolation ON "platform_search_capabilities"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
