-- OSS-110-05: Persistent Entity Mapping Store
-- Platform metadata only — APZHUB global ID ↔ provider-native ID bindings.

CREATE TABLE IF NOT EXISTS "platform_entity_mapping" (
  "platform_id" text PRIMARY KEY NOT NULL,
  "entity_type" text NOT NULL,
  "provider_id" text NOT NULL,
  "integration_id" text NOT NULL,
  "provider_native_id" text NOT NULL,
  "parent_platform_id" text,
  "parent_provider_native_id" text,
  "tenant_id" text NOT NULL,
  "organisation_id" text,
  "status" text DEFAULT 'active' NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "platform_entity_mapping_entity_type_chk" CHECK (
    "entity_type" IN (
      'workspace', 'project', 'task', 'sprint', 'milestone', 'label',
      'status', 'module', 'member', 'team', 'user'
    )
  ),
  CONSTRAINT "platform_entity_mapping_status_chk" CHECK (
    "status" IN ('active', 'inactive', 'pending', 'orphaned')
  ),
  CONSTRAINT "platform_entity_mapping_revision_chk" CHECK ("revision" >= 1)
);

-- Uniqueness: one active/pending binding per provider-native identity within tenant + entity type.
CREATE UNIQUE INDEX IF NOT EXISTS "platform_entity_mapping_provider_native_active_uidx"
  ON "platform_entity_mapping" ("tenant_id", "entity_type", "provider_id", "provider_native_id")
  WHERE "status" IN ('active', 'pending');

CREATE INDEX IF NOT EXISTS "platform_entity_mapping_tenant_idx"
  ON "platform_entity_mapping" ("tenant_id");

CREATE INDEX IF NOT EXISTS "platform_entity_mapping_tenant_org_idx"
  ON "platform_entity_mapping" ("tenant_id", "organisation_id");

CREATE INDEX IF NOT EXISTS "platform_entity_mapping_provider_idx"
  ON "platform_entity_mapping" ("provider_id");

CREATE INDEX IF NOT EXISTS "platform_entity_mapping_integration_idx"
  ON "platform_entity_mapping" ("integration_id");

CREATE INDEX IF NOT EXISTS "platform_entity_mapping_entity_type_idx"
  ON "platform_entity_mapping" ("entity_type");

CREATE INDEX IF NOT EXISTS "platform_entity_mapping_status_idx"
  ON "platform_entity_mapping" ("status");

CREATE INDEX IF NOT EXISTS "platform_entity_mapping_parent_platform_idx"
  ON "platform_entity_mapping" ("parent_platform_id");

CREATE INDEX IF NOT EXISTS "platform_entity_mapping_tenant_status_idx"
  ON "platform_entity_mapping" ("tenant_id", "status");
