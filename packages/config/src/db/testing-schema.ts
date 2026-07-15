import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

/** Shared column helpers for APZ TCMS product tables (APZTCMS-003). */

function tenantOrgColumns() {
  return {
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
  };
}

function auditRevisionColumns() {
  return {
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by"),
    updatedBy: text("updated_by"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  };
}

/** Requirement — traceability anchor. */
export const testingRequirement = pgTable(
  "testing_requirement",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    key: varchar("key", { length: 64 }).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    priority: varchar("priority", { length: 32 }).notNull(),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    workItemRefs: jsonb("work_item_refs")
      .$type<
        Array<{
          kind: string;
          projectRefId: string;
          workItemId: string;
          label?: string;
        }>
      >()
      .notNull()
      .default([]),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_requirement_priority_chk",
      sql`${table.priority} in ('low','medium','high','critical')`,
    ),
    check("testing_requirement_revision_chk", sql`${table.revision} >= 1`),
    uniqueIndex("testing_requirement_tenant_key_uidx").on(table.tenantId, table.key),
    index("testing_requirement_tenant_idx").on(table.tenantId),
    index("testing_requirement_tenant_org_idx").on(
      table.tenantId,
      table.organisationId,
    ),
    index("testing_requirement_archived_idx").on(table.tenantId, table.archivedAt),
  ],
);

/**
 * Polymorphic work item (Feature / Epic / Story / Task) in testing context only.
 * Soft refs to Projects IDs as optional text — never authoritative copies.
 */
export const testingWorkItem = pgTable(
  "testing_work_item",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    kind: varchar("kind", { length: 32 }).notNull(),
    key: varchar("key", { length: 64 }).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    projectRefId: text("project_ref_id"),
    externalWorkItemId: text("external_work_item_id"),
    status: varchar("status", { length: 32 }).notNull().default("active"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_work_item_kind_chk",
      sql`${table.kind} in ('feature','epic','story','task')`,
    ),
    check("testing_work_item_revision_chk", sql`${table.revision} >= 1`),
    uniqueIndex("testing_work_item_tenant_key_uidx").on(table.tenantId, table.key),
    index("testing_work_item_tenant_idx").on(table.tenantId),
    index("testing_work_item_tenant_kind_idx").on(table.tenantId, table.kind),
    index("testing_work_item_project_ref_idx").on(table.tenantId, table.projectRefId),
  ],
);

/** Risk informing priority and coverage. */
export const testingRisk = pgTable(
  "testing_risk",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    key: varchar("key", { length: 64 }).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    level: varchar("level", { length: 32 }).notNull(),
    mitigationSummary: text("mitigation_summary"),
    severity: varchar("severity", { length: 32 }),
    likelihood: varchar("likelihood", { length: 32 }),
    impact: varchar("impact", { length: 32 }),
    businessCriticality: varchar("business_criticality", { length: 32 }),
    regressionImportance: varchar("regression_importance", { length: 32 }),
    ownerId: text("owner_id"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_risk_level_chk",
      sql`${table.level} in ('low','medium','high','critical')`,
    ),
    check("testing_risk_revision_chk", sql`${table.revision} >= 1`),
    uniqueIndex("testing_risk_tenant_key_uidx").on(table.tenantId, table.key),
    index("testing_risk_tenant_idx").on(table.tenantId),
    index("testing_risk_tenant_org_idx").on(table.tenantId, table.organisationId),
  ],
);

/** Test plan — scoped verification intent. */
export const testingTestPlan = pgTable(
  "testing_test_plan",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    key: varchar("key", { length: 64 }).notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: varchar("status", { length: 32 }).notNull(),
    releaseLabel: text("release_label"),
    milestoneLabel: text("milestone_label"),
    ownerId: text("owner_id"),
    assigneeId: text("assignee_id"),
    versionNumber: integer("version_number").notNull().default(1),
    parentPlanId: text("parent_plan_id"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_test_plan_status_chk",
      sql`${table.status} in ('draft','review','ready','approved','deprecated','archived')`,
    ),
    check("testing_test_plan_revision_chk", sql`${table.revision} >= 1`),
    uniqueIndex("testing_test_plan_tenant_key_uidx").on(table.tenantId, table.key),
    index("testing_test_plan_tenant_idx").on(table.tenantId),
    index("testing_test_plan_tenant_org_idx").on(table.tenantId, table.organisationId),
  ],
);

/** Test suite — reusable grouping of cases. */
export const testingTestSuite = pgTable(
  "testing_test_suite",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    key: varchar("key", { length: 64 }).notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: varchar("status", { length: 32 }).notNull(),
    isRegression: boolean("is_regression").notNull().default(false),
    ownerId: text("owner_id"),
    parentSuiteId: text("parent_suite_id"),
    sortOrder: integer("sort_order").notNull().default(0),
    versionNumber: integer("version_number").notNull().default(1),
    groupKey: varchar("group_key", { length: 128 }),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_test_suite_status_chk",
      sql`${table.status} in ('draft','review','ready','approved','deprecated','archived')`,
    ),
    check("testing_test_suite_revision_chk", sql`${table.revision} >= 1`),
    uniqueIndex("testing_test_suite_tenant_key_uidx").on(table.tenantId, table.key),
    index("testing_test_suite_tenant_idx").on(table.tenantId),
    index("testing_test_suite_parent_idx").on(table.tenantId, table.parentSuiteId),
  ],
);

/** Test case — atomic verification unit. */
export const testingTestCase = pgTable(
  "testing_test_case",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    key: varchar("key", { length: 64 }).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    status: varchar("status", { length: 32 }).notNull(),
    priority: varchar("priority", { length: 32 }).notNull(),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    estimatedMinutes: integer("estimated_minutes"),
    preconditions: text("preconditions"),
    postconditions: text("postconditions"),
    expectedResultsSummary: text("expected_results_summary"),
    templateKey: varchar("template_key", { length: 128 }),
    parameters: jsonb("parameters")
      .$type<
        Array<{
          key: string;
          label?: string;
          defaultValue?: string;
          required?: boolean;
        }>
      >()
      .notNull()
      .default([]),
    components: jsonb("components").$type<string[]>().notNull().default([]),
    ownerId: text("owner_id"),
    reviewerId: text("reviewer_id"),
    versionNumber: integer("version_number").notNull().default(1),
    parentCaseId: text("parent_case_id"),
    riskLevel: varchar("risk_level", { length: 32 }),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_test_case_status_chk",
      sql`${table.status} in ('draft','review','ready','approved','deprecated','archived')`,
    ),
    check(
      "testing_test_case_priority_chk",
      sql`${table.priority} in ('low','medium','high','critical')`,
    ),
    check("testing_test_case_revision_chk", sql`${table.revision} >= 1`),
    uniqueIndex("testing_test_case_tenant_key_uidx").on(table.tenantId, table.key),
    index("testing_test_case_tenant_idx").on(table.tenantId),
  ],
);

/** Test step — structure only (not execution results). */
export const testingTestStep = pgTable(
  "testing_test_step",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    caseId: text("case_id").notNull(),
    ordinal: integer("ordinal").notNull(),
    action: text("action").notNull(),
    expectedResult: text("expected_result").notNull(),
    dataHint: text("data_hint"),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => [
    check("testing_test_step_ordinal_chk", sql`${table.ordinal} >= 0`),
    check("testing_test_step_revision_chk", sql`${table.revision} >= 1`),
    uniqueIndex("testing_test_step_case_ordinal_uidx").on(
      table.tenantId,
      table.caseId,
      table.ordinal,
    ),
    index("testing_test_step_tenant_case_idx").on(table.tenantId, table.caseId),
  ],
);

