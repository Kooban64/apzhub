ALTER TABLE platform_project_conversation ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_project_conversation_message ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_project_meeting_outcome ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_project_notice ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_project_announcement ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY platform_project_conversation_tenant_isolation
    ON platform_project_conversation
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_project_conversation_message_tenant_isolation
    ON platform_project_conversation_message
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_project_meeting_outcome_tenant_isolation
    ON platform_project_meeting_outcome
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_project_notice_tenant_isolation
    ON platform_project_notice
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY platform_project_announcement_tenant_isolation
    ON platform_project_announcement
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
