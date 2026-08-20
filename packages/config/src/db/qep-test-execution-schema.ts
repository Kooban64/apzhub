/**
 * QEP Test Execution metadata schema (APZQEP-ENG-100D, OES-ENG-090A PART-03).
 * Platform metadata SoR for Test Execution aggregates — domain rules remain in
 * `@apzhub/qep-test-execution`.
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

export const qepTestExecution = pgTable(
  "qep_test_execution",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    executionNumber: text("execution_number").notNull(),
    projectId: text("project_id").notNull(),
    workspaceId: text("workspace_id").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    mode: varchar("mode", { length: 32 }).notNull(),
    outcome: varchar("outcome", { length: 32 }),
    preReviewDerivedOutcome: varchar("pre_review_derived_outcome", { length: 32 }),
    planRefCapability: text("plan_ref_capability"),
    planRefId: text("plan_ref_id"),
    planRefVersionLabel: text("plan_ref_version_label"),
    specRefCapability: text("spec_ref_capability"),
    specRefId: text("spec_ref_id"),
    specRefVersionLabel: text("spec_ref_version_label"),
    planItemId: text("plan_item_id"),
    contextJson: jsonb("context_json")
      .$type<Record<string, string>>()
      .notNull()
      .default({}),
    ownerId: text("owner_id").notNull(),
    executorId: text("executor_id"),
    reviewerId: text("reviewer_id"),
    agentIdentity: text("agent_identity"),
    assignmentUpdatedAt: timestamp("assignment_updated_at", {
      withTimezone: true,
    }).notNull(),
    assignmentUpdatedBy: text("assignment_updated_by").notNull(),
    blockReason: text("block_reason"),
    cancelReason: text("cancel_reason"),
    supersedesId: text("supersedes_id"),
    supersededById: text("superseded_by_id"),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: text("updated_by").notNull(),
    correlationId: text("correlation_id"),
    applicationId: text("application_id"),
  },
  (table) => [
    uniqueIndex("qep_test_execution_tenant_number_uidx").on(
      table.tenantId,
      table.executionNumber,
    ),
    index("qep_test_execution_tenant_id_idx").on(table.tenantId, table.id),
    index("qep_test_execution_tenant_status_idx").on(table.tenantId, table.status),
    index("qep_test_execution_tenant_executor_idx").on(
      table.tenantId,
      table.executorId,
    ),
    index("qep_test_execution_tenant_owner_idx").on(table.tenantId, table.ownerId),
    index("qep_test_execution_tenant_reviewer_idx").on(
      table.tenantId,
      table.reviewerId,
    ),
    index("qep_test_execution_tenant_plan_ref_idx").on(table.tenantId, table.planRefId),
    index("qep_test_execution_tenant_spec_ref_idx").on(table.tenantId, table.specRefId),
    index("qep_test_execution_review_queue_idx").on(table.tenantId, table.status),
    index("qep_test_execution_tenant_updated_idx").on(table.tenantId, table.updatedAt),
  ],
);

export const qepTestExecutionManifest = pgTable(
  "qep_test_execution_manifest",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    executionId: text("execution_id")
      .notNull()
      .references(() => qepTestExecution.id, { onDelete: "cascade" }),
    contentHash: text("content_hash").notNull(),
    sealedAt: timestamp("sealed_at", { withTimezone: true }).notNull(),
    sealedBy: text("sealed_by").notNull(),
    preconditionsJson: jsonb("preconditions_json")
      .$type<string[]>()
      .notNull()
      .default([]),
    stepsJson: jsonb("steps_json")
      .$type<
        {
          order: number;
          instruction: string;
          expectedResult: string;
          preconditions: string[];
          requireActualResult: boolean;
          allowUnordered: boolean;
          testDataRef?: string;
        }[]
      >()
      .notNull()
      .default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("qep_test_execution_manifest_execution_uidx").on(table.executionId),
    index("qep_test_execution_manifest_tenant_idx").on(
      table.tenantId,
      table.executionId,
    ),
  ],
);

export const qepTestExecutionStep = pgTable(
  "qep_test_execution_step",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    executionId: text("execution_id")
      .notNull()
      .references(() => qepTestExecution.id, { onDelete: "cascade" }),
    order: integer("order").notNull(),
    instruction: text("instruction").notNull(),
    expectedResult: text("expected_result").notNull(),
    preconditionsJson: jsonb("preconditions_json")
      .$type<string[]>()
      .notNull()
      .default([]),
    requireActualResult: boolean("require_actual_result").notNull().default(true),
    allowUnordered: boolean("allow_unordered").notNull().default(false),
    actualResult: text("actual_result"),
    outcome: varchar("outcome", { length: 32 }),
    evidenceIdsJson: jsonb("evidence_ids_json").$type<string[]>().notNull().default([]),
    skipReason: text("skip_reason"),
    blockReason: text("block_reason"),
    notApplicableReason: text("not_applicable_reason"),
    comment: text("comment"),
    attemptCount: integer("attempt_count").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("qep_test_execution_step_order_uidx").on(
      table.tenantId,
      table.executionId,
      table.order,
    ),
    index("qep_test_execution_step_execution_idx").on(
      table.tenantId,
      table.executionId,
    ),
  ],
);

export const qepTestExecutionObservation = pgTable(
  "qep_test_execution_observation",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    executionId: text("execution_id")
      .notNull()
      .references(() => qepTestExecution.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    actorUserId: text("actor_user_id").notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
    severityHint: varchar("severity_hint", { length: 16 }),
    structuredJson: jsonb("structured_json").$type<Record<string, string>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("qep_test_execution_observation_execution_idx").on(
      table.tenantId,
      table.executionId,
    ),
  ],
);

export const qepTestExecutionEvidenceReference = pgTable(
  "qep_test_execution_evidence_reference",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    executionId: text("execution_id")
      .notNull()
      .references(() => qepTestExecution.id, { onDelete: "cascade" }),
    uri: text("uri").notNull(),
    integrityHash: text("integrity_hash"),
    associatedAt: timestamp("associated_at", { withTimezone: true }).notNull(),
    associatedBy: text("associated_by").notNull(),
    stepOrder: integer("step_order"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("qep_test_execution_evidence_reference_execution_idx").on(
      table.tenantId,
      table.executionId,
    ),
  ],
);

export const qepTestExecutionReview = pgTable(
  "qep_test_execution_review",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    executionId: text("execution_id")
      .notNull()
      .references(() => qepTestExecution.id, { onDelete: "cascade" }),
    reviewerId: text("reviewer_id").notNull(),
    decision: varchar("decision", { length: 16 }).notNull(),
    reason: text("reason"),
    decidedAt: timestamp("decided_at", { withTimezone: true }).notNull(),
    preReviewDerivedOutcome: varchar("pre_review_derived_outcome", {
      length: 32,
    }).notNull(),
    outcomeOverride: varchar("outcome_override", { length: 32 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("qep_test_execution_review_execution_idx").on(
      table.tenantId,
      table.executionId,
    ),
  ],
);

export const qepTestExecutionExternalSubmission = pgTable(
  "qep_test_execution_external_submission",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    executionId: text("execution_id")
      .notNull()
      .references(() => qepTestExecution.id, { onDelete: "cascade" }),
    sourceSystemId: text("source_system_id").notNull(),
    agentIdentity: text("agent_identity").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    payloadHash: text("payload_hash").notNull(),
    signatureMetadata: text("signature_metadata"),
    isComplete: boolean("is_complete").notNull().default(false),
    correlationId: text("correlation_id"),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull(),
    receivedBy: text("received_by").notNull(),
    quarantineReason: text("quarantine_reason"),
  },
  (table) => [
    uniqueIndex("qep_test_execution_external_submission_idem_uidx").on(
      table.tenantId,
      table.sourceSystemId,
      table.idempotencyKey,
    ),
    index("qep_test_execution_external_submission_execution_idx").on(
      table.tenantId,
      table.executionId,
    ),
  ],
);

export const qepTestExecutionHistory = pgTable(
  "qep_test_execution_history",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    executionId: text("execution_id")
      .notNull()
      .references(() => qepTestExecution.id, { onDelete: "cascade" }),
    sequence: integer("sequence").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    actorUserId: text("actor_user_id").notNull(),
    action: text("action").notNull(),
    summary: text("summary").notNull(),
    fromStatus: varchar("from_status", { length: 32 }),
    toStatus: varchar("to_status", { length: 32 }),
    correlationId: text("correlation_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("qep_test_execution_history_seq_uidx").on(
      table.tenantId,
      table.executionId,
      table.sequence,
    ),
    index("qep_test_execution_history_execution_idx").on(
      table.tenantId,
      table.executionId,
    ),
  ],
);

export const qepTestExecutionAudit = pgTable(
  "qep_test_execution_audit",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    executionId: text("execution_id").notNull(),
    action: text("action").notNull(),
    actorUserId: text("actor_user_id").notNull(),
    correlationId: text("correlation_id").notNull(),
    priorStatus: varchar("prior_status", { length: 32 }),
    resultingStatus: varchar("resulting_status", { length: 32 }),
    reason: text("reason"),
    detailsJson: jsonb("details_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("qep_test_execution_audit_tenant_idx").on(table.tenantId, table.executionId),
    index("qep_test_execution_audit_created_idx").on(table.tenantId, table.createdAt),
  ],
);

export const qepTestExecutionOutbox = pgTable(
  "qep_test_execution_outbox",
  {
    outboxEventId: text("outbox_event_id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    executionId: text("execution_id").notNull(),
    eventType: varchar("event_type", { length: 128 }).notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    attemptCount: integer("attempt_count").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(5),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }),
    lastError: text("last_error"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    correlationId: text("correlation_id"),
  },
  (table) => [
    index("qep_test_execution_outbox_tenant_idx").on(table.tenantId),
    index("qep_test_execution_outbox_execution_idx").on(
      table.tenantId,
      table.executionId,
    ),
    index("qep_test_execution_outbox_status_idx").on(table.status),
    index("qep_test_execution_outbox_claim_idx").on(
      table.status,
      table.nextAttemptAt,
      table.createdAt,
    ),
  ],
);

export const qepTestExecutionSchema = {
  qepTestExecution,
  qepTestExecutionManifest,
  qepTestExecutionStep,
  qepTestExecutionObservation,
  qepTestExecutionEvidenceReference,
  qepTestExecutionReview,
  qepTestExecutionExternalSubmission,
  qepTestExecutionHistory,
  qepTestExecutionAudit,
  qepTestExecutionOutbox,
};
