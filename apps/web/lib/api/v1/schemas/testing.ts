import { z } from "zod";

import { paginationQuerySchema } from "./common";

// Automation result imports may contain full normalized result payloads. Cap at 5 MiB;
// binary evidence is intentionally not accepted by these JSON-only API routes.
export const TESTING_AUTOMATION_MAX_BODY_BYTES = 5_242_880;

const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/;
const platformIdSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid testing identifier format");

export const requirementIdParamSchema = platformIdSchema;
export const planIdParamSchema = platformIdSchema;
export const suiteIdParamSchema = platformIdSchema;
export const caseIdParamSchema = platformIdSchema;
export const executionIdParamSchema = platformIdSchema;
export const stepIdParamSchema = platformIdSchema;
export const evidenceIdParamSchema = platformIdSchema;
export const importIdParamSchema = platformIdSchema;
export const coverageIdParamSchema = platformIdSchema;
export const defectIdParamSchema = platformIdSchema;
export const certificationIdParamSchema = platformIdSchema;
export const approvalIdParamSchema = platformIdSchema;
export const relationshipIdParamSchema = platformIdSchema;
export const resourceIdParamSchema = platformIdSchema;
export const releaseIdParamSchema = platformIdSchema;
export const pipelineIdParamSchema = platformIdSchema;
export const pipelineRunIdParamSchema = platformIdSchema;
export const pipelineWorkflowIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid workflow identifier format");
export const pipelineJobIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid job identifier format");
export const pipelineOwnerParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,127}$/, "Invalid repository owner");
export const pipelineRepoParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,127}$/, "Invalid repository name");
export const pipelineProviderRunIdParamSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(idPattern, "Invalid provider run identifier format");

const testStatusValues = ["draft", "review", "ready", "approved", "deprecated", "archived"] as const;
const priorityValues = ["low", "medium", "high", "critical"] as const;
const severityValues = ["info", "minor", "major", "critical", "blocker"] as const;
const testResultStatusValues = ["pass", "fail", "blocked", "skipped", "retest", "not_executed"] as const;
const executionStatusValues = [
  "draft",
  "assigned",
  "ready",
  "in_progress",
  "paused",
  "blocked",
  "completed",
  "under_review",
  "approved",
  "rejected",
  "cancelled",
  "archived",
  "planned",
  "queued",
  "aborted",
  "failed",
] as const;
const approvalStateValues = ["none", "pending_review", "approved", "rejected"] as const;
const evidenceTypeValues = ["screenshot", "log", "video", "trace", "report", "note", "attachment", "url", "other"] as const;
const evidenceLifecycleStatusValues = ["pending", "captured", "submitted", "verified", "rejected", "approved", "archived"] as const;
const automationAdapterValues = ["vitest", "playwright", "junit_xml", "generic_json", "generic_tap", "allure_metadata"] as const;
const automationTypeValues = ["unit", "integration", "e2e", "api", "performance", "security", "accessibility", "other"] as const;
const normalizedResultStatusValues = ["pass", "fail", "skipped", "blocked", "timed_out", "cancelled", "errored", "unknown"] as const;
const coverageMetricKindValues = ["requirement", "risk", "suite", "plan", "code_ref", "feature", "story", "case", "manual", "automation", "execution", "release"] as const;
const defectProviderKindValues = ["internal", "projects", "support", "external_generic"] as const;
const defectStatusValues = ["open", "in_progress", "resolved", "verified", "closed", "reopened", "cancelled"] as const;
const defectLinkTargetValues = ["project_task", "support_ticket", "requirement", "plan", "suite", "case", "manual_execution", "automation_execution", "evidence", "risk", "work_item"] as const;
const traceabilityTypeValues = ["covers", "verifies", "related", "blocks", "derived_from"] as const;
const traceabilityResourceTypeValues = ["requirement", "feature", "story", "task", "epic", "test_plan", "test_suite", "test_case", "manual_execution", "automated_execution", "automation_import", "automation_run", "evidence", "certification", "release", "defect", "risk", "work_item"] as const;
const certificationStatusValues = ["draft", "preparing", "awaiting_evidence", "awaiting_review", "in_review", "changes_required", "awaiting_approval", "approved", "conditionally_approved", "rejected", "expired", "archived", "development_ready", "qa_ready", "regression_ready", "uat_ready", "production_ready", "certified", "failed_certification", "conditional_approval"] as const;

