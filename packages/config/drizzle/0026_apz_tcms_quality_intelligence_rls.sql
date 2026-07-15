-- APZTCMS-008: RLS for quality intelligence tables

ALTER TABLE "testing_defect_link" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_defect_link" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_defect_link_tenant_isolation" ON "testing_defect_link"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_quality_snapshot" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_quality_snapshot" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_quality_snapshot_tenant_isolation" ON "testing_quality_snapshot"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_regression_analysis" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_regression_analysis" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_regression_analysis_tenant_isolation" ON "testing_regression_analysis"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
