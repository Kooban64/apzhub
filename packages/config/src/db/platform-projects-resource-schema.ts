import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const platformDeliveryAssignment = pgTable(
  "platform_delivery_assignment",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    scopeType: text("scope_type").notNull(),
    scopeId: text("scope_id").notNull(),
    principalType: text("principal_type").notNull(),
    principalId: text("principal_id").notNull(),
    assignmentType: text("assignment_type").notNull().default("core"),
    fromAt: timestamp("from_at", { withTimezone: true }).notNull(),
    toAt: timestamp("to_at", { withTimezone: true }),
    allocationPercent: integer("allocation_percent"),
    primaryRoleKey: text("primary_role_key"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("platform_delivery_assignment_scope_idx").on(
      t.tenantId,
      t.scopeType,
      t.scopeId,
    ),
  ],
);

export const platformProjectsResourceSchema = {
  platformDeliveryAssignment,
};
