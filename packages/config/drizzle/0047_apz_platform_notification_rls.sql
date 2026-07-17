-- APZNOTIFY-001: RLS for platform notification metadata tables

ALTER TABLE "platform_notification" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_notification_recipient" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_notification_template" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_notification_category" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_notification_channel" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_notification_preference" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_notification_rule" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_notification_audit" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

DO $$ BEGIN
  CREATE POLICY platform_notification_tenant_isolation ON "platform_notification"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_notification_recipient_tenant_isolation ON "platform_notification_recipient"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_notification_template_tenant_isolation ON "platform_notification_template"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_notification_category_tenant_isolation ON "platform_notification_category"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_notification_channel_tenant_isolation ON "platform_notification_channel"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_notification_preference_tenant_isolation ON "platform_notification_preference"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_notification_rule_tenant_isolation ON "platform_notification_rule"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE POLICY platform_notification_audit_tenant_isolation ON "platform_notification_audit"
    USING (tenant_id = current_setting('app.tenant_id', true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
