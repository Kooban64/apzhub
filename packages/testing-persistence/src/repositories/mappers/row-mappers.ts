import type {
  ApprovalStatus,
  AutomationType,
  BusinessCriticality,
  CaseVersionReason,
  CertificationStatus,
  CoverageMetricKind,
  EvidenceType,
  ExecutionApprovalState,
  ExecutionStatus,
  ExecutionType,
  Impact,
  Likelihood,
  Priority,
  RegressionImportance,
  ReleaseApprovalStageKind,
  ReleaseGovernanceStatus,
  ReleaseReadinessStatus,
  ReleaseScopeKind,
  RiskLevel,
  Severity,
  TestResultStatus,
  TestStatus,
  TraceabilityLinkType,
  WorkItemRefKind,
} from "@apzhub/testing-contracts";

import type { PersistenceMeta } from "../../types";
import type {
  ApprovalHistoryRecord,
  ApprovalRecord,
  AuditRecord,
  AutomationDefinitionRecord,
  CertificationAuditRecord,
  CertificationGateDefinitionRecord,
  CertificationGateEvaluationRecord,
  CertificationHistoryRecord,
  CertificationRecordRecord,
  CertificationRuleRecord,
  ConfigurationRecord,
  CoverageRecord,
  DefectLinkRecord,
  EvidenceRecord,
  ExecutionCommentRecord,
  ExecutionHistoryRecord,
  ExecutionSessionRecord,
  ManualExecutionRecord,
  ManualStepActualRecord,
  QualitySnapshotRecord,
  RegistryEntryRecord,
  RegressionAnalysisRecord,
  RegressionSetRecord,
  ReleaseApprovalRecord,
  ReleaseAuditRecord,
  ReleaseCandidateRecord,
  ReleaseDecisionRecord,
  ReleaseDependencyRecord,
  ReleaseEvidenceRecord,
  ReleaseNoteRecord,
  ReleasePackageRecord,
  ReleaseReadinessRecord,
  ReleaseReadinessSnapshotRecord,
  ReleaseRecord,
  ReleaseRiskAssessmentRecord,
  ReleaseScopeRecord,
  ReleaseSummarySnapshotRecord,
  RequirementRecord,
  RiskRecord,
  TestCaseRecord,
  TestCaseVersionRecord,
  TestPlanRecord,
  TestPlanVersionRecord,
  TestStepRecord,
  TestSuiteRecord,
  TestSuiteVersionRecord,
  TraceabilityLinkRecord,
  WorkItemRecord,
} from "../records";

export function isoFromDate(
  value: Date | string | null | undefined,
): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value;
  return value.toISOString();
}

export function dateFromIso(value: string | undefined): Date | null {
  if (!value) return null;
  return new Date(value);
}

export function metaFromRow(row: {
  id: string;
  tenantId: string;
  organisationId: string | null;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
  archivedAt?: Date | null;
}): PersistenceMeta {
  return {
    id: row.id,
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    revision: row.revision,
    createdAt: isoFromDate(row.createdAt)!,
    updatedAt: isoFromDate(row.updatedAt)!,
    createdBy: row.createdBy ?? undefined,
    updatedBy: row.updatedBy ?? undefined,
    archivedAt: isoFromDate(row.archivedAt),
  };
}

function metaToRow(record: PersistenceMeta) {
  return {
    id: record.id,
    tenantId: record.tenantId,
    organisationId: record.organisationId ?? null,
    revision: record.revision,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
    createdBy: record.createdBy ?? null,
    updatedBy: record.updatedBy ?? null,
    archivedAt: dateFromIso(record.archivedAt),
  };
}

type MetaRow = {
  id: string;
  tenantId: string;
  organisationId: string | null;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  archivedAt: Date | null;
};

export function requirementToRow(
  record: PersistenceMeta & {
    key: string;
    title: string;
    description?: string;
    priority: string;
    tags: readonly string[];
    workItemRefs: readonly unknown[];
  },
) {
  return {
    ...metaToRow(record),
    key: record.key,
    title: record.title,
    description: record.description ?? null,
    priority: record.priority,
    tags: [...record.tags],
    workItemRefs: record.workItemRefs as Array<{
      kind: string;
      projectRefId: string;
      workItemId: string;
      label?: string;
    }>,
  };
}

export function rowToRequirement(row: MetaRow & {
  key: string;
  title: string;
  description: string | null;
  priority: string;
  tags: string[] | null;
  workItemRefs: Array<{
    kind: string;
    projectRefId: string;
    workItemId: string;
    label?: string;
  }> | null;
}): RequirementRecord {
  return {
    ...metaFromRow(row),
    key: row.key,
    title: row.title,
    description: row.description ?? undefined,
    priority: row.priority as Priority,
    tags: row.tags ?? [],
    workItemRefs: (row.workItemRefs ?? []) as never,
    riskIds: [] as readonly string[],
  };
}

export function workItemToRow(record: WorkItemRecord) {
  return {
    ...metaToRow(record),
    kind: record.kind,
    key: record.key,
    title: record.title,
    description: record.description ?? null,
    projectRefId: record.projectRefId ?? null,
    externalWorkItemId: record.externalWorkItemId ?? null,
    status: record.status,
  };
}

export function rowToWorkItem(row: MetaRow & {
  kind: string;
  key: string;
  title: string;
  description: string | null;
  projectRefId: string | null;
  externalWorkItemId: string | null;
  status: string;
}): WorkItemRecord {
  return {
    ...metaFromRow(row),
    kind: row.kind as WorkItemRefKind,
    key: row.key,
    title: row.title,
    description: row.description ?? undefined,
    projectRefId: row.projectRefId ?? undefined,
    externalWorkItemId: row.externalWorkItemId ?? undefined,
    status: row.status,
  };
}

export function riskToRow(record: RiskRecord) {
  return {
    ...metaToRow(record),
    key: record.key,
    title: record.title,
    description: record.description ?? null,
    level: record.level,
    mitigationSummary: record.mitigationSummary ?? null,
    severity: record.severity ?? null,
    likelihood: record.likelihood ?? null,
    impact: record.impact ?? null,
    businessCriticality: record.businessCriticality ?? null,
    regressionImportance: record.regressionImportance ?? null,
    ownerId: record.ownerId ?? null,
  };
}

export function rowToRisk(row: MetaRow & {
  key: string;
  title: string;
  description: string | null;
  level: string;
  mitigationSummary: string | null;
  severity: string | null;
  likelihood: string | null;
  impact: string | null;
  businessCriticality: string | null;
  regressionImportance: string | null;
  ownerId: string | null;
}): RiskRecord {
  return {
    ...metaFromRow(row),
    key: row.key,
    title: row.title,
    description: row.description ?? undefined,
    level: row.level as RiskLevel,
    mitigationSummary: row.mitigationSummary ?? undefined,
    requirementIds: [] as readonly string[],
    severity: (row.severity as Severity | null) ?? undefined,
    likelihood: (row.likelihood as Likelihood | null) ?? undefined,
    impact: (row.impact as Impact | null) ?? undefined,
    businessCriticality:
      (row.businessCriticality as BusinessCriticality | null) ?? undefined,
    regressionImportance:
      (row.regressionImportance as RegressionImportance | null) ?? undefined,
    ownerId: row.ownerId ?? undefined,
  };
}

export function testPlanToRow(record: TestPlanRecord) {
  return {
    ...metaToRow(record),
    key: record.key,
    name: record.name,
    description: record.description ?? null,
    status: record.status,
    releaseLabel: record.releaseLabel ?? null,
    milestoneLabel: record.milestoneLabel ?? null,
    ownerId: record.ownerId ?? null,
    assigneeId: record.assigneeId ?? null,
    versionNumber: record.versionNumber ?? 1,
    parentPlanId: record.parentPlanId ?? null,
  };
}