const stringArraySchema = z.array(z.string().min(1).max(256)).max(500);
const stringRecordSchema = z.record(z.string().min(1).max(128), z.string().max(2000));
const unknownRecordSchema = z.record(z.string().min(1).max(128), z.unknown());

const tenantInputSchema = {
  tenantId: z.string().min(1).max(128).optional(),
};

export const testingListQuerySchema = paginationQuerySchema.strict();

export const clonePlanBodySchema = z.object({ key: z.string().min(1).max(128).optional(), name: z.string().min(1).max(255).optional() }).strict();
export const cloneSuiteBodySchema = clonePlanBodySchema;
export const cloneCaseBodySchema = z.object({ key: z.string().min(1).max(128).optional(), title: z.string().min(1).max(500).optional() }).strict();

export const testPlanCreateBodySchema = z.object({
  ...tenantInputSchema,
  key: z.string().min(1).max(128),
  name: z.string().min(1).max(255),
  description: z.string().max(10_000).optional(),
  status: z.enum(testStatusValues),
  suiteIds: stringArraySchema.optional(),
  requirementIds: stringArraySchema.optional(),
  riskIds: stringArraySchema.optional(),
  releaseLabel: z.string().max(255).optional(),
  milestoneLabel: z.string().max(255).optional(),
  ownerId: platformIdSchema.optional(),
  assigneeId: platformIdSchema.optional(),
  versionNumber: z.number().int().positive().optional(),
  parentPlanId: platformIdSchema.optional(),
}).strict();

export const testPlanUpdateBodySchema = testPlanCreateBodySchema.omit({ tenantId: true, key: true }).partial().strict().refine((value) => Object.keys(value).length > 0, { message: "At least one field is required for update." });

export const testSuiteCreateBodySchema = z.object({
  ...tenantInputSchema,
  key: z.string().min(1).max(128),
  name: z.string().min(1).max(255),
  description: z.string().max(10_000).optional(),
  status: z.enum(testStatusValues),
  planIds: stringArraySchema.optional(),
  caseIds: stringArraySchema.optional(),
  isRegression: z.boolean().optional(),
  ownerId: platformIdSchema.optional(),
  parentSuiteId: platformIdSchema.optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  versionNumber: z.number().int().positive().optional(),
  groupKey: z.string().min(1).max(128).optional(),
}).strict();

export const testSuiteUpdateBodySchema = testSuiteCreateBodySchema.omit({ tenantId: true, key: true }).partial().strict().refine((value) => Object.keys(value).length > 0, { message: "At least one field is required for update." });

const testStepBodySchema = z.object({
  ordinal: z.number().int().nonnegative(),
  action: z.string().min(1).max(10_000),
  expectedResult: z.string().min(1).max(10_000),
  dataHint: z.string().max(2000).optional(),
  parentStepId: platformIdSchema.optional(),
  nestLevel: z.number().int().nonnegative().optional(),
  repeatIndex: z.number().int().nonnegative().optional(),
  parameters: stringRecordSchema.optional(),
  attachmentIds: stringArraySchema.optional(),
}).strict();

const testCaseParameterSchema = z.object({
  key: z.string().min(1).max(128),
  label: z.string().max(255).optional(),
  defaultValue: z.string().max(2000).optional(),
  required: z.boolean().optional(),
}).strict();

