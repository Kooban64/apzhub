import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const platformProjectLifecycle = pgTable(
  "platform_project_lifecycle",
  {
    projectId: text("project_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    stage: text("stage").notNull(),
    classification: text("classification"),
    deliveryModel: text("delivery_model"),
    executionCharacteristic: text("execution_characteristic")
      .notNull()
      .default("unspecified"),
    governanceProfileId: text("governance_profile_id"),
    governanceProfileVersion: integer("governance_profile_version"),
    templateId: text("template_id"),
    templateVersion: integer("template_version"),
    ownerUserId: text("owner_user_id"),
    programmeId: text("programme_id"),
    customerLabel: text("customer_label"),
    targetEndAt: timestamp("target_end_at", { withTimezone: true }),
    successCriteria: text("success_criteria"),
    nextMilestoneIntent: text("next_milestone_intent"),
    continuousDeliveryWaiver: boolean("continuous_delivery_waiver")
      .notNull()
      .default(false),
    milestoneFreeWaiver: boolean("milestone_free_waiver").notNull().default(false),
    coreTeamUserIds: jsonb("core_team_user_ids")
      .$type<string[]>()
      .notNull()
      .default([]),
    closureOutcome: text("closure_outcome"),
    closureSummary: text("closure_summary"),
    holdReason: text("hold_reason"),
    activeBaselineId: text("active_baseline_id"),
    wizardStep: integer("wizard_step"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("platform_project_lifecycle_tenant_stage_idx").on(t.tenantId, t.stage)],
);

export const platformProjectBaseline = pgTable(
  "platform_project_baseline",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id").notNull(),
    version: integer("version").notNull(),
    kind: text("kind").notNull(),
    targetEndAt: timestamp("target_end_at", { withTimezone: true }),
    successCriteria: text("success_criteria"),
    milestoneSnapshot: jsonb("milestone_snapshot")
      .$type<unknown[]>()
      .notNull()
      .default([]),
    reason: text("reason"),
    approvedBy: text("approved_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
  },
  (t) => [
    uniqueIndex("platform_project_baseline_project_version_uidx").on(
      t.tenantId,
      t.projectId,
      t.version,
    ),
  ],
);

export const platformProjectLifecycleTransition = pgTable(
  "platform_project_lifecycle_transition",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id").notNull(),
    fromStage: text("from_stage").notNull(),
    toStage: text("to_stage").notNull(),
    reason: text("reason"),
    outcome: text("outcome"),
    actorUserId: text("actor_user_id").notNull(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
    auditNote: text("audit_note").notNull(),
  },
  (t) => [
    index("platform_project_lifecycle_transition_project_idx").on(
      t.tenantId,
      t.projectId,
      t.at,
    ),
  ],
);

export const platformProjectLifecycleWaiver = pgTable(
  "platform_project_lifecycle_waiver",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id").notNull(),
    policyKey: text("policy_key").notNull(),
    reason: text("reason").notNull(),
    authorisedBy: text("authorised_by").notNull(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("platform_project_lifecycle_waiver_project_idx").on(t.tenantId, t.projectId),
  ],
);

export const platformProjectsLifecycleSchema = {
  platformProjectLifecycle,
  platformProjectBaseline,
  platformProjectLifecycleTransition,
  platformProjectLifecycleWaiver,
};
