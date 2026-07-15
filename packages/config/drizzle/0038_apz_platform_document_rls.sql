-- APZDOCS-001: RLS for platform document metadata tables

ALTER TABLE "platform_document" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_document_metadata" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_document_tag" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_document_category" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_document_relationship" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_document_retention" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_document_audit" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

DO $$ BEGIN
  CREATE POLICY platform_document_tenant_isolation ON "platform_document"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_document_metadata_tenant_isolation ON "platform_document_metadata"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_document_tag_tenant_isolation ON "platform_document_tag"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_document_category_tenant_isolation ON "platform_document_category"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_document_relationship_tenant_isolation ON "platform_document_relationship"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_document_retention_tenant_isolation ON "platform_document_retention"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_document_audit_tenant_isolation ON "platform_document_audit"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
