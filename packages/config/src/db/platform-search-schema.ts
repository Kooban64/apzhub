/**
 * Platform Search metadata schema (APZSEARCH-002).
 * Provider configuration, diagnostics, audit, and metadata only —
 * no search index, no cached results, no indexed content, no binary.
 */
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const platformSearchProvider = pgTable(
  "platform_search_provider",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    kind: varchar("kind", { length: 64 }).notNull(),
    label: text("label").notNull(),
    version: varchar("version", { length: 64 }).notNull(),
    enabled: boolean("enabled").notNull().default(true),
    active: boolean("active").notNull().default(false),
    ownership: varchar("ownership", { length: 32 }).notNull().default("tenant"),
    capabilitiesJson: jsonb("capabilities_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    configurationJson: jsonb("configuration_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    revision: integer("revision").notNull().default(1),
  },
  (table) => [
    uniqueIndex("platform_search_provider_tenant_id_uidx").on(table.tenantId, table.id),
  ],
);

export const platformSearchProviderRegistration = pgTable(
  "platform_search_provider_registration",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    providerId: text("provider_id").notNull(),
    kind: varchar("kind", { length: 64 }).notNull(),
    label: text("label").notNull(),
    version: varchar("version", { length: 64 }).notNull(),
    registeredAt: timestamp("registered_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    unregisteredAt: timestamp("unregistered_at", { withTimezone: true }),
    registeredBy: text("registered_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    revision: integer("revision").notNull().default(1),
  },
);

export const platformSearchProviderStatus = pgTable(
  "platform_search_provider_status",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    providerId: text("provider_id").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    message: text("message"),
    checkedAt: timestamp("checked_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    revision: integer("revision").notNull().default(1),
  },
  (table) => [
    uniqueIndex("platform_search_provider_status_tenant_provider_uidx").on(
      table.tenantId,
      table.providerId,
    ),
  ],
);

export const platformSearchConfiguration = pgTable("platform_search_configuration", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  organisationId: text("organisation_id"),
  label: text("label"),
  status: varchar("status", { length: 32 }).notNull().default("active"),
  defaultPageSize: integer("default_page_size").notNull(),
  maxPageSize: integer("max_page_size").notNull(),
  maxKeywordLength: integer("max_keyword_length").notNull(),
  allowedProviderKindsJson: jsonb("allowed_provider_kinds_json")
    .$type<string[]>()
    .notNull()
    .default([]),
  enforceTenantIsolation: boolean("enforce_tenant_isolation").notNull().default(true),
  enforceOrganisationIsolation: boolean("enforce_organisation_isolation")
    .notNull()
    .default(true),
  enforcePermissionFilter: boolean("enforce_permission_filter").notNull().default(true),
  currentVersion: integer("current_version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  revision: integer("revision").notNull().default(1),
});

export const platformSearchConfigurationVersion = pgTable(
  "platform_search_configuration_version",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    configurationId: text("configuration_id").notNull(),
    version: integer("version").notNull(),
    snapshotJson: jsonb("snapshot_json").$type<Record<string, unknown>>().notNull(),
    changedBy: text("changed_by").notNull(),
    changeReason: text("change_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    revision: integer("revision").notNull().default(1),
  },
);

export const platformSearchProfile = pgTable("platform_search_profile", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  organisationId: text("organisation_id"),
  name: text("name").notNull(),
  defaultScopesJson: jsonb("default_scopes_json")
    .$type<string[]>()
    .notNull()
    .default([]),
  defaultCollectionsJson: jsonb("default_collections_json")
    .$type<string[]>()
    .notNull()
    .default([]),
  defaultSortsJson: jsonb("default_sorts_json")
    .$type<Record<string, unknown>[]>()
    .notNull()
    .default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  revision: integer("revision").notNull().default(1),
});

export const platformSearchCollection = pgTable("platform_search_collection", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  organisationId: text("organisation_id"),
  name: text("name").notNull(),
  scope: varchar("scope", { length: 32 }).notNull(),
  productIdsJson: jsonb("product_ids_json").$type<string[]>().notNull().default([]),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  revision: integer("revision").notNull().default(1),
});

