ALTER TABLE "platform_business_journey" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_business_journey" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS platform_business_journey_tenant_isolation ON "platform_business_journey";
--> statement-breakpoint
CREATE POLICY platform_business_journey_tenant_isolation
  ON "platform_business_journey" AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "platform_business_process_template" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_business_process_template" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS platform_business_process_template_tenant_isolation ON "platform_business_process_template";
--> statement-breakpoint
CREATE POLICY platform_business_process_template_tenant_isolation
  ON "platform_business_process_template" AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "platform_business_process_instance" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_business_process_instance" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS platform_business_process_instance_tenant_isolation ON "platform_business_process_instance";
--> statement-breakpoint
CREATE POLICY platform_business_process_instance_tenant_isolation
  ON "platform_business_process_instance" AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "platform_business_process_audit" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_business_process_audit" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS platform_business_process_audit_tenant_isolation ON "platform_business_process_audit";
--> statement-breakpoint
CREATE POLICY platform_business_process_audit_tenant_isolation
  ON "platform_business_process_audit" AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));
