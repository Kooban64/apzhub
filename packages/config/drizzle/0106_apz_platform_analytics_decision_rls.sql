ALTER TABLE "platform_analytics_decision_pack" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_analytics_decision_pack" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS platform_analytics_decision_pack_tenant_isolation ON "platform_analytics_decision_pack";
--> statement-breakpoint
CREATE POLICY platform_analytics_decision_pack_tenant_isolation
  ON "platform_analytics_decision_pack" AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "platform_analytics_trend_point" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_analytics_trend_point" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS platform_analytics_trend_point_tenant_isolation ON "platform_analytics_trend_point";
--> statement-breakpoint
CREATE POLICY platform_analytics_trend_point_tenant_isolation
  ON "platform_analytics_trend_point" AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "platform_analytics_decision_kpi" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_analytics_decision_kpi" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS platform_analytics_decision_kpi_tenant_isolation ON "platform_analytics_decision_kpi";
--> statement-breakpoint
CREATE POLICY platform_analytics_decision_kpi_tenant_isolation
  ON "platform_analytics_decision_kpi" AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "platform_analytics_decision_timeline" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_analytics_decision_timeline" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS platform_analytics_decision_timeline_tenant_isolation ON "platform_analytics_decision_timeline";
--> statement-breakpoint
CREATE POLICY platform_analytics_decision_timeline_tenant_isolation
  ON "platform_analytics_decision_timeline" AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));
