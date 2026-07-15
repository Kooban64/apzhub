-- APZTCMS-014: RLS for TCMS Release & Quality Governance tables

ALTER TABLE "testing_release" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_release" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_release_tenant_isolation"
ON "testing_release"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_release_scope" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_release_scope" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_release_scope_tenant_isolation"
ON "testing_release_scope"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_release_package" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_release_package" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_release_package_tenant_isolation"
ON "testing_release_package"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_release_candidate" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_release_candidate" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_release_candidate_tenant_isolation"
ON "testing_release_candidate"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_release_approval" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_release_approval" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_release_approval_tenant_isolation"
ON "testing_release_approval"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_release_decision" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_release_decision" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_release_decision_tenant_isolation"
ON "testing_release_decision"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_release_evidence" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_release_evidence" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_release_evidence_tenant_isolation"
ON "testing_release_evidence"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_release_dependency" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_release_dependency" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_release_dependency_tenant_isolation"
ON "testing_release_dependency"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_release_note" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_release_note" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_release_note_tenant_isolation"
ON "testing_release_note"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_release_risk_assessment" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_release_risk_assessment" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_release_risk_assessment_tenant_isolation"
ON "testing_release_risk_assessment"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_release_readiness_snapshot" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_release_readiness_snapshot" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_release_readiness_snapshot_tenant_isolation"
ON "testing_release_readiness_snapshot"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_release_summary_snapshot" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_release_summary_snapshot" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_release_summary_snapshot_tenant_isolation"
ON "testing_release_summary_snapshot"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "testing_release_audit_entry" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "testing_release_audit_entry" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "testing_release_audit_entry_tenant_isolation"
ON "testing_release_audit_entry"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