/** Junction: plan ↔ suite. */
export const testingPlanSuite = pgTable(
  "testing_plan_suite",
  {
    tenantId: text("tenant_id").notNull(),
    planId: text("plan_id").notNull(),
    suiteId: text("suite_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.planId, table.suiteId] }),
    index("testing_plan_suite_suite_idx").on(table.tenantId, table.suiteId),
  ],
);

/** Junction: suite ↔ case. */
export const testingSuiteCase = pgTable(
  "testing_suite_case",
  {
    tenantId: text("tenant_id").notNull(),
    suiteId: text("suite_id").notNull(),
    caseId: text("case_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.suiteId, table.caseId] }),
    index("testing_suite_case_case_idx").on(table.tenantId, table.caseId),
  ],
);

/** Junction: case ↔ requirement. */
export const testingCaseRequirement = pgTable(
  "testing_case_requirement",
  {
    tenantId: text("tenant_id").notNull(),
    caseId: text("case_id").notNull(),
    requirementId: text("requirement_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.caseId, table.requirementId] }),
    index("testing_case_requirement_req_idx").on(table.tenantId, table.requirementId),
  ],
);

/** Junction: plan ↔ requirement. */
export const testingPlanRequirement = pgTable(
  "testing_plan_requirement",
  {
    tenantId: text("tenant_id").notNull(),
    planId: text("plan_id").notNull(),
    requirementId: text("requirement_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.planId, table.requirementId] }),
    index("testing_plan_requirement_req_idx").on(table.tenantId, table.requirementId),
  ],
);

/** Junction: risk ↔ requirement. */
export const testingRiskRequirement = pgTable(
  "testing_risk_requirement",
  {
    tenantId: text("tenant_id").notNull(),
    riskId: text("risk_id").notNull(),
    requirementId: text("requirement_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.riskId, table.requirementId] }),
    index("testing_risk_requirement_req_idx").on(table.tenantId, table.requirementId),
  ],
);

/** Junction: plan ↔ risk. */
export const testingPlanRisk = pgTable(
  "testing_plan_risk",
  {
    tenantId: text("tenant_id").notNull(),
    planId: text("plan_id").notNull(),
    riskId: text("risk_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.planId, table.riskId] }),
    index("testing_plan_risk_risk_idx").on(table.tenantId, table.riskId),
  ],
);

/** Regression set — designated suite set for regression campaigns. */
export const testingRegressionSet = pgTable(
  "testing_regression_set",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    key: varchar("key", { length: 64 }).notNull(),
    name: text("name").notNull(),
    description: text("description"),
    planId: text("plan_id"),
    suiteIds: jsonb("suite_ids").$type<string[]>().notNull().default([]),
    ownerId: text("owner_id"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check("testing_regression_set_revision_chk", sql`${table.revision} >= 1`),
    uniqueIndex("testing_regression_set_tenant_key_uidx").on(table.tenantId, table.key),
    index("testing_regression_set_tenant_idx").on(table.tenantId),
    index("testing_regression_set_plan_idx").on(table.tenantId, table.planId),
  ],
);

/** Execution session — metadata only (no result rows). */
export const testingExecutionSession = pgTable(
  "testing_execution_session",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    planId: text("plan_id"),
    suiteId: text("suite_id"),
    executionType: varchar("execution_type", { length: 32 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    assigneeId: text("assignee_id"),
    notes: text("notes"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_execution_session_type_chk",
      sql`${table.executionType} in ('manual','automated','hybrid')`,
    ),
    check(
      "testing_execution_session_status_chk",
      sql`${table.status} in (
        'draft','assigned','ready','in_progress','paused','blocked','completed',
        'under_review','approved','rejected','cancelled','archived',
        'planned','queued','aborted','failed'
      )`,
    ),
    check("testing_execution_session_revision_chk", sql`${table.revision} >= 1`),
    index("testing_execution_session_tenant_idx").on(table.tenantId),
    index("testing_execution_session_plan_idx").on(table.tenantId, table.planId),
    index("testing_execution_session_status_idx").on(table.tenantId, table.status),
  ],
);

/**
 * Append-only session history events (not result rows).
 * No update/delete of payload; soft-archive not applicable — immutable.
 */
export const testingExecutionHistory = pgTable(
  "testing_execution_history",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    sessionId: text("session_id").notNull(),
    eventType: varchar("event_type", { length: 64 }).notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    actorUserId: text("actor_user_id"),
    correlationId: text("correlation_id"),
    summary: text("summary").notNull(),
    details: jsonb("details").$type<Record<string, unknown>>().notNull().default({}),
  },
  (table) => [
    index("testing_execution_history_tenant_session_idx").on(
      table.tenantId,
      table.sessionId,
    ),
    index("testing_execution_history_occurred_idx").on(
      table.tenantId,
      table.occurredAt,
    ),
  ],
);

/** Evidence — metadata only (blob refs, not upload pipeline). */
export const testingEvidence = pgTable(
  "testing_evidence",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    type: varchar("type", { length: 32 }).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    storageRef: text("storage_ref").notNull(),
    contentType: varchar("content_type", { length: 128 }),
    contentHash: text("content_hash"),
    sizeBytes: integer("size_bytes"),
    sessionId: text("session_id"),
    caseId: text("case_id"),
    stepId: text("step_id"),
    url: text("url"),
    checksum: text("checksum"),
    mimeType: varchar("mime_type", { length: 128 }),
    relationships: jsonb("relationships")
      .$type<Array<{ kind: string; targetId: string; label?: string }>>()
      .notNull()
      .default([]),
    executionId: text("execution_id"),
    lifecycleStatus: varchar("lifecycle_status", { length: 32 })
      .notNull()
      .default("pending"),
    verificationState: varchar("verification_state", { length: 64 }),
    evidenceApprovalState: varchar("evidence_approval_state", { length: 64 }),
    captureTime: timestamp("capture_time", { withTimezone: true }),
    authorUserId: text("author_user_id"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_evidence_type_chk",
      sql`${table.type} in ('screenshot','log','video','trace','report','note','attachment','url','other')`,
    ),
    check(
      "testing_evidence_lifecycle_chk",
      sql`${table.lifecycleStatus} in ('pending','captured','submitted','verified','rejected','approved','archived')`,
    ),
    check("testing_evidence_revision_chk", sql`${table.revision} >= 1`),
    index("testing_evidence_tenant_idx").on(table.tenantId),
    index("testing_evidence_session_idx").on(table.tenantId, table.sessionId),
  ],
);

/** Approval decision bound to certification. */
export const testingApproval = pgTable(
  "testing_approval",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    certificationRecordId: text("certification_record_id").notNull(),
    gateId: text("gate_id"),
    status: varchar("status", { length: 32 }).notNull(),
    requestedFromUserId: text("requested_from_user_id"),
    decidedByUserId: text("decided_by_user_id"),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    comments: text("comments"),
    conditions: text("conditions"),
    signatureJson: jsonb("signature_json").$type<Record<string, unknown>>(),
    witnessesJson: jsonb("witnesses_json").$type<Array<Record<string, unknown>>>(),
    authorUserId: text("author_user_id"),
    reviewerUserId: text("reviewer_user_id"),
    approverUserId: text("approver_user_id"),
    historyJson: jsonb("history_json").$type<Array<Record<string, unknown>>>(),
    subjectKind: varchar("subject_kind", { length: 64 }),
    subjectId: text("subject_id"),
    stagesJson: jsonb("stages_json").$type<Array<Record<string, unknown>>>(),
    currentStageOrdinal: integer("current_stage_ordinal"),
    stageDecisionsJson: jsonb("stage_decisions_json").$type<
      Array<Record<string, unknown>>
    >(),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_approval_status_chk",
      sql`${table.status} in ('pending','approved','rejected','withdrawn','conditional','rework')`,
    ),
    check("testing_approval_revision_chk", sql`${table.revision} >= 1`),
    index("testing_approval_tenant_idx").on(table.tenantId),
    index("testing_approval_cert_idx").on(table.tenantId, table.certificationRecordId),
  ],
);

/** Certification record — formal release/product certification instance. */
export const testingCertificationRecord = pgTable(
  "testing_certification_record",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    key: varchar("key", { length: 64 }).notNull(),
    name: text("name").notNull(),
    status: varchar("status", { length: 64 }).notNull(),
    planId: text("plan_id"),
    productLabel: text("product_label"),
    releaseLabel: text("release_label"),
    gateIds: jsonb("gate_ids").$type<string[]>().notNull().default([]),
    approvalIds: jsonb("approval_ids").$type<string[]>().notNull().default([]),
    conditions: text("conditions"),
    certifiedAt: timestamp("certified_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    gateEvaluationIds: jsonb("gate_evaluation_ids")
      .$type<string[]>()
      .notNull()
      .default([]),
    currentRecommendation: varchar("current_recommendation", { length: 64 }),
    recommendationJson: jsonb("recommendation_json").$type<Record<string, unknown>>(),
    evidenceLinksJson: jsonb("evidence_links_json").$type<Record<string, unknown>>(),
    ruleId: text("rule_id"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_certification_status_chk",
      sql`${table.status} in (
        'draft','preparing','awaiting_evidence','awaiting_review','in_review',
        'changes_required','awaiting_approval','approved','conditionally_approved',
        'rejected','expired','archived',
        'development_ready','qa_ready','regression_ready','uat_ready',
        'production_ready','certified','failed_certification','conditional_approval'
      )`,
    ),
    check("testing_certification_revision_chk", sql`${table.revision} >= 1`),
    uniqueIndex("testing_certification_tenant_key_uidx").on(table.tenantId, table.key),
    index("testing_certification_tenant_idx").on(table.tenantId),
    index("testing_certification_status_idx").on(table.tenantId, table.status),
  ],
);

/** Configurable certification gate definition (APZTCMS-009). */
export const testingCertificationGateDefinition = pgTable(
  "testing_certification_gate_definition",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    gateKey: varchar("gate_key", { length: 64 }).notNull(),
    name: text("name").notNull(),
    description: text("description"),
    kind: varchar("kind", { length: 64 }).notNull().default("builtin"),
    required: boolean("required").notNull().default(true),
    configJson: jsonb("config_json").$type<Record<string, unknown>>().default({}),
    templateKey: text("template_key"),
    ordinal: integer("ordinal").default(0),
    enabled: boolean("enabled").notNull().default(true),
    ...auditRevisionColumns(),
  },
  (table) => [
    check("testing_cert_gate_def_revision_chk", sql`${table.revision} >= 1`),
    index("testing_cert_gate_def_tenant_idx").on(table.tenantId),
    index("testing_cert_gate_def_key_idx").on(table.tenantId, table.gateKey),
  ],
);

/** Certification gate evaluation (APZTCMS-009). */
export const testingCertificationGateEvaluation = pgTable(
  "testing_certification_gate_evaluation",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    certificationRecordId: text("certification_record_id").notNull(),
    gateDefinitionId: text("gate_definition_id"),
    gateKey: varchar("gate_key", { length: 64 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    reason: text("reason").notNull(),
    supportingEvidence: jsonb("supporting_evidence")
      .$type<string[]>()
      .notNull()
      .default([]),
    evaluatedAt: timestamp("evaluated_at", { withTimezone: true }).notNull(),
    evaluatorUserId: text("evaluator_user_id"),
    traceabilityRefs: jsonb("traceability_refs")
      .$type<string[]>()
      .notNull()
      .default([]),
    detailsJson: jsonb("details_json").$type<Record<string, unknown>>().default({}),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_cert_gate_eval_status_chk",
      sql`${table.status} in ('pass','fail','warning','not_applicable','unknown','pending')`,
    ),
    check("testing_cert_gate_eval_revision_chk", sql`${table.revision} >= 1`),
    index("testing_cert_gate_eval_tenant_idx").on(table.tenantId),
    index("testing_cert_gate_eval_cert_idx").on(
      table.tenantId,
      table.certificationRecordId,
    ),
  ],
);

/** Certification rule — which gates apply (APZTCMS-009). */
export const testingCertificationRule = pgTable(
  "testing_certification_rule",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    key: varchar("key", { length: 64 }).notNull(),
    name: text("name").notNull(),
    certificationRecordId: text("certification_record_id"),
    planId: text("plan_id"),
    productLabel: text("product_label"),
    requiredGateKeys: jsonb("required_gate_keys")
      .$type<string[]>()
      .notNull()
      .default([]),
    optionalGateKeys: jsonb("optional_gate_keys")
      .$type<string[]>()
      .notNull()
      .default([]),
    approvalStagesJson: jsonb("approval_stages_json").$type<
      Array<Record<string, unknown>>
    >(),
    enabled: boolean("enabled").notNull().default(true),
    configJson: jsonb("config_json").$type<Record<string, unknown>>().default({}),
    ...auditRevisionColumns(),
  },
  (table) => [
    check("testing_cert_rule_revision_chk", sql`${table.revision} >= 1`),
    uniqueIndex("testing_cert_rule_tenant_key_uidx").on(table.tenantId, table.key),
    index("testing_cert_rule_tenant_idx").on(table.tenantId),
    index("testing_cert_rule_cert_idx").on(table.tenantId, table.certificationRecordId),
  ],
);

/** Append-only certification audit (APZTCMS-009). */
export const testingCertificationAudit = pgTable(
  "testing_certification_audit",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    certificationRecordId: text("certification_record_id").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    actorUserId: text("actor_user_id"),
    action: text("action").notNull(),
    summary: text("summary").notNull(),
    detailsJson: jsonb("details_json").$type<Record<string, unknown>>().default({}),
    correlationId: text("correlation_id"),
  },
  (table) => [
    index("testing_cert_audit_tenant_idx").on(table.tenantId),
    index("testing_cert_audit_cert_idx").on(table.tenantId, table.certificationRecordId),
    index("testing_cert_audit_occurred_idx").on(table.tenantId, table.occurredAt),
  ],
);

