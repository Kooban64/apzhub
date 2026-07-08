ALTER TABLE "law_document" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_document" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_task" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_task" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "law_document_tenant_isolation" ON "law_document"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
CREATE POLICY "law_task_tenant_isolation" ON "law_task"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
