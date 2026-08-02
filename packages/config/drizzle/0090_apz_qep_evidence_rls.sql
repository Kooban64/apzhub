-- APZQEP-120-S05: RLS tenant isolation for Evidence Catalogue tables.
ALTER TABLE "qep_evidence" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_evidence_version" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_evidence_relationship" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_evidence_audit" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_evidence_collection" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_evidence_set" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_evidence_access_grant" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_evidence" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_evidence_version" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_evidence_relationship" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_evidence_audit" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_evidence_collection" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_evidence_set" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "qep_evidence_access_grant" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS qep_evidence_tenant_isolation ON "qep_evidence";
--> statement-breakpoint
CREATE POLICY qep_evidence_tenant_isolation
  ON "qep_evidence"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
DROP POLICY IF EXISTS qep_evidence_version_tenant_isolation ON "qep_evidence_version";
--> statement-breakpoint
CREATE POLICY qep_evidence_version_tenant_isolation
  ON "qep_evidence_version"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
DROP POLICY IF EXISTS qep_evidence_relationship_tenant_isolation ON "qep_evidence_relationship";
--> statement-breakpoint
CREATE POLICY qep_evidence_relationship_tenant_isolation
  ON "qep_evidence_relationship"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
DROP POLICY IF EXISTS qep_evidence_audit_tenant_isolation ON "qep_evidence_audit";
--> statement-breakpoint
CREATE POLICY qep_evidence_audit_tenant_isolation
  ON "qep_evidence_audit"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
DROP POLICY IF EXISTS qep_evidence_collection_tenant_isolation ON "qep_evidence_collection";
--> statement-breakpoint
CREATE POLICY qep_evidence_collection_tenant_isolation
  ON "qep_evidence_collection"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
DROP POLICY IF EXISTS qep_evidence_set_tenant_isolation ON "qep_evidence_set";
--> statement-breakpoint
CREATE POLICY qep_evidence_set_tenant_isolation
  ON "qep_evidence_set"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint
DROP POLICY IF EXISTS qep_evidence_access_grant_tenant_isolation ON "qep_evidence_access_grant";
--> statement-breakpoint
CREATE POLICY qep_evidence_access_grant_tenant_isolation
  ON "qep_evidence_access_grant"
  USING (tenant_id = current_setting('app.tenant_id', true));
