/**
 * Platform Administration metadata schema (APZADMIN-001).
 * Administration SoR metadata only — no runtime UI, user management, or execution.
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

export const platformAdminModule = pgTable(
  "platform_admin_module",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    key: varchar("key", { length: 64 }).notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: varchar("status", { length: 32 }).notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    revision: integer("revision").notNull().default(1),
  },
  (table) => [
    uniqueIndex("platform_admin_module_tenant_key_uidx").on(table.tenantId, table.key),
  ],
);

export const platformAdminCategory = pgTable("platform_admin_category", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  moduleId: text("module_id"),
  key: text("key").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  ordering: integer("ordering").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformAdminSection = pgTable("platform_admin_section", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  categoryId: text("category_id").notNull(),
  key: text("key").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  ordering: integer("ordering").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformAdminAction = pgTable("platform_admin_action", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  moduleId: text("module_id"),
  sectionId: text("section_id"),
  key: text("key").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  kind: varchar("kind", { length: 32 }).notNull(),
  permissionKeysJson: jsonb("permission_keys_json").$type<string[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformAdminPermission = pgTable("platform_admin_permission", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  key: text("key").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformAdminAudit = pgTable("platform_admin_audit", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  moduleId: text("module_id"),
  action: varchar("action", { length: 64 }).notNull(),
  actorUserId: text("actor_user_id").notNull(),
  detail: text("detail"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformAdminHistory = pgTable("platform_admin_history", {
  id: text("id").primaryKey(),
  moduleId: text("module_id").notNull(),
  summary: text("summary").notNull(),
  actorUserId: text("actor_user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformAdminDiagnostic = pgTable("platform_admin_diagnostic", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  moduleId: text("module_id"),
  capabilityId: text("capability_id"),
  severity: varchar("severity", { length: 32 }).notNull(),
  code: text("code").notNull(),
  message: text("message").notNull(),
  detail: text("detail"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformAdminRegistration = pgTable("platform_admin_registration", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  moduleKey: varchar("module_key", { length: 64 }).notNull(),
  version: text("version").notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  registeredAt: timestamp("registered_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  registeredBy: text("registered_by").notNull(),
  notes: text("notes"),
});

export const platformAdminMetadata = pgTable("platform_admin_metadata", {
  id: text("id").primaryKey(),
  moduleId: text("module_id").notNull(),
  labelsJson: jsonb("labels_json").$type<Record<string, string>>(),
  tagsJson: jsonb("tags_json").$type<string[]>(),
  notes: text("notes"),
});

export const platformAdminPolicy = pgTable("platform_admin_policy", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  moduleId: text("module_id"),
  kind: varchar("kind", { length: 32 }).notNull(),
  key: text("key").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformAdminReference = pgTable("platform_admin_reference", {
  id: text("id").primaryKey(),
  moduleId: text("module_id").notNull(),
  kind: varchar("kind", { length: 32 }).notNull(),
  resourceId: text("resource_id").notNull(),
  label: text("label"),
});

export const platformAdminCapability = pgTable("platform_admin_capability", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  moduleId: text("module_id").notNull(),
  key: text("key").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  enabled: boolean("enabled").notNull().default(false),
  available: boolean("available").notNull().default(false),
  healthy: boolean("healthy").notNull().default(false),
  certified: boolean("certified").notNull().default(false),
  productionReady: boolean("production_ready").notNull().default(false),
  limitationsJson: jsonb("limitations_json").$type<string[]>(),
  owner: text("owner").notNull(),
  version: text("version").notNull(),
  documentation: text("documentation"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformAdminNavigation = pgTable("platform_admin_navigation", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  moduleId: text("module_id").notNull(),
  categoryId: text("category_id"),
  sectionId: text("section_id"),
  key: text("key").notNull(),
  label: text("label").notNull(),
  ordering: integer("ordering").notNull().default(0),
  visibility: varchar("visibility", { length: 32 }).notNull(),
  permissionKeysJson: jsonb("permission_keys_json").$type<string[]>(),
  iconKey: text("icon_key"),
  routePath: text("route_path"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformAdminShortcut = pgTable("platform_admin_shortcut", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  moduleId: text("module_id"),
  actionId: text("action_id"),
  key: text("key").notNull(),
  label: text("label").notNull(),
  ordering: integer("ordering").notNull().default(0),
  permissionKeysJson: jsonb("permission_keys_json").$type<string[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformAdminDashboard = pgTable("platform_admin_dashboard", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  moduleId: text("module_id"),
  key: text("key").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  ordering: integer("ordering").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformAdminWidget = pgTable("platform_admin_widget", {
  id: text("id").primaryKey(),
  dashboardId: text("dashboard_id").notNull(),
  key: text("key").notNull(),
  name: text("name").notNull(),
  kind: varchar("kind", { length: 32 }).notNull(),
  ordering: integer("ordering").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformAdminSchema = {
  platformAdminModule,
  platformAdminCategory,
  platformAdminSection,
  platformAdminAction,
  platformAdminPermission,
  platformAdminAudit,
  platformAdminHistory,
  platformAdminDiagnostic,
  platformAdminRegistration,
  platformAdminMetadata,
  platformAdminPolicy,
  platformAdminReference,
  platformAdminCapability,
  platformAdminNavigation,
  platformAdminShortcut,
  platformAdminDashboard,
  platformAdminWidget,
};
