-- APZTCMS-005: RLS for plan/suite version + approval history tables

ALTER TABLE "testing_test_plan_version" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_test_plan_version" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_test_plan_version_tenant_isolation" ON "testing_test_plan_version"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_test_suite_version" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_test_suite_version" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_test_suite_version_tenant_isolation" ON "testing_test_suite_version"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_approval_history" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_approval_history" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_approval_history_tenant_isolation" ON "testing_approval_history"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
