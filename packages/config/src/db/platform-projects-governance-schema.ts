import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const platformOrgGovernanceProfile = pgTable(
  "platform_org_governance_profile",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    version: integer("version").notNull().default(1),
    scope: text("scope").notNull().default("organisation"),
    status: text("status").notNull().default("draft"),
    requiresHoldDecision: boolean("requires_hold_decision").notNull().default(false),
    requiresClosureApproval: boolean("requires_closure_approval")
      .notNull()
      .default(false),
    requiresEvidenceOnClose: boolean("requires_evidence_on_close")
      .notNull()
      .default(true),
    initiationRequiresMilestone: boolean("initiation_requires_milestone")
      .notNull()
      .default(true),
    milestoneDateToleranceDays: integer("milestone_date_tolerance_days")
      .notNull()
      .default(7),
    waitingBreachEscalationDays: integer("waiting_breach_escalation_days")
      .notNull()
      .default(3),
    allowedDeliveryModels: jsonb("allowed_delivery_models")
      .$type<string[]>()
      .notNull()
      .default([]),
    allowedClassifications: jsonb("allowed_classifications")
      .$type<string[]>()
      .notNull()
      .default([]),
    boundPolicyIds: jsonb("bound_policy_ids").$type<string[]>().notNull().default([]),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (t) => [
    index("platform_org_governance_profile_tenant_status_idx").on(t.tenantId, t.status),
  ],
);

export const platformOperationalPolicy = pgTable(
  "platform_operational_policy",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    version: integer("version").notNull().default(1),
    status: text("status").notNull().default("draft"),
    areas: jsonb("areas").$type<string[]>().notNull().default([]),
    rules: jsonb("rules").$type<Record<string, unknown>>().notNull().default({}),
    boundProfileIds: jsonb("bound_profile_ids").$type<string[]>().notNull().default([]),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (t) => [
    index("platform_operational_policy_tenant_status_idx").on(t.tenantId, t.status),
  ],
);

export const platformProjectsGovernanceSchema = {
  platformOrgGovernanceProfile,
  platformOperationalPolicy,
};
