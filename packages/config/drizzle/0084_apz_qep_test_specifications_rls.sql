-- APZQEP-ENG-050B: RLS tenant isolation for Test Specifications.
ALTER TABLE "qep_test_specifications" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_test_specification_versions" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_test_specification_relationships" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_test_specification_history" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS qep_test_specifications_tenant_isolation ON "qep_test_specifications";
--> statement-breakpoint
CREATE POLICY qep_test_specifications_tenant_isolation
  ON "qep_test_specifications"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
DROP POLICY IF EXISTS qep_test_specification_versions_tenant_isolation ON "qep_test_specification_versions";
--> statement-breakpoint
CREATE POLICY qep_test_specification_versions_tenant_isolation
  ON "qep_test_specification_versions"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
DROP POLICY IF EXISTS qep_test_specification_relationships_tenant_isolation ON "qep_test_specification_relationships";
--> statement-breakpoint
CREATE POLICY qep_test_specification_relationships_tenant_isolation
  ON "qep_test_specification_relationships"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
DROP POLICY IF EXISTS qep_test_specification_history_tenant_isolation ON "qep_test_specification_history";
--> statement-breakpoint
CREATE POLICY qep_test_specification_history_tenant_isolation
  ON "qep_test_specification_history"
  USING (tenant_id = current_setting('app.tenant_id', true));