export function rowToTestPlan(row: MetaRow & {
  key: string;
  name: string;
  description: string | null;
  status: string;
  releaseLabel: string | null;
  milestoneLabel: string | null;
  ownerId: string | null;
  assigneeId: string | null;
  versionNumber: number;
  parentPlanId: string | null;
}): TestPlanRecord {
  return {
    ...metaFromRow(row),
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    status: row.status as TestStatus,
    releaseLabel: row.releaseLabel ?? undefined,
    milestoneLabel: row.milestoneLabel ?? undefined,
    suiteIds: [] as readonly string[],
    requirementIds: [] as readonly string[],
    riskIds: [] as readonly string[],
    ownerId: row.ownerId ?? undefined,
    assigneeId: row.assigneeId ?? undefined,
    versionNumber: row.versionNumber,
    parentPlanId: row.parentPlanId ?? undefined,
  };
}

export function testSuiteToRow(record: TestSuiteRecord) {
  return {
    ...metaToRow(record),
    key: record.key,
    name: record.name,
    description: record.description ?? null,
    status: record.status,
    isRegression: record.isRegression,
    ownerId: record.ownerId ?? null,
    parentSuiteId: record.parentSuiteId ?? null,
    sortOrder: record.sortOrder ?? 0,
    versionNumber: record.versionNumber ?? 1,
    groupKey: record.groupKey ?? null,
  };
}

export function rowToTestSuite(row: MetaRow & {
  key: string;
  name: string;
  description: string | null;
  status: string;
  isRegression: boolean;
  ownerId: string | null;
  parentSuiteId: string | null;
  sortOrder: number;
  versionNumber: number;
  groupKey: string | null;
}): TestSuiteRecord {
  return {
    ...metaFromRow(row),
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    status: row.status as TestStatus,
    isRegression: row.isRegression,
    planIds: [] as readonly string[],
    caseIds: [] as readonly string[],
    ownerId: row.ownerId ?? undefined,
    parentSuiteId: row.parentSuiteId ?? undefined,
    sortOrder: row.sortOrder,
    versionNumber: row.versionNumber,
    groupKey: row.groupKey ?? undefined,
  };
}

export function testCaseToRow(record: TestCaseRecord) {
  return {
    ...metaToRow(record),
    key: record.key,
    title: record.title,
    description: record.description ?? null,
    status: record.status,
    priority: record.priority,
    tags: [...record.tags],
    estimatedMinutes: record.estimatedMinutes ?? null,
    preconditions: record.preconditions ?? null,
    postconditions: record.postconditions ?? null,
    expectedResultsSummary: record.expectedResultsSummary ?? null,
    templateKey: record.templateKey ?? null,
    parameters: [...(record.parameters ?? [])],
    components: [...(record.components ?? [])],
    ownerId: record.ownerId ?? null,
    reviewerId: record.reviewerId ?? null,
    versionNumber: record.versionNumber ?? 1,
    parentCaseId: record.parentCaseId ?? null,
    riskLevel: record.riskLevel ?? null,
  };
}

export function rowToTestCase(row: MetaRow & {
  key: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  tags: string[] | null;
  estimatedMinutes: number | null;
  preconditions: string | null;
  postconditions: string | null;
  expectedResultsSummary: string | null;
  templateKey: string | null;
  parameters: Array<{
    key: string;
    label?: string;
    defaultValue?: string;
    required?: boolean;
  }> | null;
  components: string[] | null;
  ownerId: string | null;
  reviewerId: string | null;
  versionNumber: number;
  parentCaseId: string | null;
  riskLevel: string | null;
}): TestCaseRecord {
  return {
    ...metaFromRow(row),
    key: row.key,
    title: row.title,
    description: row.description ?? undefined,
    status: row.status as TestStatus,
    priority: row.priority as Priority,
    tags: row.tags ?? [],
    estimatedMinutes: row.estimatedMinutes ?? undefined,
    suiteIds: [] as readonly string[],
    requirementIds: [] as readonly string[],
    stepIds: [] as readonly string[],
    preconditions: row.preconditions ?? undefined,
    postconditions: row.postconditions ?? undefined,
    expectedResultsSummary: row.expectedResultsSummary ?? undefined,
    templateKey: row.templateKey ?? undefined,
    parameters: row.parameters ?? [],
    components: row.components ?? [],
    ownerId: row.ownerId ?? undefined,
    reviewerId: row.reviewerId ?? undefined,
    versionNumber: row.versionNumber,
    parentCaseId: row.parentCaseId ?? undefined,
    riskLevel: (row.riskLevel as Severity | null) ?? undefined,
  };
}

export function testStepToRow(record: TestStepRecord) {
  return {
    id: record.id,
    tenantId: record.tenantId,
    organisationId: record.organisationId ?? null,
    caseId: record.caseId,
    ordinal: record.ordinal,
    action: record.action,
    expectedResult: record.expectedResult,
    dataHint: record.dataHint ?? null,
    revision: record.revision,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
    archivedAt: dateFromIso(record.archivedAt),
  };
}

export function rowToTestStep(row: {
  id: string;
  tenantId: string;
  organisationId: string | null;
  caseId: string;
  ordinal: number;
  action: string;
  expectedResult: string;
  dataHint: string | null;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}): TestStepRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    revision: row.revision,
    createdAt: isoFromDate(row.createdAt)!,
    updatedAt: isoFromDate(row.updatedAt)!,
    archivedAt: isoFromDate(row.archivedAt),
    caseId: row.caseId,
    ordinal: row.ordinal,
    action: row.action,
    expectedResult: row.expectedResult,
    dataHint: row.dataHint ?? undefined,
  };
}

export function testCaseVersionToRow(record: TestCaseVersionRecord) {
  return {
    ...metaToRow(record),
    caseId: record.caseId,
    versionNumber: record.versionNumber,
    reason: record.reason,
    snapshot: { ...record.snapshot },
    changedByUserId: record.changedByUserId ?? null,
    changeSummary: record.changeSummary ?? null,
  };
}

export function rowToTestCaseVersion(row: MetaRow & {
  caseId: string;
  versionNumber: number;
  reason: string;
  snapshot: Record<string, unknown> | null;
  changedByUserId: string | null;
  changeSummary: string | null;
}): TestCaseVersionRecord {
  return {
    ...metaFromRow(row),
    caseId: row.caseId,
    versionNumber: row.versionNumber,
    reason: row.reason as CaseVersionReason,
    snapshot: row.snapshot ?? {},
    changedByUserId: row.changedByUserId ?? undefined,
    changeSummary: row.changeSummary ?? undefined,
  };
}

export function testPlanVersionToRow(record: TestPlanVersionRecord) {
  return {
    ...metaToRow(record),
    planId: record.planId,
    versionNumber: record.versionNumber,
    reason: record.reason,
    snapshot: { ...record.snapshot },
    changedByUserId: record.changedByUserId ?? null,
    changeSummary: record.changeSummary ?? null,
  };
}

export function rowToTestPlanVersion(row: MetaRow & {
  planId: string;
  versionNumber: number;
  reason: string;
  snapshot: Record<string, unknown> | null;
  changedByUserId: string | null;
  changeSummary: string | null;
}): TestPlanVersionRecord {
  return {
    ...metaFromRow(row),
    planId: row.planId,
    versionNumber: row.versionNumber,
    reason: row.reason as CaseVersionReason,
    snapshot: row.snapshot ?? {},
    changedByUserId: row.changedByUserId ?? undefined,
    changeSummary: row.changeSummary ?? undefined,
  };
}

