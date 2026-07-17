-- APZWORKFLOW-001: RLS for platform workflow metadata tables

ALTER TABLE "platform_workflow" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_workflow_version" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_workflow_template" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_workflow_category" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_workflow_folder" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_workflow_audit" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

DO $$ BEGIN
  CREATE POLICY platform_workflow_tenant_isolation ON "platform_workflow"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_workflow_version_tenant_isolation ON "platform_workflow_version"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_workflow_template_tenant_isolation ON "platform_workflow_template"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_workflow_category_tenant_isolation ON "platform_workflow_category"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_workflow_folder_tenant_isolation ON "platform_workflow_folder"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_workflow_audit_tenant_isolation ON "platform_workflow_audit"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
