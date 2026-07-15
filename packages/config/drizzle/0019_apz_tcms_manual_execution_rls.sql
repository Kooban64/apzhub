-- APZTCMS-004: RLS for new manual execution / case version tables

ALTER TABLE "testing_manual_execution" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_manual_execution" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_manual_execution_tenant_isolation" ON "testing_manual_execution"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_manual_step_actual" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_manual_step_actual" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_manual_step_actual_tenant_isolation" ON "testing_manual_step_actual"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_test_case_version" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_test_case_version" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_test_case_version_tenant_isolation" ON "testing_test_case_version"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