export function testSuiteVersionToRow(record: TestSuiteVersionRecord) {
  return {
    ...metaToRow(record),
    suiteId: record.suiteId,
    versionNumber: record.versionNumber,
    reason: record.reason,
    snapshot: { ...record.snapshot },
    changedByUserId: record.changedByUserId ?? null,
    changeSummary: record.changeSummary ?? null,
  };
}

export function rowToTestSuiteVersion(row: MetaRow & {
  suiteId: string;
  versionNumber: number;
  reason: string;
  snapshot: Record<string, unknown> | null;
  changedByUserId: string | null;
  changeSummary: string | null;
}): TestSuiteVersionRecord {
  return {
    ...metaFromRow(row),
    suiteId: row.suiteId,
    versionNumber: row.versionNumber,
    reason: row.reason as CaseVersionReason,
    snapshot: row.snapshot ?? {},
    changedByUserId: row.changedByUserId ?? undefined,
    changeSummary: row.changeSummary ?? undefined,
  };
}

export function regressionSetToRow(record: RegressionSetRecord) {
  return {
    ...metaToRow(record),
    key: record.key,
    name: record.name,
    description: record.description ?? null,
    planId: record.planId ?? null,
    suiteIds: [...record.suiteIds],
    ownerId: record.ownerId ?? null,
  };
}

export function rowToRegressionSet(row: MetaRow & {
  key: string;
  name: string;
  description: string | null;
  planId: string | null;
  suiteIds: string[] | null;
  ownerId: string | null;
}): RegressionSetRecord {
  return {
    ...metaFromRow(row),
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    planId: row.planId ?? undefined,
    suiteIds: row.suiteIds ?? [],
    ownerId: row.ownerId ?? undefined,
  };
}

export function executionSessionToRow(record: ExecutionSessionRecord) {
  return {
    ...metaToRow(record),
    planId: record.planId ?? null,
    suiteId: record.suiteId ?? null,
    executionType: record.executionType,
    status: record.status,
    startedAt: dateFromIso(record.startedAt),
    completedAt: dateFromIso(record.completedAt),
    assigneeId: record.assigneeId ?? null,
    notes: record.notes ?? null,
  };
}