export const testCaseCreateBodySchema = z.object({
  ...tenantInputSchema,
  key: z.string().min(1).max(128),
  title: z.string().min(1).max(500),
  description: z.string().max(20_000).optional(),
  status: z.enum(testStatusValues),
  priority: z.enum(priorityValues),
  suiteIds: stringArraySchema.optional(),
  requirementIds: stringArraySchema.optional(),
  steps: z.array(testStepBodySchema).max(500).optional(),
  tags: stringArraySchema.optional(),
  estimatedMinutes: z.number().int().nonnegative().optional(),
  preconditions: z.string().max(10_000).optional(),
  postconditions: z.string().max(10_000).optional(),
  expectedResultsSummary: z.string().max(10_000).optional(),
  templateKey: z.string().min(1).max(128).optional(),
  parameters: z.array(testCaseParameterSchema).max(100).optional(),
  components: stringArraySchema.optional(),
  ownerId: platformIdSchema.optional(),
  reviewerId: platformIdSchema.optional(),
  versionNumber: z.number().int().positive().optional(),
  parentCaseId: platformIdSchema.optional(),
  riskLevel: z.enum(severityValues).optional(),
}).strict();

export const testCaseUpdateBodySchema = testCaseCreateBodySchema.omit({ tenantId: true, key: true }).partial().strict().refine((value) => Object.keys(value).length > 0, { message: "At least one field is required for update." });
export const testCaseTransitionBodySchema = z.object({ status: z.enum(testStatusValues) }).strict();

const workItemRefSchema = z.object({
  kind: z.enum(["feature", "epic", "story", "task"]),
  projectRefId: z.string().min(1).max(128),
  workItemId: platformIdSchema,
  label: z.string().max(255).optional(),
}).strict();

export const requirementCreateBodySchema = z.object({
  ...tenantInputSchema,
  key: z.string().min(1).max(128),
  title: z.string().min(1).max(500),
  description: z.string().max(20_000).optional(),
  priority: z.enum(priorityValues),
  workItemRefs: z.array(workItemRefSchema).max(100).optional(),
  riskIds: stringArraySchema.optional(),
  tags: stringArraySchema.optional(),
  ownerId: platformIdSchema.optional(),
}).strict();

export const requirementUpdateBodySchema = requirementCreateBodySchema.omit({ tenantId: true, key: true }).partial().strict().refine((value) => Object.keys(value).length > 0, { message: "At least one field is required for update." });

const stepActualPayloadSchema = z.object({
  actualResult: z.string().max(20_000).optional(),
  status: z.enum(testResultStatusValues).optional(),
  evidenceIds: stringArraySchema.optional(),
  notes: z.string().max(10_000).optional(),
  comment: z.string().max(10_000).optional(),
  comments: z.string().max(10_000).optional(),
  recordedAt: z.string().max(64).optional(),
  expectedSnapshot: z.string().max(10_000).optional(),
  expectedResult: z.string().max(10_000).optional(),
  recordedByUserId: platformIdSchema.optional(),
  parentStepId: platformIdSchema.optional(),
  nestLevel: z.number().int().nonnegative().optional(),
  repeatIndex: z.number().int().nonnegative().optional(),
  parameters: stringRecordSchema.optional(),
  attachmentIds: stringArraySchema.optional(),
  ordinal: z.number().int().nonnegative().optional(),
}).strict();

export const executionCreateBodySchema = z.object({
  ...tenantInputSchema,
  sessionId: platformIdSchema,
  caseId: platformIdSchema,
  status: z.enum(executionStatusValues).optional(),
  assigneeId: platformIdSchema.optional(),
  testerId: platformIdSchema.optional(),
  reviewerId: platformIdSchema.optional(),
  approvalState: z.enum(approvalStateValues).optional(),
  stepActuals: z.array(stepActualPayloadSchema.extend({ stepId: platformIdSchema })).max(500).optional(),
  overallResult: z.enum(testResultStatusValues).optional(),
  restartOfId: platformIdSchema.optional(),
  parameterOverrides: stringRecordSchema.optional(),
}).strict();

