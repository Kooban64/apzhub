-- APZSEARCH-016: RLS for search publication journal

ALTER TABLE "platform_search_publication_journal" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_search_publication_journal_tenant_isolation
    ON "platform_search_publication_journal"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
