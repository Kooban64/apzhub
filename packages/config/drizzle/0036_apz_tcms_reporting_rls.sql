-- APZTCMS-024: RLS for reporting tables

ALTER TABLE "testing_report_template" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_report_template" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_report_template_tenant_isolation" ON "testing_report_template"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_report_generation_metadata" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_report_generation_metadata" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_report_generation_metadata_tenant_isolation" ON "testing_report_generation_metadata"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
