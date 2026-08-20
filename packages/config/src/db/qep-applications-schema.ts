/**
 * APZQEP Phase 1E — durable Application SoR.
 * Quality container for repositories, environments, and execution targets.
 * Does not store secrets. Does not grant Source access.
 */
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const qepApplication = pgTable(
  "qep_application",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationKey: varchar("application_key", { length: 32 }).notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: varchar("status", { length: 32 }).notNull(),
    ownerUserId: text("owner_user_id"),
    legacyQualityProjectId: text("legacy_quality_project_id"),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (t) => ({
    tenantIdx: index("qep_application_tenant_idx").on(t.tenantId),
    tenantKeyUidx: uniqueIndex("qep_application_tenant_key_uidx").on(
      t.tenantId,
      t.applicationKey,
    ),
    tenantUpdatedIdx: index("qep_application_tenant_updated_idx").on(
      t.tenantId,
      t.updatedAt,
    ),
    legacyIdx: index("qep_application_legacy_project_idx").on(
      t.tenantId,
      t.legacyQualityProjectId,
    ),
  }),
);

export const qepApplicationRepository = pgTable(
  "qep_application_repository",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    scmRepositoryId: text("scm_repository_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
  },
  (t) => ({
    tenantIdx: index("qep_application_repository_tenant_idx").on(t.tenantId),
    applicationIdx: index("qep_application_repository_application_idx").on(
      t.applicationId,
    ),
    appRepoUidx: uniqueIndex("qep_application_repository_uidx").on(
      t.applicationId,
      t.scmRepositoryId,
    ),
  }),
);

export const qepApplicationEnvironment = pgTable(
  "qep_application_environment",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    name: text("name").notNull(),
    category: varchar("category", { length: 32 }).notNull(),
    description: text("description"),
    baseUrl: text("base_url"),
    status: varchar("status", { length: 32 }).notNull(),
    metadataJson: jsonb("metadata_json").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (t) => ({
    tenantIdx: index("qep_application_environment_tenant_idx").on(t.tenantId),
    applicationIdx: index("qep_application_environment_application_idx").on(
      t.applicationId,
    ),
    appNameUidx: uniqueIndex("qep_application_environment_name_uidx").on(
      t.applicationId,
      t.name,
    ),
  }),
);

export const qepApplicationExecutionTarget = pgTable(
  "qep_application_execution_target",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    environmentId: text("environment_id"),
    name: text("name").notNull(),
    targetType: varchar("target_type", { length: 64 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    configJson: jsonb("config_json").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (t) => ({
    tenantIdx: index("qep_application_execution_target_tenant_idx").on(t.tenantId),
    applicationIdx: index("qep_application_execution_target_application_idx").on(
      t.applicationId,
    ),
    environmentIdx: index("qep_application_execution_target_environment_idx").on(
      t.environmentId,
    ),
  }),
);

/**
 * Durable compatibility map: legacy Cap/QEP project identifiers → qep_application.id.
 * application_id null means UNRESOLVED. Never guess. Never rewrite Cap records.
 */
export const qepApplicationLegacyRef = pgTable(
  "qep_application_legacy_ref",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectRef: text("project_ref").notNull(),
    applicationId: text("application_id"),
    origin: varchar("origin", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    tenantRefUidx: uniqueIndex("qep_application_legacy_ref_tenant_ref_uidx").on(
      t.tenantId,
      t.projectRef,
    ),
    tenantIdx: index("qep_application_legacy_ref_tenant_idx").on(t.tenantId),
    applicationIdx: index("qep_application_legacy_ref_application_idx").on(
      t.applicationId,
    ),
  }),
);

export const qepApplicationsSchema = {
  qepApplication,
  qepApplicationRepository,
  qepApplicationEnvironment,
  qepApplicationExecutionTarget,
  qepApplicationLegacyRef,
};