export const platformSearchSource = pgTable("platform_search_source", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  organisationId: text("organisation_id"),
  productId: varchar("product_id", { length: 64 }).notNull(),
  label: text("label").notNull(),
  entityTypesJson: jsonb("entity_types_json").$type<string[]>().notNull().default([]),
  enabled: boolean("enabled").notNull().default(true),
  providerId: text("provider_id"),
  collectionId: text("collection_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  revision: integer("revision").notNull().default(1),
});

export const platformSearchScope = pgTable("platform_search_scope", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  organisationId: text("organisation_id"),
  scope: varchar("scope", { length: 32 }).notNull(),
  label: text("label").notNull(),
  description: text("description"),
  enabled: boolean("enabled").notNull().default(true),
  metadataJson: jsonb("metadata_json")
    .$type<Record<string, string>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  revision: integer("revision").notNull().default(1),
});

export const platformSearchMetadata = pgTable("platform_search_metadata", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  organisationId: text("organisation_id"),
  entityType: varchar("entity_type", { length: 128 }).notNull(),
  entityId: text("entity_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  keywordsJson: jsonb("keywords_json").$type<string[]>().notNull().default([]),
  productId: varchar("product_id", { length: 64 }).notNull(),
  sourceId: text("source_id").notNull(),
  classification: varchar("classification", { length: 32 }),
  permissionsJson: jsonb("permissions_json").$type<string[]>().notNull().default([]),
  ownerUserId: text("owner_user_id"),
  status: varchar("status", { length: 32 }),
  entityVersion: varchar("entity_version", { length: 64 }),
  navigationTarget: text("navigation_target"),
  customJson: jsonb("custom_json")
    .$type<Record<string, string>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  revision: integer("revision").notNull().default(1),
});

export const platformSearchSession = pgTable("platform_search_session", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  organisationId: text("organisation_id"),
  actorUserId: text("actor_user_id").notNull(),
  lastQueryAt: timestamp("last_query_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  revision: integer("revision").notNull().default(1),
});

export const platformSearchAudit = pgTable("platform_search_audit", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  organisationId: text("organisation_id"),
  action: varchar("action", { length: 128 }).notNull(),
  actorUserId: text("actor_user_id").notNull(),
  correlationId: text("correlation_id"),
  detailJson: jsonb("detail_json")
    .$type<Record<string, string>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  revision: integer("revision").notNull().default(1),
});

export const platformSearchDiagnostics = pgTable("platform_search_diagnostics", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  organisationId: text("organisation_id"),
  providerId: text("provider_id"),
  snapshotJson: jsonb("snapshot_json").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  revision: integer("revision").notNull().default(1),
});

export const platformSearchHealth = pgTable("platform_search_health", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  organisationId: text("organisation_id"),
  providerId: text("provider_id"),
  status: varchar("status", { length: 32 }).notNull(),
  message: text("message"),
  checkedAt: timestamp("checked_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  revision: integer("revision").notNull().default(1),
});

export const platformSearchStatistics = pgTable("platform_search_statistics", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  organisationId: text("organisation_id"),
  declaredIndexCount: integer("declared_index_count").notNull().default(0),
  declaredProviderCount: integer("declared_provider_count").notNull().default(0),
  declaredCollectionCount: integer("declared_collection_count").notNull().default(0),
  declaredSourceCount: integer("declared_source_count").notNull().default(0),
  capturedAt: timestamp("captured_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  revision: integer("revision").notNull().default(1),
});

/** Capabilities stored as structured jsonb on provider; table holds optional snapshots. */
export const platformSearchCapabilities = pgTable(
  "platform_search_capabilities",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    providerId: text("provider_id").notNull(),
    capabilitiesJson: jsonb("capabilities_json")
      .$type<Record<string, unknown>>()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    revision: integer("revision").notNull().default(1),
  },
  (table) => [
    uniqueIndex("platform_search_capabilities_tenant_provider_uidx").on(
      table.tenantId,
      table.providerId,
    ),
  ],
);

export const platformSearchSchema = {
  platformSearchProvider,
  platformSearchProviderRegistration,
  platformSearchProviderStatus,
  platformSearchConfiguration,
  platformSearchConfigurationVersion,
  platformSearchProfile,
  platformSearchCollection,
  platformSearchSource,
  platformSearchScope,
  platformSearchMetadata,
  platformSearchSession,
  platformSearchAudit,
  platformSearchDiagnostics,
  platformSearchHealth,
  platformSearchStatistics,
  platformSearchCapabilities,
};
