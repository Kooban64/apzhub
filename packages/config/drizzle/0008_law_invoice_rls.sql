ALTER TABLE "law_invoice" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_invoice" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_invoice_line_item" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_invoice_line_item" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "law_invoice_tenant_isolation" ON "law_invoice"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
CREATE POLICY "law_invoice_line_item_tenant_isolation" ON "law_invoice_line_item"
AS PERMISSIVE FOR ALL TO PUBLIC
USING ("tenant_id" = current_setting('app.tenant_id', true))
WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
