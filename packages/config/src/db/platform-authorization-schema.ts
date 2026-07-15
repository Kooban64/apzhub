import { jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { platformTenant } from "./platform-identity-schema";
import { user } from "./schema";

export const platformAuthorizationPermission = pgTable("platform_authorization_permission", {
  permissionKey: text("permission_key").primaryKey(),
  namespace: text("namespace").notNull(),
  description: text("description"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformAuthorizationRole = pgTable(
  "platform_authorization_role",
  {
    roleId: text("role_id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    scope: text("scope").notNull(),
    tenantId: text("tenant_id").references(() => platformTenant.tenantId, {
      onDelete: "cascade",
    }),
    productKey: text("product_key"),
    parentRoleId: text("parent_role_id"),
    status: text("status").notNull().default("active"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("platform_authorization_role_scope_uidx").on(
      table.slug,
      table.scope,
      table.tenantId,
      table.productKey,
    ),
  ],
);

export const platformAuthorizationRolePermission = pgTable(
  "platform_authorization_role_permission",
  {
    roleId: text("role_id")
      .notNull()
      .references(() => platformAuthorizationRole.roleId, { onDelete: "cascade" }),
    permissionKey: text("permission_key")
      .notNull()
      .references(() => platformAuthorizationPermission.permissionKey, {
        onDelete: "cascade",
      }),
    grantType: text("grant_type").notNull().default("allow"),
  },
  (table) => [
    uniqueIndex("platform_authorization_role_permission_uidx").on(
      table.roleId,
      table.permissionKey,
    ),
  ],
);

export const platformAuthorizationRoleAssignment = pgTable(
  "platform_authorization_role_assignment",
  {
    assignmentId: text("assignment_id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    roleId: text("role_id")
      .notNull()
      .references(() => platformAuthorizationRole.roleId, { onDelete: "cascade" }),
    tenantId: text("tenant_id").references(() => platformTenant.tenantId, {
      onDelete: "cascade",
    }),
    productKey: text("product_key"),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("platform_authorization_role_assignment_uidx").on(
      table.userId,
      table.roleId,
      table.tenantId,
      table.productKey,
    ),
  ],
);

export const platformAuthorizationSchema = {
  platformAuthorizationPermission,
  platformAuthorizationRole,
  platformAuthorizationRolePermission,
  platformAuthorizationRoleAssignment,
};