export const executionAssignBodySchema = z.object({ assigneeId: platformIdSchema }).strict();
export const executionReasonBodySchema = z.object({ reason: z.string().min(1).max(10_000).optional() }).strict();
export const executionCompleteBodySchema = z.object({ overallResult: z.enum(testResultStatusValues).optional() }).strict();
export const executionCommentBodySchema = z.object({ comments: z.string().max(10_000).optional() }).strict();
export const executionRejectBodySchema = z.object({ comments: z.string().min(1).max(10_000) }).strict();
export const executionStepPatchBodySchema = stepActualPayloadSchema.refine((value) => value.status !== undefined || Object.keys(value).some((key) => key !== "status"), { message: "status or step actual fields are required." });

const evidenceRelationshipSchema = z.object({
  kind: z.string().min(1).max(128),
  targetId: platformIdSchema,
  label: z.string().max(255).optional(),
}).strict();

export const evidenceRegisterBodySchema = z.object({
  ...tenantInputSchema,
  type: z.enum(evidenceTypeValues),
  title: z.string().min(1).max(500),
  description: z.string().max(20_000).optional(),
  storageRef: z.string().min(1).max(2000),
  contentType: z.string().max(255).optional(),
  contentHash: z.string().max(512).optional(),
  sizeBytes: z.number().int().nonnegative().optional(),
  runId: platformIdSchema.optional(),
  resultId: platformIdSchema.optional(),
  stepId: platformIdSchema.optional(),
  url: z.string().max(2000).optional(),
  checksum: z.string().max(512).optional(),
  mimeType: z.string().max(255).optional(),
  relationships: z.array(evidenceRelationshipSchema).max(100).optional(),
  executionId: platformIdSchema.optional(),
  lifecycleStatus: z.enum(evidenceLifecycleStatusValues).optional(),
  verificationState: z.string().max(128).optional(),
  approvalState: z.string().max(128).optional(),
  captureTime: z.string().max(64).optional(),
  authorUserId: platformIdSchema.optional(),
}).strict();

export const evidenceVerifyBodySchema = z.object({ verificationState: z.string().min(1).max(128).optional() }).strict();
export const evidenceRejectBodySchema = z.object({ reason: z.string().min(1).max(10_000).optional() }).strict();

const canonicalEnvironmentSchema = z.object({
  framework: z.string().max(128).optional(),
  version: z.string().max(128).optional(),
  commit: z.string().max(128).optional(),
  branch: z.string().max(255).optional(),
  build: z.string().max(255).optional(),
  pipeline: z.string().max(255).optional(),
  machine: z.string().max(255).optional(),
  platform: z.string().max(255).optional(),
  browser: z.string().max(255).optional(),
  device: z.string().max(255).optional(),
  os: z.string().max(255).optional(),
  nodeVersion: z.string().max(128).optional(),
  extra: stringRecordSchema.optional(),
}).strict();

const canonicalStepSchema = z.object({
  name: z.string().min(1).max(500),
  status: z.enum(normalizedResultStatusValues),
  durationMs: z.number().int().nonnegative().optional(),
  expected: z.string().max(10_000).optional(),
  actual: z.string().max(10_000).optional(),
  message: z.string().max(20_000).optional(),
  stack: z.string().max(50_000).optional(),
  evidenceRefs: stringArraySchema.optional(),
}).strict();

const canonicalCaseSchema = z.object({
  key: z.string().max(255).optional(),
  title: z.string().min(1).max(500),
  status: z.enum(normalizedResultStatusValues),
  durationMs: z.number().int().nonnegative().optional(),
  steps: z.array(canonicalStepSchema).max(1000).optional(),
  tags: stringArraySchema.optional(),
  requirementRefs: stringArraySchema.optional(),
  suiteKey: z.string().max(255).optional(),
  message: z.string().max(20_000).optional(),
  stack: z.string().max(50_000).optional(),
  storyRefs: stringArraySchema.optional(),
  planRefs: stringArraySchema.optional(),
  caseRefs: stringArraySchema.optional(),
}).strict();

