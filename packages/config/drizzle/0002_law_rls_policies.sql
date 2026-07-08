ALTER TABLE "law_client" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_client" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_matter" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_matter" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_outbox_event" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_outbox_event" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "law_client_tenant_isolation" ON "law_client"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
CREATE POLICY "law_matter_tenant_isolation" ON "law_matter"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
CREATE POLICY "law_outbox_event_tenant_isolation" ON "law_outbox_event"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
