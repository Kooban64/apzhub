-- APZTCMS-007: RLS for automation result ingestion tables

ALTER TABLE "testing_automation_import" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_automation_import" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_automation_import_tenant_isolation" ON "testing_automation_import"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_automated_execution" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_automated_execution" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_automated_execution_tenant_isolation" ON "testing_automated_execution"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_automation_run" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_automation_run" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_automation_run_tenant_isolation" ON "testing_automation_run"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_automation_result_item" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_automation_result_item" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_automation_result_item_tenant_isolation" ON "testing_automation_result_item"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_automation_import_history" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_automation_import_history" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_automation_import_history_tenant_isolation" ON "testing_automation_import_history"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_automation_coverage_snapshot" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_automation_coverage_snapshot" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_automation_coverage_snapshot_tenant_isolation" ON "testing_automation_coverage_snapshot"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
