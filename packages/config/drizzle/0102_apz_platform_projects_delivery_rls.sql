ALTER TABLE "platform_project_milestone" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_project_milestone" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS platform_project_milestone_tenant_isolation ON "platform_project_milestone";
--> statement-breakpoint
CREATE POLICY platform_project_milestone_tenant_isolation
  ON "platform_project_milestone" AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "platform_project_risk" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_project_risk" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS platform_project_risk_tenant_isolation ON "platform_project_risk";
--> statement-breakpoint
CREATE POLICY platform_project_risk_tenant_isolation
  ON "platform_project_risk" AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "platform_project_decision" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_project_decision" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS platform_project_decision_tenant_isolation ON "platform_project_decision";
--> statement-breakpoint
CREATE POLICY platform_project_decision_tenant_isolation
  ON "platform_project_decision" AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "platform_project_action" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_project_action" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS platform_project_action_tenant_isolation ON "platform_project_action";
--> statement-breakpoint
CREATE POLICY platform_project_action_tenant_isolation
  ON "platform_project_action" AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));
