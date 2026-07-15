-- APZTCMS-003: Tenant RLS for APZ TCMS tables (app.tenant_id session GUC)

ALTER TABLE "testing_requirement" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_requirement" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_requirement_tenant_isolation" ON "testing_requirement"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_work_item" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_work_item" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_work_item_tenant_isolation" ON "testing_work_item"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_risk" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_risk" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_risk_tenant_isolation" ON "testing_risk"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_test_plan" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_test_plan" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_test_plan_tenant_isolation" ON "testing_test_plan"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_test_suite" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_test_suite" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_test_suite_tenant_isolation" ON "testing_test_suite"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_test_case" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_test_case" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_test_case_tenant_isolation" ON "testing_test_case"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_test_step" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_test_step" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_test_step_tenant_isolation" ON "testing_test_step"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_plan_suite" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_plan_suite" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_plan_suite_tenant_isolation" ON "testing_plan_suite"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_suite_case" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_suite_case" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_suite_case_tenant_isolation" ON "testing_suite_case"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_case_requirement" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_case_requirement" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_case_requirement_tenant_isolation" ON "testing_case_requirement"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_plan_requirement" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_plan_requirement" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_plan_requirement_tenant_isolation" ON "testing_plan_requirement"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_risk_requirement" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_risk_requirement" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_risk_requirement_tenant_isolation" ON "testing_risk_requirement"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_plan_risk" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_plan_risk" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_plan_risk_tenant_isolation" ON "testing_plan_risk"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_regression_set" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_regression_set" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_regression_set_tenant_isolation" ON "testing_regression_set"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_execution_session" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_execution_session" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_execution_session_tenant_isolation" ON "testing_execution_session"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_execution_history" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_execution_history" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_execution_history_tenant_isolation" ON "testing_execution_history"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_evidence" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_evidence" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_evidence_tenant_isolation" ON "testing_evidence"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_approval" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_approval" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_approval_tenant_isolation" ON "testing_approval"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_certification_record" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_certification_record" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_certification_record_tenant_isolation" ON "testing_certification_record"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_release_readiness" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_release_readiness" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_release_readiness_tenant_isolation" ON "testing_release_readiness"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_coverage_record" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_coverage_record" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_coverage_record_tenant_isolation" ON "testing_coverage_record"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_automation_definition" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_automation_definition" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_automation_definition_tenant_isolation" ON "testing_automation_definition"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_traceability_link" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_traceability_link" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_traceability_link_tenant_isolation" ON "testing_traceability_link"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_audit_record" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_audit_record" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_audit_record_tenant_isolation" ON "testing_audit_record"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_configuration" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_configuration" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_configuration_tenant_isolation" ON "testing_configuration"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
ALTER TABLE "testing_registry_entry" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_registry_entry" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_registry_entry_tenant_isolation" ON "testing_registry_entry"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