export function rowToExecutionSession(row: MetaRow & {
  planId: string | null;
  suiteId: string | null;
  executionType: string;
  status: string;
  startedAt: Date | null;
  completedAt: Date | null;
  assigneeId: string | null;
  notes: string | null;
}): ExecutionSessionRecord {
  return {
    ...metaFromRow(row),
    planId: row.planId ?? undefined,
    suiteId: row.suiteId ?? undefined,
    executionType: row.executionType as ExecutionType,
    status: row.status as ExecutionStatus,
    startedAt: isoFromDate(row.startedAt),
    completedAt: isoFromDate(row.completedAt),
    assigneeId: row.assigneeId ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export function manualExecutionToRow(record: ManualExecutionRecord) {
  return {
    ...metaToRow(record),
    sessionId: record.sessionId,
    caseId: record.caseId,
    status: record.status,
    assigneeId: record.assigneeId ?? null,
    testerId: record.testerId ?? null,
    reviewerId: record.reviewerId ?? null,
    startedAt: dateFromIso(record.startedAt),
    pausedAt: dateFromIso(record.pausedAt),
    resumedAt: dateFromIso(record.resumedAt),
    completedAt: dateFromIso(record.completedAt),
    approvalState: record.approvalState ?? "none",
    comments: [...record.comments],
    stepActuals: record.stepActuals.map((step) => ({ ...step })),
    overallResult: record.overallResult ?? null,
    restartOfId: record.restartOfId ?? null,
    parameterOverrides: record.parameterOverrides
      ? { ...record.parameterOverrides }
      : {},
    blockReason: record.blockReason ?? null,
  };
}

export function rowToManualExecution(row: MetaRow & {
  sessionId: string;
  caseId: string;
  status: string;
  assigneeId: string | null;
  testerId: string | null;
  reviewerId: string | null;
  startedAt: Date | null;
  pausedAt: Date | null;
  resumedAt: Date | null;
  completedAt: Date | null;
  approvalState: string;
  comments: ExecutionCommentRecord[] | null;
  stepActuals: Array<Record<string, unknown>> | null;
  overallResult: string | null;
  restartOfId: string | null;
  parameterOverrides?: Record<string, string> | null;
  blockReason?: string | null;
}): ManualExecutionRecord {
  return {
    ...metaFromRow(row),
    sessionId: row.sessionId,
    caseId: row.caseId,
    status: row.status as ExecutionStatus,
    assigneeId: row.assigneeId ?? undefined,
    testerId: row.testerId ?? undefined,
    reviewerId: row.reviewerId ?? undefined,
    startedAt: isoFromDate(row.startedAt),
    pausedAt: isoFromDate(row.pausedAt),
    resumedAt: isoFromDate(row.resumedAt),
    completedAt: isoFromDate(row.completedAt),
    approvalState: row.approvalState as ExecutionApprovalState,
    comments: row.comments ?? [],
    stepActuals: ((row.stepActuals ?? []) as unknown as ManualStepActualRecord[]),
    overallResult: (row.overallResult as TestResultStatus | null) ?? undefined,
    restartOfId: row.restartOfId ?? undefined,
    parameterOverrides: row.parameterOverrides ?? undefined,
    blockReason: row.blockReason ?? undefined,
  };
}

export function evidenceToRow(record: EvidenceRecord) {
  return {
    ...metaToRow(record),
    type: record.type,
    title: record.title,
    description: record.description ?? null,
    storageRef: record.storageRef,
    contentType: record.contentType ?? null,
    contentHash: record.contentHash ?? null,
    sizeBytes: record.sizeBytes ?? null,
    sessionId: record.sessionId ?? null,
    caseId: record.caseId ?? null,
    stepId: record.stepId ?? null,
    url: record.url ?? null,
    checksum: record.checksum ?? null,
    mimeType: record.mimeType ?? null,
    relationships: [...(record.relationships ?? [])],
    executionId: record.executionId ?? null,
    lifecycleStatus: record.lifecycleStatus ?? "pending",
    verificationState: record.verificationState ?? null,
    evidenceApprovalState: record.evidenceApprovalState ?? null,
    captureTime: dateFromIso(record.captureTime),
    authorUserId: record.authorUserId ?? null,
  };
}

export function rowToEvidence(row: MetaRow & {
  type: string;
  title: string;
  description: string | null;
  storageRef: string;
  contentType: string | null;
  contentHash: string | null;
  sizeBytes: number | null;
  sessionId: string | null;
  caseId: string | null;
  stepId: string | null;
  url: string | null;
  checksum: string | null;
  mimeType: string | null;
  relationships: Array<{ kind: string; targetId: string; label?: string }> | null;
  executionId: string | null;
  lifecycleStatus?: string | null;
  verificationState?: string | null;
  evidenceApprovalState?: string | null;
  captureTime?: Date | null;
  authorUserId?: string | null;
}): EvidenceRecord {
  return {
    ...metaFromRow(row),
    type: row.type as EvidenceType,
    title: row.title,
    description: row.description ?? undefined,
    storageRef: row.storageRef,
    contentType: row.contentType ?? undefined,
    contentHash: row.contentHash ?? undefined,
    sizeBytes: row.sizeBytes ?? undefined,
    sessionId: row.sessionId ?? undefined,
    caseId: row.caseId ?? undefined,
    stepId: row.stepId ?? undefined,
    url: row.url ?? undefined,
    checksum: row.checksum ?? undefined,
    mimeType: row.mimeType ?? undefined,
    relationships: row.relationships ?? [],
    executionId: row.executionId ?? undefined,
    lifecycleStatus: (row.lifecycleStatus as EvidenceRecord["lifecycleStatus"]) ?? "pending",
    verificationState: row.verificationState ?? undefined,
    evidenceApprovalState: row.evidenceApprovalState ?? undefined,
    captureTime: isoFromDate(row.captureTime ?? null),
    authorUserId: row.authorUserId ?? undefined,
  };
}

export function approvalToRow(record: ApprovalRecord) {
  return {
    ...metaToRow(record),
    certificationRecordId: record.certificationRecordId,
    gateId: record.gateId ?? null,
    status: record.status,
    requestedFromUserId: record.requestedFromUserId ?? null,
    decidedByUserId: record.decidedByUserId ?? null,
    decidedAt: dateFromIso(record.decidedAt),
    comments: record.comments ?? null,
    conditions: record.conditions ?? null,
    signatureJson: record.signatureJson ? { ...record.signatureJson } : null,
    witnessesJson: record.witnessesJson
      ? record.witnessesJson.map((w) => ({ ...w }))
      : null,
    authorUserId: record.authorUserId ?? null,
    reviewerUserId: record.reviewerUserId ?? null,
    approverUserId: record.approverUserId ?? null,
    historyJson: record.historyJson
      ? record.historyJson.map((h) => ({ ...h }))
      : null,
    subjectKind: record.subjectKind ?? null,
    subjectId: record.subjectId ?? null,
    stagesJson: record.stagesJson
      ? record.stagesJson.map((s) => ({ ...s }))
      : null,
    currentStageOrdinal: record.currentStageOrdinal ?? null,
    stageDecisionsJson: record.stageDecisionsJson
      ? record.stageDecisionsJson.map((s) => ({ ...s }))
      : null,
  };
}

export function rowToApproval(row: MetaRow & {
  certificationRecordId: string;
  gateId: string | null;
  status: string;
  requestedFromUserId: string | null;
  decidedByUserId: string | null;
  decidedAt: Date | null;
  comments: string | null;
  conditions: string | null;
  signatureJson: Record<string, unknown> | null;
  witnessesJson: Array<Record<string, unknown>> | null;
  authorUserId: string | null;
  reviewerUserId: string | null;
  approverUserId: string | null;
  historyJson: Array<Record<string, unknown>> | null;
  subjectKind: string | null;
  subjectId: string | null;
  stagesJson?: Array<Record<string, unknown>> | null;
  currentStageOrdinal?: number | null;
  stageDecisionsJson?: Array<Record<string, unknown>> | null;
}): ApprovalRecord {
  return {
    ...metaFromRow(row),
    certificationRecordId: row.certificationRecordId,
    gateId: row.gateId ?? undefined,
    status: row.status as ApprovalStatus,
    requestedFromUserId: row.requestedFromUserId ?? undefined,
    decidedByUserId: row.decidedByUserId ?? undefined,
    decidedAt: isoFromDate(row.decidedAt),
    comments: row.comments ?? undefined,
    conditions: row.conditions ?? undefined,
    signatureJson: row.signatureJson ?? undefined,
    witnessesJson: row.witnessesJson ?? undefined,
    authorUserId: row.authorUserId ?? undefined,
    reviewerUserId: row.reviewerUserId ?? undefined,
    approverUserId: row.approverUserId ?? undefined,
    historyJson: row.historyJson ?? undefined,
    subjectKind: row.subjectKind ?? undefined,
    subjectId: row.subjectId ?? undefined,
    stagesJson: row.stagesJson ?? undefined,
    currentStageOrdinal: row.currentStageOrdinal ?? undefined,
    stageDecisionsJson: row.stageDecisionsJson ?? undefined,
  };
}

export function certificationToRow(record: CertificationRecordRecord) {
  return {
    ...metaToRow(record),
    key: record.key,
    name: record.name,
    status: record.status,
    planId: record.planId ?? null,
    productLabel: record.productLabel ?? null,
    releaseLabel: record.releaseLabel ?? null,
    gateIds: [...record.gateIds],
    approvalIds: [...record.approvalIds],
    conditions: record.conditions ?? null,
    certifiedAt: dateFromIso(record.certifiedAt),
    expiresAt: dateFromIso(record.expiresAt),
    gateEvaluationIds: [...(record.gateEvaluationIds ?? [])],
    currentRecommendation: record.currentRecommendation ?? null,
    recommendationJson: record.recommendationJson
      ? { ...record.recommendationJson }
      : null,
    evidenceLinksJson: record.evidenceLinksJson
      ? { ...record.evidenceLinksJson }
      : null,
    ruleId: record.ruleId ?? null,
  };
}

export function rowToCertification(row: MetaRow & {
  key: string;
  name: string;
  status: string;
  planId: string | null;
  productLabel: string | null;
  releaseLabel: string | null;
  gateIds: string[] | null;
  approvalIds: string[] | null;
  conditions: string | null;
  certifiedAt: Date | null;
  expiresAt?: Date | null;
  gateEvaluationIds?: string[] | null;
  currentRecommendation?: string | null;
  recommendationJson?: Record<string, unknown> | null;
  evidenceLinksJson?: Record<string, unknown> | null;
  ruleId?: string | null;
}): CertificationRecordRecord {
  return {
    ...metaFromRow(row),
    key: row.key,
    name: row.name,
    status: row.status as CertificationStatus,
    planId: row.planId ?? undefined,
    productLabel: row.productLabel ?? undefined,
    releaseLabel: row.releaseLabel ?? undefined,
    gateIds: row.gateIds ?? [],
    approvalIds: row.approvalIds ?? [],
    conditions: row.conditions ?? undefined,
    certifiedAt: isoFromDate(row.certifiedAt),
    expiresAt: isoFromDate(row.expiresAt ?? null),
    gateEvaluationIds: row.gateEvaluationIds ?? [],
    currentRecommendation: row.currentRecommendation ?? undefined,
    recommendationJson: row.recommendationJson ?? undefined,
    evidenceLinksJson: row.evidenceLinksJson ?? undefined,
    ruleId: row.ruleId ?? undefined,
  };
}

export function certificationGateDefinitionToRow(
  record: CertificationGateDefinitionRecord,
) {
  return {
    ...metaToRow(record),
    gateKey: record.gateKey,
    name: record.name,
    description: record.description ?? null,
    kind: record.kind,
    required: record.required,
    configJson: record.configJson ? { ...record.configJson } : {},
    templateKey: record.templateKey ?? null,
    ordinal: record.ordinal ?? 0,
    enabled: record.enabled,
  };
}

export function rowToCertificationGateDefinition(row: MetaRow & {
  gateKey: string;
  name: string;
  description: string | null;
  kind: string;
  required: boolean;
  configJson: Record<string, unknown> | null;
  templateKey: string | null;
  ordinal: number | null;
  enabled: boolean;
}): CertificationGateDefinitionRecord {
  return {
    ...metaFromRow(row),
    gateKey: row.gateKey,
    name: row.name,
    description: row.description ?? undefined,
    kind: row.kind,
    required: row.required,
    configJson: row.configJson ?? undefined,
    templateKey: row.templateKey ?? undefined,
    ordinal: row.ordinal ?? undefined,
    enabled: row.enabled,
  };
}

export function certificationGateEvaluationToRow(
  record: CertificationGateEvaluationRecord,
) {
  return {
    ...metaToRow(record),
    certificationRecordId: record.certificationRecordId,
    gateDefinitionId: record.gateDefinitionId ?? null,
    gateKey: record.gateKey,
    status: record.status,
    reason: record.reason,
    supportingEvidence: [...record.supportingEvidence],
    evaluatedAt: dateFromIso(record.evaluatedAt)!,
    evaluatorUserId: record.evaluatorUserId ?? null,
    traceabilityRefs: [...record.traceabilityRefs],
    detailsJson: record.detailsJson ? { ...record.detailsJson } : {},
  };
}

export function rowToCertificationGateEvaluation(row: MetaRow & {
  certificationRecordId: string;
  gateDefinitionId: string | null;
  gateKey: string;
  status: string;
  reason: string;
  supportingEvidence: string[] | null;
  evaluatedAt: Date;
  evaluatorUserId: string | null;
  traceabilityRefs: string[] | null;
  detailsJson: Record<string, unknown> | null;
}): CertificationGateEvaluationRecord {
  return {
    ...metaFromRow(row),
    certificationRecordId: row.certificationRecordId,
    gateDefinitionId: row.gateDefinitionId ?? undefined,
    gateKey: row.gateKey,
    status: row.status,
    reason: row.reason,
    supportingEvidence: row.supportingEvidence ?? [],
    evaluatedAt: isoFromDate(row.evaluatedAt)!,
    evaluatorUserId: row.evaluatorUserId ?? undefined,
    traceabilityRefs: row.traceabilityRefs ?? [],
    detailsJson: row.detailsJson ?? undefined,
  };
}

export function certificationRuleToRow(record: CertificationRuleRecord) {
  return {
    ...metaToRow(record),
    key: record.key,
    name: record.name,
    certificationRecordId: record.certificationRecordId ?? null,
    planId: record.planId ?? null,
    productLabel: record.productLabel ?? null,
    requiredGateKeys: [...record.requiredGateKeys],
    optionalGateKeys: [...record.optionalGateKeys],
    approvalStagesJson: record.approvalStagesJson
      ? record.approvalStagesJson.map((s) => ({ ...s }))
      : null,
    enabled: record.enabled,
    configJson: record.configJson ? { ...record.configJson } : {},
  };
}

export function rowToCertificationRule(row: MetaRow & {
  key: string;
  name: string;
  certificationRecordId: string | null;
  planId: string | null;
  productLabel: string | null;
  requiredGateKeys: string[] | null;
  optionalGateKeys: string[] | null;
  approvalStagesJson: Array<Record<string, unknown>> | null;
  enabled: boolean;
  configJson: Record<string, unknown> | null;
}): CertificationRuleRecord {
  return {
    ...metaFromRow(row),
    key: row.key,
    name: row.name,
    certificationRecordId: row.certificationRecordId ?? undefined,
    planId: row.planId ?? undefined,
    productLabel: row.productLabel ?? undefined,
    requiredGateKeys: row.requiredGateKeys ?? [],
    optionalGateKeys: row.optionalGateKeys ?? [],
    approvalStagesJson: row.approvalStagesJson ?? undefined,
    enabled: row.enabled,
    configJson: row.configJson ?? undefined,
  };
}

export function certificationAuditToRow(record: CertificationAuditRecord) {
  return {
    id: record.id,
    tenantId: record.tenantId,
    organisationId: record.organisationId ?? null,
    certificationRecordId: record.certificationRecordId,
    occurredAt: dateFromIso(record.occurredAt)!,
    actorUserId: record.actorUserId ?? null,
    action: record.action,
    summary: record.summary,
    detailsJson: record.detailsJson ? { ...record.detailsJson } : {},
    correlationId: record.correlationId ?? null,
  };
}

export function rowToCertificationAudit(row: {
  id: string;
  tenantId: string;
  organisationId: string | null;
  certificationRecordId: string;
  occurredAt: Date;
  actorUserId: string | null;
  action: string;
  summary: string;
  detailsJson: Record<string, unknown> | null;
  correlationId: string | null;
}): CertificationAuditRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    certificationRecordId: row.certificationRecordId,
    occurredAt: isoFromDate(row.occurredAt)!,
    actorUserId: row.actorUserId ?? undefined,
    action: row.action,
    summary: row.summary,
    detailsJson: row.detailsJson ?? undefined,
    correlationId: row.correlationId ?? undefined,
  };
}

