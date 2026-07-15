import { boolean, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const platformCapability = pgTable(
  "platform_capability",
  {
    capabilityId: text("capability_id").primaryKey(),
    capabilityKey: text("capability_key").notNull(),
    capabilityType: text("capability_type").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    version: text("version"),
    status: text("status").notNull().default("active"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("platform_capability_key_uidx").on(table.capabilityKey)],
);

export const platformCapabilityDependency = pgTable(
  "platform_capability_dependency",
  {
    dependencyId: text("dependency_id").primaryKey(),
    capabilityId: text("capability_id")
      .notNull()
      .references(() => platformCapability.capabilityId, { onDelete: "cascade" }),
    dependsOnCapabilityKey: text("depends_on_capability_key").notNull(),
    dependencyType: text("dependency_type").notNull().default("required"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("platform_capability_dependency_pair_uidx").on(
      table.capabilityId,
      table.dependsOnCapabilityKey,
    ),
  ],
);

export const platformGovernanceEnablement = pgTable(
  "platform_governance_enablement",
  {
    enablementId: text("enablement_id").primaryKey(),
    scopeType: text("scope_type").notNull(),
    scopeKey: text("scope_key").notNull().default(""),
    targetType: text("target_type").notNull(),
    targetKey: text("target_key").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("platform_governance_enablement_scope_target_uidx").on(
      table.scopeType,
      table.scopeKey,
      table.targetType,
      table.targetKey,
    ),
  ],
);

export const platformProvisioningRecord = pgTable("platform_provisioning_record", {
  provisioningId: text("provisioning_id").primaryKey(),
  scopeType: text("scope_type").notNull(),
  scopeKey: text("scope_key").notNull(),
  targetType: text("target_type").notNull(),
  targetKey: text("target_key").notNull(),
  status: text("status").notNull().default("pending"),
  message: text("message"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const platformFeatureFlag = pgTable("platform_feature_flag", {
  flagKey: text("flag_key").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  defaultEnabled: boolean("default_enabled").notNull().default(false),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformFeatureFlagOverride = pgTable(
  "platform_feature_flag_override",
  {
    overrideId: text("override_id").primaryKey(),
    flagKey: text("flag_key")
      .notNull()
      .references(() => platformFeatureFlag.flagKey, { onDelete: "cascade" }),
    scopeType: text("scope_type").notNull(),
    scopeKey: text("scope_key").notNull().default(""),
    enabled: boolean("enabled").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("platform_feature_flag_override_scope_uidx").on(
      table.flagKey,
      table.scopeType,
      table.scopeKey,
    ),
  ],
);

export const platformGovernanceSchema = {
  platformCapability,
  platformCapabilityDependency,
  platformGovernanceEnablement,
  platformProvisioningRecord,
  platformFeatureFlag,
  platformFeatureFlagOverride,
};
