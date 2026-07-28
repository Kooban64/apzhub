-- APZHUB-ENG-0002 / R12-PERSIST-02: RLS for Law session SoR tables

ALTER TABLE "platform_law_activity_session" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_law_activity_session_tenant_isolation
    ON "platform_law_activity_session"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
ALTER TABLE "platform_law_notification_session" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_law_notification_session_tenant_isolation
    ON "platform_law_notification_session"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