export function certificationHistoryToRow(record: CertificationHistoryRecord) {
  return {
    id: record.id,
    tenantId: record.tenantId,
    organisationId: record.organisationId ?? null,
    certificationRecordId: record.certificationRecordId,
    occurredAt: dateFromIso(record.occurredAt)!,
    actorUserId: record.actorUserId ?? null,
    fromStatus: record.fromStatus ?? null,
    toStatus: record.toStatus,
    reason: record.reason ?? null,
    correlationId: record.correlationId ?? null,
    detailsJson: record.detailsJson ? { ...record.detailsJson } : {},
  };
}

export function rowToCertificationHistory(row: {
  id: string;
  tenantId: string;
  organisationId: string | null;
  certificationRecordId: string;
  occurredAt: Date;
  actorUserId: string | null;
  fromStatus: string | null;
  toStatus: string;
  reason: string | null;
  correlationId: string | null;
  detailsJson: Record<string, unknown> | null;
}): CertificationHistoryRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    certificationRecordId: row.certificationRecordId,
    occurredAt: isoFromDate(row.occurredAt)!,
    actorUserId: row.actorUserId ?? undefined,
    fromStatus: row.fromStatus ?? undefined,
    toStatus: row.toStatus,
    reason: row.reason ?? undefined,
    correlationId: row.correlationId ?? undefined,
    detailsJson: row.detailsJson ?? undefined,
  };
}

export function releaseReadinessToRow(record: ReleaseReadinessRecord) {
  return {
    ...metaToRow(record),
    certificationRecordId: record.certificationRecordId,
    status: record.status,
    summary: record.summary,
    blockingGateIds: [...record.blockingGateIds],
    assessedAt: new Date(record.assessedAt),
  };
}

export function rowToReleaseReadiness(row: MetaRow & {
  certificationRecordId: string;
  status: string;
  summary: string;
  blockingGateIds: string[] | null;
  assessedAt: Date;
}): ReleaseReadinessRecord {
  return {
    ...metaFromRow(row),
    certificationRecordId: row.certificationRecordId,
    status: row.status as ReleaseReadinessStatus,
    summary: row.summary,
    blockingGateIds: row.blockingGateIds ?? [],
    assessedAt: isoFromDate(row.assessedAt)!,
  };
}

export function releaseToRow(record: ReleaseRecord) {
  return {
    ...metaToRow(record),
    key: record.key,
    name: record.name,
    status: record.status,
    description: record.description ?? null,
    windowJson: record.windowJson ? { ...record.windowJson } : null,
    metadataJson: record.metadataJson ? { ...record.metadataJson } : {},
  };
}

export function rowToRelease(row: MetaRow & {
  key: string;
  name: string;
  status: string;
  description: string | null;
  windowJson: Record<string, unknown> | null;
  metadataJson: Record<string, unknown> | null;
}): ReleaseRecord {
  return {
    ...metaFromRow(row),
    key: row.key,
    name: row.name,
    status: row.status as ReleaseGovernanceStatus,
    description: row.description ?? undefined,
    windowJson: row.windowJson ?? undefined,
    metadataJson: row.metadataJson ?? undefined,
  };
}

export function releaseScopeToRow(record: ReleaseScopeRecord) {
  return {
    ...metaToRow(record),
    releaseId: record.releaseId,
    kind: record.kind,
    refId: record.refId,
    label: record.label ?? null,
  };
}

export function rowToReleaseScope(row: MetaRow & {
  releaseId: string;
  kind: string;
  refId: string;
  label: string | null;
}): ReleaseScopeRecord {
  return {
    ...metaFromRow(row),
    releaseId: row.releaseId,
    kind: row.kind as ReleaseScopeKind,
    refId: row.refId,
    label: row.label ?? undefined,
  };
}

export function releasePackageToRow(record: ReleasePackageRecord) {
  return {
    ...metaToRow(record),
    releaseId: record.releaseId,
    name: record.name,
    versionLabel: record.versionLabel,
    description: record.description ?? null,
  };
}

