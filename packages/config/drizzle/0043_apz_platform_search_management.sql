-- APZSEARCH-003: Search management-plane columns (no engine indexes)

ALTER TABLE "platform_search_provider"
  ADD COLUMN IF NOT EXISTS "ownership" varchar(32) DEFAULT 'tenant' NOT NULL;
--> statement-breakpoint

ALTER TABLE "platform_search_configuration"
  ADD COLUMN IF NOT EXISTS "label" text;
--> statement-breakpoint
ALTER TABLE "platform_search_configuration"
  ADD COLUMN IF NOT EXISTS "status" varchar(32) DEFAULT 'active' NOT NULL;
--> statement-breakpoint

DROP INDEX IF EXISTS "platform_search_configuration_tenant_uidx";
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_configuration_tenant_idx"
  ON "platform_search_configuration" ("tenant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_configuration_tenant_status_idx"
  ON "platform_search_configuration" ("tenant_id", "status");
--> statement-breakpoint

ALTER TABLE "platform_search_collection"
  ADD COLUMN IF NOT EXISTS "enabled" boolean DEFAULT true NOT NULL;
--> statement-breakpoint

ALTER TABLE "platform_search_source"
  ADD COLUMN IF NOT EXISTS "enabled" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "platform_search_source"
  ADD COLUMN IF NOT EXISTS "provider_id" text;
--> statement-breakpoint
ALTER TABLE "platform_search_source"
  ADD COLUMN IF NOT EXISTS "collection_id" text;
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "platform_search_source_tenant_provider_idx"
  ON "platform_search_source" ("tenant_id", "provider_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_search_source_tenant_collection_idx"
  ON "platform_search_source" ("tenant_id", "collection_id");
