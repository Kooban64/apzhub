-- APZTCMS-009: RLS for certification engine tables

ALTER TABLE "testing_certification_gate_definition" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_certification_gate_definition" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_certification_gate_definition_tenant_isolation"
ON "testing_certification_gate_definition"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_certification_gate_evaluation" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_certification_gate_evaluation" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_certification_gate_evaluation_tenant_isolation"
ON "testing_certification_gate_evaluation"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_certification_rule" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_certification_rule" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_certification_rule_tenant_isolation"
ON "testing_certification_rule"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_certification_audit" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_certification_audit" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_certification_audit_tenant_isolation"
ON "testing_certification_audit"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_certification_history" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_certification_history" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_certification_history_tenant_isolation"
ON "testing_certification_history"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