const canonicalCoverageSchema = z.object({
  covered: z.number().nonnegative().optional(),
  total: z.number().nonnegative().optional(),
  percentage: z.number().min(0).max(100).optional(),
  kind: z.string().max(128).optional(),
  raw: unknownRecordSchema.optional(),
}).strict();

export const canonicalAutomationResultBodySchema = z.object({
  adapterKind: z.enum(automationAdapterValues),
  externalRunRef: z.string().min(1).max(512),
  correlationId: z.string().max(128).optional(),
  environment: canonicalEnvironmentSchema,
  suites: z.array(z.object({
    key: z.string().max(255).optional(),
    name: z.string().min(1).max(500),
    cases: z.array(canonicalCaseSchema).max(5000),
    status: z.enum(normalizedResultStatusValues).optional(),
    durationMs: z.number().int().nonnegative().optional(),
  }).strict()).max(1000),
  evidence: z.array(z.object({
    type: z.string().min(1).max(128),
    title: z.string().min(1).max(500),
    storageRef: z.string().max(2000).optional(),
    mimeType: z.string().max(255).optional(),
    sizeBytes: z.number().int().nonnegative().optional(),
    checksum: z.string().max(512).optional(),
    pathHint: z.string().max(2000).optional(),
    bytesBase64: z.string().max(1_000_000).optional(),
  }).strict()).max(5000),
  coverage: canonicalCoverageSchema.optional(),
  startedAt: z.string().max(64).optional(),
  completedAt: z.string().max(64).optional(),
  durationMs: z.number().int().nonnegative().optional(),
  overallStatus: z.enum(normalizedResultStatusValues),
  metadata: unknownRecordSchema.optional(),
  automationType: z.enum(automationTypeValues).optional(),
}).strict();

export const automationImportBodySchema = z.object({
  adapterKind: z.enum(automationAdapterValues).optional(),
  payload: z.union([z.string(), unknownRecordSchema]),
  contentType: z.string().max(255).optional(),
  fileNameHint: z.string().max(500).optional(),
  metadata: stringRecordSchema.optional(),
  sessionId: platformIdSchema.optional(),
  automationType: z.enum(automationTypeValues).optional(),
  correlationId: z.string().max(128).optional(),
  allowDuplicateReturn: z.boolean().optional(),
}).strict();

export const automationAggregateCoverageQuerySchema = z.object({ executionId: platformIdSchema.optional() }).strict();

const qualityScopeShape = {
  tenantId: z.string().min(1).max(128).optional(),
  planId: platformIdSchema.optional(),
  suiteId: platformIdSchema.optional(),
  releaseLabel: z.string().max(255).optional(),
  subjectId: platformIdSchema.optional(),
};

export const qualityScopeQuerySchema = z.object(qualityScopeShape).strict();
export const coverageRecomputeBodySchema = z.object(qualityScopeShape).strict();
export const coverageListQuerySchema = z.object({ kind: z.enum(coverageMetricKindValues).optional(), planId: platformIdSchema.optional(), subjectId: platformIdSchema.optional() }).strict();

function metricsFromJson(value: string, ctx: z.RefinementCtx): Readonly<Record<string, number>> {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "metrics must be a JSON object" });
      return {};
    }
    const result: Record<string, number> = {};
    for (const [key, metric] of Object.entries(parsed)) {
      if (typeof metric !== "number" || Number.isNaN(metric)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "metrics values must be numbers" });
        return {};
      }
      result[key] = metric;
    }
    return result;
  } catch {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "metrics must be valid JSON" });
    return {};
  }
}

