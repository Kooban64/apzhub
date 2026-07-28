-- APZQEP-ENG-100D: RLS tenant isolation for Test Execution.
ALTER TABLE "qep_test_execution" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_test_execution_manifest" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_test_execution_step" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_test_execution_observation" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_test_execution_evidence_reference" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_test_execution_review" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_test_execution_external_submission" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_test_execution_history" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_test_execution_audit" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_test_execution_outbox" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS qep_test_execution_tenant_isolation ON "qep_test_execution";
--> statement-breakpoint
CREATE POLICY qep_test_execution_tenant_isolation
  ON "qep_test_execution"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
DROP POLICY IF EXISTS qep_test_execution_manifest_tenant_isolation ON "qep_test_execution_manifest";
--> statement-breakpoint
CREATE POLICY qep_test_execution_manifest_tenant_isolation
  ON "qep_test_execution_manifest"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
DROP POLICY IF EXISTS qep_test_execution_step_tenant_isolation ON "qep_test_execution_step";
--> statement-breakpoint
CREATE POLICY qep_test_execution_step_tenant_isolation
  ON "qep_test_execution_step"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
DROP POLICY IF EXISTS qep_test_execution_observation_tenant_isolation ON "qep_test_execution_observation";
--> statement-breakpoint
CREATE POLICY qep_test_execution_observation_tenant_isolation
  ON "qep_test_execution_observation"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
DROP POLICY IF EXISTS qep_test_execution_evidence_reference_tenant_isolation ON "qep_test_execution_evidence_reference";
--> statement-breakpoint
CREATE POLICY qep_test_execution_evidence_reference_tenant_isolation
  ON "qep_test_execution_evidence_reference"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
DROP POLICY IF EXISTS qep_test_execution_review_tenant_isolation ON "qep_test_execution_review";
--> statement-breakpoint
CREATE POLICY qep_test_execution_review_tenant_isolation
  ON "qep_test_execution_review"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
DROP POLICY IF EXISTS qep_test_execution_external_submission_tenant_isolation ON "qep_test_execution_external_submission";
--> statement-breakpoint
CREATE POLICY qep_test_execution_external_submission_tenant_isolation
  ON "qep_test_execution_external_submission"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
DROP POLICY IF EXISTS qep_test_execution_history_tenant_isolation ON "qep_test_execution_history";
--> statement-breakpoint
CREATE POLICY qep_test_execution_history_tenant_isolation
  ON "qep_test_execution_history"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
DROP POLICY IF EXISTS qep_test_execution_audit_tenant_isolation ON "qep_test_execution_audit";
--> statement-breakpoint
CREATE POLICY qep_test_execution_audit_tenant_isolation
  ON "qep_test_execution_audit"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
DROP POLICY IF EXISTS qep_test_execution_outbox_tenant_isolation ON "qep_test_execution_outbox";
--> statement-breakpoint
CREATE POLICY qep_test_execution_outbox_tenant_isolation
  ON "qep_test_execution_outbox"
  USING (tenant_id = current_setting('app.tenant_id', true));