export function rowToReleasePackage(row: MetaRow & {
  releaseId: string;
  name: string;
  versionLabel: string;
  description: string | null;
}): ReleasePackageRecord {
  return {
    ...metaFromRow(row),
    releaseId: row.releaseId,
    name: row.name,
    versionLabel: row.versionLabel,
    description: row.description ?? undefined,
  };
}

export function releaseCandidateToRow(record: ReleaseCandidateRecord) {
  return {
    ...metaToRow(record),
    releaseId: record.releaseId,
    label: record.label,
    status: record.status,
    notes: record.notes ?? null,
  };
}

export function rowToReleaseCandidate(row: MetaRow & {
  releaseId: string;
  label: string;
  status: string;
  notes: string | null;
}): ReleaseCandidateRecord {
  return {
    ...metaFromRow(row),
    releaseId: row.releaseId,
    label: row.label,
    status: row.status as ReleaseGovernanceStatus,
    notes: row.notes ?? undefined,
  };
}

export function releaseApprovalToRow(record: ReleaseApprovalRecord) {
  return {
    ...metaToRow(record),
    releaseId: record.releaseId,
    stageKind: record.stageKind,
    status: record.status,
    requestedFromUserId: record.requestedFromUserId ?? null,
    decidedByUserId: record.decidedByUserId ?? null,
    decidedAt: dateFromIso(record.decidedAt),
    comments: record.comments ?? null,
    conditions: record.conditions ?? null,
  };
}

export function rowToReleaseApproval(row: MetaRow & {
  releaseId: string;
  stageKind: string;
  status: string;
  requestedFromUserId: string | null;
  decidedByUserId: string | null;
  decidedAt: Date | null;
  comments: string | null;
  conditions: string | null;
}): ReleaseApprovalRecord {
  return {
    ...metaFromRow(row),
    releaseId: row.releaseId,
    stageKind: row.stageKind as ReleaseApprovalStageKind,
    status: row.status as ReleaseApprovalRecord["status"],
    requestedFromUserId: row.requestedFromUserId ?? undefined,
    decidedByUserId: row.decidedByUserId ?? undefined,
    decidedAt: isoFromDate(row.decidedAt),
    comments: row.comments ?? undefined,
    conditions: row.conditions ?? undefined,
  };
}

export function releaseDecisionToRow(record: ReleaseDecisionRecord) {
  return {
    ...metaToRow(record),
    releaseId: record.releaseId,
    verdict: record.verdict,
    decidedByUserId: record.decidedByUserId,
    decidedAt: dateFromIso(record.decidedAt)!,
    rationale: record.rationale,
    isAutomatic: false,
  };
}

export function rowToReleaseDecision(row: MetaRow & {
  releaseId: string;
  verdict: string;
  decidedByUserId: string;
  decidedAt: Date;
  rationale: string;
  isAutomatic: boolean;
}): ReleaseDecisionRecord {
  return {
    ...metaFromRow(row),
    releaseId: row.releaseId,
    verdict: row.verdict as ReleaseDecisionRecord["verdict"],
    decidedByUserId: row.decidedByUserId,
    decidedAt: isoFromDate(row.decidedAt)!,
    rationale: row.rationale,
    isAutomatic: false,
  };
}

export function releaseEvidenceToRow(record: ReleaseEvidenceRecord) {
  return {
    ...metaToRow(record),
    releaseId: record.releaseId,
    kind: record.kind,
    refId: record.refId,
    summary: record.summary ?? null,
  };
}

export function rowToReleaseEvidence(row: MetaRow & {
  releaseId: string;
  kind: string;
  refId: string;
  summary: string | null;
}): ReleaseEvidenceRecord {
  return {
    ...metaFromRow(row),
    releaseId: row.releaseId,
    kind: row.kind,
    refId: row.refId,
    summary: row.summary ?? undefined,
  };
}

export function releaseDependencyToRow(record: ReleaseDependencyRecord) {
  return {
    ...metaToRow(record),
    releaseId: record.releaseId,
    dependsOnReleaseId: record.dependsOnReleaseId ?? null,
    kind: record.kind,
    required: record.required,
    notes: record.notes ?? null,
    blocked: record.blocked,
  };
}

export function rowToReleaseDependency(row: MetaRow & {
  releaseId: string;
  dependsOnReleaseId: string | null;
  kind: string;
  required: boolean;
  notes: string | null;
  blocked: boolean;
}): ReleaseDependencyRecord {
  return {
    ...metaFromRow(row),
    releaseId: row.releaseId,
    dependsOnReleaseId: row.dependsOnReleaseId ?? undefined,
    kind: row.kind,
    required: row.required,
    notes: row.notes ?? undefined,
    blocked: row.blocked,
  };
}

export function releaseNoteToRow(record: ReleaseNoteRecord) {
  return {
    ...metaToRow(record),
    releaseId: record.releaseId,
    title: record.title,
    body: record.body,
    authoredAt: dateFromIso(record.authoredAt)!,
    authorUserId: record.authorUserId ?? null,
  };
}

export function rowToReleaseNote(row: MetaRow & {
  releaseId: string;
  title: string;
  body: string;
  authoredAt: Date;
  authorUserId: string | null;
}): ReleaseNoteRecord {
  return {
    ...metaFromRow(row),
    releaseId: row.releaseId,
    title: row.title,
    body: row.body,
    authoredAt: isoFromDate(row.authoredAt)!,
    authorUserId: row.authorUserId ?? undefined,
  };
}

export function releaseRiskAssessmentToRow(record: ReleaseRiskAssessmentRecord) {
  return {
    ...metaToRow(record),
    releaseId: record.releaseId,
    snapshotJson: { ...record.snapshotJson },
    computedAt: dateFromIso(record.computedAt)!,
    isDecision: false,
  };
}

export function rowToReleaseRiskAssessment(row: MetaRow & {
  releaseId: string;
  snapshotJson: Record<string, unknown>;
  computedAt: Date;
  isDecision: boolean;
}): ReleaseRiskAssessmentRecord {
  return {
    ...metaFromRow(row),
    releaseId: row.releaseId,
    snapshotJson: row.snapshotJson ?? {},
    computedAt: isoFromDate(row.computedAt)!,
    isDecision: false,
  };
}

export function releaseReadinessSnapshotToRow(
  record: ReleaseReadinessSnapshotRecord,
) {
  return {
    ...metaToRow(record),
    releaseId: record.releaseId,
    snapshotJson: { ...record.snapshotJson },
    computedAt: dateFromIso(record.computedAt)!,
    isDecision: false,
  };
}

export function rowToReleaseReadinessSnapshot(row: MetaRow & {
  releaseId: string;
  snapshotJson: Record<string, unknown>;
  computedAt: Date;
  isDecision: boolean;
}): ReleaseReadinessSnapshotRecord {
  return {
    ...metaFromRow(row),
    releaseId: row.releaseId,
    snapshotJson: row.snapshotJson ?? {},
    computedAt: isoFromDate(row.computedAt)!,
    isDecision: false,
  };
}

export function releaseSummarySnapshotToRow(
  record: ReleaseSummarySnapshotRecord,
) {
  return {
    ...metaToRow(record),
    releaseId: record.releaseId,
    snapshotJson: { ...record.snapshotJson },
    computedAt: dateFromIso(record.computedAt)!,
    isDecision: false,
  };
}

export function rowToReleaseSummarySnapshot(row: MetaRow & {
  releaseId: string;
  snapshotJson: Record<string, unknown>;
  computedAt: Date;
  isDecision: boolean;
}): ReleaseSummarySnapshotRecord {
  return {
    ...metaFromRow(row),
    releaseId: row.releaseId,
    snapshotJson: row.snapshotJson ?? {},
    computedAt: isoFromDate(row.computedAt)!,
    isDecision: false,
  };
}