/** Append-only certification history / transitions (APZTCMS-009). */
export const testingCertificationHistory = pgTable(
  "testing_certification_history",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    certificationRecordId: text("certification_record_id").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    actorUserId: text("actor_user_id"),
    fromStatus: varchar("from_status", { length: 64 }),
    toStatus: varchar("to_status", { length: 64 }).notNull(),
    reason: text("reason"),
    correlationId: text("correlation_id"),
    detailsJson: jsonb("details_json").$type<Record<string, unknown>>().default({}),
  },
  (table) => [
    index("testing_cert_history_tenant_idx").on(table.tenantId),
    index("testing_cert_history_cert_idx").on(
      table.tenantId,
      table.certificationRecordId,
    ),
    index("testing_cert_history_occurred_idx").on(table.tenantId, table.occurredAt),
  ],
);

/** Release readiness assessment snapshot. */
export const testingReleaseReadiness = pgTable(
  "testing_release_readiness",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    certificationRecordId: text("certification_record_id").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    summary: text("summary").notNull(),
    blockingGateIds: jsonb("blocking_gate_ids").$type<string[]>().notNull().default([]),
    assessedAt: timestamp("assessed_at", { withTimezone: true }).notNull(),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_release_readiness_status_chk",
      sql`${table.status} in ('not_ready','partially_ready','ready','blocked')`,
    ),
    check("testing_release_readiness_revision_chk", sql`${table.revision} >= 1`),
    index("testing_release_readiness_tenant_idx").on(table.tenantId),
    index("testing_release_readiness_cert_idx").on(
      table.tenantId,
      table.certificationRecordId,
    ),
  ],
);

/** Aggregate coverage metadata (not engine coverage files). */
export const testingCoverageRecord = pgTable(
  "testing_coverage_record",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    kind: varchar("kind", { length: 32 }).notNull(),
    subjectId: text("subject_id").notNull(),
    coveredCount: integer("covered_count").notNull().default(0),
    totalCount: integer("total_count").notNull().default(0),
    percentage: real("percentage").notNull().default(0),
    computedAt: timestamp("computed_at", { withTimezone: true }).notNull(),
    planId: text("plan_id"),
    suiteId: text("suite_id"),
    requirementId: text("requirement_id"),
    riskId: text("risk_id"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_coverage_kind_chk",
      sql`${table.kind} in ('requirement','risk','suite','plan','code_ref','feature','story','case','manual','automation','execution','release')`,
    ),
    check("testing_coverage_revision_chk", sql`${table.revision} >= 1`),
    index("testing_coverage_tenant_idx").on(table.tenantId),
    index("testing_coverage_subject_idx").on(
      table.tenantId,
      table.kind,
      table.subjectId,
    ),
  ],
);

/** Defect link — platform-owned defect relationship metadata (APZTCMS-008). */
export const testingDefectLink = pgTable(
  "testing_defect_link",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    providerKind: varchar("provider_kind", { length: 32 }).notNull(),
    providerKey: text("provider_key"),
    status: varchar("status", { length: 32 }).notNull(),
    internalRef: text("internal_ref"),
    externalRef: text("external_ref"),
    severity: varchar("severity", { length: 32 }),
    priority: varchar("priority", { length: 32 }),
    ownerUserId: text("owner_user_id"),
    resolution: text("resolution"),
    verificationState: text("verification_state"),
    summary: text("summary"),
    url: text("url"),
    requirementIds: jsonb("requirement_ids").$type<string[]>().notNull().default([]),
    planIds: jsonb("plan_ids").$type<string[]>().notNull().default([]),
    suiteIds: jsonb("suite_ids").$type<string[]>().notNull().default([]),
    caseIds: jsonb("case_ids").$type<string[]>().notNull().default([]),
    manualExecutionIds: jsonb("manual_execution_ids")
      .$type<string[]>()
      .notNull()
      .default([]),
    automationExecutionIds: jsonb("automation_execution_ids")
      .$type<string[]>()
      .notNull()
      .default([]),
    evidenceIds: jsonb("evidence_ids").$type<string[]>().notNull().default([]),
    releaseLabel: text("release_label"),
    riskIds: jsonb("risk_ids").$type<string[]>().notNull().default([]),
    workItemRefs: jsonb("work_item_refs")
      .$type<
        Array<{
          kind: string;
          projectRefId: string;
          workItemId: string;
          label?: string;
        }>
      >()
      .notNull()
      .default([]),
    target: varchar("target", { length: 32 }),
    externalId: text("external_id"),
    resultId: text("result_id"),
    runId: text("run_id"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_defect_link_provider_chk",
      sql`${table.providerKind} in ('internal','projects','support','external_generic')`,
    ),
    check(
      "testing_defect_link_status_chk",
      sql`${table.status} in ('open','in_progress','resolved','verified','closed','reopened','cancelled')`,
    ),
    check("testing_defect_link_revision_chk", sql`${table.revision} >= 1`),
    index("testing_defect_link_tenant_idx").on(table.tenantId),
    index("testing_defect_link_status_idx").on(table.tenantId, table.status),
    index("testing_defect_link_provider_idx").on(table.tenantId, table.providerKind),
    index("testing_defect_link_release_idx").on(table.tenantId, table.releaseLabel),
  ],
);

