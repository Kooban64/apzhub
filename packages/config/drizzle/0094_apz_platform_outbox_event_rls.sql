-- APZQEP-120-S08: RLS for enterprise platform outbox.
ALTER TABLE "platform_outbox_event" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_outbox_event" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS platform_outbox_event_tenant_isolation
  ON "platform_outbox_event";
--> statement-breakpoint
CREATE POLICY platform_outbox_event_tenant_isolation
  ON "platform_outbox_event"
  AS PERMISSIVE
  FOR ALL
  TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));
