import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/** W006 / P2 — Enterprise Delivery Team Directory SoR (Projects-owned). */
export const platformEnterpriseDeliveryTeam = pgTable(
  "platform_enterprise_delivery_team",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    leadUserId: text("lead_user_id").notNull(),
    status: text("status").notNull().default("active"),
    skillTags: jsonb("skill_tags").$type<string[]>().notNull().default([]),
    orgUnitLabel: text("org_unit_label"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("platform_enterprise_delivery_team_tenant_status_idx").on(
      t.tenantId,
      t.status,
    ),
  ],
);

export const platformEnterpriseTeamMembership = pgTable(
  "platform_enterprise_team_membership",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    teamId: text("team_id").notNull(),
    userId: text("user_id").notNull(),
    roleInTeam: text("role_in_team").notNull().default("member"),
    fromAt: timestamp("from_at", { withTimezone: true }).notNull(),
    toAt: timestamp("to_at", { withTimezone: true }),
    allocationPercent: integer("allocation_percent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("platform_enterprise_team_membership_team_idx").on(t.tenantId, t.teamId),
    uniqueIndex("platform_enterprise_team_membership_active_uidx").on(
      t.tenantId,
      t.teamId,
      t.userId,
      t.fromAt,
    ),
  ],
);

export const platformProjectsTeamDirectorySchema = {
  platformEnterpriseDeliveryTeam,
  platformEnterpriseTeamMembership,
};
