import { index, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const platformProjectMilestone = pgTable(
  "platform_project_milestone",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    targetDate: timestamp("target_date", { withTimezone: true }),
    owner: text("owner"),
    ownerUserId: text("owner_user_id"),
    status: text("status").notNull(),
    confidence: text("confidence").notNull().default("medium"),
    failureConsequence: text("failure_consequence"),
    exitCriteria: text("exit_criteria"),
    baselineDueAt: timestamp("baseline_due_at", { withTimezone: true }),
    sortKey: integer("sort_key").notNull().default(0),
    dependencyIds: jsonb("dependency_ids").$type<string[]>().notNull().default([]),
    progressPercent: integer("progress_percent").notNull().default(0),
    achievementEvidence: jsonb("achievement_evidence")
      .$type<unknown[]>()
      .notNull()
      .default([]),
    varianceDays: integer("variance_days"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("platform_project_milestone_project_idx").on(t.tenantId, t.projectId)],
);

export const platformProjectRisk = pgTable(
  "platform_project_risk",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    probability: text("probability").notNull(),
    impact: text("impact").notNull(),
    mitigation: text("mitigation").notNull(),
    owner: text("owner").notNull(),
    reviewDate: timestamp("review_date", { withTimezone: true }),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("platform_project_risk_project_idx").on(t.tenantId, t.projectId)],
);

export const platformProjectDecision = pgTable(
  "platform_project_decision",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id").notNull(),
    decision: text("decision").notNull(),
    rationale: text("rationale").notNull(),
    owner: text("owner").notNull(),
    decidedAt: timestamp("decided_at", { withTimezone: true }).notNull(),
    outcome: text("outcome").notNull(),
    relatedWork: text("related_work"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("platform_project_decision_project_idx").on(t.tenantId, t.projectId)],
);

export const platformProjectAction = pgTable(
  "platform_project_action",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id").notNull(),
    title: text("title").notNull(),
    owner: text("owner").notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("platform_project_action_project_idx").on(t.tenantId, t.projectId)],
);

export const platformProjectsDeliverySchema = {
  platformProjectMilestone,
  platformProjectRisk,
  platformProjectDecision,
  platformProjectAction,
};