/** Computed quality intelligence snapshot (APZTCMS-008). */
export const testingQualitySnapshot = pgTable(
  "testing_quality_snapshot",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    scope: jsonb("scope").$type<Record<string, unknown>>().notNull().default({}),
    metrics: jsonb("metrics").$type<Record<string, unknown>>().notNull().default({}),
    computedAt: timestamp("computed_at", { withTimezone: true }).notNull(),
    label: text("label"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check("testing_quality_snapshot_revision_chk", sql`${table.revision} >= 1`),
    index("testing_quality_snapshot_tenant_idx").on(table.tenantId),
    index("testing_quality_snapshot_computed_idx").on(table.tenantId, table.computedAt),
  ],
);

/** Regression analysis result for reproducibility (APZTCMS-008). */
export const testingRegressionAnalysis = pgTable(
  "testing_regression_analysis",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    baselineLabel: text("baseline_label").notNull(),
    currentLabel: text("current_label").notNull(),
    newFailures: jsonb("new_failures").$type<string[]>().notNull().default([]),
    resolvedFailures: jsonb("resolved_failures").$type<string[]>().notNull().default([]),
    reopenedFailures: jsonb("reopened_failures").$type<string[]>().notNull().default([]),
    coverageDelta: real("coverage_delta").notNull().default(0),
    executionDelta: real("execution_delta").notNull().default(0),
    computedAt: timestamp("computed_at", { withTimezone: true }).notNull(),
    details: jsonb("details").$type<Record<string, unknown>>().default({}),
    ...auditRevisionColumns(),
  },
  (table) => [
    check("testing_regression_analysis_revision_chk", sql`${table.revision} >= 1`),
    index("testing_regression_analysis_tenant_idx").on(table.tenantId),
    index("testing_regression_analysis_computed_idx").on(
      table.tenantId,
      table.computedAt,
    ),
  ],
);

/** Automation definition — metadata only (not runners / job queues). */
export const testingAutomationDefinition = pgTable(
  "testing_automation_definition",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    key: varchar("key", { length: 64 }).notNull(),
    name: text("name").notNull(),
    description: text("description"),
    automationType: varchar("automation_type", { length: 32 }).notNull(),
    adapterSourceId: text("adapter_source_id"),
    caseId: text("case_id"),
    suiteId: text("suite_id"),
    configJson: jsonb("config_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    status: varchar("status", { length: 32 }).notNull().default("active"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_automation_type_chk",
      sql`${table.automationType} in (
        'unit','integration','e2e','api','performance','security','accessibility','other'
      )`,
    ),
    check("testing_automation_revision_chk", sql`${table.revision} >= 1`),
    uniqueIndex("testing_automation_tenant_key_uidx").on(table.tenantId, table.key),
    index("testing_automation_tenant_idx").on(table.tenantId),
  ],
);

/** Automation result import batch (APZTCMS-007). */
export const testingAutomationImport = pgTable(
  "testing_automation_import",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    adapterKind: varchar("adapter_kind", { length: 32 }).notNull(),
    adapterVersion: varchar("adapter_version", { length: 64 }).notNull(),
    externalRunRef: text("external_run_ref").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    correlationId: text("correlation_id"),
    checksum: text("checksum"),
    payloadFingerprint: text("payload_fingerprint"),
    summary: jsonb("summary").$type<Record<string, unknown>>().default({}),
    errorSummary: text("error_summary"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    canonicalSnapshot: jsonb("canonical_snapshot").$type<Record<string, unknown>>(),
    automatedExecutionId: text("automated_execution_id"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_automation_import_adapter_chk",
      sql`${table.adapterKind} in (
        'vitest','playwright','junit_xml','generic_json','generic_tap','allure_metadata'
      )`,
    ),
    check(
      "testing_automation_import_status_chk",
      sql`${table.status} in (
        'pending','validating','importing','completed','failed','duplicate','corrected'
      )`,
    ),
    check("testing_automation_import_revision_chk", sql`${table.revision} >= 1`),
    uniqueIndex("testing_automation_import_tenant_adapter_run_uidx").on(
      table.tenantId,
      table.adapterKind,
      table.externalRunRef,
    ),
    index("testing_automation_import_tenant_idx").on(table.tenantId),
    index("testing_automation_import_status_idx").on(table.tenantId, table.status),
  ],
);

/** Automated execution produced by result ingestion. */
export const testingAutomatedExecution = pgTable(
  "testing_automated_execution",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    sessionId: text("session_id"),
    importId: text("import_id").notNull(),
    automationType: varchar("automation_type", { length: 32 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    adapterSourceId: text("adapter_source_id"),
    externalRunRef: text("external_run_ref").notNull(),
    environment: jsonb("environment")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    overallStatus: varchar("overall_status", { length: 32 }).notNull(),
    durationMs: integer("duration_ms"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    adapterKind: varchar("adapter_kind", { length: 32 }).notNull(),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_automated_execution_type_chk",
      sql`${table.automationType} in (
        'unit','integration','e2e','api','performance','security','accessibility','other'
      )`,
    ),
    check(
      "testing_automated_execution_overall_chk",
      sql`${table.overallStatus} in (
        'pass','fail','skipped','blocked','timed_out','cancelled','errored','unknown'
      )`,
    ),
    check("testing_automated_execution_revision_chk", sql`${table.revision} >= 1`),
    index("testing_automated_execution_tenant_idx").on(table.tenantId),
    index("testing_automated_execution_import_idx").on(table.tenantId, table.importId),
    index("testing_automated_execution_external_idx").on(
      table.tenantId,
      table.externalRunRef,
    ),
  ],
);

/** Suite/case run row under an automated execution. */
export const testingAutomationRun = pgTable(
  "testing_automation_run",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    executionId: text("execution_id").notNull(),
    suiteKey: text("suite_key"),
    caseKey: text("case_key"),
    title: text("title").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    durationMs: integer("duration_ms"),
    message: text("message"),
    stack: text("stack"),
    result: jsonb("result").$type<Record<string, unknown>>(),
    tags: jsonb("tags").$type<string[]>().default([]),
    requirementRefs: jsonb("requirement_refs").$type<string[]>().default([]),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_automation_run_status_chk",
      sql`${table.status} in (
        'pass','fail','skipped','blocked','timed_out','cancelled','errored','unknown'
      )`,
    ),
    check("testing_automation_run_revision_chk", sql`${table.revision} >= 1`),
    index("testing_automation_run_tenant_idx").on(table.tenantId),
    index("testing_automation_run_execution_idx").on(table.tenantId, table.executionId),
  ],
);

/** Step/result item under an automation run. */
export const testingAutomationResultItem = pgTable(
  "testing_automation_result_item",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    runId: text("run_id").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    stepPayload: jsonb("step_payload").$type<Record<string, unknown>>(),
    name: text("name"),
    durationMs: integer("duration_ms"),
    message: text("message"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_automation_result_item_status_chk",
      sql`${table.status} in (
        'pass','fail','skipped','blocked','timed_out','cancelled','errored','unknown'
      )`,
    ),
    check("testing_automation_result_item_revision_chk", sql`${table.revision} >= 1`),
    index("testing_automation_result_item_tenant_idx").on(table.tenantId),
    index("testing_automation_result_item_run_idx").on(table.tenantId, table.runId),
  ],
);

/** Append-only automation import history. */
export const testingAutomationImportHistory = pgTable(
  "testing_automation_import_history",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    importId: text("import_id").notNull(),
    eventType: varchar("event_type", { length: 128 }).notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    actorUserId: text("actor_user_id"),
    summary: text("summary").notNull(),
    details: jsonb("details").$type<Record<string, unknown>>().default({}),
    adapterVersion: varchar("adapter_version", { length: 64 }),
    normalizationNotes: text("normalization_notes"),
    correlationId: text("correlation_id"),
  },
  (table) => [
    index("testing_automation_import_history_tenant_import_idx").on(
      table.tenantId,
      table.importId,
    ),
    index("testing_automation_import_history_occurred_idx").on(
      table.tenantId,
      table.occurredAt,
    ),
  ],
);

/** Coverage snapshot from imported automation metadata. */
export const testingAutomationCoverageSnapshot = pgTable(
  "testing_automation_coverage_snapshot",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    importId: text("import_id"),
    executionId: text("execution_id"),
    summary: jsonb("summary")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    coveredCount: integer("covered_count"),
    totalCount: integer("total_count"),
    percentage: real("percentage"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check("testing_automation_coverage_revision_chk", sql`${table.revision} >= 1`),
    index("testing_automation_coverage_tenant_idx").on(table.tenantId),
    index("testing_automation_coverage_import_idx").on(table.tenantId, table.importId),
    index("testing_automation_coverage_execution_idx").on(
      table.tenantId,
      table.executionId,
    ),
  ],
);

