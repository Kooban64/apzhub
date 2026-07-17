/**
 * Platform Configuration metadata schema (APZCONFIG-001).
 * Configuration SoR metadata only — no secrets, credentials, env vars, or binaries.
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

export const platformConfigurationNamespace = pgTable(
  "platform_configuration_namespace",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("platform_configuration_namespace_tenant_key_uidx").on(
      table.tenantId,
      table.key,
    ),
  ],
);

export const platformConfigurationGroup = pgTable(
  "platform_configuration_group",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    namespaceId: text("namespace_id").notNull(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

export const platformConfigurationKey = pgTable(
  "platform_configuration_key",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    namespaceId: text("namespace_id").notNull(),
    groupId: text("group_id"),
    key: text("key").notNull(),
    displayName: text("display_name").notNull(),
    description: text("description"),
    valueKind: varchar("value_kind", { length: 32 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

export const platformConfiguration = pgTable(
  "platform_configuration",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    namespaceId: text("namespace_id").notNull(),
    groupId: text("group_id"),
    keyId: text("key_id").notNull(),
    hierarchyLevel: varchar("hierarchy_level", { length: 32 }).notNull(),
    scopeJson: jsonb("scope_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    status: varchar("status", { length: 32 }).notNull().default("draft"),
    currentVersionId: text("current_version_id"),
    inheritsFromConfigurationId: text("inherits_from_configuration_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    revision: integer("revision").notNull().default(1),
  },
);

export const platformConfigurationValue = pgTable(
  "platform_configuration_value",
  {
    id: text("id").primaryKey(),
    configurationId: text("configuration_id").notNull(),
    versionId: text("version_id"),
    valueKind: varchar("value_kind", { length: 32 }).notNull(),
    payload: text("payload").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

export const platformConfigurationVersion = pgTable(
  "platform_configuration_version",
  {
    id: text("id").primaryKey(),
    configurationId: text("configuration_id").notNull(),
    versionNumber: integer("version_number").notNull(),
    immutable: boolean("immutable").notNull().default(true),
    isCurrent: boolean("is_current").notNull().default(false),
    label: text("label"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: text("created_by").notNull(),
    rollbackFromVersionId: text("rollback_from_version_id"),
  },
);

export const platformConfigurationOverride = pgTable(
  "platform_configuration_override",
  {
    id: text("id").primaryKey(),
    configurationId: text("configuration_id").notNull(),
    hierarchyLevel: varchar("hierarchy_level", { length: 32 }).notNull(),
    scopeJson: jsonb("scope_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    valueId: text("value_id").notNull(),
    precedenceRank: integer("precedence_rank").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

export const platformConfigurationValidation = pgTable(
  "platform_configuration_validation",
  {
    id: text("id").primaryKey(),
    configurationKeyId: text("configuration_key_id").notNull(),
    kind: varchar("kind", { length: 32 }).notNull(),
    ruleRef: text("rule_ref"),
    pattern: text("pattern"),
    min: integer("min"),
    max: integer("max"),
    enumValuesJson: jsonb("enum_values_json").$type<string[]>(),
    required: boolean("required"),
    customValidatorKey: text("custom_validator_key"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

export const platformConfigurationReference = pgTable(
  "platform_configuration_reference",
  {
    id: text("id").primaryKey(),
    configurationId: text("configuration_id").notNull(),
    kind: varchar("kind", { length: 32 }).notNull(),
    resourceId: text("resource_id").notNull(),
    label: text("label"),
  },
);

export const platformConfigurationHistory = pgTable(
  "platform_configuration_history",
  {
    id: text("id").primaryKey(),
    configurationId: text("configuration_id").notNull(),
    versionId: text("version_id"),
    summary: text("summary").notNull(),
    actorUserId: text("actor_user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

export const platformConfigurationAudit = pgTable(
  "platform_configuration_audit",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    configurationId: text("configuration_id"),
    action: varchar("action", { length: 64 }).notNull(),
    actorUserId: text("actor_user_id").notNull(),
    detail: text("detail"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

export const platformConfigurationSchema = {
  platformConfigurationNamespace,
  platformConfigurationGroup,
  platformConfigurationKey,
  platformConfiguration,
  platformConfigurationValue,
  platformConfigurationVersion,
  platformConfigurationOverride,
  platformConfigurationValidation,
  platformConfigurationReference,
  platformConfigurationHistory,
  platformConfigurationAudit,
};
