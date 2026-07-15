-- APZTCMS-015: RLS for external CI/CD integration tables

ALTER TABLE "testing_pipeline" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_pipeline" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_pipeline_tenant_isolation" ON "testing_pipeline"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_pipeline_import" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_pipeline_import" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_pipeline_import_tenant_isolation" ON "testing_pipeline_import"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_pipeline_run" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_pipeline_run" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_pipeline_run_tenant_isolation" ON "testing_pipeline_run"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_pipeline_import_history" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_pipeline_import_history" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_pipeline_import_history_tenant_isolation" ON "testing_pipeline_import_history"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
