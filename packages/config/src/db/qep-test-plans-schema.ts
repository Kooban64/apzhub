/**
 * QEP Test Plans metadata schema (APZQEP-ENG-060B, OES-ENG-060B Part 2).
 * Platform metadata SoR for Test Plan aggregates — domain rules remain in
 * `@apzhub/qep-test-plans`.
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

export const qepTestPlan = pgTable(
  "qep_test_plans",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    number: text("number").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    objective: text("objective").notNull(),
    scopeClass: varchar("scope_class", { length: 32 }).notNull(),
    scopeLabel: text("scope_label"),
    scopeExternalRef: text("scope_external_ref"),
    status: varchar("status", { length: 32 }).notNull(),
    priority: varchar("priority", { length: 16 }).notNull(),
    planType: varchar("plan_type", { length: 32 }).notNull(),
    ownerId: text("owner_id").notNull(),
    versionLabel: varchar("version_label", { length: 32 }).notNull(),
    predecessorPlanId: text("predecessor_plan_id"),
    predecessorSealedVersionLabel: varchar("predecessor_sealed_version_label", {
      length: 32,
    }),
    successorPlanId: text("successor_plan_id"),
    leadId: text("lead_id"),
    assigneeIdsJson: jsonb("assignee_ids_json").$type<string[]>().notNull().default([]),
    assignmentUpdatedAt: timestamp("assignment_updated_at", {
      withTimezone: true,
    }).notNull(),
    assignmentUpdatedBy: text("assignment_updated_by").notNull(),
    plannedStart: timestamp("planned_start", { withTimezone: true }),
    plannedEnd: timestamp("planned_end", { withTimezone: true }),
    milestoneRef: text("milestone_ref"),
    timezone: text("timezone"),
    externalReferencesJson: jsonb("external_references_json")
      .$type<string[]>()
      .notNull()
      .default([]),
    metadataJson: jsonb("metadata_json")
      .$type<Record<string, string>>()
      .notNull()
      .default({}),
    metricsJson: jsonb("metrics_json")
      .$type<{
        totalItems: number;
        includedCount: number;
        optionalCount: number;
        deferredCount: number;
        pinnedIncludedCount: number;
      }>()
      .notNull()
      .default({
        totalItems: 0,
        includedCount: 0,
        optionalCount: 0,
        deferredCount: 0,
        pinnedIncludedCount: 0,
      }),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: text("updated_by").notNull(),
    correlationId: text("correlation_id"),
  },
  (table) => [
    uniqueIndex("qep_test_plans_tenant_number_uidx").on(table.tenantId, table.number),
    index("qep_test_plans_tenant_id_idx").on(table.tenantId, table.id),
    index("qep_test_plans_tenant_status_idx").on(table.tenantId, table.status),
    index("qep_test_plans_tenant_owner_idx").on(table.tenantId, table.ownerId),
    index("qep_test_plans_tenant_updated_idx").on(table.tenantId, table.updatedAt),
  ],
);

export const qepTestPlanItem = pgTable(
  "qep_test_plan_items",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    planId: text("plan_id")
      .notNull()
      .references(() => qepTestPlan.id, { onDelete: "cascade" }),
    specificationId: text("specification_id").notNull(),
    specificationVersionPin: text("specification_version_pin"),
    sequence: integer("sequence").notNull().default(0),
    itemStatus: varchar("item_status", { length: 16 }).notNull().default("included"),
    notes: text("notes"),
    requirementRefsJson: jsonb("requirement_refs_json")
      .$type<string[]>()
      .notNull()
      .default([]),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: text("updated_by").notNull(),
  },
  (table) => [
    index("qep_test_plan_items_plan_seq_idx").on(table.planId, table.sequence),
    index("qep_test_plan_items_tenant_plan_idx").on(table.tenantId, table.planId),
  ],
);

export const qepTestPlanApproval = pgTable(
  "qep_test_plan_approvals",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    planId: text("plan_id")
      .notNull()
      .references(() => qepTestPlan.id, { onDelete: "cascade" }),
    decision: varchar("decision", { length: 16 }).notNull(),
    decidedBy: text("decided_by").notNull(),
    decidedAt: timestamp("decided_at", { withTimezone: true }).notNull(),
    comment: text("comment"),
    fromStatus: varchar("from_status", { length: 32 }).notNull(),
    toStatus: varchar("to_status", { length: 32 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
  },
  (table) => [
    index("qep_test_plan_approvals_tenant_plan_idx").on(table.tenantId, table.planId),
  ],
);

export const qepTestPlanRevision = pgTable(
  "qep_test_plan_revisions",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    planId: text("plan_id")
      .notNull()
      .references(() => qepTestPlan.id, { onDelete: "cascade" }),
    versionLabel: varchar("version_label", { length: 32 }).notNull(),
    sealedAt: timestamp("sealed_at", { withTimezone: true }).notNull(),
    sealedBy: text("sealed_by").notNull(),
    statusAtSeal: varchar("status_at_seal", { length: 32 }).notNull(),
    itemFingerprint: text("item_fingerprint").notNull(),
    predecessorVersionLabel: varchar("predecessor_version_label", { length: 32 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("qep_test_plan_revisions_lineage_uidx").on(
      table.tenantId,
      table.planId,
      table.versionLabel,
    ),
    index("qep_test_plan_revisions_tenant_plan_idx").on(table.tenantId, table.planId),
  ],
);

export const qepTestPlanHistory = pgTable(
  "qep_test_plan_history",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    planId: text("plan_id")
      .notNull()
      .references(() => qepTestPlan.id, { onDelete: "cascade" }),
    sequence: integer("sequence").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    actorUserId: text("actor_user_id").notNull(),
    action: text("action").notNull(),
    summary: text("summary").notNull(),
    fromStatus: varchar("from_status", { length: 32 }),
    toStatus: varchar("to_status", { length: 32 }),
    correlationId: text("correlation_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: text("updated_by").notNull(),
    revision: integer("revision").notNull().default(1),
  },
  (table) => [
    uniqueIndex("qep_test_plan_history_seq_uidx").on(
      table.tenantId,
      table.planId,
      table.sequence,
    ),
    index("qep_test_plan_history_plan_idx").on(table.tenantId, table.planId),
  ],
);

export const qepTestPlansSchema = {
  qepTestPlan,
  qepTestPlanItem,
  qepTestPlanApproval,
  qepTestPlanRevision,
  qepTestPlanHistory,
};