export const qualityTrendsQuerySchema = z.object({
  baselineLabel: z.string().min(1).max(128).optional(),
  currentLabel: z.string().min(1).max(128).optional(),
  baselineMetrics: z.string().min(2).max(20_000).transform(metricsFromJson).optional(),
  currentMetrics: z.string().min(2).max(20_000).transform(metricsFromJson).optional(),
}).strict();

export const qualityRegressionQuerySchema = z.object({ baselineSnapshotId: platformIdSchema, currentSnapshotId: platformIdSchema }).strict();

export const defectCreateBodySchema = z.object({
  ...tenantInputSchema,
  providerKind: z.enum(defectProviderKindValues),
  providerKey: z.string().max(128).optional(),
  status: z.enum(defectStatusValues),
  internalRef: z.string().max(255).optional(),
  externalRef: z.string().max(255).optional(),
  severity: z.enum(severityValues).optional(),
  priority: z.enum(priorityValues).optional(),
  ownerUserId: platformIdSchema.optional(),
  resolution: z.string().max(10_000).optional(),
  verificationState: z.string().max(128).optional(),
  summary: z.string().max(1000).optional(),
  url: z.string().max(2000).optional(),
  requirementIds: stringArraySchema.optional(),
  planIds: stringArraySchema.optional(),
  suiteIds: stringArraySchema.optional(),
  caseIds: stringArraySchema.optional(),
  manualExecutionIds: stringArraySchema.optional(),
  automationExecutionIds: stringArraySchema.optional(),
  evidenceIds: stringArraySchema.optional(),
  releaseLabel: z.string().max(255).optional(),
  riskIds: stringArraySchema.optional(),
  workItemRefs: z.array(workItemRefSchema).max(100).optional(),
  target: z.enum(defectLinkTargetValues).optional(),
  externalId: z.string().max(255).optional(),
  resultId: platformIdSchema.optional(),
  runId: platformIdSchema.optional(),
}).strict();

export const defectUpdateBodySchema = defectCreateBodySchema.omit({ tenantId: true }).partial().strict().refine((value) => Object.keys(value).length > 0, { message: "At least one field is required for update." });
export const defectLinkBodySchema = z.object({ entityKind: z.union([z.enum(defectLinkTargetValues), z.string().min(1).max(128)]), entityId: platformIdSchema }).strict();

export const certificationCreateBodySchema = z.object({
  ...tenantInputSchema,
  key: z.string().min(1).max(128),
  name: z.string().min(1).max(255),
  status: z.enum(certificationStatusValues).optional(),
  planId: platformIdSchema.optional(),
  productLabel: z.string().max(255).optional(),
  releaseLabel: z.string().max(255).optional(),
  gateIds: stringArraySchema.optional(),
  approvalIds: stringArraySchema.optional(),
  conditions: z.string().max(10_000).optional(),
  certifiedAt: z.string().max(64).optional(),
  expiresAt: z.string().max(64).optional(),
  recommendationJson: unknownRecordSchema.optional(),
  evidenceLinks: z.object({
    requirementIds: stringArraySchema.optional(),
    planIds: stringArraySchema.optional(),
    suiteIds: stringArraySchema.optional(),
    caseIds: stringArraySchema.optional(),
    executionIds: stringArraySchema.optional(),
    evidenceIds: stringArraySchema.optional(),
    coverageIds: stringArraySchema.optional(),
    defectIds: stringArraySchema.optional(),
    riskIds: stringArraySchema.optional(),
    readinessSummaryIds: stringArraySchema.optional(),
    qualitySummaryIds: stringArraySchema.optional(),
  }).strict().optional(),
  ruleId: platformIdSchema.optional(),
}).strict();

