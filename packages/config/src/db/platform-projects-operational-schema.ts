/**
 * APZ Projects Release 3.0 — Operational Delivery SoR (W004).
 */

import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const platformProjectCommitment = pgTable(
  "platform_project_commitment",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id").notNull(),
    statement: text("statement").notNull(),
    ownerUserId: text("owner_user_id").notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }),
    status: text("status").notNull(),
    waiters: jsonb("waiters").$type<string[]>().notNull().default([]),
    failureConsequence: text("failure_consequence"),
    milestoneId: text("milestone_id"),
    waitingId: text("waiting_id"),
    baselineVersionId: text("baseline_version_id"),
    blockedByDependencyIds: jsonb("blocked_by_dependency_ids")
      .$type<string[]>()
      .notNull()
      .default([]),
    priority: text("priority").notNull().default("normal"),
    completionEvidence: jsonb("completion_evidence")
      .$type<unknown[]>()
      .notNull()
      .default([]),
    blocksGoLive: boolean("blocks_go_live").notNull().default(false),
    cancelReason: text("cancel_reason"),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("platform_project_commitment_project_idx").on(t.tenantId, t.projectId)],
);

export const platformProjectWaiting = pgTable(
  "platform_project_waiting",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id").notNull(),
    subject: text("subject").notNull(),
    category: text("category").notNull(),
    since: timestamp("since", { withTimezone: true }).notNull(),
    chaseOwnerUserId: text("chase_owner_user_id").notNull(),
    status: text("status").notNull(),
    partyLabel: text("party_label"),
    slaDays: integer("sla_days").notNull().default(7),
    failureConsequence: text("failure_consequence"),
    linkedCommitmentId: text("linked_commitment_id"),
    linkedDecisionId: text("linked_decision_id"),
    linkedMilestoneId: text("linked_milestone_id"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolveNote: text("resolve_note"),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("platform_project_waiting_project_idx").on(t.tenantId, t.projectId)],
);

export const platformProjectDependency = pgTable(
  "platform_project_dependency",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id").notNull(),
    fromRef: jsonb("from_ref").$type<Record<string, unknown>>().notNull(),
    toRef: jsonb("to_ref").$type<Record<string, unknown>>().notNull(),
    kind: text("kind").notNull(),
    status: text("status").notNull(),
    failureConsequence: text("failure_consequence"),
    ownerUserId: text("owner_user_id"),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("platform_project_dependency_project_idx").on(t.tenantId, t.projectId)],
);

export const platformProjectOpsDecision = pgTable(
  "platform_project_ops_decision",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id").notNull(),
    title: text("title").notNull(),
    status: text("status").notNull(),
    decisionMakerUserId: text("decision_maker_user_id").notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }),
    context: text("context"),
    outcome: text("outcome"),
    failureConsequence: text("failure_consequence"),
    links: jsonb("links").$type<unknown[]>().notNull().default([]),
    deferReason: text("defer_reason"),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("platform_project_ops_decision_project_idx").on(t.tenantId, t.projectId),
  ],
);

export const platformProjectCheckpoint = pgTable(
  "platform_project_checkpoint",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id").notNull(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    status: text("status").notNull(),
    requiredByProfile: boolean("required_by_profile").notNull().default(true),
    releaseClass: boolean("release_class").notNull().default(false),
    workflowBinding: text("workflow_binding"),
    dueAt: timestamp("due_at", { withTimezone: true }),
    anchorMilestoneId: text("anchor_milestone_id"),
    decisionId: text("decision_id"),
    waiverActor: text("waiver_actor"),
    waiverReason: text("waiver_reason"),
    waivedAt: timestamp("waived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("platform_project_checkpoint_project_idx").on(t.tenantId, t.projectId)],
);

export const platformProjectException = pgTable(
  "platform_project_exception",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id").notNull(),
    type: text("type").notNull(),
    severity: text("severity").notNull(),
    status: text("status").notNull(),
    outcome: text("outcome"),
    subjectRef: jsonb("subject_ref").$type<Record<string, string>>().notNull(),
    detectedAt: timestamp("detected_at", { withTimezone: true }).notNull(),
    reason: text("reason").notNull(),
    impactSummary: text("impact_summary").notNull(),
    failureConsequence: text("failure_consequence"),
    requiredDecisionId: text("required_decision_id"),
    escalationState: text("escalation_state").notNull().default("none"),
    resolutionNote: text("resolution_note"),
    concludedAt: timestamp("concluded_at", { withTimezone: true }),
    concludedBy: text("concluded_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("platform_project_exception_project_idx").on(t.tenantId, t.projectId)],
);

export const platformProjectOperationalHistory = pgTable(
  "platform_project_operational_history",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id").notNull(),
    objectType: text("object_type").notNull(),
    objectId: text("object_id").notNull(),
    kind: text("kind").notNull(),
    summary: text("summary").notNull(),
    detail: text("detail"),
    actorUserId: text("actor_user_id").notNull(),
    at: timestamp("at", { withTimezone: true }).notNull(),
  },
  (t) => [
    index("platform_project_ops_history_object_idx").on(
      t.tenantId,
      t.projectId,
      t.objectType,
      t.objectId,
    ),
  ],
);

/** Risk extensions for W004 (failure consequence + watch band). */
export const platformProjectsOperationalSchema = {
  platformProjectCommitment,
  platformProjectWaiting,
  platformProjectDependency,
  platformProjectOpsDecision,
  platformProjectCheckpoint,
  platformProjectException,
  platformProjectOperationalHistory,
} as const;