/** Traceability link between entities. */
export const testingTraceabilityLink = pgTable(
  "testing_traceability_link",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    type: varchar("type", { length: 32 }).notNull(),
    sourceKind: varchar("source_kind", { length: 64 }).notNull(),
    sourceId: text("source_id").notNull(),
    targetKind: varchar("target_kind", { length: 64 }).notNull(),
    targetId: text("target_id").notNull(),
    notes: text("notes"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_traceability_type_chk",
      sql`${table.type} in ('covers','verifies','related','blocks','derived_from')`,
    ),
    check("testing_traceability_revision_chk", sql`${table.revision} >= 1`),
    index("testing_traceability_tenant_idx").on(table.tenantId),
    index("testing_traceability_source_idx").on(
      table.tenantId,
      table.sourceKind,
      table.sourceId,
    ),
    index("testing_traceability_target_idx").on(
      table.tenantId,
      table.targetKind,
      table.targetId,
    ),
  ],
);

/** Immutable audit record. */
export const testingAuditRecord = pgTable(
  "testing_audit_record",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    actorUserId: text("actor_user_id"),
    action: varchar("action", { length: 128 }).notNull(),
    entityKind: varchar("entity_kind", { length: 64 }).notNull(),
    entityId: text("entity_id").notNull(),
    correlationId: text("correlation_id"),
    summary: text("summary").notNull(),
    details: jsonb("details").$type<Record<string, string>>().notNull().default({}),
  },
  (table) => [
    index("testing_audit_tenant_idx").on(table.tenantId),
    index("testing_audit_entity_idx").on(
      table.tenantId,
      table.entityKind,
      table.entityId,
    ),
    index("testing_audit_occurred_idx").on(table.tenantId, table.occurredAt),
  ],
);

/** Tenant product configuration JSON. */
export const testingConfiguration = pgTable(
  "testing_configuration",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    configKey: varchar("config_key", { length: 64 }).notNull().default("default"),
    configJson: jsonb("config_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    ...auditRevisionColumns(),
  },
  (table) => [
    check("testing_configuration_revision_chk", sql`${table.revision} >= 1`),
    uniqueIndex("testing_configuration_tenant_key_uidx").on(
      table.tenantId,
      table.configKey,
    ),
    index("testing_configuration_tenant_idx").on(table.tenantId),
  ],
);

/** Optional persist of foundation registry metadata. */
export const testingRegistryEntry = pgTable(
  "testing_registry_entry",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    registryKind: varchar("registry_kind", { length: 64 }).notNull(),
    entryKey: varchar("entry_key", { length: 128 }).notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: varchar("status", { length: 32 }).notNull().default("enabled"),
    version: varchar("version", { length: 32 }),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    metadata: jsonb("metadata").$type<Record<string, string>>().notNull().default({}),
    ...auditRevisionColumns(),
  },
  (table) => [
    check("testing_registry_revision_chk", sql`${table.revision} >= 1`),
    uniqueIndex("testing_registry_tenant_kind_key_uidx").on(
      table.tenantId,
      table.registryKind,
      table.entryKey,
    ),
    index("testing_registry_tenant_idx").on(table.tenantId),
    index("testing_registry_kind_idx").on(table.tenantId, table.registryKind),
  ],
);


/** Manual execution result aggregate (APZTCMS-004). */
export const testingManualExecution = pgTable(
  "testing_manual_execution",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    sessionId: text("session_id").notNull(),
    caseId: text("case_id").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    assigneeId: text("assignee_id"),
    testerId: text("tester_id"),
    reviewerId: text("reviewer_id"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    pausedAt: timestamp("paused_at", { withTimezone: true }),
    resumedAt: timestamp("resumed_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    approvalState: varchar("approval_state", { length: 32 }).notNull().default("none"),
    comments: jsonb("comments")
      .$type<Array<{ id: string; authorUserId: string; body: string; createdAt: string }>>()
      .notNull()
      .default([]),
    stepActuals: jsonb("step_actuals")
      .$type<Array<Record<string, unknown>>>()
      .notNull()
      .default([]),
    overallResult: varchar("overall_result", { length: 32 }),
    restartOfId: text("restart_of_id"),
    parameterOverrides: jsonb("parameter_overrides")
      .$type<Record<string, string>>()
      .default({}),
    blockReason: text("block_reason"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_manual_execution_status_chk",
      sql`${table.status} in (
        'draft','assigned','ready','in_progress','paused','blocked','completed',
        'under_review','approved','rejected','cancelled','archived',
        'planned','queued','aborted','failed'
      )`,
    ),
    check(
      "testing_manual_execution_approval_chk",
      sql`${table.approvalState} in ('none','pending_review','approved','rejected')`,
    ),
    check("testing_manual_execution_revision_chk", sql`${table.revision} >= 1`),
    index("testing_manual_execution_tenant_idx").on(table.tenantId),
    index("testing_manual_execution_session_idx").on(table.tenantId, table.sessionId),
    index("testing_manual_execution_case_idx").on(table.tenantId, table.caseId),
  ],
);

/** Flattened manual step actual rows (optional normalized store). */
export const testingManualStepActual = pgTable(
  "testing_manual_step_actual",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    executionId: text("execution_id").notNull(),
    stepId: text("step_id").notNull(),
    actualResult: text("actual_result"),
    status: varchar("status", { length: 32 }),
    evidenceIds: jsonb("evidence_ids").$type<string[]>().notNull().default([]),
    notes: text("notes"),
    comment: text("comment"),
    recordedAt: timestamp("recorded_at", { withTimezone: true }),
    expectedSnapshot: text("expected_snapshot"),
    recordedByUserId: text("recorded_by_user_id"),
    parentStepId: text("parent_step_id"),
    nestLevel: integer("nest_level"),
    repeatIndex: integer("repeat_index"),
    parameters: jsonb("parameters").$type<Record<string, string>>(),
    attachmentIds: jsonb("attachment_ids").$type<string[]>().default([]),
    expectedResult: text("expected_result"),
    ordinal: integer("ordinal"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_manual_step_actual_status_chk",
      sql`${table.status} is null or ${table.status} in ('pass','fail','blocked','skipped','retest','not_executed')`,
    ),
    check("testing_manual_step_actual_revision_chk", sql`${table.revision} >= 1`),
    uniqueIndex("testing_manual_step_actual_exec_step_uidx").on(
      table.tenantId,
      table.executionId,
      table.stepId,
    ),
    index("testing_manual_step_actual_exec_idx").on(table.tenantId, table.executionId),
  ],
);

/** Immutable test case version snapshots. */
export const testingTestCaseVersion = pgTable(
  "testing_test_case_version",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    caseId: text("case_id").notNull(),
    versionNumber: integer("version_number").notNull(),
    reason: varchar("reason", { length: 32 }).notNull(),
    snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull().default({}),
    changedByUserId: text("changed_by_user_id"),
    changeSummary: text("change_summary"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_test_case_version_reason_chk",
      sql`${table.reason} in ('created','edited','cloned','status_change','template_applied','rework','manual_version')`,
    ),
    check("testing_test_case_version_revision_chk", sql`${table.revision} >= 1`),
    uniqueIndex("testing_test_case_version_case_ver_uidx").on(
      table.tenantId,
      table.caseId,
      table.versionNumber,
    ),
    index("testing_test_case_version_case_idx").on(table.tenantId, table.caseId),
  ],
);

/** Immutable test plan version snapshots. */
export const testingTestPlanVersion = pgTable(
  "testing_test_plan_version",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    planId: text("plan_id").notNull(),
    versionNumber: integer("version_number").notNull(),
    reason: varchar("reason", { length: 32 }).notNull(),
    snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull().default({}),
    changedByUserId: text("changed_by_user_id"),
    changeSummary: text("change_summary"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_test_plan_version_reason_chk",
      sql`${table.reason} in ('created','edited','cloned','status_change','template_applied','rework','manual_version')`,
    ),
    check("testing_test_plan_version_revision_chk", sql`${table.revision} >= 1`),
    uniqueIndex("testing_test_plan_version_plan_ver_uidx").on(
      table.tenantId,
      table.planId,
      table.versionNumber,
    ),
    index("testing_test_plan_version_plan_idx").on(table.tenantId, table.planId),
  ],
);

/** Immutable test suite version snapshots. */
export const testingTestSuiteVersion = pgTable(
  "testing_test_suite_version",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    suiteId: text("suite_id").notNull(),
    versionNumber: integer("version_number").notNull(),
    reason: varchar("reason", { length: 32 }).notNull(),
    snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull().default({}),
    changedByUserId: text("changed_by_user_id"),
    changeSummary: text("change_summary"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_test_suite_version_reason_chk",
      sql`${table.reason} in ('created','edited','cloned','status_change','template_applied','rework','manual_version')`,
    ),
    check("testing_test_suite_version_revision_chk", sql`${table.revision} >= 1`),
    uniqueIndex("testing_test_suite_version_suite_ver_uidx").on(
      table.tenantId,
      table.suiteId,
      table.versionNumber,
    ),
    index("testing_test_suite_version_suite_idx").on(table.tenantId, table.suiteId),
  ],
);

