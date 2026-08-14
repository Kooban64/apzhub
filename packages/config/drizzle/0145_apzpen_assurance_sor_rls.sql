-- APZPEN assurance SoR RLS (SPR-APZPEN-014).

ALTER TABLE "apzpen_engagement" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "apzpen_finding" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "apzpen_certification_ledger" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "apzpen_graph_node" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "apzpen_graph_edge" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "apzpen_evidence_object" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY apzpen_engagement_tenant_isolation ON "apzpen_engagement"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY apzpen_finding_tenant_isolation ON "apzpen_finding"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY apzpen_cert_ledger_tenant_isolation ON "apzpen_certification_ledger"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY apzpen_graph_node_tenant_isolation ON "apzpen_graph_node"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY apzpen_graph_edge_tenant_isolation ON "apzpen_graph_edge"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY apzpen_evidence_object_tenant_isolation ON "apzpen_evidence_object"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
