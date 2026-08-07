/**
 * Operational Friction Register — APZHUB-PRODUCT-BOARD-001.
 */
import { boolean, index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const platformOperationalFriction = pgTable(
  "platform_operational_friction",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    title: text("title").notNull(),
    reportedAt: timestamp("reported_at", { withTimezone: true }).notNull(),
    reporter: text("reporter").notNull(),
    productsAffected: jsonb("products_affected")
      .$type<string[]>()
      .notNull()
      .default([]),
    userRole: text("user_role").notNull(),
    frustration: text("frustration").notNull(),
    whoExperiences: text("who_experiences").notNull(),
    evidence: text("evidence").notNull(),
    nonEngineeringOptions: text("non_engineering_options").notNull(),
    smallestCapability: text("smallest_capability").notNull(),
    boardDecision: text("board_decision").notNull(),
    engineeringStatus: text("engineering_status").notNull(),
    source: text("source").notNull(),
    outcomeFaster: boolean("outcome_faster"),
    outcomeClearer: boolean("outcome_clearer"),
    outcomeSafer: boolean("outcome_safer"),
    outcomeBetterDecision: boolean("outcome_better_decision"),
    outcomeNotes: text("outcome_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    createdByUserId: text("created_by_user_id"),
    updatedByUserId: text("updated_by_user_id"),
  },
  (table) => [
    index("platform_operational_friction_tenant_idx").on(
      table.tenantId,
      table.updatedAt,
    ),
  ],
);

export const platformOperationalFrictionAudit = pgTable(
  "platform_operational_friction_audit",
  {
    id: text("id").primaryKey(),
    frictionId: text("friction_id").notNull(),
    tenantId: text("tenant_id").notNull(),
    actorUserId: text("actor_user_id").notNull(),
    action: text("action").notNull(),
    detailJson: jsonb("detail_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("platform_operational_friction_audit_friction_idx").on(
      table.frictionId,
      table.createdAt,
    ),
  ],
);

export const platformOperationalFrictionSchema = {
  platformOperationalFriction,
  platformOperationalFrictionAudit,
};
