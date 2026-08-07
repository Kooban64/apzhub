ALTER TABLE "platform_knowledge_object" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "platform_knowledge_object" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS platform_knowledge_object_tenant_isolation ON "platform_knowledge_object";
--> statement-breakpoint
CREATE POLICY platform_knowledge_object_tenant_isolation
  ON "platform_knowledge_object" AS PERMISSIVE FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));