export function releaseAuditToRow(record: ReleaseAuditRecord) {
  return {
    id: record.id,
    tenantId: record.tenantId,
    organisationId: record.organisationId ?? null,
    releaseId: record.releaseId,
    occurredAt: dateFromIso(record.occurredAt)!,
    actorUserId: record.actorUserId ?? null,
    action: record.action,
    summary: record.summary,
    detailsJson: record.detailsJson ? { ...record.detailsJson } : {},
    correlationId: record.correlationId ?? null,
  };
}

export function rowToReleaseAudit(row: {
  id: string;
  tenantId: string;
  organisationId: string | null;
  releaseId: string;
  occurredAt: Date;
  actorUserId: string | null;
  action: string;
  summary: string;
  detailsJson: Record<string, unknown> | null;
  correlationId: string | null;
}): ReleaseAuditRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    releaseId: row.releaseId,
    occurredAt: isoFromDate(row.occurredAt)!,
    actorUserId: row.actorUserId ?? undefined,
    action: row.action,
    summary: row.summary,
    detailsJson: row.detailsJson ?? undefined,
    correlationId: row.correlationId ?? undefined,
  };
}

export function coverageToRow(record: CoverageRecord) {
  return {
    ...metaToRow(record),
    kind: record.kind,
    subjectId: record.subjectId,
    coveredCount: record.coveredCount,
    totalCount: record.totalCount,
    percentage: record.percentage,
    computedAt: new Date(record.computedAt),
    planId: record.planId ?? null,
    suiteId: record.suiteId ?? null,
    requirementId: record.requirementId ?? null,
    riskId: record.riskId ?? null,
  };
}

export function rowToCoverage(row: MetaRow & {
  kind: string;
  subjectId: string;
  coveredCount: number;
  totalCount: number;
  percentage: number;
  computedAt: Date;
  planId: string | null;
  suiteId: string | null;
  requirementId: string | null;
  riskId: string | null;
}): CoverageRecord {
  return {
    ...metaFromRow(row),
    kind: row.kind as CoverageMetricKind,
    subjectId: row.subjectId,
    coveredCount: row.coveredCount,
    totalCount: row.totalCount,
    percentage: row.percentage,
    computedAt: isoFromDate(row.computedAt)!,
    planId: row.planId ?? undefined,
    suiteId: row.suiteId ?? undefined,
    requirementId: row.requirementId ?? undefined,
    riskId: row.riskId ?? undefined,
  };
}

export function defectLinkToRow(record: DefectLinkRecord) {
  return {
    ...metaToRow(record),
    providerKind: record.providerKind,
    providerKey: record.providerKey ?? null,
    status: record.status,
    internalRef: record.internalRef ?? null,
    externalRef: record.externalRef ?? null,
    severity: record.severity ?? null,
    priority: record.priority ?? null,
    ownerUserId: record.ownerUserId ?? null,
    resolution: record.resolution ?? null,
    verificationState: record.verificationState ?? null,
    summary: record.summary ?? null,
    url: record.url ?? null,
    requirementIds: [...record.requirementIds],
    planIds: [...record.planIds],
    suiteIds: [...record.suiteIds],
    caseIds: [...record.caseIds],
    manualExecutionIds: [...record.manualExecutionIds],
    automationExecutionIds: [...record.automationExecutionIds],
    evidenceIds: [...record.evidenceIds],
    releaseLabel: record.releaseLabel ?? null,
    riskIds: [...record.riskIds],
    workItemRefs: record.workItemRefs.map((r) => ({ ...r })),
    target: record.target ?? null,
    externalId: record.externalId ?? null,
    resultId: record.resultId ?? null,
    runId: record.runId ?? null,
  };
}

export function rowToDefectLink(row: MetaRow & {
  providerKind: string;
  providerKey: string | null;
  status: string;
  internalRef: string | null;
  externalRef: string | null;
  severity: string | null;
  priority: string | null;
  ownerUserId: string | null;
  resolution: string | null;
  verificationState: string | null;
  summary: string | null;
  url: string | null;
  requirementIds: string[] | null;
  planIds: string[] | null;
  suiteIds: string[] | null;
  caseIds: string[] | null;
  manualExecutionIds: string[] | null;
  automationExecutionIds: string[] | null;
  evidenceIds: string[] | null;
  releaseLabel: string | null;
  riskIds: string[] | null;
  workItemRefs: Record<string, unknown>[] | null;
  target: string | null;
  externalId: string | null;
  resultId: string | null;
  runId: string | null;
}): DefectLinkRecord {
  return {
    ...metaFromRow(row),
    providerKind: row.providerKind,
    providerKey: row.providerKey ?? undefined,
    status: row.status,
    internalRef: row.internalRef ?? undefined,
    externalRef: row.externalRef ?? undefined,
    severity: row.severity ?? undefined,
    priority: row.priority ?? undefined,
    ownerUserId: row.ownerUserId ?? undefined,
    resolution: row.resolution ?? undefined,
    verificationState: row.verificationState ?? undefined,
    summary: row.summary ?? undefined,
    url: row.url ?? undefined,
    requirementIds: row.requirementIds ?? [],
    planIds: row.planIds ?? [],
    suiteIds: row.suiteIds ?? [],
    caseIds: row.caseIds ?? [],
    manualExecutionIds: row.manualExecutionIds ?? [],
    automationExecutionIds: row.automationExecutionIds ?? [],
    evidenceIds: row.evidenceIds ?? [],
    releaseLabel: row.releaseLabel ?? undefined,
    riskIds: row.riskIds ?? [],
    workItemRefs: row.workItemRefs ?? [],
    target: row.target ?? undefined,
    externalId: row.externalId ?? undefined,
    resultId: row.resultId ?? undefined,
    runId: row.runId ?? undefined,
  };
}

export function qualitySnapshotToRow(record: QualitySnapshotRecord) {
  return {
    ...metaToRow(record),
    scope: { ...record.scope },
    metrics: { ...record.metrics },
    computedAt: new Date(record.computedAt),
    label: record.label ?? null,
  };
}

export function rowToQualitySnapshot(row: MetaRow & {
  scope: Record<string, unknown> | null;
  metrics: Record<string, unknown> | null;
  computedAt: Date;
  label: string | null;
}): QualitySnapshotRecord {
  return {
    ...metaFromRow(row),
    scope: row.scope ?? {},
    metrics: row.metrics ?? {},
    computedAt: isoFromDate(row.computedAt)!,
    label: row.label ?? undefined,
  };
}

export function regressionAnalysisToRow(record: RegressionAnalysisRecord) {
  return {
    ...metaToRow(record),
    baselineLabel: record.baselineLabel,
    currentLabel: record.currentLabel,
    newFailures: [...record.newFailures],
    resolvedFailures: [...record.resolvedFailures],
    reopenedFailures: [...record.reopenedFailures],
    coverageDelta: record.coverageDelta,
    executionDelta: record.executionDelta,
    computedAt: new Date(record.computedAt),
    details: record.details ? { ...record.details } : null,
  };
}

export function rowToRegressionAnalysis(row: MetaRow & {
  baselineLabel: string;
  currentLabel: string;
  newFailures: string[] | null;
  resolvedFailures: string[] | null;
  reopenedFailures: string[] | null;
  coverageDelta: number;
  executionDelta: number;
  computedAt: Date;
  details: Record<string, unknown> | null;
}): RegressionAnalysisRecord {
  return {
    ...metaFromRow(row),
    baselineLabel: row.baselineLabel,
    currentLabel: row.currentLabel,
    newFailures: row.newFailures ?? [],
    resolvedFailures: row.resolvedFailures ?? [],
    reopenedFailures: row.reopenedFailures ?? [],
    coverageDelta: row.coverageDelta,
    executionDelta: row.executionDelta,
    computedAt: isoFromDate(row.computedAt)!,
    details: row.details ?? undefined,
  };
}