/**
 * Append-only approval history events.
 * No update/delete of payload — immutable.
 */
export const testingApprovalHistory = pgTable(
  "testing_approval_history",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    approvalId: text("approval_id").notNull(),
    eventType: varchar("event_type", { length: 64 }).notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    actorUserId: text("actor_user_id"),
    correlationId: text("correlation_id"),
    summary: text("summary").notNull(),
    details: jsonb("details").$type<Record<string, unknown>>().notNull().default({}),
    fromStatus: varchar("from_status", { length: 32 }),
    toStatus: varchar("to_status", { length: 32 }),
  },
  (table) => [
    index("testing_approval_history_tenant_approval_idx").on(
      table.tenantId,
      table.approvalId,
    ),
    index("testing_approval_history_occurred_idx").on(
      table.tenantId,
      table.occurredAt,
    ),
  ],
);


/** TCMS release aggregate (APZTCMS-014 Release & Quality Governance). */
export const testingRelease = pgTable(
  "testing_release",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    key: varchar("key", { length: 64 }).notNull(),
    name: text("name").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    description: text("description"),
    windowJson: jsonb("window_json").$type<Record<string, unknown>>(),
    metadataJson: jsonb("metadata_json").$type<Record<string, unknown>>().default({}),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_release_status_chk",
      sql`${table.status} in ('draft','planning','ready_for_review','ready_for_approval','approved','conditionally_approved','rejected','withdrawn','superseded','archived')`,
    ),
    check("testing_release_revision_chk", sql`${table.revision} >= 1`),
    uniqueIndex("testing_release_tenant_key_uidx").on(table.tenantId, table.key),
    index("testing_release_tenant_idx").on(table.tenantId),
    index("testing_release_status_idx").on(table.tenantId, table.status),
  ],
);

export const testingReleaseScope = pgTable(
  "testing_release_scope",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    releaseId: text("release_id").notNull(),
    kind: varchar("kind", { length: 32 }).notNull(),
    refId: text("ref_id").notNull(),
    label: text("label"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_release_scope_kind_chk",
      sql`${table.kind} in ('plan','suite','case','execution','requirement','certification','evidence','coverage','defect','risk','automation','pipeline','other')`,
    ),
    check("testing_release_scope_revision_chk", sql`${table.revision} >= 1`),
    index("testing_release_scope_tenant_idx").on(table.tenantId),
    index("testing_release_scope_release_idx").on(table.tenantId, table.releaseId),
  ],
);

export const testingReleasePackage = pgTable(
  "testing_release_package",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    releaseId: text("release_id").notNull(),
    name: text("name").notNull(),
    versionLabel: text("version_label").notNull(),
    description: text("description"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check("testing_release_package_revision_chk", sql`${table.revision} >= 1`),
    index("testing_release_package_tenant_idx").on(table.tenantId),
    index("testing_release_package_release_idx").on(table.tenantId, table.releaseId),
  ],
);

export const testingReleaseCandidate = pgTable(
  "testing_release_candidate",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    releaseId: text("release_id").notNull(),
    label: text("label").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    notes: text("notes"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_release_candidate_status_chk",
      sql`${table.status} in ('draft','planning','ready_for_review','ready_for_approval','approved','conditionally_approved','rejected','withdrawn','superseded','archived')`,
    ),
    check("testing_release_candidate_revision_chk", sql`${table.revision} >= 1`),
    index("testing_release_candidate_tenant_idx").on(table.tenantId),
    index("testing_release_candidate_release_idx").on(table.tenantId, table.releaseId),
  ],
);

export const testingReleaseApproval = pgTable(
  "testing_release_approval",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    releaseId: text("release_id").notNull(),
    stageKind: varchar("stage_kind", { length: 32 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    requestedFromUserId: text("requested_from_user_id"),
    decidedByUserId: text("decided_by_user_id"),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    comments: text("comments"),
    conditions: text("conditions"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_release_approval_stage_chk",
      sql`${table.stageKind} in ('technical','qa','business','security','executive')`,
    ),
    check(
      "testing_release_approval_status_chk",
      sql`${table.status} in ('pending','approved','rejected','withdrawn','conditional')`,
    ),
    check("testing_release_approval_revision_chk", sql`${table.revision} >= 1`),
    index("testing_release_approval_tenant_idx").on(table.tenantId),
    index("testing_release_approval_release_idx").on(table.tenantId, table.releaseId),
  ],
);

export const testingReleaseDecision = pgTable(
  "testing_release_decision",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    releaseId: text("release_id").notNull(),
    verdict: varchar("verdict", { length: 32 }).notNull(),
    decidedByUserId: text("decided_by_user_id").notNull(),
    decidedAt: timestamp("decided_at", { withTimezone: true }).notNull(),
    rationale: text("rationale").notNull(),
    isAutomatic: boolean("is_automatic").notNull().default(false),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_release_decision_verdict_chk",
      sql`${table.verdict} in ('approved','conditionally_approved','rejected')`,
    ),
    check("testing_release_decision_auto_chk", sql`${table.isAutomatic} = false`),
    check("testing_release_decision_revision_chk", sql`${table.revision} >= 1`),
    index("testing_release_decision_tenant_idx").on(table.tenantId),
    index("testing_release_decision_release_idx").on(table.tenantId, table.releaseId),
  ],
);

export const testingReleaseEvidence = pgTable(
  "testing_release_evidence",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    releaseId: text("release_id").notNull(),
    kind: varchar("kind", { length: 64 }).notNull(),
    refId: text("ref_id").notNull(),
    summary: text("summary"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check("testing_release_evidence_revision_chk", sql`${table.revision} >= 1`),
    index("testing_release_evidence_tenant_idx").on(table.tenantId),
    index("testing_release_evidence_release_idx").on(table.tenantId, table.releaseId),
  ],
);

export const testingReleaseDependency = pgTable(
  "testing_release_dependency",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    releaseId: text("release_id").notNull(),
    dependsOnReleaseId: text("depends_on_release_id"),
    kind: varchar("kind", { length: 64 }).notNull(),
    required: boolean("required").notNull().default(true),
    notes: text("notes"),
    blocked: boolean("blocked").notNull().default(false),
    ...auditRevisionColumns(),
  },
  (table) => [
    check("testing_release_dependency_revision_chk", sql`${table.revision} >= 1`),
    index("testing_release_dependency_tenant_idx").on(table.tenantId),
    index("testing_release_dependency_release_idx").on(table.tenantId, table.releaseId),
  ],
);

export const testingReleaseNote = pgTable(
  "testing_release_note",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    releaseId: text("release_id").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    authoredAt: timestamp("authored_at", { withTimezone: true }).notNull(),
    authorUserId: text("author_user_id"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check("testing_release_note_revision_chk", sql`${table.revision} >= 1`),
    index("testing_release_note_tenant_idx").on(table.tenantId),
    index("testing_release_note_release_idx").on(table.tenantId, table.releaseId),
  ],
);

export const testingReleaseRiskAssessment = pgTable(
  "testing_release_risk_assessment",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    releaseId: text("release_id").notNull(),
    snapshotJson: jsonb("snapshot_json").$type<Record<string, unknown>>().notNull(),
    computedAt: timestamp("computed_at", { withTimezone: true }).notNull(),
    isDecision: boolean("is_decision").notNull().default(false),
    ...auditRevisionColumns(),
  },
  (table) => [
    check("testing_release_risk_decision_chk", sql`${table.isDecision} = false`),
    check("testing_release_risk_revision_chk", sql`${table.revision} >= 1`),
    index("testing_release_risk_tenant_idx").on(table.tenantId),
    index("testing_release_risk_release_idx").on(table.tenantId, table.releaseId),
  ],
);

export const testingReleaseReadinessSnapshot = pgTable(
  "testing_release_readiness_snapshot",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    releaseId: text("release_id").notNull(),
    snapshotJson: jsonb("snapshot_json").$type<Record<string, unknown>>().notNull(),
    computedAt: timestamp("computed_at", { withTimezone: true }).notNull(),
    isDecision: boolean("is_decision").notNull().default(false),
    ...auditRevisionColumns(),
  },
  (table) => [
    check("testing_release_readiness_snap_decision_chk", sql`${table.isDecision} = false`),
    check("testing_release_readiness_snap_revision_chk", sql`${table.revision} >= 1`),
    index("testing_release_readiness_snap_tenant_idx").on(table.tenantId),
    index("testing_release_readiness_snap_release_idx").on(table.tenantId, table.releaseId),
  ],
);

