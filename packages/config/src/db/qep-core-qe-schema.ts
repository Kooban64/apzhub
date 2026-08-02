/**
 * APZQEP-151 Core QE Cap A–F durable persistence schema.
 * PostgreSQL is the production Source of Record.
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

export const qepSuite = pgTable(
  "qep_suite",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id"),
    parentSuiteId: text("parent_suite_id"),
    folderPath: text("folder_path").notNull().default("/"),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    ownerId: text("owner_id").notNull(),
    kind: varchar("kind", { length: 32 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    version: integer("version").notNull().default(1),
    priority: varchar("priority", { length: 32 }).notNull().default("normal"),
    category: text("category"),
    tagsJson: jsonb("tags_json").$type<string[]>().notNull().default([]),
    risk: text("risk"),
    businessArea: text("business_area"),
    application: text("application"),
    component: text("component"),
    classification: text("classification"),
    favouriteUserIdsJson: jsonb("favourite_user_ids_json")
      .$type<string[]>()
      .notNull()
      .default([]),
    pinnedUserIdsJson: jsonb("pinned_user_ids_json")
      .$type<string[]>()
      .notNull()
      .default([]),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    retiredAt: timestamp("retired_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    customMetadataJson: jsonb("custom_metadata_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    historyJson: jsonb("history_json").$type<unknown[]>().notNull().default([]),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (t) => ({
    tenantIdx: index("qep_suite_tenant_idx").on(t.tenantId),
    tenantProjectIdx: index("qep_suite_tenant_project_idx").on(t.tenantId, t.projectId),
    tenantStatusIdx: index("qep_suite_tenant_status_idx").on(t.tenantId, t.status),
  }),
);

export const qepExecutionPlan = pgTable(
  "qep_execution_plan",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id"),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    ownerId: text("owner_id").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    priority: varchar("priority", { length: 32 }),
    risk: text("risk"),
    suiteId: text("suite_id").notNull(),
    suiteVersion: integer("suite_version"),
    suiteName: text("suite_name"),
    handoffId: text("handoff_id"),
    version: integer("version").notNull().default(1),
    planJson: jsonb("plan_json").$type<Record<string, unknown>>().notNull(),
    historyJson: jsonb("history_json").$type<unknown[]>().notNull().default([]),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (t) => ({
    tenantHandoffUid: uniqueIndex("qep_execution_plan_tenant_handoff_uidx").on(
      t.tenantId,
      t.handoffId,
    ),
    tenantIdx: index("qep_execution_plan_tenant_idx").on(t.tenantId),
    tenantStatusIdx: index("qep_execution_plan_tenant_status_idx").on(
      t.tenantId,
      t.status,
    ),
  }),
);

export const qepExecutionSession = pgTable(
  "qep_execution_session",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id"),
    name: text("name").notNull(),
    ownerId: text("owner_id").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    planId: text("plan_id"),
    handoffId: text("handoff_id"),
    suiteId: text("suite_id"),
    sessionJson: jsonb("session_json").$type<Record<string, unknown>>().notNull(),
    historyJson: jsonb("history_json").$type<unknown[]>().notNull().default([]),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (t) => ({
    tenantHandoffUid: uniqueIndex("qep_execution_session_tenant_handoff_uidx").on(
      t.tenantId,
      t.handoffId,
    ),
    tenantIdx: index("qep_execution_session_tenant_idx").on(t.tenantId),
  }),
);

export const qepDefect = pgTable(
  "qep_defect",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id"),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    status: varchar("status", { length: 32 }).notNull(),
    severity: varchar("severity", { length: 32 }).notNull(),
    priority: varchar("priority", { length: 32 }).notNull(),
    reporterId: text("reporter_id").notNull(),
    assigneeId: text("assignee_id"),
    sessionId: text("session_id"),
    suiteId: text("suite_id"),
    defectJson: jsonb("defect_json").$type<Record<string, unknown>>().notNull(),
    historyJson: jsonb("history_json").$type<unknown[]>().notNull().default([]),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (t) => ({
    tenantIdx: index("qep_defect_tenant_idx").on(t.tenantId),
    tenantStatusIdx: index("qep_defect_tenant_status_idx").on(t.tenantId, t.status),
  }),
);

export const qepEnterpriseRequirement = pgTable(
  "qep_enterprise_requirement",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id"),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    status: varchar("status", { length: 32 }).notNull(),
    category: text("category"),
    priority: varchar("priority", { length: 32 }),
    criticality: varchar("criticality", { length: 32 }),
    risk: varchar("risk", { length: 32 }),
    ownerId: text("owner_id").notNull(),
    version: integer("version").notNull().default(1),
    requirementJson: jsonb("requirement_json")
      .$type<Record<string, unknown>>()
      .notNull(),
    historyJson: jsonb("history_json").$type<unknown[]>().notNull().default([]),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (t) => ({
    tenantIdx: index("qep_enterprise_requirement_tenant_idx").on(t.tenantId),
  }),
);

export const qepSavedReport = pgTable(
  "qep_saved_report",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id"),
    ownerId: text("owner_id").notNull(),
    name: text("name").notNull(),
    templateId: text("template_id").notNull(),
    reportJson: jsonb("report_json").$type<Record<string, unknown>>().notNull(),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    tenantIdx: index("qep_saved_report_tenant_idx").on(t.tenantId),
  }),
);

export const qepReportingTrendSample = pgTable(
  "qep_reporting_trend_sample",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    sampledAt: timestamp("sampled_at", { withTimezone: true }).notNull(),
    sampleJson: jsonb("sample_json").$type<Record<string, unknown>>().notNull(),
  },
  (t) => ({
    tenantSampledIdx: index("qep_reporting_trend_tenant_sampled_idx").on(
      t.tenantId,
      t.sampledAt,
    ),
  }),
);

export const qepCoreQeIdempotency = pgTable(
  "qep_core_qe_idempotency",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    scope: text("scope").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    resourceId: text("resource_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    uidx: uniqueIndex("qep_core_qe_idempotency_uidx").on(
      t.tenantId,
      t.scope,
      t.idempotencyKey,
    ),
  }),
);

export const qepCoreQeSchema = {
  qepSuite,
  qepExecutionPlan,
  qepExecutionSession,
  qepDefect,
  qepEnterpriseRequirement,
  qepSavedReport,
  qepReportingTrendSample,
  qepCoreQeIdempotency,
};