export function automationDefinitionToRow(record: AutomationDefinitionRecord) {
  return {
    ...metaToRow(record),
    key: record.key,
    name: record.name,
    description: record.description ?? null,
    automationType: record.automationType,
    adapterSourceId: record.adapterSourceId ?? null,
    caseId: record.caseId ?? null,
    suiteId: record.suiteId ?? null,
    configJson: { ...record.configJson },
    status: record.status,
  };
}

export function rowToAutomationDefinition(row: MetaRow & {
  key: string;
  name: string;
  description: string | null;
  automationType: string;
  adapterSourceId: string | null;
  caseId: string | null;
  suiteId: string | null;
  configJson: Record<string, unknown> | null;
  status: string;
}): AutomationDefinitionRecord {
  return {
    ...metaFromRow(row),
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    automationType: row.automationType as AutomationType,
    adapterSourceId: row.adapterSourceId ?? undefined,
    caseId: row.caseId ?? undefined,
    suiteId: row.suiteId ?? undefined,
    configJson: row.configJson ?? {},
    status: row.status,
  };
}

export function traceabilityLinkToRow(record: TraceabilityLinkRecord) {
  return {
    ...metaToRow(record),
    type: record.type,
    sourceKind: record.sourceKind,
    sourceId: record.sourceId,
    targetKind: record.targetKind,
    targetId: record.targetId,
    notes: record.notes ?? null,
  };
}

export function rowToTraceabilityLink(row: MetaRow & {
  type: string;
  sourceKind: string;
  sourceId: string;
  targetKind: string;
  targetId: string;
  notes: string | null;
}): TraceabilityLinkRecord {
  return {
    ...metaFromRow(row),
    type: row.type as TraceabilityLinkType,
    sourceKind: row.sourceKind,
    sourceId: row.sourceId,
    targetKind: row.targetKind,
    targetId: row.targetId,
    notes: row.notes ?? undefined,
  };
}

export function configurationToRow(
  record: PersistenceMeta & {
    configKey: string;
    configJson: Readonly<Record<string, unknown>>;
  },
) {
  return {
    ...metaToRow(record),
    configKey: record.configKey,
    configJson: { ...record.configJson },
  };
}

export function rowToConfiguration(row: MetaRow & {
  configKey: string;
  configJson: Record<string, unknown> | null;
}): ConfigurationRecord {
  return {
    ...metaFromRow(row),
    configKey: row.configKey,
    configJson: row.configJson ?? {},
  };
}

export function registryEntryToRow(record: RegistryEntryRecord) {
  return {
    ...metaToRow(record),
    registryKind: record.registryKind,
    entryKey: record.entryKey,
    name: record.name,
    description: record.description ?? null,
    status: record.status,
    version: record.version ?? null,
    tags: [...record.tags],
    metadata: { ...record.metadata },
  };
}

export function rowToRegistryEntry(row: MetaRow & {
  registryKind: string;
  entryKey: string;
  name: string;
  description: string | null;
  status: string;
  version: string | null;
  tags: string[] | null;
  metadata: Record<string, string> | null;
}): RegistryEntryRecord {
  return {
    ...metaFromRow(row),
    registryKind: row.registryKind,
    entryKey: row.entryKey,
    name: row.name,
    description: row.description ?? undefined,
    status: row.status,
    version: row.version ?? undefined,
    tags: row.tags ?? [],
    metadata: row.metadata ?? {},
  };
}

export function executionHistoryToRow(record: {
  id: string;
  tenantId: string;
  organisationId?: string;
  sessionId: string;
  eventType: string;
  occurredAt: string;
  actorUserId?: string;
  correlationId?: string;
  summary: string;
  details: Readonly<Record<string, unknown>>;
}) {
  return {
    id: record.id,
    tenantId: record.tenantId,
    organisationId: record.organisationId ?? null,
    sessionId: record.sessionId,
    eventType: record.eventType,
    occurredAt: new Date(record.occurredAt),
    actorUserId: record.actorUserId ?? null,
    correlationId: record.correlationId ?? null,
    summary: record.summary,
    details: { ...record.details },
  };
}

export function rowToExecutionHistory(row: {
  id: string;
  tenantId: string;
  organisationId: string | null;
  sessionId: string;
  eventType: string;
  occurredAt: Date;
  actorUserId: string | null;
  correlationId: string | null;
  summary: string;
  details: Record<string, unknown> | null;
}): ExecutionHistoryRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    sessionId: row.sessionId,
    eventType: row.eventType,
    occurredAt: isoFromDate(row.occurredAt)!,
    actorUserId: row.actorUserId ?? undefined,
    correlationId: row.correlationId ?? undefined,
    summary: row.summary,
    details: row.details ?? {},
  };
}

export function approvalHistoryToRow(record: ApprovalHistoryRecord) {
  return {
    id: record.id,
    tenantId: record.tenantId,
    organisationId: record.organisationId ?? null,
    approvalId: record.approvalId,
    eventType: record.eventType,
    occurredAt: new Date(record.occurredAt),
    actorUserId: record.actorUserId ?? null,
    correlationId: record.correlationId ?? null,
    summary: record.summary,
    details: { ...record.details },
    fromStatus: record.fromStatus ?? null,
    toStatus: record.toStatus ?? null,
  };
}

export function rowToApprovalHistory(row: {
  id: string;
  tenantId: string;
  organisationId: string | null;
  approvalId: string;
  eventType: string;
  occurredAt: Date;
  actorUserId: string | null;
  correlationId: string | null;
  summary: string;
  details: Record<string, unknown> | null;
  fromStatus: string | null;
  toStatus: string | null;
}): ApprovalHistoryRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    approvalId: row.approvalId,
    eventType: row.eventType,
    occurredAt: isoFromDate(row.occurredAt)!,
    actorUserId: row.actorUserId ?? undefined,
    correlationId: row.correlationId ?? undefined,
    summary: row.summary,
    details: row.details ?? {},
    fromStatus: row.fromStatus ?? undefined,
    toStatus: row.toStatus ?? undefined,
  };
}

export function auditToRow(record: {
  id: string;
  tenantId: string;
  organisationId?: string;
  occurredAt: string;
  actorUserId?: string;
  action: string;
  entityKind: string;
  entityId: string;
  correlationId?: string;
  summary: string;
  details: Readonly<Record<string, string>>;
}) {
  return {
    id: record.id,
    tenantId: record.tenantId,
    organisationId: record.organisationId ?? null,
    occurredAt: new Date(record.occurredAt),
    actorUserId: record.actorUserId ?? null,
    action: record.action,
    entityKind: record.entityKind,
    entityId: record.entityId,
    correlationId: record.correlationId ?? null,
    summary: record.summary,
    details: { ...record.details },
  };
}

export function rowToAudit(row: {
  id: string;
  tenantId: string;
  organisationId: string | null;
  occurredAt: Date;
  actorUserId: string | null;
  action: string;
  entityKind: string;
  entityId: string;
  correlationId: string | null;
  summary: string;
  details: Record<string, string> | null;
}): AuditRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    occurredAt: isoFromDate(row.occurredAt)!,
    actorUserId: row.actorUserId ?? undefined,
    action: row.action,
    entityKind: row.entityKind,
    entityId: row.entityId,
    correlationId: row.correlationId ?? undefined,
    summary: row.summary,
    details: row.details ?? {},
  };
}
