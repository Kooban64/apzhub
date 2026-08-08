import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Platform entity mapping — APZHUB global ID ↔ provider-native ID (OSS-110-05).
 * Platform metadata only; never stores engine business payloads (011).
 */
export const platformEntityMapping = pgTable(
  "platform_entity_mapping",
  {
    platformId: text("platform_id").primaryKey(),
    entityType: text("entity_type").notNull(),
    providerId: text("provider_id").notNull(),
    integrationId: text("integration_id").notNull(),
    providerNativeId: text("provider_native_id").notNull(),
    parentPlatformId: text("parent_platform_id"),
    parentProviderNativeId: text("parent_provider_native_id"),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    status: text("status").notNull().default("active"),
    metadata: jsonb("metadata").$type<Record<string, string>>().notNull().default({}),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      "platform_entity_mapping_entity_type_chk",
      sql`${table.entityType} in (
        'workspace','project','task','sprint','milestone','label',
        'status','module','member','team','user',
        'support_request','support_organization','support_group',
        'support_user','support_article'
      )`,
    ),
    check(
      "platform_entity_mapping_status_chk",
      sql`${table.status} in ('active','inactive','pending','orphaned')`,
    ),
    check("platform_entity_mapping_revision_chk", sql`${table.revision} >= 1`),
    /**
     * Uniqueness boundary (active/pending only):
     * (tenant_id, entity_type, provider_id, provider_native_id)
     * Inactive/orphaned rows may reuse the same provider-native identity after rebind.
     */
    uniqueIndex("platform_entity_mapping_provider_native_active_uidx")
      .on(table.tenantId, table.entityType, table.providerId, table.providerNativeId)
      .where(sql`${table.status} in ('active', 'pending')`),
    index("platform_entity_mapping_tenant_idx").on(table.tenantId),
    index("platform_entity_mapping_tenant_org_idx").on(
      table.tenantId,
      table.organisationId,
    ),
    index("platform_entity_mapping_provider_idx").on(table.providerId),
    index("platform_entity_mapping_integration_idx").on(table.integrationId),
    index("platform_entity_mapping_entity_type_idx").on(table.entityType),
    index("platform_entity_mapping_status_idx").on(table.status),
    index("platform_entity_mapping_parent_platform_idx").on(table.parentPlatformId),
    index("platform_entity_mapping_tenant_status_idx").on(table.tenantId, table.status),
  ],
);

export const platformEntityMappingSchema = {
  platformEntityMapping,
};
