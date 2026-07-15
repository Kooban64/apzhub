import { boolean, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./schema";

export const platformTenant = pgTable(
  "platform_tenant",
  {
    tenantId: text("tenant_id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    status: text("status").notNull().default("active"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("platform_tenant_slug_uidx").on(table.slug)],
);

export const platformUserTenant = pgTable(
  "platform_user_tenant",
  {
    membershipId: text("membership_id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => platformTenant.tenantId, { onDelete: "cascade" }),
    isPrimary: boolean("is_primary").notNull().default(false),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("platform_user_tenant_user_tenant_uidx").on(table.userId, table.tenantId),
  ],
);

export const platformIdentitySchema = {
  platformTenant,
  platformUserTenant,
};
