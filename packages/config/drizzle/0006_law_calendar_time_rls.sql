ALTER TABLE "law_calendar_event" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_calendar_event" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_time_entry" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_time_entry" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "law_calendar_event_tenant_isolation" ON "law_calendar_event"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
CREATE POLICY "law_time_entry_tenant_isolation" ON "law_time_entry"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