export const testingReleaseSummarySnapshot = pgTable(
  "testing_release_summary_snapshot",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    releaseId: text("release_id").notNull(),
    snapshotJson: jsonb("snapshot_json").$type<Record<string, unknown>>().notNull(),
    computedAt: timestamp("computed_at", { withTimezone: true }).notNull(),
    isDecision: boolean("is_decision").notNull().default(false),
    ...auditRevisionColumns(),
  },
  (table) => [
    check("testing_release_summary_decision_chk", sql`${table.isDecision} = false`),
    check("testing_release_summary_revision_chk", sql`${table.revision} >= 1`),
    index("testing_release_summary_tenant_idx").on(table.tenantId),
    index("testing_release_summary_release_idx").on(table.tenantId, table.releaseId),
  ],
);

export const testingReleaseAuditEntry = pgTable(
  "testing_release_audit_entry",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    releaseId: text("release_id").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    actorUserId: text("actor_user_id"),
    action: text("action").notNull(),
    summary: text("summary").notNull(),
    detailsJson: jsonb("details_json").$type<Record<string, unknown>>().default({}),
    correlationId: text("correlation_id"),
  },
  (table) => [
    index("testing_release_audit_tenant_idx").on(table.tenantId),
    index("testing_release_audit_release_idx").on(table.tenantId, table.releaseId),
    index("testing_release_audit_occurred_idx").on(table.tenantId, table.occurredAt),
  ],
);

/** Registered CI/CD pipeline definition (APZTCMS-015). */
export const testingPipeline = pgTable(
  "testing_pipeline",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    key: varchar("key", { length: 64 }).notNull(),
    name: text("name").notNull(),
    providerKind: varchar("provider_kind", { length: 32 }).notNull(),
    externalPipelineRef: text("external_pipeline_ref"),
    description: text("description"),
    status: varchar("status", { length: 32 }).notNull().default("active"),
    defaultBranch: text("default_branch"),
    repositoryRef: text("repository_ref"),
    variablesJson: jsonb("variables_json").$type<unknown[]>().default([]),
    secretRefsJson: jsonb("secret_refs_json").$type<unknown[]>().default([]),
    metadataJson: jsonb("metadata_json").$type<Record<string, unknown>>().default({}),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_pipeline_provider_chk",
      sql`${table.providerKind} in ('generic_ci','github_actions','gitlab_ci','azure_devops','jenkins','circleci','buildkite')`,
    ),
    check(
      "testing_pipeline_status_chk",
      sql`${table.status} in ('active','archived')`,
    ),
    check("testing_pipeline_revision_chk", sql`${table.revision} >= 1`),
    uniqueIndex("testing_pipeline_tenant_key_uidx").on(table.tenantId, table.key),
    index("testing_pipeline_tenant_idx").on(table.tenantId),
    index("testing_pipeline_provider_idx").on(table.tenantId, table.providerKind),
  ],
);

export const testingPipelineImport = pgTable(
  "testing_pipeline_import",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    providerKind: varchar("provider_kind", { length: 32 }).notNull(),
    adapterVersion: varchar("adapter_version", { length: 64 }).notNull(),
    externalRunRef: text("external_run_ref").notNull(),
    pipelineId: text("pipeline_id"),
    status: varchar("status", { length: 32 }).notNull(),
    correlationId: text("correlation_id"),
    checksum: text("checksum"),
    payloadFingerprint: text("payload_fingerprint"),
    summary: jsonb("summary").$type<Record<string, unknown>>().default({}),
    errorSummary: text("error_summary"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    canonicalSnapshot: jsonb("canonical_snapshot").$type<Record<string, unknown>>(),
    pipelineRunId: text("pipeline_run_id"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_pipeline_import_provider_chk",
      sql`${table.providerKind} in ('generic_ci','github_actions','gitlab_ci','azure_devops','jenkins','circleci','buildkite')`,
    ),
    check(
      "testing_pipeline_import_status_chk",
      sql`${table.status} in ('pending','validating','importing','completed','failed','duplicate','corrected')`,
    ),
    check("testing_pipeline_import_revision_chk", sql`${table.revision} >= 1`),
    uniqueIndex("testing_pipeline_import_tenant_provider_run_uidx").on(
      table.tenantId,
      table.providerKind,
      table.externalRunRef,
    ),
    index("testing_pipeline_import_tenant_idx").on(table.tenantId),
    index("testing_pipeline_import_status_idx").on(table.tenantId, table.status),
    index("testing_pipeline_import_pipeline_idx").on(table.tenantId, table.pipelineId),
  ],
);

export const testingPipelineRun = pgTable(
  "testing_pipeline_run",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    pipelineId: text("pipeline_id").notNull(),
    importId: text("import_id").notNull(),
    providerKind: varchar("provider_kind", { length: 32 }).notNull(),
    externalRunRef: text("external_run_ref").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    stagesJson: jsonb("stages_json").$type<unknown[]>().notNull().default([]),
    jobsJson: jsonb("jobs_json").$type<unknown[]>().notNull().default([]),
    artifactsJson: jsonb("artifacts_json").$type<unknown[]>().notNull().default([]),
    approvalsJson: jsonb("approvals_json").$type<unknown[]>().notNull().default([]),
    eventsJson: jsonb("events_json").$type<unknown[]>().notNull().default([]),
    environmentJson: jsonb("environment_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    linksJson: jsonb("links_json").$type<Record<string, unknown>>().notNull().default({}),
    summaryJson: jsonb("summary_json").$type<Record<string, unknown>>().notNull().default({}),
    metricsJson: jsonb("metrics_json").$type<Record<string, unknown>>(),
    logsJson: jsonb("logs_json").$type<unknown[]>().default([]),
    variablesJson: jsonb("variables_json").$type<unknown[]>().default([]),
    secretRefsJson: jsonb("secret_refs_json").$type<unknown[]>().default([]),
    triggerJson: jsonb("trigger_json").$type<Record<string, unknown>>(),
    sourceJson: jsonb("source_json").$type<Record<string, unknown>>(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    durationMs: integer("duration_ms"),
    correlationId: text("correlation_id"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_pipeline_run_provider_chk",
      sql`${table.providerKind} in ('generic_ci','github_actions','gitlab_ci','azure_devops','jenkins','circleci','buildkite')`,
    ),
    check(
      "testing_pipeline_run_status_chk",
      sql`${table.status} in ('queued','running','passed','failed','cancelled','skipped','timed_out','unknown')`,
    ),
    check("testing_pipeline_run_revision_chk", sql`${table.revision} >= 1`),
    index("testing_pipeline_run_tenant_idx").on(table.tenantId),
    index("testing_pipeline_run_pipeline_idx").on(table.tenantId, table.pipelineId),
    index("testing_pipeline_run_import_idx").on(table.tenantId, table.importId),
    index("testing_pipeline_run_external_idx").on(table.tenantId, table.externalRunRef),
  ],
);

export const testingPipelineImportHistory = pgTable(
  "testing_pipeline_import_history",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    importId: text("import_id").notNull(),
    eventType: varchar("event_type", { length: 128 }).notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    actorUserId: text("actor_user_id"),
    summary: text("summary").notNull(),
    details: jsonb("details").$type<Record<string, unknown>>().default({}),
    adapterVersion: varchar("adapter_version", { length: 64 }),
    normalizationNotes: text("normalization_notes"),
    correlationId: text("correlation_id"),
  },
  (table) => [
    index("testing_pipeline_import_history_tenant_import_idx").on(
      table.tenantId,
      table.importId,
    ),
    index("testing_pipeline_import_history_occurred_idx").on(
      table.tenantId,
      table.occurredAt,
    ),
  ],
);


/** Engineering intelligence snapshot (APZTCMS-021). */
export const testingEngineeringSnapshot = pgTable(
  "testing_engineering_snapshot",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    scope: jsonb("scope").$type<Record<string, unknown>>().notNull().default({}),
    qualityScoreJson: jsonb("quality_score_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    healthJson: jsonb("health_json").$type<Record<string, unknown>>().notNull().default({}),
    riskJson: jsonb("risk_json").$type<Record<string, unknown>>().notNull().default({}),
    indicatorsJson: jsonb("indicators_json").$type<unknown[]>().notNull().default([]),
    trendsJson: jsonb("trends_json").$type<unknown[]>().notNull().default([]),
    computedAt: timestamp("computed_at", { withTimezone: true }).notNull(),
    label: text("label"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check("testing_engineering_snapshot_revision_chk", sql`${table.revision} >= 1`),
    index("testing_engineering_snapshot_tenant_idx").on(table.tenantId),
    index("testing_engineering_snapshot_computed_idx").on(table.tenantId, table.computedAt),
  ],
);

/** Immutable historical engineering snapshot (APZTCMS-021). */
export const testingEngineeringHistoricalSnapshot = pgTable(
  "testing_engineering_historical_snapshot",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    scope: jsonb("scope").$type<Record<string, unknown>>().notNull().default({}),
    periodJson: jsonb("period_json").$type<Record<string, unknown>>().notNull().default({}),
    qualityScore: real("quality_score").notNull().default(0),
    engineeringHealthScore: real("engineering_health_score").notNull().default(0),
    indicatorsJson: jsonb("indicators_json").$type<unknown[]>().notNull().default([]),
    metricsJson: jsonb("metrics_json").$type<Record<string, unknown>>().notNull().default({}),
    sourceRefsJson: jsonb("source_refs_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    computedAt: timestamp("computed_at", { withTimezone: true }).notNull(),
    immutable: boolean("immutable").notNull().default(true),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_engineering_historical_snapshot_revision_chk",
      sql`${table.revision} >= 1`,
    ),
    check(
      "testing_engineering_historical_snapshot_immutable_chk",
      sql`${table.immutable} = true`,
    ),
    index("testing_engineering_historical_snapshot_tenant_idx").on(table.tenantId),
    index("testing_engineering_historical_snapshot_computed_idx").on(
      table.tenantId,
      table.computedAt,
    ),
  ],
);

