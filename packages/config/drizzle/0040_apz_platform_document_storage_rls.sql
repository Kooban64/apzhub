-- APZDOCS-002: RLS for document version + storage object tables

ALTER TABLE "platform_document_version" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_document_storage_object" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

DO $$ BEGIN
  CREATE POLICY platform_document_version_tenant_isolation ON "platform_document_version"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_document_storage_object_tenant_isolation ON "platform_document_storage_object"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
