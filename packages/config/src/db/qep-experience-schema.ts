/**
 * APZQEP Phase 5 — Exploratory Session, Experience Plan, UI/UX Verification Activity,
 * and shared quality capture. Evidence and Defect remain existing SoRs.
 */
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const qepExploratorySession = pgTable(
  "qep_exploratory_session",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    number: varchar("number", { length: 32 }).notNull(),
    name: text("name").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    testerId: text("tester_id").notNull(),
    testerName: text("tester_name"),
    environmentId: text("environment_id"),
    environmentName: text("environment_name"),
    mission: text("mission").notNull(),
    scope: text("scope").notNull(),
    sessionNotes: text("session_notes"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    pausedAt: timestamp("paused_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    elapsedMs: integer("elapsed_ms").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (t) => ({
    numberUidx: uniqueIndex("qep_exploratory_session_number_uidx").on(
      t.tenantId,
      t.applicationId,
      t.number,
    ),
    appIdx: index("qep_exploratory_session_app_idx").on(t.tenantId, t.applicationId),
  }),
);

export const qepExploratoryArea = pgTable(
  "qep_exploratory_area",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    sessionId: text("session_id").notNull(),
    prompt: text("prompt").notNull(),
    sequence: integer("sequence").notNull().default(0),
    explored: boolean("explored").notNull().default(false),
    exploredAt: timestamp("explored_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
  },
  (t) => ({
    sessionIdx: index("qep_exploratory_area_session_idx").on(t.tenantId, t.sessionId),
  }),
);

export const qepExperiencePlan = pgTable(
  "qep_experience_plan",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    number: varchar("number", { length: 32 }).notNull(),
    name: text("name").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    ownerId: text("owner_id").notNull(),
    ownerName: text("owner_name"),
    environmentId: text("environment_id"),
    environmentName: text("environment_name"),
    mission: text("mission").notNull(),
    scope: text("scope").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (t) => ({
    numberUidx: uniqueIndex("qep_experience_plan_number_uidx").on(
      t.tenantId,
      t.applicationId,
      t.number,
    ),
    appIdx: index("qep_experience_plan_app_idx").on(t.tenantId, t.applicationId),
  }),
);

export const qepExperiencePlanDiscipline = pgTable(
  "qep_experience_plan_discipline",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    planId: text("plan_id").notNull(),
    discipline: varchar("discipline", { length: 32 }).notNull(),
    sequence: integer("sequence").notNull().default(0),
  },
  (t) => ({
    planUidx: uniqueIndex("qep_experience_plan_discipline_uidx").on(
      t.planId,
      t.discipline,
    ),
  }),
);

export const qepExperienceContext = pgTable(
  "qep_experience_context",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    planId: text("plan_id").notNull(),
    label: text("label").notNull(),
    deviceClass: varchar("device_class", { length: 16 }).notNull(),
    viewportWidth: integer("viewport_width"),
    viewportHeight: integer("viewport_height"),
    orientation: varchar("orientation", { length: 16 }),
    browser: text("browser"),
    browserVersion: text("browser_version"),
    operatingSystem: text("operating_system"),
    deviceProfile: text("device_profile"),
    sequence: integer("sequence").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
  },
  (t) => ({
    planIdx: index("qep_experience_context_plan_idx").on(t.tenantId, t.planId),
  }),
);

export const qepExperienceCriterion = pgTable(
  "qep_experience_criterion",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    planId: text("plan_id").notNull(),
    discipline: varchar("discipline", { length: 32 }).notNull(),
    statement: text("statement").notNull(),
    sequence: integer("sequence").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
  },
  (t) => ({
    planIdx: index("qep_experience_criterion_plan_idx").on(t.tenantId, t.planId),
  }),
);

