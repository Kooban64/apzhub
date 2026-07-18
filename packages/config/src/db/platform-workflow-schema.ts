/**
 * Platform Workflow metadata schema (APZWORKFLOW-001).
 * Workflow definitions, versions, templates, taxonomy, audit —
 * no execution, queues, runtime, or engine payloads.
 */
import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const platformWorkflow = pgTable(
  "platform_workflow",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    lifecycle: varchar("lifecycle", { length: 32 }).notNull().default("draft"),
    currentVersionId: text("current_version_id"),
    categoryId: text("category_id"),
    folderId: text("folder_id"),
    templateId: text("template_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    revision: integer("revision").notNull().default(1),
  },
  (table) => [
    uniqueIndex("platform_workflow_tenant_key_uidx").on(table.tenantId, table.key),
  ],
);

export const platformWorkflowVersion = pgTable(
  "platform_workflow_version",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    workflowId: text("workflow_id").notNull(),
    versionNumber: integer("version_number").notNull(),
    status: varchar("status", { length: 32 }).notNull().default("draft"),
    lifecycle: varchar("lifecycle", { length: 32 }).notNull().default("draft"),
    graphJson: jsonb("graph_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    variablesJson: jsonb("variables_json").$type<unknown[]>().notNull().default([]),
    parametersJson: jsonb("parameters_json").$type<unknown[]>().notNull().default([]),
    triggersJson: jsonb("triggers_json").$type<unknown[]>().notNull().default([]),
    actionsJson: jsonb("actions_json").$type<unknown[]>().notNull().default([]),
    conditionsJson: jsonb("conditions_json").$type<unknown[]>().notNull().default([]),
    connectionsJson: jsonb("connections_json").$type<unknown[]>().notNull().default([]),
    changeSummary: text("change_summary"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    revision: integer("revision").notNull().default(1),
  },
  (table) => [
    uniqueIndex("platform_workflow_version_tenant_workflow_number_uidx").on(
      table.tenantId,
      table.workflowId,
      table.versionNumber,
    ),
  ],
);

export const platformWorkflowTemplate = pgTable(
  "platform_workflow_template",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    lifecycle: varchar("lifecycle", { length: 32 }).notNull().default("draft"),
    categoryId: text("category_id"),
    graphJson: jsonb("graph_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    parametersJson: jsonb("parameters_json").$type<unknown[]>().notNull().default([]),
    variablesJson: jsonb("variables_json").$type<unknown[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    revision: integer("revision").notNull().default(1),
  },
  (table) => [
    uniqueIndex("platform_workflow_template_tenant_key_uidx").on(
      table.tenantId,
      table.key,
    ),
  ],
);

export const platformWorkflowCategory = pgTable("platform_workflow_category", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  organisationId: text("organisation_id"),
  name: text("name").notNull(),
  description: text("description"),
  parentCategoryId: text("parent_category_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  revision: integer("revision").notNull().default(1),
});

export const platformWorkflowFolder = pgTable("platform_workflow_folder", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  organisationId: text("organisation_id"),
  name: text("name").notNull(),
  parentFolderId: text("parent_folder_id"),
  path: text("path").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  revision: integer("revision").notNull().default(1),
});

export const platformWorkflowAudit = pgTable("platform_workflow_audit", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  organisationId: text("organisation_id"),
  workflowId: text("workflow_id").notNull(),
  versionId: text("version_id"),
  action: text("action").notNull(),
  actorUserId: text("actor_user_id").notNull(),
  correlationId: text("correlation_id"),
  detailJson: jsonb("detail_json")
    .$type<Record<string, string>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  revision: integer("revision").notNull().default(1),
});

export const platformWorkflowSchema = {
  platformWorkflow,
  platformWorkflowVersion,
  platformWorkflowTemplate,
  platformWorkflowCategory,
  platformWorkflowFolder,
  platformWorkflowAudit,
};