export const certificationPrepareBodySchema = z.object({ mode: z.enum(["plan", "certification"]), planId: platformIdSchema.optional() }).strict();
export const certificationReasonBodySchema = z.object({ reason: z.string().min(1).max(10_000).optional() }).strict();
export const certificationRequiredReasonBodySchema = z.object({ reason: z.string().min(1).max(10_000) }).strict();
export const certificationConditionalApproveBodySchema = z.object({ conditions: z.string().min(1).max(10_000) }).strict();
export const releaseReadinessQuerySchema = z.object({ scope: z.enum(["plan", "certification"]).optional() }).strict();

export const traceabilityCreateBodySchema = z.object({
  ...tenantInputSchema,
  type: z.enum(traceabilityTypeValues),
  sourceKind: z.union([z.enum(traceabilityResourceTypeValues), z.string().min(1).max(128)]),
  sourceId: platformIdSchema,
  targetKind: z.union([z.enum(traceabilityResourceTypeValues), z.string().min(1).max(128)]),
  targetId: platformIdSchema,
  notes: z.string().max(10_000).optional(),
}).strict();

export const traceabilityResourceTypeParamSchema = z.enum(traceabilityResourceTypeValues);

/** Live pipeline run list query (APZTCMS-018). */
export const pipelineRunListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(10_000).optional(),
    perPage: z.coerce.number().int().min(1).max(100).optional(),
    status: z.string().min(1).max(64).optional(),
    branch: z.string().min(1).max(255).optional(),
  })
  .strict();

/** Persist a live provider run into SoR (refresh) — not workflow dispatch. */
export const pipelineImportFromProviderBodySchema = z
  .object({
    owner: pipelineOwnerParamSchema,
    repo: pipelineRepoParamSchema,
    runId: z.union([pipelineProviderRunIdParamSchema, z.number().int().positive()]),
    pipelineKey: z.string().min(1).max(128).optional(),
    pipelineId: pipelineIdParamSchema.optional(),
  })
  .strict();

/** Engineering Intelligence (APZTCMS-022) — presentation schemas only. */
export const engineeringSnapshotIdParamSchema = platformIdSchema;

const engineeringScopeSchema = z
  .object({
    tenantId: z.string().min(1).max(128).optional(),
    organisationId: z.string().min(1).max(128).optional(),
    planId: z.string().min(1).max(128).optional(),
    releaseId: z.string().min(1).max(128).optional(),
    releaseLabel: z.string().max(255).optional(),
    subjectId: z.string().min(1).max(128).optional(),
  })
  .strict();

const qualityScoreWeightsSchema = z
  .object({
    coverage: z.number().min(0).max(1),
    automation: z.number().min(0).max(1),
    manualExecution: z.number().min(0).max(1),
    failedTests: z.number().min(0).max(1),
    openDefects: z.number().min(0).max(1),
    certification: z.number().min(0).max(1),
    approvals: z.number().min(0).max(1),
    releaseReadiness: z.number().min(0).max(1),
  })
  .strict();

export const engineeringScopeBodySchema = z
  .object({
    scope: engineeringScopeSchema.optional(),
    weights: qualityScoreWeightsSchema.optional(),
    label: z.string().max(255).optional(),
  })
  .strict();

export const engineeringTrendBuildBodySchema = z
  .object({
    kind: z.enum([
      "quality",
      "coverage",
      "execution",
      "automation",
      "regression",
      "release",
      "certification",
      "defect",
      "lead_time",
      "stability",
      "risk",
      "velocity",
    ]),
    scope: engineeringScopeSchema.optional(),
    periodKind: z
      .enum(["daily", "weekly", "monthly", "quarterly", "release", "custom"])
      .optional(),
  })
  .strict();

export const engineeringBenchmarkCompareBodySchema = z
  .object({
    metricKey: z.string().min(1).max(128),
    values: z.array(z.number()).min(1).max(500),
    baselineValue: z.number().optional(),
    scope: engineeringScopeSchema.optional(),
    label: z.string().max(255).optional(),
  })
  .strict();
