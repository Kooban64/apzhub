-- APZQEP-120-S06: RLS for lifecycle history.
ALTER TABLE "qep_evidence_lifecycle_history" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_evidence_lifecycle_history" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS qep_evidence_lifecycle_history_tenant_isolation
  ON "qep_evidence_lifecycle_history";
--> statement-breakpoint
CREATE POLICY qep_evidence_lifecycle_history_tenant_isolation
  ON "qep_evidence_lifecycle_history"
  USING (tenant_id = current_setting('app.tenant_id', true));
