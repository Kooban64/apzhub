-- APZQEP-ENG-060B: RLS tenant isolation for Test Plans.
ALTER TABLE "qep_test_plans" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_test_plan_items" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_test_plan_approvals" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_test_plan_revisions" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_test_plan_history" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS qep_test_plans_tenant_isolation ON "qep_test_plans";
--> statement-breakpoint
CREATE POLICY qep_test_plans_tenant_isolation
  ON "qep_test_plans"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
DROP POLICY IF EXISTS qep_test_plan_items_tenant_isolation ON "qep_test_plan_items";
--> statement-breakpoint
CREATE POLICY qep_test_plan_items_tenant_isolation
  ON "qep_test_plan_items"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
DROP POLICY IF EXISTS qep_test_plan_approvals_tenant_isolation ON "qep_test_plan_approvals";
--> statement-breakpoint
CREATE POLICY qep_test_plan_approvals_tenant_isolation
  ON "qep_test_plan_approvals"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
DROP POLICY IF EXISTS qep_test_plan_revisions_tenant_isolation ON "qep_test_plan_revisions";
--> statement-breakpoint
CREATE POLICY qep_test_plan_revisions_tenant_isolation
  ON "qep_test_plan_revisions"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
DROP POLICY IF EXISTS qep_test_plan_history_tenant_isolation ON "qep_test_plan_history";
--> statement-breakpoint
CREATE POLICY qep_test_plan_history_tenant_isolation
  ON "qep_test_plan_history"
  USING (tenant_id = current_setting('app.tenant_id', true));