export const qepExperienceVerificationActivity = pgTable(
  "qep_experience_verification_activity",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    planId: text("plan_id").notNull(),
    number: varchar("number", { length: 32 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    testerId: text("tester_id").notNull(),
    testerName: text("tester_name"),
    currentContextId: text("current_context_id"),
    environmentId: text("environment_id"),
    environmentName: text("environment_name"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    pausedAt: timestamp("paused_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    elapsedMs: integer("elapsed_ms").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (t) => ({
    numberUidx: uniqueIndex("qep_experience_activity_number_uidx").on(
      t.tenantId,
      t.applicationId,
      t.number,
    ),
    planIdx: index("qep_experience_activity_plan_idx").on(t.tenantId, t.planId),
  }),
);

export const qepExperienceCriterionResult = pgTable(
  "qep_experience_criterion_result",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    activityId: text("activity_id").notNull(),
    criterionId: text("criterion_id").notNull(),
    contextId: text("context_id").notNull(),
    state: varchar("state", { length: 32 }).notNull(),
    concernFound: boolean("concern_found").notNull().default(false),
    note: text("note"),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
    recordedBy: text("recorded_by").notNull(),
  },
  (t) => ({
    uniqueResult: uniqueIndex("qep_experience_criterion_result_uidx").on(
      t.activityId,
      t.criterionId,
      t.contextId,
    ),
    activityIdx: index("qep_experience_criterion_result_activity_idx").on(
      t.tenantId,
      t.activityId,
    ),
  }),
);

export const qepExperienceContextActivity = pgTable(
  "qep_experience_context_activity",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    activityId: text("activity_id").notNull(),
    contextId: text("context_id").notNull(),
    activatedAt: timestamp("activated_at", { withTimezone: true }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => ({
    uniqueCtx: uniqueIndex("qep_experience_context_activity_uidx").on(
      t.activityId,
      t.contextId,
    ),
  }),
);

export const qepQualityObservation = pgTable(
  "qep_quality_observation",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    hostKind: varchar("host_kind", { length: 32 }).notNull(),
    hostId: text("host_id").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    contextId: text("context_id"),
    criterionId: text("criterion_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
  },
  (t) => ({
    hostIdx: index("qep_quality_observation_host_idx").on(
      t.tenantId,
      t.hostKind,
      t.hostId,
    ),
  }),
);

export const qepQualityIssue = pgTable(
  "qep_quality_issue",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    hostKind: varchar("host_kind", { length: 32 }).notNull(),
    hostId: text("host_id").notNull(),
    observationId: text("observation_id"),
    title: text("title").notNull(),
    body: text("body").notNull(),
    priority: varchar("priority", { length: 16 }).notNull().default("medium"),
    status: varchar("status", { length: 32 }).notNull(),
    contextId: text("context_id"),
    criterionId: text("criterion_id"),
    defectId: text("defect_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (t) => ({
    hostIdx: index("qep_quality_issue_host_idx").on(t.tenantId, t.hostKind, t.hostId),
  }),
);

export const qepQualityNote = pgTable(
  "qep_quality_note",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    hostKind: varchar("host_kind", { length: 32 }).notNull(),
    hostId: text("host_id").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
  },
  (t) => ({
    hostIdx: index("qep_quality_note_host_idx").on(t.tenantId, t.hostKind, t.hostId),
  }),
);

export const qepQualityEvidenceLink = pgTable(
  "qep_quality_evidence_link",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    evidenceId: text("evidence_id").notNull(),
    targetKind: varchar("target_kind", { length: 32 }).notNull(),
    targetId: text("target_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
  },
  (t) => ({
    uniqueLink: uniqueIndex("qep_quality_evidence_link_uidx").on(
      t.evidenceId,
      t.targetKind,
      t.targetId,
    ),
    targetIdx: index("qep_quality_evidence_link_target_idx").on(
      t.tenantId,
      t.targetKind,
      t.targetId,
    ),
  }),
);

export const qepExploratorySessionHistory = pgTable(
  "qep_exploratory_session_history",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    sessionId: text("session_id").notNull(),
    eventType: varchar("event_type", { length: 64 }).notNull(),
    detail: text("detail"),
    payload: jsonb("payload"),
    actorId: text("actor_id").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    sessionIdx: index("qep_exploratory_session_history_idx").on(
      t.tenantId,
      t.sessionId,
    ),
  }),
);

export const qepExperiencePlanHistory = pgTable(
  "qep_experience_plan_history",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    planId: text("plan_id").notNull(),
    eventType: varchar("event_type", { length: 64 }).notNull(),
    detail: text("detail"),
    payload: jsonb("payload"),
    actorId: text("actor_id").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    planIdx: index("qep_experience_plan_history_idx").on(t.tenantId, t.planId),
  }),
);

export const qepExperienceActivityHistory = pgTable(
  "qep_experience_activity_history",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    activityId: text("activity_id").notNull(),
    eventType: varchar("event_type", { length: 64 }).notNull(),
    detail: text("detail"),
    payload: jsonb("payload"),
    actorId: text("actor_id").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    activityIdx: index("qep_experience_activity_history_idx").on(
      t.tenantId,
      t.activityId,
    ),
  }),
);

export const qepQualityTraceLink = pgTable(
  "qep_quality_trace_link",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    fromKind: varchar("from_kind", { length: 32 }).notNull(),
    fromId: text("from_id").notNull(),
    toKind: varchar("to_kind", { length: 32 }).notNull(),
    toId: text("to_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
  },
  (t) => ({
    uniqueTrace: uniqueIndex("qep_quality_trace_link_uidx").on(
      t.fromKind,
      t.fromId,
      t.toKind,
      t.toId,
    ),
    fromIdx: index("qep_quality_trace_link_from_idx").on(
      t.tenantId,
      t.fromKind,
      t.fromId,
    ),
  }),
);

export const qepExperienceSchema = {
  qepExploratorySession,
  qepExploratoryArea,
  qepExperiencePlan,
  qepExperiencePlanDiscipline,
  qepExperienceContext,
  qepExperienceCriterion,
  qepExperienceVerificationActivity,
  qepExperienceCriterionResult,
  qepExperienceContextActivity,
  qepQualityObservation,
  qepQualityIssue,
  qepQualityNote,
  qepQualityEvidenceLink,
  qepExploratorySessionHistory,
  qepExperiencePlanHistory,
  qepExperienceActivityHistory,
  qepQualityTraceLink,
};