/** Engineering trend series (APZTCMS-021). */
export const testingEngineeringTrendSeries = pgTable(
  "testing_engineering_trend_series",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    kind: varchar("kind", { length: 64 }).notNull(),
    scope: jsonb("scope").$type<Record<string, unknown>>().notNull().default({}),
    periodKind: varchar("period_kind", { length: 64 }).notNull(),
    pointsJson: jsonb("points_json").$type<unknown[]>().notNull().default([]),
    direction: varchar("direction", { length: 32 }).notNull(),
    delta: real("delta").notNull().default(0),
    computedAt: timestamp("computed_at", { withTimezone: true }).notNull(),
    ...auditRevisionColumns(),
  },
  (table) => [
    check("testing_engineering_trend_series_revision_chk", sql`${table.revision} >= 1`),
    index("testing_engineering_trend_series_tenant_idx").on(table.tenantId),
    index("testing_engineering_trend_series_computed_idx").on(
      table.tenantId,
      table.computedAt,
    ),
  ],
);

/** Engineering benchmark (APZTCMS-021). */
export const testingEngineeringBenchmark = pgTable(
  "testing_engineering_benchmark",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    scope: jsonb("scope").$type<Record<string, unknown>>().notNull().default({}),
    metricKey: varchar("metric_key", { length: 128 }).notNull(),
    comparisonJson: jsonb("comparison_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    computedAt: timestamp("computed_at", { withTimezone: true }).notNull(),
    label: text("label"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check("testing_engineering_benchmark_revision_chk", sql`${table.revision} >= 1`),
    index("testing_engineering_benchmark_tenant_idx").on(table.tenantId),
    index("testing_engineering_benchmark_computed_idx").on(table.tenantId, table.computedAt),
  ],
);

/** Engineering baseline (APZTCMS-021). */
export const testingEngineeringBaseline = pgTable(
  "testing_engineering_baseline",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    scope: jsonb("scope").$type<Record<string, unknown>>().notNull().default({}),
    kind: varchar("kind", { length: 64 }).notNull(),
    metricKey: varchar("metric_key", { length: 128 }).notNull(),
    value: real("value").notNull().default(0),
    sourceSnapshotId: text("source_snapshot_id"),
    periodJson: jsonb("period_json").$type<Record<string, unknown>>().default({}),
    computedAt: timestamp("computed_at", { withTimezone: true }).notNull(),
    label: text("label"),
    ...auditRevisionColumns(),
  },
  (table) => [
    check("testing_engineering_baseline_revision_chk", sql`${table.revision} >= 1`),
    index("testing_engineering_baseline_tenant_idx").on(table.tenantId),
    index("testing_engineering_baseline_computed_idx").on(table.tenantId, table.computedAt),
  ],
);

/** Engineering quality summary (APZTCMS-021). */
export const testingEngineeringQualitySummary = pgTable(
  "testing_engineering_quality_summary",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    scope: jsonb("scope").$type<Record<string, unknown>>().notNull().default({}),
    qualityScoreJson: jsonb("quality_score_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    indicatorsJson: jsonb("indicators_json").$type<unknown[]>().notNull().default([]),
    computedAt: timestamp("computed_at", { withTimezone: true }).notNull(),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_engineering_quality_summary_revision_chk",
      sql`${table.revision} >= 1`,
    ),
    index("testing_engineering_quality_summary_tenant_idx").on(table.tenantId),
    index("testing_engineering_quality_summary_computed_idx").on(
      table.tenantId,
      table.computedAt,
    ),
  ],
);

/** Report template definition (APZTCMS-024). */
export const testingReportTemplate = pgTable(
  "testing_report_template",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    reportType: varchar("report_type", { length: 64 }).notNull(),
    name: text("name").notNull(),
    description: text("description"),
    version: varchar("version", { length: 32 }).notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    header: text("header"),
    footer: text("footer"),
    brandingJson: jsonb("branding_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    metadataJson: jsonb("metadata_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    metricKeysJson: jsonb("metric_keys_json").$type<unknown[]>().notNull().default([]),
    sectionsJson: jsonb("sections_json").$type<unknown[]>().notNull().default([]),
    builtin: boolean("builtin").notNull().default(false),
    ...auditRevisionColumns(),
  },
  (table) => [
    check("testing_report_template_revision_chk", sql`${table.revision} >= 1`),
    index("testing_report_template_tenant_idx").on(table.tenantId),
    index("testing_report_template_tenant_type_idx").on(table.tenantId, table.reportType),
  ],
);

/** Immutable report generation metadata (APZTCMS-024). */
export const testingReportGenerationMetadata = pgTable(
  "testing_report_generation_metadata",
  {
    id: text("id").primaryKey(),
    ...tenantOrgColumns(),
    requestId: text("request_id").notNull(),
    templateId: text("template_id").notNull(),
    reportType: varchar("report_type", { length: 64 }).notNull(),
    outputFormat: varchar("output_format", { length: 32 }).notNull(),
    parametersJson: text("parameters_json").notNull(),
    generatedAt: timestamp("generated_at", { withTimezone: true }).notNull(),
    generatedBy: text("generated_by").notNull(),
    version: varchar("version", { length: 32 }).notNull(),
    checksumSha256: varchar("checksum_sha256", { length: 64 }).notNull(),
    byteLength: integer("byte_length").notNull(),
    preview: boolean("preview").notNull().default(false),
    ...auditRevisionColumns(),
  },
  (table) => [
    check(
      "testing_report_generation_metadata_revision_chk",
      sql`${table.revision} >= 1`,
    ),
    index("testing_report_generation_metadata_tenant_idx").on(table.tenantId),
    index("testing_report_generation_metadata_generated_idx").on(
      table.tenantId,
      table.generatedAt,
    ),
    index("testing_report_generation_metadata_template_idx").on(
      table.tenantId,
      table.templateId,
    ),
  ],
);

export const testingSchema = {
  testingRequirement,
  testingWorkItem,
  testingRisk,
  testingTestPlan,
  testingTestSuite,
  testingTestCase,
  testingTestCaseVersion,
  testingTestPlanVersion,
  testingTestSuiteVersion,
  testingTestStep,
  testingPlanSuite,
  testingSuiteCase,
  testingCaseRequirement,
  testingPlanRequirement,
  testingRiskRequirement,
  testingPlanRisk,
  testingRegressionSet,
  testingExecutionSession,
  testingExecutionHistory,
  testingManualExecution,
  testingManualStepActual,
  testingEvidence,
  testingApproval,
  testingApprovalHistory,
  testingCertificationRecord,
  testingCertificationGateDefinition,
  testingCertificationGateEvaluation,
  testingCertificationRule,
  testingCertificationAudit,
  testingCertificationHistory,
  testingReleaseReadiness,
  testingCoverageRecord,
  testingDefectLink,
  testingQualitySnapshot,
  testingRegressionAnalysis,
  testingAutomationDefinition,
  testingAutomationImport,
  testingAutomatedExecution,
  testingAutomationRun,
  testingAutomationResultItem,
  testingAutomationImportHistory,
  testingAutomationCoverageSnapshot,
  testingTraceabilityLink,
  testingAuditRecord,
  testingConfiguration,
  testingRegistryEntry,
  testingRelease,
  testingReleaseScope,
  testingReleasePackage,
  testingReleaseCandidate,
  testingReleaseApproval,
  testingReleaseDecision,
  testingReleaseEvidence,
  testingReleaseDependency,
  testingReleaseNote,
  testingReleaseRiskAssessment,
  testingReleaseReadinessSnapshot,
  testingReleaseSummarySnapshot,
  testingReleaseAuditEntry,
  testingPipeline,
  testingPipelineImport,
  testingPipelineRun,
  testingPipelineImportHistory,
  testingEngineeringSnapshot,
  testingEngineeringHistoricalSnapshot,
  testingEngineeringTrendSeries,
  testingEngineeringBenchmark,
  testingEngineeringBaseline,
  testingEngineeringQualitySummary,
  testingReportTemplate,
  testingReportGenerationMetadata,
};
