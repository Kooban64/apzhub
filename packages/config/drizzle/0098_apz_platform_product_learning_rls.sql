-- APZHUB-CONTEXT-LEARNING-001 — tenant isolation for product-learning events.
ALTER TABLE "platform_product_learning_event" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_product_learning_event" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS platform_product_learning_event_tenant_isolation
  ON "platform_product_learning_event";
--> statement-breakpoint
CREATE POLICY platform_product_learning_event_tenant_isolation
  ON "platform_product_learning_event"
  AS PERMISSIVE
  FOR ALL
  TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));
