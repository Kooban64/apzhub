import { index, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/** W005 / PX-02 — Enterprise Portfolio hierarchy SoR. */
export const platformPortfolioEnterprise = pgTable(
  "platform_portfolio_enterprise",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    name: text("name").notNull(),
    status: text("status").notNull().default("active"),
    initiativeIds: jsonb("initiative_ids").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("platform_portfolio_enterprise_tenant_idx").on(t.tenantId)],
);

export const platformStrategicInitiative = pgTable(
  "platform_strategic_initiative",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    name: text("name").notNull(),
    sponsorUserId: text("sponsor_user_id").notNull(),
    status: text("status").notNull().default("active"),
    governanceProfileId: text("governance_profile_id"),
    strategicObjectiveIds: jsonb("strategic_objective_ids")
      .$type<string[]>()
      .notNull()
      .default([]),
    programmeIds: jsonb("programme_ids").$type<string[]>().notNull().default([]),
    projectIds: jsonb("project_ids").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (t) => [
    index("platform_strategic_initiative_tenant_status_idx").on(t.tenantId, t.status),
  ],
);

export const platformProgramme = pgTable(
  "platform_programme",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    name: text("name").notNull(),
    ownerUserId: text("owner_user_id").notNull(),
    strategicInitiativeId: text("strategic_initiative_id"),
    classification: text("classification"),
    governanceProfileId: text("governance_profile_id"),
    status: text("status").notNull().default("active"),
    strategicImportance: text("strategic_importance").notNull().default("normal"),
    strategicObjectiveIds: jsonb("strategic_objective_ids")
      .$type<string[]>()
      .notNull()
      .default([]),
    memberProjectIds: jsonb("member_project_ids")
      .$type<string[]>()
      .notNull()
      .default([]),
    targetEndAt: timestamp("target_end_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (t) => [
    index("platform_programme_tenant_status_idx").on(t.tenantId, t.status),
    index("platform_programme_tenant_initiative_idx").on(
      t.tenantId,
      t.strategicInitiativeId,
    ),
  ],
);

export const platformStrategicObjective = pgTable(
  "platform_strategic_objective",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    name: text("name").notNull(),
    statement: text("statement").notNull(),
    ownerUserId: text("owner_user_id").notNull(),
    status: text("status").notNull().default("on_track"),
    /** Evidence-derived 0–100; never authoritative manual edit. */
    progress: integer("progress").notNull().default(0),
    initiativeIds: jsonb("initiative_ids").$type<string[]>().notNull().default([]),
    programmeIds: jsonb("programme_ids").$type<string[]>().notNull().default([]),
    contributingProjectIds: jsonb("contributing_project_ids")
      .$type<string[]>()
      .notNull()
      .default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (t) => [
    index("platform_strategic_objective_tenant_status_idx").on(t.tenantId, t.status),
  ],
);

export const platformProjectsPortfolioSchema = {
  platformPortfolioEnterprise,
  platformStrategicInitiative,
  platformProgramme,
  platformStrategicObjective,
};
