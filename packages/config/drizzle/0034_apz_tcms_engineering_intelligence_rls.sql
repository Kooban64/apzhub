-- APZTCMS-021: RLS for engineering intelligence tables

ALTER TABLE "testing_engineering_snapshot" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_engineering_snapshot" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_engineering_snapshot_tenant_isolation" ON "testing_engineering_snapshot"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_engineering_historical_snapshot" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_engineering_historical_snapshot" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_engineering_historical_snapshot_tenant_isolation" ON "testing_engineering_historical_snapshot"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_engineering_trend_series" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_engineering_trend_series" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_engineering_trend_series_tenant_isolation" ON "testing_engineering_trend_series"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_engineering_benchmark" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_engineering_benchmark" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_engineering_benchmark_tenant_isolation" ON "testing_engineering_benchmark"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_engineering_baseline" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_engineering_baseline" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_engineering_baseline_tenant_isolation" ON "testing_engineering_baseline"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_engineering_quality_summary" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_engineering_quality_summary" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_engineering_quality_summary_tenant_isolation" ON "testing_engineering_quality_summary"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
