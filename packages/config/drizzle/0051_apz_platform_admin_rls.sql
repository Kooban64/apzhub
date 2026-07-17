-- APZADMIN-001: RLS for platform administration metadata tables

ALTER TABLE "platform_admin_module" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_admin_category" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_admin_section" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_admin_action" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_admin_permission" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_admin_audit" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_admin_diagnostic" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_admin_registration" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_admin_policy" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_admin_capability" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_admin_navigation" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_admin_shortcut" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_admin_dashboard" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

DO $$ BEGIN
  CREATE POLICY platform_admin_module_tenant_isolation ON "platform_admin_module"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_admin_category_tenant_isolation ON "platform_admin_category"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_admin_section_tenant_isolation ON "platform_admin_section"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_admin_action_tenant_isolation ON "platform_admin_action"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_admin_permission_tenant_isolation ON "platform_admin_permission"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_admin_audit_tenant_isolation ON "platform_admin_audit"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_admin_diagnostic_tenant_isolation ON "platform_admin_diagnostic"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_admin_registration_tenant_isolation ON "platform_admin_registration"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_admin_policy_tenant_isolation ON "platform_admin_policy"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_admin_capability_tenant_isolation ON "platform_admin_capability"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_admin_navigation_tenant_isolation ON "platform_admin_navigation"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_admin_shortcut_tenant_isolation ON "platform_admin_shortcut"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_admin_dashboard_tenant_isolation ON "platform_admin_dashboard"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
