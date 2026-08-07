ALTER TABLE "platform_operational_friction" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_operational_friction" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS platform_operational_friction_tenant_isolation
  ON "platform_operational_friction";
--> statement-breakpoint
CREATE POLICY platform_operational_friction_tenant_isolation
  ON "platform_operational_friction"
  AS PERMISSIVE
  FOR ALL
  TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "platform_operational_friction_audit" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_operational_friction_audit" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS platform_operational_friction_audit_tenant_isolation
  ON "platform_operational_friction_audit";
--> statement-breakpoint
CREATE POLICY platform_operational_friction_audit_tenant_isolation
  ON "platform_operational_friction_audit"
  AS PERMISSIVE
  FOR ALL
  TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));
