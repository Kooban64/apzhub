import { PlatformServiceError } from "@apzhub/platform-service-contracts";
import type {
  Approval,
  ApprovalHistoryEntry,
  ApprovalId,
  AutomationCoverageSnapshot,
  AutomationImport,
  AutomationImportHistory,
  AutomationImportId,
  AutomationRun,
  CertificationAuditEntry,
  CertificationGateEvaluation,
  CertificationPreparationSummary,
  CertificationRecommendation,
  CertificationRecord,
  CertificationRecordId,
  CoverageMetric,
  CoverageMetricId,
  DefectLink,
  DefectLinkId,
  Evidence,
  EvidenceId,
  ManualExecution,
  ManualExecutionId,
  Project,
  ProjectService,
  QualitySnapshot,
  QualitySummary,
  QualityTrendComparison,
  ReleaseReadinessInputs,
  Requirement,
  RequirementId,
  ServiceRequestContext,
  SupportAnalyticsService,
  SupportArticle,
  SupportArticleService,
  SupportGroup,
  SupportGroupService,
  SupportHistoryService,
  SupportIntelligenceSnapshot,
  SupportOrganization,
  SupportOrganizationService,
  SupportSearchService,
  SupportService,
  SupportTicket,
  SupportUser,
  SupportUserService,
  Task,
  TaskService,
  TeamMember,
  TeamService,
  TestCase,
  TestCaseId,
  TestPlan,
  TestPlanId,
  TestStepId,
  TestSuite,
  TestSuiteId,
  TestingApprovalService,
  TestingAutomationService,
  TestingCaseService,
  TestingCertificationService,
  TestingCoverageService,
  TestingDashboardService,
  TestingDefectService,
  TestingEvidenceService,
  TestingExecutionService,
  TestingPlanService,
  TestingPipelineArtifactService,
  TestingPipelineJobService,
  TestingPipelineRepositoryService,
  TestingPipelineRunLiveService,
  TestingPipelineStepService,
  TestingPipelineSummaryService,
  TestingPipelineWorkflowService,
  TestingPipelinesService,
  TestingQualityService,
  TestingEngineeringIntelligenceService,
  TestingReleaseReadinessService,
  TestingRequirementService,
  TestingSuiteService,
  TestingTraceabilityService,
  TraceabilityLink,
  PipelineRepository,
  PipelineRunView,
  PipelineWorkflow,
  TraceabilityLinkId,
  TraceabilityMatrixRow,
  Workspace,
  WorkspaceService,
} from "@apzhub/platform-service-contracts";
import type {
  ArtifactReference,
  Pipeline,
  PipelineId,
  PipelineImport,
  PipelineImportId,
  PipelineImportOutcome,
  PipelineJob,
  PipelineLinks,
  PipelineRun,
  PipelineRunId,
  PipelineStage,
  PipelineStep,
  PipelineSummary,
} from "@apzhub/testing-contracts";
import type { PlatformServiceGateway } from "@apzhub/platform-services";
import { vi } from "vitest";

import {
  createTestPlatformApiGatewayBootstrap,
  setPlatformApiGatewayBootstrapForTests,
} from "../gateway/bootstrap";

export const API_TEST_TENANT_A = "tenant-a-00000000-0000-4000-8000-000000000001";
export const API_TEST_TENANT_B = "tenant-b-00000000-0000-4000-8000-000000000002";
export const API_TEST_USER_ID = "user-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
export const API_TEST_ADMIN_ID = "user-adminaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
export const API_TEST_WS_ID = "ws_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
export const API_TEST_PROJ_ID = "proj_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
export const API_TEST_MEMBER_ID = "member_cccccccccccccccccccccccccccccccc";
export const API_TEST_TASK_ID = "task_dddddddddddddddddddddddddddddddd";
export const API_TEST_STATUS_ID = "status_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
export const API_TEST_ASSIGNEE_ID = "user_ffffffffffffffffffffffffffffffff";
export const API_TEST_LABEL_ID = "label_11111111111111111111111111111111";
export const API_TEST_SPRINT_ID = "sprint_22222222222222222222222222222222";
export const API_TEST_MODULE_ID = "module_33333333333333333333333333333333";
export const API_TEST_PARENT_TASK_ID = "task_44444444444444444444444444444444";

// Support test IDs (global IDs with correct prefixes — exactly 32 hex chars after prefix)
export const API_TEST_SREQ_ID = "sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1";
export const API_TEST_SORG_ID = "sorg_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa2";
export const API_TEST_SGRP_ID = "sgrp_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa3";
export const API_TEST_SUSER_ID = "suser_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa4";
export const API_TEST_SART_ID = "sart_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa5";

// Testing test IDs
export const API_TEST_REQ_ID = "req_apztcms_012";
export const API_TEST_PLAN_ID = "plan_apztcms_012";
export const API_TEST_SUITE_ID = "suite_apztcms_012";
export const API_TEST_CASE_ID = "case_apztcms_012";
export const API_TEST_EI_SNAPSHOT_ID = "eisnap_apztcms_022";
export const API_TEST_EI_SCORE = 78.5;
export const API_TEST_EXEC_ID = "exec_apztcms_012";
export const API_TEST_STEP_ID = "step_apztcms_012";
export const API_TEST_EVIDENCE_ID = "evidence_apztcms_012";
export const API_TEST_IMPORT_ID = "import_apztcms_012";
export const API_TEST_COVERAGE_ID = "coverage_apztcms_012";
export const API_TEST_DEFECT_ID = "defect_apztcms_012";
export const API_TEST_CERT_ID = "cert_apztcms_012";
export const API_TEST_APPROVAL_ID = "approval_apztcms_012";
export const API_TEST_TRACE_ID = "trace_apztcms_012";
export const API_TEST_PIPELINE_ID = "pipe_apztcms_018";
export const API_TEST_PIPELINE_RUN_ID = "prun_apztcms_018";
export const API_TEST_PIPELINE_IMPORT_ID = "pimp_apztcms_018";
export const API_TEST_PIPELINE_OWNER = "acme";
export const API_TEST_PIPELINE_REPO = "portal";
export const API_TEST_PIPELINE_WORKFLOW_ID = "7";
export const API_TEST_PIPELINE_LIVE_RUN_ID = "99";
export const API_TEST_PIPELINE_JOB_ID = "1";

export function buildTestServiceContext(
  overrides: Partial<ServiceRequestContext> = {},
): ServiceRequestContext {
  return {
    tenantId: API_TEST_TENANT_A,
    userId: API_TEST_USER_ID,
    correlationId: "corr-test-0001",
    permissions: [],
    requestId: "req-test-0001",
    ...overrides,
  };
}

export function buildTestWorkspace(overrides: Partial<Workspace> = {}): Workspace {
  return {
    id: API_TEST_WS_ID,
    tenantId: API_TEST_TENANT_A,
    name: "Acme",
    slug: "acme",
    createdAt: "2026-07-10T00:00:00.000Z",
    updatedAt: "2026-07-10T00:00:00.000Z",
    ...overrides,
  };
}

export function buildTestProject(overrides: Partial<Project> = {}): Project {
  return {
    id: API_TEST_PROJ_ID,
    tenantId: API_TEST_TENANT_A,
    workspaceId: API_TEST_WS_ID,
    name: "Portal",
    identifier: "PORT",
    status: "active",
    createdAt: "2026-07-10T00:00:00.000Z",
    updatedAt: "2026-07-10T00:00:00.000Z",
    ...overrides,
  };
}

export function buildTestTeamMember(overrides: Partial<TeamMember> = {}): TeamMember {
  return {
    id: API_TEST_MEMBER_ID,
    projectId: API_TEST_PROJ_ID,
    userId: API_TEST_USER_ID,
    role: "member",
    joinedAt: "2026-07-10T00:00:00.000Z",
    ...overrides,
  };
}

export function buildTestTask(overrides: Partial<Task> = {}): Task {
  return {
    id: API_TEST_TASK_ID,
    projectId: API_TEST_PROJ_ID,
    title: "Implement API",
    status: "open",
    statusId: API_TEST_STATUS_ID,
    priority: "medium",
    labelIds: [],
    createdAt: "2026-07-10T00:00:00.000Z",
    updatedAt: "2026-07-10T00:00:00.000Z",
    ...overrides,
  };
}

export function buildTestSupportRequest(overrides: Partial<SupportTicket> = {}): SupportTicket {
  return {
    id: API_TEST_SREQ_ID,
    tenantId: API_TEST_TENANT_A,
    title: "Cannot login",
    groupId: API_TEST_SGRP_ID,
    requesterId: API_TEST_SUSER_ID,
    status: "open",
    priority: "normal",
    createdAt: "2026-07-10T00:00:00.000Z",
    updatedAt: "2026-07-10T00:00:00.000Z",
    ...overrides,
  };
}

export function buildTestSupportArticle(overrides: Partial<SupportArticle> = {}): SupportArticle {
  return {
    id: API_TEST_SART_ID,
    tenantId: API_TEST_TENANT_A,
    supportTicketId: API_TEST_SREQ_ID,
    body: "Please reset your password.",
    bodyFormat: "text/plain",
    channel: "note",
    visibility: "internal",
    senderType: "agent",
    author: { senderType: "agent" },
    deliveryStatus: "none",
    attachments: [],
    createdAt: "2026-07-10T00:00:00.000Z",
    updatedAt: "2026-07-10T00:00:00.000Z",
    ...overrides,
  };
}

export function buildTestSupportOrganization(
  overrides: Partial<SupportOrganization> = {},
): SupportOrganization {
  return {
    id: API_TEST_SORG_ID,
    tenantId: API_TEST_TENANT_A,
    name: "Acme Corp",
    active: true,
    createdAt: "2026-07-10T00:00:00.000Z",
    updatedAt: "2026-07-10T00:00:00.000Z",
    ...overrides,
  };
}

export function buildTestSupportGroup(overrides: Partial<SupportGroup> = {}): SupportGroup {
  return {
    id: API_TEST_SGRP_ID,
    tenantId: API_TEST_TENANT_A,
    name: "Support Tier 1",
    active: true,
    createdAt: "2026-07-10T00:00:00.000Z",
    updatedAt: "2026-07-10T00:00:00.000Z",
    ...overrides,
  };
}

export function buildTestSupportUser(overrides: Partial<SupportUser> = {}): SupportUser {
  return {
    id: API_TEST_SUSER_ID,
    tenantId: API_TEST_TENANT_A,
    email: "agent@example.com",
    displayName: "Support Agent",
    active: true,
    role: "agent",
    createdAt: "2026-07-10T00:00:00.000Z",
    updatedAt: "2026-07-10T00:00:00.000Z",
    ...overrides,
  };
}

export function buildTestSupportIntelligence(
  overrides: Partial<SupportIntelligenceSnapshot> = {},
): SupportIntelligenceSnapshot {
  return {
    capturedAt: "2026-07-10T00:00:00.000Z",
    totalTickets: 10,
    openTickets: 5,
    closedTickets: 3,
    pendingTickets: 1,
    newTickets: 1,
    overdueTickets: 0,
    unassignedTickets: 2,
    byPriority: [],
    byState: [],
    byOrganization: [],
    byGroup: [],
    byOwner: [],
    ...overrides,
  };
}

const TESTING_NOW = "2026-07-10T00:00:00.000Z";

function auditFields() {
  return {
    tenantId: API_TEST_TENANT_A,
    createdAt: TESTING_NOW,
    updatedAt: TESTING_NOW,
  };
}

export function buildTestRequirement(overrides: Partial<Requirement> = {}): Requirement {
  return {
    ...auditFields(),
    id: API_TEST_REQ_ID as RequirementId,
    key: "REQ-012",
    title: "Testing HTTP API requirement",
    priority: "high",
    workItemRefs: [],
    riskIds: [],
    tags: ["apztcms-012"],
    ...overrides,
  };
}

export function buildTestPlan(overrides: Partial<TestPlan> = {}): TestPlan {
  return {
    ...auditFields(),
    id: API_TEST_PLAN_ID as TestPlanId,
    key: "PLAN-012",
    name: "APZTCMS-012 HTTP API Plan",
    status: "draft",
    suiteIds: [API_TEST_SUITE_ID as TestSuiteId],
    requirementIds: [API_TEST_REQ_ID as RequirementId],
    riskIds: [],
    releaseLabel: "APZTCMS-012",
    versionNumber: 1,
    ...overrides,
  };
}

export function buildTestSuite(overrides: Partial<TestSuite> = {}): TestSuite {
  return {
    ...auditFields(),
    id: API_TEST_SUITE_ID as TestSuiteId,
    key: "SUITE-012",
    name: "HTTP API Suite",
    status: "ready",
    planIds: [API_TEST_PLAN_ID as TestPlanId],
    caseIds: [API_TEST_CASE_ID as TestCaseId],
    isRegression: true,
    ...overrides,
  };
}

export function buildTestCase(overrides: Partial<TestCase> = {}): TestCase {
  return {
    ...auditFields(),
    id: API_TEST_CASE_ID as TestCaseId,
    key: "TC-012",
    title: "List plans over HTTP",
    status: "ready",
    priority: "high",
    suiteIds: [API_TEST_SUITE_ID as TestSuiteId],
    requirementIds: [API_TEST_REQ_ID as RequirementId],
    steps: [
      {
        id: API_TEST_STEP_ID as TestStepId,
        caseId: API_TEST_CASE_ID as TestCaseId,
        ordinal: 1,
        action: "Open the Testing workbench",
        expectedResult: "Plans are loaded from /api/v1/testing/plans",
      },
    ],
    tags: ["http"],
    ...overrides,
  };
}

export function buildTestExecution(overrides: Partial<ManualExecution> = {}): ManualExecution {
  return {
    ...auditFields(),
    id: API_TEST_EXEC_ID as ManualExecutionId,
    sessionId: "session_apztcms_012" as ManualExecution["sessionId"],
    caseId: API_TEST_CASE_ID as TestCaseId,
    status: "ready",
    stepActuals: [],
    ...overrides,
  };
}

export function buildTestEvidence(overrides: Partial<Evidence> = {}): Evidence {
  return {
    ...auditFields(),
    id: API_TEST_EVIDENCE_ID as EvidenceId,
    type: "note",
    title: "HTTP API evidence metadata",
    storageRef: "metadata:apztcms-012",
    contentType: "text/plain",
    sizeBytes: 0,
    lifecycleStatus: "submitted",
    executionId: API_TEST_EXEC_ID as ManualExecutionId,
    ...overrides,
  };
}

export function buildTestAutomationImport(
  overrides: Partial<AutomationImport> = {},
): AutomationImport {
  return {
    ...auditFields(),
    id: API_TEST_IMPORT_ID as AutomationImportId,
    adapterKind: "playwright",
    adapterVersion: "1",
    externalRunRef: "run-apztcms-012",
    status: "completed",
    correlationId: "corr-test-0001",
    ...overrides,
  };
}

export function buildTestCoverage(overrides: Partial<CoverageMetric> = {}): CoverageMetric {
  return {
    ...auditFields(),
    id: API_TEST_COVERAGE_ID as CoverageMetricId,
    kind: "requirement",
    subjectId: API_TEST_REQ_ID,
    coveredCount: 1,
    totalCount: 1,
    percentage: 100,
    computedAt: TESTING_NOW,
    planId: API_TEST_PLAN_ID as TestPlanId,
    requirementId: API_TEST_REQ_ID as RequirementId,
    ...overrides,
  };
}

export function buildTestDefect(overrides: Partial<DefectLink> = {}): DefectLink {
  return {
    ...auditFields(),
    id: API_TEST_DEFECT_ID as DefectLinkId,
    providerKind: "internal",
    status: "open",
    severity: "major",
    priority: "high",
    summary: "Representative Testing defect",
    caseIds: [API_TEST_CASE_ID],
    ...overrides,
  };
}

export function buildTestCertification(
  overrides: Partial<CertificationRecord> = {},
): CertificationRecord {
  return {
    ...auditFields(),
    id: API_TEST_CERT_ID as CertificationRecordId,
    key: "CERT-012",
    name: "APZTCMS-012 Certification",
    status: "awaiting_approval",
    planId: API_TEST_PLAN_ID as TestPlanId,
    releaseLabel: "APZTCMS-012",
    gateIds: [],
    approvalIds: [API_TEST_APPROVAL_ID as ApprovalId],
    ...overrides,
  };
}

export function buildPipelineRepository(
  overrides: Partial<PipelineRepository> = {},
): PipelineRepository {
  return {
    id: "1",
    name: API_TEST_PIPELINE_REPO,
    fullName: `${API_TEST_PIPELINE_OWNER}/${API_TEST_PIPELINE_REPO}`,
    private: false,
    htmlUrl: `https://github.com/${API_TEST_PIPELINE_OWNER}/${API_TEST_PIPELINE_REPO}`,
    description: "APZTCMS-018 fixture repository",
    defaultBranch: "main",
    ownerLogin: API_TEST_PIPELINE_OWNER,
    ...overrides,
  };
}

export function buildPipelineWorkflow(
  overrides: Partial<PipelineWorkflow> = {},
): PipelineWorkflow {
  return {
    id: API_TEST_PIPELINE_WORKFLOW_ID,
    name: "CI",
    path: ".github/workflows/ci.yml",
    state: "active",
    createdAt: TESTING_NOW,
    updatedAt: TESTING_NOW,
    htmlUrl: `https://github.com/${API_TEST_PIPELINE_OWNER}/${API_TEST_PIPELINE_REPO}/actions/workflows/ci.yml`,
    ...overrides,
  };
}

export function buildPipelineRunView(
  overrides: Partial<PipelineRunView> = {},
): PipelineRunView {
  return {
    id: API_TEST_PIPELINE_LIVE_RUN_ID,
    name: "CI",
    status: "passed",
    workflowId: API_TEST_PIPELINE_WORKFLOW_ID,
    runNumber: 99,
    event: "push",
    htmlUrl: `https://github.com/${API_TEST_PIPELINE_OWNER}/${API_TEST_PIPELINE_REPO}/actions/runs/99`,
    startedAt: TESTING_NOW,
    completedAt: TESTING_NOW,
    durationMs: 120_000,
    branch: "main",
    commit: "abc1234",
    actorRef: "ci-bot",
    ...overrides,
  };
}

export function buildPipelineJob(overrides: Partial<PipelineJob> = {}): PipelineJob {
  return {
    key: API_TEST_PIPELINE_JOB_ID,
    name: "unit",
    status: "passed",
    durationMs: 45_000,
    startedAt: TESTING_NOW,
    completedAt: TESTING_NOW,
    ...overrides,
  };
}

export function buildPipelineStep(overrides: Partial<PipelineStep> = {}): PipelineStep {
  return {
    key: "checkout",
    name: "Checkout",
    status: "passed",
    durationMs: 5_000,
    ...overrides,
  };
}

export function buildPipelineArtifact(
  overrides: Partial<ArtifactReference> = {},
): ArtifactReference {
  return {
    name: "junit.xml",
    type: "application/xml",
    sizeBytes: 1024,
    createdAt: TESTING_NOW,
    ...overrides,
  };
}

export function buildPipelineSummary(
  overrides: Partial<PipelineSummary> = {},
): PipelineSummary {
  return {
    headline: "CI passed",
    overallStatus: "passed",
    passed: 1,
    failed: 0,
    skipped: 0,
    ...overrides,
  };
}

export function buildSorPipeline(overrides: Partial<Pipeline> = {}): Pipeline {
  return {
    ...auditFields(),
    id: API_TEST_PIPELINE_ID as PipelineId,
    key: "portal-ci",
    name: "Portal CI",
    providerKind: "github_actions",
    status: "active",
    defaultBranch: "main",
    repositoryRef: `${API_TEST_PIPELINE_OWNER}/${API_TEST_PIPELINE_REPO}`,
    ...overrides,
  };
}

export function buildPipelineLinks(overrides: Partial<PipelineLinks> = {}): PipelineLinks {
  return {
    evidenceIds: [],
    coverageMetricIds: [],
    ...overrides,
  };
}

export function buildSorPipelineRun(overrides: Partial<PipelineRun> = {}): PipelineRun {
  return {
    ...auditFields(),
    id: API_TEST_PIPELINE_RUN_ID as PipelineRunId,
    pipelineId: API_TEST_PIPELINE_ID as PipelineId,
    importId: API_TEST_PIPELINE_IMPORT_ID as PipelineImportId,
    providerKind: "github_actions",
    externalRunRef: API_TEST_PIPELINE_LIVE_RUN_ID,
    status: "passed",
    stages: [{ name: "build", status: "passed" }],
    jobs: [buildPipelineJob()],
    artifacts: [buildPipelineArtifact()],
    approvals: [],
    events: [],
    environment: { branch: "main", commit: "abc1234" },
    links: buildPipelineLinks(),
    summary: buildPipelineSummary(),
    startedAt: TESTING_NOW,
    completedAt: TESTING_NOW,
    durationMs: 120_000,
    ...overrides,
  };
}

export function buildPipelineImportOutcome(
  overrides: Partial<PipelineImportOutcome> = {},
): PipelineImportOutcome {
  const importRecord: PipelineImport = {
    ...auditFields(),
    id: API_TEST_PIPELINE_IMPORT_ID as PipelineImportId,
    providerKind: "github_actions",
    adapterVersion: "1.0.0",
    externalRunRef: API_TEST_PIPELINE_LIVE_RUN_ID,
    pipelineId: API_TEST_PIPELINE_ID as PipelineId,
    status: "completed",
    pipelineRunId: API_TEST_PIPELINE_RUN_ID as PipelineRunId,
  };
  return {
    importRecord,
    run: buildSorPipelineRun(),
    pipeline: buildSorPipeline(),
    ...overrides,
  };
}

function buildTestCertificationPreparation(
  overrides: Partial<CertificationPreparationSummary> = {},
): CertificationPreparationSummary {
  return {
    planId: API_TEST_PLAN_ID as TestPlanId,
    coverageGaps: [],
    missingEvidenceIds: [],
    missingEvidenceCount: 0,
    approvalCompletenessPercent: 100,
    pendingApprovalIds: [],
    executionCompletenessPercent: 100,
    incompleteExecutionIds: [],
    riskSummary: { totalRisks: 0, highOrCriticalCount: 0 },
    computedAt: TESTING_NOW,
    ...overrides,
  };
}

export function buildTestReleaseReadiness(
  overrides: Partial<ReleaseReadinessInputs> = {},
): ReleaseReadinessInputs {
  return {
    planId: API_TEST_PLAN_ID as TestPlanId,
    preparation: buildTestCertificationPreparation(),
    blockingFactors: [],
    suggestedStatus: "ready",
    computedAt: TESTING_NOW,
    isDecision: false,
    passPercent: 100,
    failCount: 0,
    blockedCount: 0,
    missingEvidenceCount: 0,
    missingApprovalCount: 0,
    completionPercent: 100,
    ...overrides,
  };
}

export function emptyPage<T>(items: readonly T[] = []) {
  return {
    items,
    totalCount: items.length,
    page: 1,
    perPage: 20,
    hasNextPage: false,
  };
}

export function buildMockReportMetadata(preview: boolean) {
  return {
    id: "rmeta_apzreport_002",
    tenantId: API_TEST_TENANT_A,
    requestId: "req_apzreport_002",
    templateId: "tmpl-executive-dashboard",
    reportType: "executive",
    outputFormat: "html" as const,
    parametersJson: "{}",
    generatedAt: TESTING_NOW,
    generatedBy: API_TEST_USER_ID,
    version: "1.0.0",
    revision: 1,
    checksumSha256: "fixturehash",
    byteLength: 42,
    preview,
    createdAt: TESTING_NOW,
    updatedAt: TESTING_NOW,
  };
}

export function buildMockReportGenerationResult(preview: boolean) {
  return {
    document: {
      id: "rdoc_apzreport_002",
      reportType: "executive",
      templateId: "tmpl-executive-dashboard",
      title: "Executive Dashboard",
      generatedAt: TESTING_NOW,
      generatedBy: API_TEST_USER_ID,
      tenantId: API_TEST_TENANT_A,
      version: "1.0.0",
      revision: 1,
      metadata: {},
      metrics: [],
      sections: [
        {
          id: "overview",
          title: "Overview",
          blocks: [{ kind: "paragraph" as const, text: "Fixture preview." }],
        },
      ],
    },
    output: {
      format: "html" as const,
      contentType: "text/html",
      encoding: "utf-8" as const,
      body: "<p>Fixture preview.</p>",
      byteLength: 22,
      checksumSha256: "fixturehash",
    },
    metadata: buildMockReportMetadata(preview),
  };
}

export interface MockGatewayOptions {
  readonly workspaces?: Partial<WorkspaceService>;
  readonly projects?: Partial<ProjectService>;
  readonly teams?: Partial<TeamService>;
  readonly tasks?: Partial<TaskService>;
  readonly support?: Partial<SupportService>;
  readonly supportArticles?: Partial<SupportArticleService>;
  readonly supportOrganizations?: Partial<SupportOrganizationService>;
  readonly supportGroups?: Partial<SupportGroupService>;
  readonly supportUsers?: Partial<SupportUserService>;
  readonly supportSearch?: Partial<SupportSearchService>;
  readonly supportHistory?: Partial<SupportHistoryService>;
  readonly supportAnalytics?: Partial<SupportAnalyticsService>;
  readonly testing?: {
    readonly plans?: Partial<TestingPlanService>;
    readonly suites?: Partial<TestingSuiteService>;
    readonly cases?: Partial<TestingCaseService>;
    readonly requirements?: Partial<TestingRequirementService>;
    readonly executions?: Partial<TestingExecutionService>;
    readonly evidence?: Partial<TestingEvidenceService>;
    readonly automation?: Partial<TestingAutomationService>;
    readonly coverage?: Partial<TestingCoverageService>;
    readonly defects?: Partial<TestingDefectService>;
    readonly quality?: Partial<TestingQualityService>;
    readonly certification?: Partial<TestingCertificationService>;
    readonly releaseReadiness?: Partial<TestingReleaseReadinessService>;
    readonly traceability?: Partial<TestingTraceabilityService>;
    readonly approvals?: Partial<TestingApprovalService>;
    readonly dashboard?: Partial<TestingDashboardService>;
    readonly pipelines?: Partial<TestingPipelinesService>;
    readonly pipelineRepositories?: Partial<TestingPipelineRepositoryService>;
    readonly pipelineWorkflows?: Partial<TestingPipelineWorkflowService>;
    readonly pipelineRuns?: Partial<TestingPipelineRunLiveService>;
    readonly pipelineArtifacts?: Partial<TestingPipelineArtifactService>;
    readonly pipelineJobs?: Partial<TestingPipelineJobService>;
    readonly pipelineSteps?: Partial<TestingPipelineStepService>;
    readonly pipelineSummaries?: Partial<TestingPipelineSummaryService>;
    readonly engineeringIntelligence?: Partial<TestingEngineeringIntelligenceService>;
  };
  readonly onCall?: (service: string, operation: string, ctx: ServiceRequestContext) => void;
  readonly reporting?: Partial<{
    listAvailableReports: (
      ctx: ServiceRequestContext,
    ) => Promise<readonly string[]>;
    listTemplates: (
      ctx: ServiceRequestContext,
      reportType?: string,
    ) => Promise<readonly unknown[]>;
    getTemplate: (ctx: ServiceRequestContext, templateId: string) => Promise<unknown>;
    validateReport: (ctx: ServiceRequestContext, input: unknown) => Promise<unknown>;
    previewReport: (ctx: ServiceRequestContext, input: unknown) => Promise<unknown>;
    generateReport: (ctx: ServiceRequestContext, input: unknown) => Promise<unknown>;
    renderReport: (ctx: ServiceRequestContext, input: unknown) => Promise<unknown>;
    listReportMetadata: (ctx: ServiceRequestContext) => Promise<readonly unknown[]>;
    getReportMetadata: (
      ctx: ServiceRequestContext,
      metadataId: string,
    ) => Promise<unknown>;
    archiveReportMetadata: (
      ctx: ServiceRequestContext,
      metadataId: string,
    ) => Promise<unknown>;
    registerTemplate: (ctx: ServiceRequestContext, input: unknown) => Promise<unknown>;
  }>;
  readonly documents?: Partial<{
    create: (ctx: ServiceRequestContext, input: unknown) => Promise<unknown>;
    get: (ctx: ServiceRequestContext, documentId: string) => Promise<unknown>;
    summarize: (ctx: ServiceRequestContext, documentId: string) => Promise<unknown>;
    archive: (ctx: ServiceRequestContext, documentId: string) => Promise<unknown>;
    restore: (ctx: ServiceRequestContext, documentId: string) => Promise<unknown>;
  }>;
  readonly documentSearchMetadata?: Partial<{
    find: (ctx: ServiceRequestContext, input?: unknown) => Promise<readonly unknown[]>;
  }>;
  readonly documentMetadata?: Partial<{
    update: (ctx: ServiceRequestContext, input: unknown) => Promise<unknown>;
  }>;
  readonly documentVersions?: Partial<{
    list: (ctx: ServiceRequestContext, documentId: string) => Promise<readonly unknown[]>;
    get: (
      ctx: ServiceRequestContext,
      documentId: string,
      versionId: string,
    ) => Promise<unknown>;
  }>;
  readonly documentStorage?: Partial<{
    getStorageMetadata: (
      ctx: ServiceRequestContext,
      documentId: string,
      versionId: string,
    ) => Promise<unknown>;
    verifyIntegrity: (
      ctx: ServiceRequestContext,
      documentId: string,
      versionId: string,
    ) => Promise<unknown>;
    inspectReconciliation: (ctx: ServiceRequestContext) => Promise<unknown>;
  }>;
  readonly documentTags?: Partial<{
    tag: (ctx: ServiceRequestContext, input: unknown) => Promise<readonly unknown[]>;
    list: (ctx: ServiceRequestContext) => Promise<readonly unknown[]>;
    get: (ctx: ServiceRequestContext, tagId: string) => Promise<unknown>;
  }>;
  readonly documentClassification?: Partial<{
    classify: (ctx: ServiceRequestContext, input: unknown) => Promise<unknown>;
  }>;
  readonly documentFolders?: Partial<{
    assign: (ctx: ServiceRequestContext, input: unknown) => Promise<unknown>;
  }>;
  readonly documentCollections?: Partial<{
    assign: (ctx: ServiceRequestContext, input: unknown) => Promise<unknown>;
  }>;
  readonly documentRetention?: Partial<{
    apply: (ctx: ServiceRequestContext, input: unknown) => Promise<unknown>;
  }>;
  readonly documentRelationships?: Partial<{
    relate: (ctx: ServiceRequestContext, input: unknown) => Promise<unknown>;
  }>;
  readonly documentAudit?: Partial<{
    list: (ctx: ServiceRequestContext, documentId: string) => Promise<readonly unknown[]>;
  }>;
  readonly documentDiagnostics?: Partial<{
    getDiagnostics: (ctx: ServiceRequestContext) => Promise<unknown>;
  }>;
  readonly searchExecution?: Record<string, unknown>;
  readonly searchExecutionHealth?: Record<string, unknown>;
  readonly searchExecutionDiagnostics?: Record<string, unknown>;
  readonly searchProviders?: Record<string, unknown>;
  readonly searchConfigurations?: Record<string, unknown>;
  readonly searchCollections?: Record<string, unknown>;
  readonly searchSources?: Record<string, unknown>;
  readonly searchScopes?: Record<string, unknown>;
  readonly searchProfiles?: Record<string, unknown>;
  readonly searchCapabilities?: Record<string, unknown>;
  readonly searchHealth?: Record<string, unknown>;
  readonly searchDiagnostics?: Record<string, unknown>;
  readonly searchStatistics?: Record<string, unknown>;
  readonly searchAudit?: Record<string, unknown>;
  readonly searchValidation?: Record<string, unknown>;
}

export function createMockPlatformGateway(
  options: MockGatewayOptions = {},
): PlatformServiceGateway {
  const track = (service: string, operation: string, ctx: ServiceRequestContext) => {
    options.onCall?.(service, operation, ctx);
  };
  const tracked = <Args extends readonly unknown[], Result>(
    service: string,
    operation: string,
    implementation: (ctx: ServiceRequestContext, ...args: Args) => Promise<Result>,
  ) =>
    vi.fn(async (ctx: ServiceRequestContext, ...args: Args) => {
      track(service, operation, ctx);
      return implementation(ctx, ...args);
    });

  const workspaces = {
    listWorkspaces: async (ctx: ServiceRequestContext) => {
      track("workspace", "listWorkspaces", ctx);
      return emptyPage([buildTestWorkspace()]);
    },
    getWorkspace: async (ctx: ServiceRequestContext, id: string) => {
      track("workspace", "getWorkspace", ctx);
      if (id !== API_TEST_WS_ID) {
        throw new PlatformServiceError({
          category: "not_found",
          code: "NOT_FOUND",
          message: "Workspace not found",
          correlationId: ctx.correlationId,
          retryable: false,
        });
      }
      return buildTestWorkspace();
    },
    ...options.workspaces,
  };

  const projects = {
    listProjects: async (ctx: ServiceRequestContext) => {
      track("project", "listProjects", ctx);
      return emptyPage([buildTestProject()]);
    },
    getProject: async (ctx: ServiceRequestContext, id: string) => {
      track("project", "getProject", ctx);
      if (ctx.tenantId === API_TEST_TENANT_B) {
        throw new PlatformServiceError({
          category: "not_found",
          code: "MAPPING_NOT_FOUND",
          message: "Project not found",
          correlationId: ctx.correlationId,
          retryable: false,
        });
      }
      if (id !== API_TEST_PROJ_ID) {
        throw new PlatformServiceError({
          category: "not_found",
          code: "NOT_FOUND",
          message: "Project not found",
          correlationId: ctx.correlationId,
          retryable: false,
        });
      }
      return buildTestProject();
    },
    createProject: async (ctx: ServiceRequestContext, input: { name: string }) => {
      track("project", "createProject", ctx);
      return buildTestProject({ name: input.name });
    },
    updateProject: async (ctx: ServiceRequestContext, id: string, input: { name?: string }) => {
      track("project", "updateProject", ctx);
      return buildTestProject({ id, name: input.name ?? "Portal" });
    },
    archiveProject: async (ctx: ServiceRequestContext, id: string) => {
      track("project", "archiveProject", ctx);
      return buildTestProject({ id, status: "archived" });
    },
    ...options.projects,
  };

  const teams = {
    listTeam: async (ctx: ServiceRequestContext) => {
      track("team", "listTeam", ctx);
      return emptyPage([buildTestTeamMember()]);
    },
    getTeamMember: async (ctx: ServiceRequestContext) => {
      track("team", "getTeamMember", ctx);
      return buildTestTeamMember();
    },
    addTeamMember: async () => buildTestTeamMember(),
    updateTeamMember: async () => buildTestTeamMember(),
    removeTeamMember: async () => undefined,
    ...options.teams,
  };

  const tasks = {
    listTasks: async (ctx: ServiceRequestContext, projectId: string) => {
      track("task", "listTasks", ctx);
      if (projectId !== API_TEST_PROJ_ID) {
        throw new PlatformServiceError({
          category: "not_found",
          code: "NOT_FOUND",
          message: "Project not found",
          correlationId: ctx.correlationId,
          retryable: false,
        });
      }
      return emptyPage([buildTestTask()]);
    },
    getTask: async (ctx: ServiceRequestContext, id: string) => {
      track("task", "getTask", ctx);
      if (ctx.tenantId === API_TEST_TENANT_B) {
        throw new PlatformServiceError({
          category: "not_found",
          code: "MAPPING_NOT_FOUND",
          message: "Task not found",
          correlationId: ctx.correlationId,
          retryable: false,
        });
      }
      if (id !== API_TEST_TASK_ID && id !== API_TEST_PARENT_TASK_ID) {
        throw new PlatformServiceError({
          category: "not_found",
          code: "NOT_FOUND",
          message: "Task not found",
          correlationId: ctx.correlationId,
          retryable: false,
        });
      }
      return buildTestTask({ id });
    },
    createTask: async (
      ctx: ServiceRequestContext,
      projectId: string,
      input: { title: string },
    ) => {
      track("task", "createTask", ctx);
      return buildTestTask({ projectId, title: input.title });
    },
    updateTask: async (
      ctx: ServiceRequestContext,
      id: string,
      input: Partial<Task> & {
        sprintId?: string | null;
        projectModuleId?: string | null;
        parentTaskId?: string | null;
        labelIds?: readonly string[];
      },
    ) => {
      track("task", "updateTask", ctx);
      return buildTestTask({
        id,
        title: input.title ?? "Implement API",
        sprintId: input.sprintId === null ? undefined : (input.sprintId ?? undefined),
        projectModuleId:
          input.projectModuleId === null ? undefined : (input.projectModuleId ?? undefined),
        parentTaskId:
          input.parentTaskId === null ? undefined : (input.parentTaskId ?? undefined),
        labelIds: input.labelIds ? [...input.labelIds] : [],
      });
    },
    archiveTask: async (ctx: ServiceRequestContext, id: string) => {
      track("task", "archiveTask", ctx);
      return buildTestTask({
        id,
        archivedAt: "2026-07-10T12:00:00.000Z",
        status: "cancelled",
      });
    },
    transitionTaskStatus: async (
      ctx: ServiceRequestContext,
      id: string,
      input: { statusId: string },
    ) => {
      track("task", "transitionTaskStatus", ctx);
      return buildTestTask({ id, statusId: input.statusId, status: "in_progress" });
    },
    assignTask: async (
      ctx: ServiceRequestContext,
      id: string,
      input: { assigneeId: string | null; assigneeIds?: readonly string[] },
    ) => {
      track("task", "assignTask", ctx);
      return buildTestTask({
        id,
        assigneeId: input.assigneeId ?? undefined,
        assigneeIds: input.assigneeIds ? [...input.assigneeIds] : undefined,
      });
    },
    ...options.tasks,
  };

  const support: SupportService = {
    listSupportRequests: async (ctx) => {
      track("support", "listSupportRequests", ctx);
      return emptyPage([buildTestSupportRequest()]);
    },
    getSupportRequest: async (ctx, id) => {
      track("support", "getSupportRequest", ctx);
      if (ctx.tenantId === API_TEST_TENANT_B) {
        throw new PlatformServiceError({
          category: "not_found",
          code: "MAPPING_NOT_FOUND",
          message: "Support request not found",
          correlationId: ctx.correlationId,
          retryable: false,
        });
      }
      if (id !== API_TEST_SREQ_ID) {
        throw new PlatformServiceError({
          category: "not_found",
          code: "NOT_FOUND",
          message: "Support request not found",
          correlationId: ctx.correlationId,
          retryable: false,
        });
      }
      return buildTestSupportRequest({ id });
    },
    createSupportRequest: async (ctx, input) => {
      track("support", "createSupportRequest", ctx);
      return buildTestSupportRequest({ title: input.title });
    },
    updateSupportRequest: async (ctx, id, input) => {
      track("support", "updateSupportRequest", ctx);
      return buildTestSupportRequest({ id, ...(input as Partial<SupportTicket>) });
    },
    closeSupportRequest: async (ctx, id) => {
      track("support", "closeSupportRequest", ctx);
      return buildTestSupportRequest({ id, status: "closed", closedAt: "2026-07-10T12:00:00.000Z" });
    },
    reopenSupportRequest: async (ctx, id) => {
      track("support", "reopenSupportRequest", ctx);
      return buildTestSupportRequest({ id, status: "open" });
    },
    assignSupportRequest: async (ctx, id, input) => {
      track("support", "assignSupportRequest", ctx);
      return buildTestSupportRequest({
        id,
        assigneeId: input.assigneeId ?? undefined,
      });
    },
    changeSupportRequestPriority: async (ctx, id, input) => {
      track("support", "changeSupportRequestPriority", ctx);
      return buildTestSupportRequest({ id, priority: input.priority });
    },
    changeSupportRequestState: async (ctx, id, input) => {
      track("support", "changeSupportRequestState", ctx);
      return buildTestSupportRequest({ id, status: input.status });
    },
    searchSupportRequests: async (ctx) => {
      track("support", "searchSupportRequests", ctx);
      return emptyPage([buildTestSupportRequest()]);
    },
    ...options.support,
  };

  const supportArticles: SupportArticleService = {
    list: async (ctx, ticketId) => {
      track("supportArticles", "list", ctx);
      return emptyPage([buildTestSupportArticle({ supportTicketId: ticketId })]);
    },
    get: async (ctx, ticketId, articleId) => {
      track("supportArticles", "get", ctx);
      if (ctx.tenantId === API_TEST_TENANT_B) {
        throw new PlatformServiceError({
          category: "not_found",
          code: "MAPPING_NOT_FOUND",
          message: "Article not found",
          correlationId: ctx.correlationId,
          retryable: false,
        });
      }
      return buildTestSupportArticle({ id: articleId, supportTicketId: ticketId });
    },
    createNote: async (ctx, input) => {
      track("supportArticles", "createNote", ctx);
      return buildTestSupportArticle({
        supportTicketId: input.supportTicketId,
        body: input.body,
        channel: "note",
        visibility: "internal",
      });
    },
    createReply: async (ctx, input) => {
      track("supportArticles", "createReply", ctx);
      return buildTestSupportArticle({
        supportTicketId: input.supportTicketId,
        body: input.body,
        channel: input.channel ?? "email",
        visibility: "public",
      });
    },
    create: async (ctx, input) => {
      track("supportArticles", "create", ctx);
      return buildTestSupportArticle({
        supportTicketId: input.supportTicketId,
        body: input.body,
        visibility: input.visibility,
      });
    },
    ...options.supportArticles,
  };

  const supportOrganizations: SupportOrganizationService = {
    listOrganizations: async (ctx) => {
      track("supportOrganizations", "listOrganizations", ctx);
      return emptyPage([buildTestSupportOrganization()]);
    },
    getOrganization: async (ctx, id) => {
      track("supportOrganizations", "getOrganization", ctx);
      if (ctx.tenantId === API_TEST_TENANT_B) {
        throw new PlatformServiceError({
          category: "not_found",
          code: "MAPPING_NOT_FOUND",
          message: "Organization not found",
          correlationId: ctx.correlationId,
          retryable: false,
        });
      }
      return buildTestSupportOrganization({ id });
    },
    createOrganization: async (ctx, input) => {
      track("supportOrganizations", "createOrganization", ctx);
      return buildTestSupportOrganization({ name: input.name });
    },
    updateOrganization: async (ctx, id, input) => {
      track("supportOrganizations", "updateOrganization", ctx);
      return buildTestSupportOrganization({ id, ...(input as Partial<SupportOrganization>) });
    },
    archiveOrganization: async (ctx, id) => {
      track("supportOrganizations", "archiveOrganization", ctx);
      return buildTestSupportOrganization({ id, active: false });
    },
    ...options.supportOrganizations,
  };

  const supportGroups: SupportGroupService = {
    listGroups: async (ctx) => {
      track("supportGroups", "listGroups", ctx);
      return emptyPage([buildTestSupportGroup()]);
    },
    getGroup: async (ctx, id) => {
      track("supportGroups", "getGroup", ctx);
      if (ctx.tenantId === API_TEST_TENANT_B) {
        throw new PlatformServiceError({
          category: "not_found",
          code: "MAPPING_NOT_FOUND",
          message: "Group not found",
          correlationId: ctx.correlationId,
          retryable: false,
        });
      }
      return buildTestSupportGroup({ id });
    },
    createGroup: async (ctx, input) => {
      track("supportGroups", "createGroup", ctx);
      return buildTestSupportGroup({ name: input.name });
    },
    updateGroup: async (ctx, id, input) => {
      track("supportGroups", "updateGroup", ctx);
      return buildTestSupportGroup({ id, ...(input as Partial<SupportGroup>) });
    },
    ...options.supportGroups,
  };

  const supportUsers: SupportUserService = {
    listUsers: async (ctx) => {
      track("supportUsers", "listUsers", ctx);
      return emptyPage([buildTestSupportUser()]);
    },
    getUser: async (ctx, id) => {
      track("supportUsers", "getUser", ctx);
      if (ctx.tenantId === API_TEST_TENANT_B) {
        throw new PlatformServiceError({
          category: "not_found",
          code: "MAPPING_NOT_FOUND",
          message: "Support user not found",
          correlationId: ctx.correlationId,
          retryable: false,
        });
      }
      return buildTestSupportUser({ id });
    },
    lookup: async (ctx, input) => {
      track("supportUsers", "lookup", ctx);
      if (!input.email && !input.login) return undefined;
      return buildTestSupportUser({ email: input.email, login: input.login });
    },
    search: async (ctx) => {
      track("supportUsers", "search", ctx);
      return emptyPage([buildTestSupportUser()]);
    },
    ...options.supportUsers,
  };

  const supportSearch: SupportSearchService = {
    search: async (ctx, queryText) => {
      track("supportSearch", "search", ctx);
      return {
        query: queryText,
        hits: [],
        totalCount: 0,
        page: 1,
        perPage: 20,
        hasNextPage: false,
      };
    },
    ...options.supportSearch,
  };

  const supportHistory: SupportHistoryService = {
    getTimeline: async (ctx) => {
      track("supportHistory", "getTimeline", ctx);
      return emptyPage([]);
    },
    list: async (ctx) => {
      track("supportHistory", "list", ctx);
      return emptyPage([]);
    },
    getSupportTimeline: async (ctx, ticketId) => {
      track("supportHistory", "getSupportTimeline", ctx);
      return { supportTicketId: ticketId, events: [], totalCount: 0 };
    },
    ...options.supportHistory,
  };

  const supportAnalytics: SupportAnalyticsService = {
    getSupportIntelligence: async (ctx) => {
      track("supportAnalytics", "getSupportIntelligence", ctx);
      return buildTestSupportIntelligence();
    },
    getSnapshot: async (ctx) => {
      track("supportAnalytics", "getSnapshot", ctx);
      return buildTestSupportIntelligence();
    },
    ...options.supportAnalytics,
  };

  const testingPlans: TestingPlanService = {
    list: tracked("testing.plans", "list", async () => [buildTestPlan()]),
    get: tracked("testing.plans", "get", async (_ctx, id) => buildTestPlan({ id })),
    create: tracked("testing.plans", "create", async (_ctx, input) =>
      buildTestPlan({ ...input, id: API_TEST_PLAN_ID as TestPlanId }),
    ),
    update: tracked("testing.plans", "update", async (_ctx, id, input) =>
      buildTestPlan({ id, ...input }),
    ),
    clone: tracked("testing.plans", "clone", async (_ctx, id, cloneOptions) =>
      buildTestPlan({
        id,
        key: cloneOptions?.key ?? "PLAN-012-CLONE",
        name: cloneOptions?.name ?? "APZTCMS-012 HTTP API Plan Clone",
      }),
    ),
    archive: tracked("testing.plans", "archive", async (_ctx, id) =>
      buildTestPlan({ id, status: "archived" }),
    ),
    ...options.testing?.plans,
  };

  const testingSuites: TestingSuiteService = {
    list: tracked("testing.suites", "list", async () => [buildTestSuite()]),
    get: tracked("testing.suites", "get", async (_ctx, id) => buildTestSuite({ id })),
    create: tracked("testing.suites", "create", async (_ctx, input) =>
      buildTestSuite({ ...input, id: API_TEST_SUITE_ID as TestSuiteId }),
    ),
    update: tracked("testing.suites", "update", async (_ctx, id, input) =>
      buildTestSuite({ id, ...input }),
    ),
    clone: tracked("testing.suites", "clone", async (_ctx, id, cloneOptions) =>
      buildTestSuite({
        id,
        key: cloneOptions?.key ?? "SUITE-012-CLONE",
        name: cloneOptions?.name ?? "HTTP API Suite Clone",
      }),
    ),
    archive: tracked("testing.suites", "archive", async (_ctx, id) =>
      buildTestSuite({ id, status: "archived" }),
    ),
    ...options.testing?.suites,
  };

  const testingCases: TestingCaseService = {
    list: tracked("testing.cases", "list", async () => [buildTestCase()]),
    get: tracked("testing.cases", "get", async (_ctx, id) => buildTestCase({ id })),
    create: tracked("testing.cases", "create", async (_ctx, input) =>
      buildTestCase({ ...input, id: API_TEST_CASE_ID as TestCaseId }),
    ),
    update: tracked("testing.cases", "update", async (_ctx, id, input) =>
      buildTestCase({ id, ...input }),
    ),
    clone: tracked("testing.cases", "clone", async (_ctx, id, cloneOptions) =>
      buildTestCase({
        id,
        key: cloneOptions?.key ?? "TC-012-CLONE",
        title: cloneOptions?.title ?? "List plans over HTTP clone",
      }),
    ),
    archive: tracked("testing.cases", "archive", async (_ctx, id) =>
      buildTestCase({ id, status: "archived" }),
    ),
    transitionStatus: tracked("testing.cases", "transitionStatus", async (_ctx, id, status) =>
      buildTestCase({ id, status }),
    ),
    ...options.testing?.cases,
  };

  const testingRequirements: TestingRequirementService = {
    list: tracked("testing.requirements", "list", async () => [buildTestRequirement()]),
    get: tracked("testing.requirements", "get", async (_ctx, id) =>
      buildTestRequirement({ id }),
    ),
    create: tracked("testing.requirements", "create", async (_ctx, input) =>
      buildTestRequirement({ ...input, id: API_TEST_REQ_ID as RequirementId }),
    ),
    update: tracked("testing.requirements", "update", async (_ctx, id, input) =>
      buildTestRequirement({ id, ...input }),
    ),
    archive: tracked("testing.requirements", "archive", async (_ctx, id) =>
      buildTestRequirement({ id, tags: ["archived"] }),
    ),
    ...options.testing?.requirements,
  };

  const testingExecutions: TestingExecutionService = {
    list: tracked("testing.executions", "list", async () => [buildTestExecution()]),
    get: tracked("testing.executions", "get", async (_ctx, id) => buildTestExecution({ id })),
    create: tracked("testing.executions", "create", async (_ctx, input) =>
      buildTestExecution({ ...input, id: API_TEST_EXEC_ID as ManualExecutionId }),
    ),
    assign: tracked("testing.executions", "assign", async (_ctx, id, assigneeId) =>
      buildTestExecution({ id, assigneeId }),
    ),
    start: tracked("testing.executions", "start", async (_ctx, id) =>
      buildTestExecution({ id, status: "in_progress", startedAt: TESTING_NOW }),
    ),
    pause: tracked("testing.executions", "pause", async (_ctx, id) =>
      buildTestExecution({ id, status: "paused", pausedAt: TESTING_NOW }),
    ),
    resume: tracked("testing.executions", "resume", async (_ctx, id) =>
      buildTestExecution({ id, status: "in_progress", resumedAt: TESTING_NOW }),
    ),
    block: tracked("testing.executions", "block", async (_ctx, id, reason) =>
      buildTestExecution({ id, status: "blocked", blockReason: reason }),
    ),
    unblock: tracked("testing.executions", "unblock", async (_ctx, id) =>
      buildTestExecution({ id, status: "in_progress" }),
    ),
    complete: tracked("testing.executions", "complete", async (_ctx, id, overallResult) =>
      buildTestExecution({ id, status: "completed", overallResult, completedAt: TESTING_NOW }),
    ),
    submitForReview: tracked("testing.executions", "submitForReview", async (_ctx, id) =>
      buildTestExecution({ id, status: "under_review" }),
    ),
    approve: tracked("testing.executions", "approve", async (_ctx, id, comments) =>
      buildTestExecution({ id, status: "approved", comments: comments ? [{ id: "comment-1", authorUserId: API_TEST_USER_ID, body: comments, createdAt: TESTING_NOW }] : [] }),
    ),
    reject: tracked("testing.executions", "reject", async (_ctx, id, comments) =>
      buildTestExecution({ id, status: "rejected", comments: [{ id: "comment-1", authorUserId: API_TEST_USER_ID, body: comments, createdAt: TESTING_NOW }] }),
    ),
    reopen: tracked("testing.executions", "reopen", async (_ctx, id) =>
      buildTestExecution({ id, status: "ready" }),
    ),
    cancel: tracked("testing.executions", "cancel", async (_ctx, id, reason) =>
      buildTestExecution({ id, status: "cancelled", blockReason: reason }),
    ),
    archive: tracked("testing.executions", "archive", async (_ctx, id) =>
      buildTestExecution({ id, status: "archived" }),
    ),
    restore: tracked("testing.executions", "restore", async (_ctx, id) =>
      buildTestExecution({ id, status: "ready" }),
    ),
    recordStepActual: tracked("testing.executions", "recordStepActual", async (_ctx, id, stepId, actual) =>
      buildTestExecution({ id, stepActuals: [{ stepId, ...actual }] }),
    ),
    setStepStatus: tracked("testing.executions", "setStepStatus", async (_ctx, id, stepId, status) =>
      buildTestExecution({ id, stepActuals: [{ stepId, status }] }),
    ),
    ...options.testing?.executions,
  };

  const testingEvidence: TestingEvidenceService = {
    listEvidence: tracked("testing.evidence", "listEvidence", async () => [buildTestEvidence()]),
    getEvidence: tracked("testing.evidence", "getEvidence", async (_ctx, id) =>
      buildTestEvidence({ id }),
    ),
    registerEvidence: tracked("testing.evidence", "registerEvidence", async (_ctx, input) =>
      buildTestEvidence({ ...input, id: API_TEST_EVIDENCE_ID as EvidenceId }),
    ),
    submitEvidence: tracked("testing.evidence", "submitEvidence", async (_ctx, id) =>
      buildTestEvidence({ id, lifecycleStatus: "submitted" }),
    ),
    verifyEvidence: tracked("testing.evidence", "verifyEvidence", async (_ctx, id, verificationState) =>
      buildTestEvidence({ id, lifecycleStatus: "verified", verificationState }),
    ),
    approveEvidence: tracked("testing.evidence", "approveEvidence", async (_ctx, id) =>
      buildTestEvidence({ id, lifecycleStatus: "approved", approvalState: "approved" }),
    ),
    rejectEvidence: tracked("testing.evidence", "rejectEvidence", async (_ctx, id, reason) =>
      buildTestEvidence({ id, lifecycleStatus: "rejected", verificationState: reason }),
    ),
    archiveEvidence: tracked("testing.evidence", "archiveEvidence", async (_ctx, id) =>
      buildTestEvidence({ id, lifecycleStatus: "archived" }),
    ),
    ...options.testing?.evidence,
  };

  const testingAutomation: TestingAutomationService = {
    validateImport: tracked("testing.automation", "validateImport", async () => undefined),
    importResult: tracked("testing.automation", "importResult", async () => ({
      importRecord: buildTestAutomationImport(),
      automatedExecutionId: "auto_exec_apztcms_012",
      createdRunCount: 1,
      createdResultCount: 1,
      registeredEvidenceIds: [API_TEST_EVIDENCE_ID],
      coverageSnapshotIds: [API_TEST_COVERAGE_ID],
    })),
    listImports: tracked("testing.automation", "listImports", async () => [buildTestAutomationImport()]),
    getImport: tracked("testing.automation", "getImport", async (_ctx, id) =>
      buildTestAutomationImport({ id }),
    ),
    listImportHistory: tracked("testing.automation", "listImportHistory", async (_ctx, importId) => [
      {
        id: "import_history_apztcms_012",
        tenantId: API_TEST_TENANT_A,
        importId,
        eventType: "testing.automation.imported",
        occurredAt: TESTING_NOW,
        summary: "Import completed",
      } as AutomationImportHistory,
    ]),
    getHistory: tracked("testing.automation", "getHistory", async () => []),
    listRuns: tracked("testing.automation", "listRuns", async () => []),
    getRun: tracked("testing.automation", "getRun", async (_ctx, id) =>
      ({
        ...auditFields(),
        id,
        executionId: "auto_exec_apztcms_012",
        title: "HTTP API automation run",
        status: "pass",
      }) as AutomationRun,
    ),
    listResultItems: tracked("testing.automation", "listResultItems", async () => []),
    listCoverageSnapshots: tracked("testing.automation", "listCoverageSnapshots", async (_ctx, importId) => [
      {
        ...auditFields(),
        id: "coverage_snapshot_apztcms_012",
        importId,
        summary: { covered: 1, total: 1, percentage: 100, kind: "requirement" },
        coveredCount: 1,
        totalCount: 1,
        percentage: 100,
      } as AutomationCoverageSnapshot,
    ]),
    aggregateCoverage: tracked("testing.automation", "aggregateCoverage", async () => ({
      covered: 1,
      total: 1,
      percentage: 100,
      kind: "requirement",
    })),
    ...options.testing?.automation,
  };

  const testingCoverage: TestingCoverageService = {
    recompute: tracked("testing.coverage", "recompute", async () => [buildTestCoverage()]),
    recomputeAll: tracked("testing.coverage", "recomputeAll", async () => [buildTestCoverage()]),
    requestRecompute: tracked("testing.coverage", "requestRecompute", async (ctx) => ({
      accepted: true,
      correlationId: ctx.correlationId,
    })),
    listMetrics: tracked("testing.coverage", "listMetrics", async () => [buildTestCoverage()]),
    getMetric: tracked("testing.coverage", "getMetric", async (_ctx, id) =>
      buildTestCoverage({ id }),
    ),
    listMetricsByKind: tracked("testing.coverage", "listMetricsByKind", async (_ctx, kind) => [
      buildTestCoverage({ kind }),
    ]),
    listMetricsForPlan: tracked("testing.coverage", "listMetricsForPlan", async (_ctx, planId) => [
      buildTestCoverage({ planId }),
    ]),
    listMetricsForSubject: tracked("testing.coverage", "listMetricsForSubject", async (_ctx, subjectId) => [
      buildTestCoverage({ subjectId }),
    ]),
    ...options.testing?.coverage,
  };

  const testingDefects: TestingDefectService = {
    list: tracked("testing.defects", "list", async () => [buildTestDefect()]),
    get: tracked("testing.defects", "get", async (_ctx, id) => buildTestDefect({ id })),
    create: tracked("testing.defects", "create", async (_ctx, input) =>
      buildTestDefect({ ...input, id: API_TEST_DEFECT_ID as DefectLinkId }),
    ),
    link: tracked("testing.defects", "link", async (_ctx, id, entityKind, entityId) =>
      buildTestDefect({ id, target: entityKind as DefectLink["target"], externalId: entityId }),
    ),
    update: tracked("testing.defects", "update", async (_ctx, id, input) =>
      buildTestDefect({ id, ...input }),
    ),
    archive: tracked("testing.defects", "archive", async (_ctx, id) =>
      buildTestDefect({ id, status: "closed" }),
    ),
    ...options.testing?.defects,
  };

  const testingQuality: TestingQualityService = {
    summarize: tracked("testing.quality", "summarize", async (_ctx, scope) => ({
      scope: scope ?? {},
      coverageMetrics: [buildTestCoverage()],
      openDefectsByStatus: { open: 1 },
      openDefectsByPriority: { high: 1 },
      computedAt: TESTING_NOW,
    } as QualitySummary)),
    getSnapshot: tracked("testing.quality", "getSnapshot", async (_ctx, id) => ({
      ...auditFields(),
      id,
      scope: {},
      metrics: {
        passRate: 1,
        failRate: 0,
        blockedRate: 0,
        skippedRate: 0,
        automationRatio: 1,
        manualRatio: 0,
        evidenceCompleteness: 1,
        approvalCompleteness: 1,
        executionCompleteness: 1,
        coverageCompleteness: 1,
        riskScore: 0,
        defectDensity: 0,
        severityDistribution: {},
        totalExecutions: 1,
        openDefectCount: 0,
      },
      computedAt: TESTING_NOW,
    } as QualitySnapshot)),
    listSnapshots: tracked("testing.quality", "listSnapshots", async () => []),
    computeSnapshot: tracked("testing.quality", "computeSnapshot", async (ctx) =>
      testingQuality.getSnapshot(ctx, "quality_snapshot_apztcms_012"),
    ),
    compareSnapshots: tracked("testing.quality", "compareSnapshots", async (ctx, baselineSnapshotId, currentSnapshotId) => ({
      baselineSnapshotId,
      currentSnapshotId,
      deltas: [],
      computedAt: ctx.correlationId,
    } as QualityTrendComparison)),
    compareWindows: tracked("testing.quality", "compareWindows", async (_ctx, baseline, current) => ({
      baselineWindowLabel: baseline.label,
      currentWindowLabel: current.label,
      deltas: [],
      computedAt: TESTING_NOW,
    } as QualityTrendComparison)),
    ...options.testing?.quality,
  };

  const testingCertification: TestingCertificationService = {
    create: tracked("testing.certification", "create", async (_ctx, input) =>
      buildTestCertification({ ...input, id: API_TEST_CERT_ID as CertificationRecordId }),
    ),
    get: tracked("testing.certification", "get", async (_ctx, id) =>
      buildTestCertification({ id }),
    ),
    list: tracked("testing.certification", "list", async () => [buildTestCertification()]),
    prepareForPlan: tracked("testing.certification", "prepareForPlan", async (_ctx, planId) =>
      buildTestCertificationPreparation({ planId }),
    ),
    prepareForCertification: tracked("testing.certification", "prepareForCertification", async (_ctx, certificationRecordId) =>
      buildTestCertificationPreparation({ certificationRecordId }),
    ),
    startReview: tracked("testing.certification", "startReview", async (_ctx, id) =>
      buildTestCertification({ id, status: "in_review" }),
    ),
    requestChanges: tracked("testing.certification", "requestChanges", async (_ctx, id) =>
      buildTestCertification({ id, status: "changes_required" }),
    ),
    submitForApproval: tracked("testing.certification", "submitForApproval", async (_ctx, id) =>
      buildTestCertification({ id, status: "awaiting_approval" }),
    ),
    approve: tracked("testing.certification", "approve", async (_ctx, id) =>
      buildTestCertification({ id, status: "approved", certifiedAt: TESTING_NOW }),
    ),
    conditionallyApprove: tracked("testing.certification", "conditionallyApprove", async (_ctx, id, conditions) =>
      buildTestCertification({ id, status: "conditionally_approved", conditions }),
    ),
    reject: tracked("testing.certification", "reject", async (_ctx, id) =>
      buildTestCertification({ id, status: "rejected" }),
    ),
    expire: tracked("testing.certification", "expire", async (_ctx, id) =>
      buildTestCertification({ id, status: "expired" }),
    ),
    archive: tracked("testing.certification", "archive", async (_ctx, id) =>
      buildTestCertification({ id, status: "archived" }),
    ),
    evaluateGate: tracked("testing.certification", "evaluateGate", async (_ctx, certificationRecordId, gateKey) =>
      ({
        ...auditFields(),
        id: "gate_eval_apztcms_012",
        certificationRecordId,
        gateKey,
        status: "pass",
        reason: "All gates pass",
        supportingEvidence: [],
        evaluatedAt: TESTING_NOW,
        traceabilityRefs: [],
      }) as unknown as CertificationGateEvaluation,
    ),
    evaluateGates: tracked("testing.certification", "evaluateGates", async (ctx, certificationRecordId) => [
      await testingCertification.evaluateGate(ctx, certificationRecordId, "requirement_coverage"),
    ]),
    getRecommendation: tracked(
      "testing.certification",
      "getRecommendation",
      async (_ctx, certificationRecordId) =>
        ({
          id: "cert_rec_apztcms_012",
          certificationRecordId,
          code: "ready_for_approval",
          reasons: ["Representative recommendation"],
          gateEvaluationIds: [],
          computedAt: TESTING_NOW,
          advisoryOnly: true,
        }) as unknown as CertificationRecommendation,
    ),
    getAuditHistory: tracked("testing.certification", "getAuditHistory", async () => []),
    listAudit: tracked("testing.certification", "listAudit", async (_ctx, certificationRecordId) => [
      {
        id: "cert_audit_apztcms_012",
        tenantId: API_TEST_TENANT_A,
        certificationRecordId,
        occurredAt: TESTING_NOW,
        action: "testing.certification.approved",
        summary: "Certification approved",
      } as CertificationAuditEntry,
    ]),
    ...options.testing?.certification,
  };

  const testingReleaseReadiness: TestingReleaseReadinessService = {
    calculateForPlan: tracked("testing.releaseReadiness", "calculateForPlan", async (_ctx, planId) =>
      buildTestReleaseReadiness({ planId }),
    ),
    calculateForCertification: tracked("testing.releaseReadiness", "calculateForCertification", async (_ctx, certificationRecordId) =>
      buildTestReleaseReadiness({ certificationRecordId }),
    ),
    ...options.testing?.releaseReadiness,
  };

  const testingTraceability: TestingTraceabilityService = {
    listLinks: tracked("testing.traceability", "listLinks", async () => [
      {
        ...auditFields(),
        id: API_TEST_TRACE_ID as TraceabilityLinkId,
        type: "covers",
        sourceKind: "requirement",
        sourceId: API_TEST_REQ_ID,
        targetKind: "test_case",
        targetId: API_TEST_CASE_ID,
      } as TraceabilityLink,
    ]),
    getLink: tracked("testing.traceability", "getLink", async (_ctx, id) => ({
      ...auditFields(),
      id,
      type: "covers",
      sourceKind: "requirement",
      sourceId: API_TEST_REQ_ID,
      targetKind: "test_case",
      targetId: API_TEST_CASE_ID,
    } as TraceabilityLink)),
    createLink: tracked("testing.traceability", "createLink", async (_ctx, input) => ({
      ...auditFields(),
      id: API_TEST_TRACE_ID as TraceabilityLinkId,
      ...input,
    } as TraceabilityLink)),
    removeLink: tracked("testing.traceability", "removeLink", async () => undefined),
    createRelationship: tracked("testing.traceability", "createRelationship", async (_ctx, input) => ({
      ...auditFields(),
      id: API_TEST_TRACE_ID as TraceabilityLinkId,
      ...input,
    } as TraceabilityLink)),
    removeRelationship: tracked("testing.traceability", "removeRelationship", async () => undefined),
    getMatrixForRequirement: tracked("testing.traceability", "getMatrixForRequirement", async (_ctx, requirementId) => ({
      requirementId,
      requirementKey: "REQ-012",
      caseIds: [API_TEST_CASE_ID as TestCaseId],
      covered: true,
    } as TraceabilityMatrixRow)),
    listMatrix: tracked("testing.traceability", "listMatrix", async (ctx) => [
      await testingTraceability.getMatrixForRequirement(ctx, API_TEST_REQ_ID as RequirementId),
    ]),
    ...options.testing?.traceability,
  };

  const testingApprovals: TestingApprovalService = {
    list: tracked("testing.approvals", "list", async () => [
      {
        ...auditFields(),
        id: API_TEST_APPROVAL_ID as ApprovalId,
        certificationRecordId: API_TEST_CERT_ID as CertificationRecordId,
        status: "pending",
      } as Approval,
    ]),
    get: tracked("testing.approvals", "get", async (_ctx, id) => ({
      ...auditFields(),
      id,
      certificationRecordId: API_TEST_CERT_ID as CertificationRecordId,
      status: "pending",
    } as Approval)),
    request: tracked("testing.approvals", "request", async (_ctx, input) => ({
      ...auditFields(),
      id: API_TEST_APPROVAL_ID as ApprovalId,
      ...input,
    } as Approval)),
    submitForReview: tracked("testing.approvals", "submitForReview", async (_ctx, input) =>
      ({
        ...auditFields(),
        id: API_TEST_APPROVAL_ID as ApprovalId,
        certificationRecordId: input.certificationRecordId ?? (API_TEST_CERT_ID as CertificationRecordId),
        status: "pending",
        subjectKind: input.subjectKind,
        subjectId: input.subjectId,
      }) as Approval,
    ),
    decide: tracked("testing.approvals", "decide", async (_ctx, id, decision) => ({
      ...auditFields(),
      id,
      certificationRecordId: API_TEST_CERT_ID as CertificationRecordId,
      ...decision,
    } as Approval)),
    listHistory: tracked("testing.approvals", "listHistory", async () => [
      { at: TESTING_NOW, toStatus: "pending" } as ApprovalHistoryEntry,
    ]),
    ...options.testing?.approvals,
  };

  const testingDashboard: TestingDashboardService = {
    getDashboardSummary: tracked("testing.dashboard", "getDashboardSummary", async () => ({
      capturedAt: TESTING_NOW,
      totals: {
        plans: 1,
        suites: 1,
        cases: 1,
        requirements: 1,
        executions: 1,
        evidence: 1,
        certifications: 1,
        defects: 1,
      },
      executionCounts: [{ label: "in_progress", count: 1 }],
      evidenceCounts: [{ label: "submitted", count: 1 }],
      certificationCounts: [{ label: "awaiting_approval", count: 1 }],
      defectCounts: [{ label: "open", count: 1 }],
      coveragePercentages: [{ label: "requirements", percentage: 100 }],
      qualityCounts: [{ label: "risk", count: 0 }],
    })),
    ...options.testing?.dashboard,
  };

  const testingPipelines = {
    listPipelines: tracked("testing.pipelines", "listPipelines", async () => [buildSorPipeline()]),
    getPipeline: tracked("testing.pipelines", "getPipeline", async (_ctx, id) =>
      buildSorPipeline({ id }),
    ),
    listRuns: tracked("testing.pipelines", "listRuns", async (_ctx, pipelineId) => [
      buildSorPipelineRun({
        pipelineId: (pipelineId ?? API_TEST_PIPELINE_ID) as PipelineId,
      }),
    ]),
    getRun: tracked("testing.pipelines", "getRun", async (_ctx, id) =>
      buildSorPipelineRun({ id }),
    ),
    getLinks: tracked("testing.pipelines", "getLinks", async () => buildPipelineLinks()),
    listJobs: tracked("testing.pipelines", "listJobs", async () => [buildPipelineJob()]),
    listStages: tracked("testing.pipelines", "listStages", async () => [
      { name: "build", status: "passed" } satisfies PipelineStage,
    ]),
    listProviders: tracked("testing.pipelines", "listProviders", async () => [
      {
        kind: "github_actions" as const,
        version: "1.0.0",
        canParse: () => true,
        parse: () => {
          throw new Error("fixture adapter does not parse");
        },
      },
    ]),
    importFromProvider: tracked("testing.pipelines", "importFromProvider", async () =>
      buildPipelineImportOutcome(),
    ),
    registerPipeline: tracked("testing.pipelines", "registerPipeline", async (_ctx, input) =>
      buildSorPipeline({ ...input, id: API_TEST_PIPELINE_ID as PipelineId }),
    ),
    updatePipeline: tracked("testing.pipelines", "updatePipeline", async (_ctx, id, input) =>
      buildSorPipeline({ id, ...input }),
    ),
    archivePipeline: tracked("testing.pipelines", "archivePipeline", async (_ctx, id) =>
      buildSorPipeline({ id, status: "archived" }),
    ),
    importRun: tracked("testing.pipelines", "importRun", async () => buildPipelineImportOutcome()),
    listImports: tracked("testing.pipelines", "listImports", async () => []),
    getImport: tracked("testing.pipelines", "getImport", async () => {
      throw new PlatformServiceError({
        category: "not_found",
        code: "NOT_FOUND",
        message: "Import not found",
        correlationId: "corr-test-0001",
        retryable: false,
      });
    }),
    listImportHistory: tracked("testing.pipelines", "listImportHistory", async () => []),
    linkArtifacts: tracked("testing.pipelines", "linkArtifacts", async (_ctx, runId) =>
      buildSorPipelineRun({ id: runId }),
    ),
    linkEvidence: tracked("testing.pipelines", "linkEvidence", async (_ctx, runId) =>
      buildSorPipelineRun({ id: runId }),
    ),
    linkCertifications: tracked("testing.pipelines", "linkCertifications", async (_ctx, runId) =>
      buildSorPipelineRun({ id: runId }),
    ),
    linkReleases: tracked("testing.pipelines", "linkReleases", async (_ctx, runId) =>
      buildSorPipelineRun({ id: runId }),
    ),
    ...options.testing?.pipelines,
  } as TestingPipelinesService;

  const testingPipelineRepositories: TestingPipelineRepositoryService = {
    getRepository: tracked(
      "testing.pipelineRepositories",
      "getRepository",
      async () => buildPipelineRepository(),
    ),
    ...options.testing?.pipelineRepositories,
  };

  const testingPipelineWorkflows: TestingPipelineWorkflowService = {
    listWorkflows: tracked("testing.pipelineWorkflows", "listWorkflows", async () => [
      buildPipelineWorkflow(),
    ]),
    getWorkflow: tracked("testing.pipelineWorkflows", "getWorkflow", async (_ctx, _o, _r, id) =>
      buildPipelineWorkflow({ id: String(id) }),
    ),
    ...options.testing?.pipelineWorkflows,
  };

  const testingPipelineRuns: TestingPipelineRunLiveService = {
    listRuns: tracked("testing.pipelineRuns", "listRuns", async () => [buildPipelineRunView()]),
    getRun: tracked("testing.pipelineRuns", "getRun", async (_ctx, _o, _r, runId) =>
      buildPipelineRunView({ id: String(runId) }),
    ),
    ...options.testing?.pipelineRuns,
  };

  const testingPipelineJobs: TestingPipelineJobService = {
    listJobs: tracked("testing.pipelineJobs", "listJobs", async () => [buildPipelineJob()]),
    getJob: tracked("testing.pipelineJobs", "getJob", async () => buildPipelineJob()),
    ...options.testing?.pipelineJobs,
  };

  const testingPipelineSteps: TestingPipelineStepService = {
    listSteps: tracked("testing.pipelineSteps", "listSteps", async () => [buildPipelineStep()]),
    ...options.testing?.pipelineSteps,
  };

  const testingPipelineArtifacts: TestingPipelineArtifactService = {
    listArtifacts: tracked("testing.pipelineArtifacts", "listArtifacts", async () => [
      buildPipelineArtifact(),
    ]),
    ...options.testing?.pipelineArtifacts,
  };

  const testingPipelineSummaries: TestingPipelineSummaryService = {
    retrieveSummary: tracked(
      "testing.pipelineSummaries",
      "retrieveSummary",
      async () => buildPipelineSummary(),
    ),
    ...options.testing?.pipelineSummaries,
  };

  const mockQualityScore = {
    id: "qs_fixture",
    scope: { tenantId: API_TEST_TENANT_A },
    score: API_TEST_EI_SCORE,
    weights: {
      coverage: 0.15,
      automation: 0.1,
      manualExecution: 0.1,
      failedTests: 0.15,
      openDefects: 0.15,
      certification: 0.15,
      approvals: 0.1,
      releaseReadiness: 0.1,
    },
    inputs: {
      coverage: 80,
      automation: 70,
      manualExecution: 30,
      failedTests: 5,
      openDefects: 10,
      certification: 90,
      approvals: 85,
      releaseReadiness: 75,
    },
    components: [],
    computedAt: "2026-07-12T12:00:00.000Z",
  };

  const mockRisk = {
    overallScore: 22,
    overallLevel: "low" as const,
    factors: [
      {
        key: "quality" as const,
        score: 15,
        level: "low" as const,
        reasons: ["fixture quality risk"],
      },
    ],
    computedAt: "2026-07-12T12:00:00.000Z",
  };

  const mockHealth = {
    scope: { tenantId: API_TEST_TENANT_A },
    status: "watch" as const,
    overallScore: 76,
    qualityScore: API_TEST_EI_SCORE,
    stabilityScore: 80,
    releaseReadinessScore: 75,
    riskScore: 22,
    coverageScore: 80,
    automationScore: 70,
    manualExecutionScore: 30,
    certificationScore: 90,
    pipelineHealthScore: 95,
    indicators: [],
    risk: mockRisk,
    computedAt: "2026-07-12T12:00:00.000Z",
    isDecision: false as const,
  };

  const mockSnapshot = {
    id: API_TEST_EI_SNAPSHOT_ID,
    tenantId: API_TEST_TENANT_A,
    scope: { tenantId: API_TEST_TENANT_A },
    qualityScore: mockQualityScore,
    health: mockHealth,
    risk: mockRisk,
    indicators: [],
    trends: [],
    computedAt: "2026-07-12T12:00:00.000Z",
    label: "fixture",
    createdAt: "2026-07-12T12:00:00.000Z",
    updatedAt: "2026-07-12T12:00:00.000Z",
  };

  const mockTrend = {
    id: "trend_fixture",
    kind: "coverage" as const,
    scope: { tenantId: API_TEST_TENANT_A },
    periodKind: "weekly" as const,
    points: [{ at: "2026-07-12T12:00:00.000Z", value: 80 }],
    direction: "stable" as const,
    delta: 0,
    computedAt: "2026-07-12T12:00:00.000Z",
  };

  const mockBenchmark = {
    id: "bench_fixture",
    tenantId: API_TEST_TENANT_A,
    scope: { tenantId: API_TEST_TENANT_A },
    metricKey: "coverage",
    comparison: {
      current: 80,
      previous: 75,
      rollingAverage: 77.5,
      baseline: 70,
      best: 80,
      worst: 75,
      direction: "improving" as const,
    },
    computedAt: "2026-07-12T12:00:00.000Z",
    createdAt: "2026-07-12T12:00:00.000Z",
    updatedAt: "2026-07-12T12:00:00.000Z",
  };

  const mockBaseline = {
    id: "base_fixture",
    tenantId: API_TEST_TENANT_A,
    scope: { tenantId: API_TEST_TENANT_A },
    kind: "last_month" as const,
    metricKey: "coverage",
    value: 70,
    computedAt: "2026-07-12T12:00:00.000Z",
    createdAt: "2026-07-12T12:00:00.000Z",
    updatedAt: "2026-07-12T12:00:00.000Z",
  };

  const mockHistorical = {
    id: "hist_fixture",
    tenantId: API_TEST_TENANT_A,
    scope: { tenantId: API_TEST_TENANT_A },
    period: {
      kind: "monthly" as const,
      startAt: "2026-06-01T00:00:00.000Z",
      endAt: "2026-06-30T23:59:59.000Z",
    },
    qualityScore: API_TEST_EI_SCORE,
    engineeringHealthScore: 76,
    indicators: [],
    metrics: { coverage: 80 },
    sourceRefs: {},
    computedAt: "2026-07-12T12:00:00.000Z",
    immutable: true as const,
    createdAt: "2026-07-12T12:00:00.000Z",
    updatedAt: "2026-07-12T12:00:00.000Z",
  };

  const testingEngineeringIntelligence: TestingEngineeringIntelligenceService = {
    score: tracked("testing.engineeringIntelligence", "score", async () => mockQualityScore),
    assessHealth: tracked(
      "testing.engineeringIntelligence",
      "assessHealth",
      async () => mockHealth,
    ),
    computeSnapshot: tracked(
      "testing.engineeringIntelligence",
      "computeSnapshot",
      async () => mockSnapshot,
    ),
    getSnapshot: tracked(
      "testing.engineeringIntelligence",
      "getSnapshot",
      async (_ctx, id) => ({ ...mockSnapshot, id: String(id) }),
    ),
    listSnapshots: tracked(
      "testing.engineeringIntelligence",
      "listSnapshots",
      async () => [mockSnapshot],
    ),
    buildTrend: tracked(
      "testing.engineeringIntelligence",
      "buildTrend",
      async (_ctx, kind) => ({ ...mockTrend, kind }),
    ),
    listTrends: tracked(
      "testing.engineeringIntelligence",
      "listTrends",
      async () => [mockTrend],
    ),
    compareBenchmark: tracked(
      "testing.engineeringIntelligence",
      "compareBenchmark",
      async () => mockBenchmark,
    ),
    listBenchmarks: tracked(
      "testing.engineeringIntelligence",
      "listBenchmarks",
      async () => [mockBenchmark],
    ),
    recordBaseline: tracked(
      "testing.engineeringIntelligence",
      "recordBaseline",
      async () => mockBaseline,
    ),
    listBaselines: tracked(
      "testing.engineeringIntelligence",
      "listBaselines",
      async () => [mockBaseline],
    ),
    captureHistorical: tracked(
      "testing.engineeringIntelligence",
      "captureHistorical",
      async () => mockHistorical,
    ),
    listHistorical: tracked(
      "testing.engineeringIntelligence",
      "listHistorical",
      async () => [mockHistorical],
    ),
    ...options.testing?.engineeringIntelligence,
  };

  return {
    workspaces,
    projects,
    teams,
    tasks,
    support,
    supportArticles,
    supportOrganizations,
    supportGroups,
    supportUsers,
    supportSearch,
    supportHistory,
    supportAnalytics,
    testing: {
      plans: testingPlans,
      suites: testingSuites,
      cases: testingCases,
      requirements: testingRequirements,
      executions: testingExecutions,
      evidence: testingEvidence,
      automation: testingAutomation,
      coverage: testingCoverage,
      defects: testingDefects,
      quality: testingQuality,
      certification: testingCertification,
      releaseReadiness: testingReleaseReadiness,
      traceability: testingTraceability,
      approvals: testingApprovals,
      dashboard: testingDashboard,
      pipelines: testingPipelines,
      pipelineRepositories: testingPipelineRepositories,
      pipelineWorkflows: testingPipelineWorkflows,
      pipelineRuns: testingPipelineRuns,
      pipelineJobs: testingPipelineJobs,
      pipelineSteps: testingPipelineSteps,
      pipelineArtifacts: testingPipelineArtifacts,
      pipelineSummaries: testingPipelineSummaries,
      engineeringIntelligence: testingEngineeringIntelligence,
      reporting: {
        listReportPlaceholders: tracked("testing.reporting", "listReportPlaceholders", async () => []),
      },
    },
    reporting: {
      listAvailableReports: tracked(
        "platformReporting",
        "listAvailableReports",
        async () => ["executive", "coverage"],
      ),
      listTemplates: tracked(
        "platformReporting",
        "listTemplates",
        async (_ctx, reportType?: string) => {
          const templates = [
            {
              id: "tmpl-executive-dashboard",
              reportType: "executive",
              name: "Executive Dashboard",
              description: "High-level quality overview.",
              version: "1.0.0",
              revision: 1,
              title: "Executive Dashboard",
              sections: [],
              builtin: true,
              createdAt: "2026-07-12T12:00:00.000Z",
              updatedAt: "2026-07-12T12:00:00.000Z",
            },
          ];
          return reportType
            ? templates.filter((t) => t.reportType === reportType)
            : templates;
        },
      ),
      getTemplate: tracked(
        "platformReporting",
        "getTemplate",
        async (_ctx, templateId: string) => ({
          id: templateId,
          reportType: "executive",
          name: "Executive Dashboard",
          description: "High-level quality overview.",
          version: "1.0.0",
          revision: 1,
          title: "Executive Dashboard",
          sections: [],
          builtin: true,
          createdAt: "2026-07-12T12:00:00.000Z",
          updatedAt: "2026-07-12T12:00:00.000Z",
        }),
      ),
      validateReport: tracked(
        "platformReporting",
        "validateReport",
        async () => ({ valid: true, errors: [], warnings: [] }),
      ),
      previewReport: tracked(
        "platformReporting",
        "previewReport",
        async () => buildMockReportGenerationResult(true),
      ),
      generateReport: tracked(
        "platformReporting",
        "generateReport",
        async () => buildMockReportGenerationResult(false),
      ),
      renderReport: tracked(
        "platformReporting",
        "renderReport",
        async () => ({
          format: "html",
          contentType: "text/html",
          encoding: "utf-8",
          body: "<p>Rendered</p>",
          byteLength: 18,
          checksumSha256: "renderhash",
        }),
      ),
      listReportMetadata: tracked(
        "platformReporting",
        "listReportMetadata",
        async () => [buildMockReportMetadata(false)],
      ),
      getReportMetadata: tracked(
        "platformReporting",
        "getReportMetadata",
        async (_ctx, metadataId: string) => ({
          ...buildMockReportMetadata(false),
          id: metadataId,
        }),
      ),
      archiveReportMetadata: tracked(
        "platformReporting",
        "archiveReportMetadata",
        async (_ctx, metadataId: string) => ({
          ...buildMockReportMetadata(false),
          id: metadataId,
          archivedAt: "2026-07-12T13:00:00.000Z",
        }),
      ),
      registerTemplate: tracked(
        "platformReporting",
        "registerTemplate",
        async (_ctx, input: { template?: { id?: string; name?: string } }) => ({
          id: input.template?.id ?? "tmpl_new",
          reportType: "executive",
          name: input.template?.name ?? "Custom",
          version: "1.0.0",
          revision: 1,
          title: input.template?.name ?? "Custom",
          sections: [],
          builtin: false,
          createdAt: "2026-07-12T12:00:00.000Z",
          updatedAt: "2026-07-12T12:00:00.000Z",
        }),
      ),
      ...options.reporting,
    },
    documents: {
      create: tracked("documentService", "create", async (_ctx, input: { title?: string }) => ({
        id: "doc_1",
        title: input.title ?? "Doc",
        status: "draft",
        documentType: "file",
        classification: { code: "internal" },
        tagIds: [],
        permissions: [],
        creatorUserId: "user_1",
        tenantId: "tenant_a",
        lifecycle: {
          state: "draft",
          changedAt: "2026-07-13T16:00:00.000Z",
          changedBy: "user_1",
        },
        createdAt: "2026-07-13T16:00:00.000Z",
        updatedAt: "2026-07-13T16:00:00.000Z",
      })),
      get: tracked("documentService", "get", async () => ({
        id: "doc_1",
        title: "Doc",
        status: "draft",
        documentType: "file",
        classification: { code: "internal" },
        tagIds: [],
        permissions: [],
        creatorUserId: "user_1",
        tenantId: "tenant_a",
        lifecycle: {
          state: "draft",
          changedAt: "2026-07-13T16:00:00.000Z",
          changedBy: "user_1",
        },
        createdAt: "2026-07-13T16:00:00.000Z",
        updatedAt: "2026-07-13T16:00:00.000Z",
      })),
      summarize: tracked("documentService", "summarize", async () => ({
        documentId: "doc_1",
        title: "Doc",
        status: "draft",
        classification: "internal",
        documentType: "file",
        updatedAt: "2026-07-13T16:00:00.000Z",
        tagNames: [],
      })),
      archive: tracked("documentService", "archive", async () => ({
        id: "doc_1",
        title: "Doc",
        status: "archived",
        documentType: "file",
        classification: { code: "internal" },
        tagIds: [],
        permissions: [],
        creatorUserId: "user_1",
        tenantId: "tenant_a",
        lifecycle: {
          state: "archived",
          changedAt: "2026-07-13T16:00:00.000Z",
          changedBy: "user_1",
        },
        createdAt: "2026-07-13T16:00:00.000Z",
        updatedAt: "2026-07-13T16:00:00.000Z",
      })),
      restore: tracked("documentService", "restore", async () => ({
        id: "doc_1",
        title: "Doc",
        status: "restored",
        documentType: "file",
        classification: { code: "internal" },
        tagIds: [],
        permissions: [],
        creatorUserId: "user_1",
        tenantId: "tenant_a",
        lifecycle: {
          state: "restored",
          changedAt: "2026-07-13T16:00:00.000Z",
          changedBy: "user_1",
        },
        createdAt: "2026-07-13T16:00:00.000Z",
        updatedAt: "2026-07-13T16:00:00.000Z",
      })),
      ...options.documents,
    },
    documentSearchMetadata: {
      find: tracked("documentSearchMetadata", "find", async () => [
        {
          documentId: "doc_1",
          title: "Doc",
          status: "draft",
          classification: "internal",
          documentType: "file",
          updatedAt: "2026-07-13T16:00:00.000Z",
          tagNames: [],
        },
      ]),
      ...options.documentSearchMetadata,
    },
    documentMetadata: {
      update: tracked("documentMetadata", "update", async (_ctx, input: { documentId: string; title?: string }) => ({
        id: "meta_1",
        documentId: input.documentId,
        title: input.title ?? "Doc",
        tenantId: "tenant_a",
        custom: {},
        createdAt: "2026-07-13T16:00:00.000Z",
        updatedAt: "2026-07-13T16:00:00.000Z",
      })),
      ...options.documentMetadata,
    },
    documentVersions: {
      list: tracked("documentVersion", "list", async () => []),
      get: tracked("documentVersion", "get", async () => ({
        id: "ver_1",
        documentId: "doc_1",
        versionNumber: 1,
        mimeType: "text/plain",
        byteLength: 4,
        checksumHex: "abcd",
        checksumAlgorithm: "sha256",
        storageProviderId: "memory",
        storageKey: "redacted",
        storageStatus: "verified",
        immutable: true,
        createdAt: "2026-07-13T16:00:00.000Z",
        createdBy: "user_1",
        tenantId: "tenant_a",
        revision: 1,
      })),
      ...options.documentVersions,
    },
    documentStorage: {
      getStorageMetadata: tracked(
        "documentStorage",
        "getStorageMetadata",
        async () => ({
          version: {
            id: "ver_1",
            documentId: "doc_1",
            versionNumber: 1,
            mimeType: "text/plain",
            byteLength: 4,
            checksumHex: "abcd",
            checksumAlgorithm: "sha256",
            storageProviderId: "memory",
            storageKey: "tenants/t/documents/d/versions/v/content.bin",
            storageStatus: "verified",
            immutable: true,
            createdAt: "2026-07-13T16:00:00.000Z",
            createdBy: "user_1",
            tenantId: "tenant_a",
            revision: 1,
          },
          storageObject: null,
        }),
      ),
      verifyIntegrity: tracked("documentStorage", "verifyIntegrity", async () => ({
        ok: true,
        algorithm: "sha256",
        actualHex: "abcd",
        actualByteLength: 4,
        providerEtagIgnored: true,
        classification: "valid",
      })),
      inspectReconciliation: tracked(
        "documentStorage",
        "inspectReconciliation",
        async () => ({
          inspectedAt: "2026-07-13T16:00:00.000Z",
          issues: [],
        }),
      ),
      ...options.documentStorage,
    },
    documentTags: {
      tag: tracked("documentTag", "tag", async () => [
        { id: "tag_1", tenantId: "tenant_a", name: "alpha", createdAt: "2026-07-13T16:00:00.000Z" },
      ]),
      list: tracked("documentTag", "list", async () => []),
      get: tracked("documentTag", "get", async () => null),
      ...options.documentTags,
    },
    documentClassification: {
      classify: tracked("documentClassification", "classify", async (_ctx, input: { classification: string }) => ({
        code: input.classification,
      })),
      ...options.documentClassification,
    },
    documentFolders: {
      assign: tracked("documentFolder", "assign", async () => ({
        id: "doc_1",
        title: "Doc",
        status: "draft",
        folderId: "folder_1",
        documentType: "file",
        classification: { code: "internal" },
        tagIds: [],
        permissions: [],
        creatorUserId: "user_1",
        tenantId: "tenant_a",
        lifecycle: {
          state: "draft",
          changedAt: "2026-07-13T16:00:00.000Z",
          changedBy: "user_1",
        },
        createdAt: "2026-07-13T16:00:00.000Z",
        updatedAt: "2026-07-13T16:00:00.000Z",
      })),
      ...options.documentFolders,
    },
    documentCollections: {
      assign: tracked("documentCollection", "assign", async () => ({
        id: "doc_1",
        title: "Doc",
        status: "draft",
        categoryId: "collection_1",
        documentType: "file",
        classification: { code: "internal" },
        tagIds: [],
        permissions: [],
        creatorUserId: "user_1",
        tenantId: "tenant_a",
        lifecycle: {
          state: "draft",
          changedAt: "2026-07-13T16:00:00.000Z",
          changedBy: "user_1",
        },
        createdAt: "2026-07-13T16:00:00.000Z",
        updatedAt: "2026-07-13T16:00:00.000Z",
      })),
      ...options.documentCollections,
    },
    documentRetention: {
      apply: tracked("documentRetention", "apply", async () => ({
        id: "doc_1",
        title: "Doc",
        status: "retained",
        retentionId: "ret_1",
        documentType: "file",
        classification: { code: "internal" },
        tagIds: [],
        permissions: [],
        creatorUserId: "user_1",
        tenantId: "tenant_a",
        lifecycle: {
          state: "retained",
          changedAt: "2026-07-13T16:00:00.000Z",
          changedBy: "user_1",
        },
        createdAt: "2026-07-13T16:00:00.000Z",
        updatedAt: "2026-07-13T16:00:00.000Z",
      })),
      ...options.documentRetention,
    },
    documentRelationships: {
      relate: tracked("documentRelationship", "relate", async () => ({
        id: "rel_1",
        tenantId: "tenant_a",
        sourceDocumentId: "doc_1",
        targetDocumentId: "doc_2",
        kind: "related_to",
        createdAt: "2026-07-13T16:00:00.000Z",
        createdBy: "user_1",
      })),
      ...options.documentRelationships,
    },
    documentAudit: {
      list: tracked("documentAudit", "list", async () => []),
      ...options.documentAudit,
    },
    documentDiagnostics: {
      getDiagnostics: tracked("documentDiagnostics", "getDiagnostics", async () => ({
        providerReady: true,
        providerId: "memory",
        providerKind: "memory",
        repositoryReady: true,
        storageReady: true,
        checksumReady: true,
        reconciliationIssueCount: 0,
      })),
      ...options.documentDiagnostics,
    },
    searchExecution: {
      execute: tracked(
        "searchExecution",
        "execute",
        async (_ctx, request: { query?: { keywords?: string } }) => ({
          request: {
            query: request?.query ?? { keywords: "doc" },
            correlationId: _ctx.correlationId,
          },
          page: {
            hits: [
              {
                id: "hit_1",
                score: 1,
                metadata: {
                  entityType: "document",
                  entityId: "doc_1",
                  title: "Fixture Hit",
                  productId: "documents",
                  sourceId: "src_1",
                  tenantId: _ctx.tenantId,
                  organisationId: _ctx.organisationId,
                  classification: "internal",
                },
                highlights: [
                  { field: "title", snippets: ["<em>Fixture</em> Hit"] },
                ],
              },
            ],
            page: 1,
            pageSize: 20,
            totalEstimated: 1,
            hasMore: false,
            suggestions: [{ text: "fixture", kind: "query" }],
          },
          providerId: "prov_1",
        }),
      ),
      validateQuery: tracked("searchExecution", "validateQuery", async () => ({
        valid: true,
        issues: [],
      })),
      suggest: tracked(
        "searchExecution",
        "suggest",
        async (_ctx, query: { keywords?: string }) => ({
          hits: [],
          page: 1,
          pageSize: 10,
          hasMore: false,
          suggestions: [
            { text: query?.keywords ?? "doc", kind: "query" as const },
          ],
        }),
      ),
      ...options.searchExecution,
    },
    searchExecutionHealth: {
      getHealth: tracked("searchExecutionHealth", "getHealth", async () => ({
        status: "available",
        checkedAt: "2026-07-14T12:00:00.000Z",
        message: "ok",
      })),
      getReadiness: tracked(
        "searchExecutionHealth",
        "getReadiness",
        async () => ({
          executionEnabled: true,
          providerBound: true,
          providerId: "prov_1",
          providerKind: "meilisearch",
          healthy: true,
        }),
      ),
      ...options.searchExecutionHealth,
    },
    searchExecutionDiagnostics: {
      getCapabilities: tracked(
        "searchExecutionDiagnostics",
        "getCapabilities",
        async () => ({
          keywords: true,
          phrases: true,
          filters: true,
          sorting: true,
          pagination: true,
          facets: true,
          highlighting: true,
          suggestions: true,
          semantic: false,
          vector: false,
          fuzzy: false,
        }),
      ),
      getDiagnostics: tracked(
        "searchExecutionDiagnostics",
        "getDiagnostics",
        async () => ({
          health: {
            status: "available",
            checkedAt: "2026-07-14T12:00:00.000Z",
          },
          capabilities: {
            keywords: true,
            phrases: true,
            filters: true,
            sorting: true,
            pagination: true,
            facets: true,
            highlighting: true,
            suggestions: true,
            semantic: false,
            vector: false,
            fuzzy: false,
          },
          statistics: {
            declaredIndexCount: 1,
            declaredProviderCount: 1,
            declaredCollectionCount: 1,
            declaredSourceCount: 1,
          },
          configurationSummary: {
            defaultPageSize: 20,
            maxPageSize: 100,
            enforceTenantIsolation: true,
            enforcePermissionFilter: true,
          },
          notes: ["fixture"],
          apiKey: "sk-secret-should-redact",
        }),
      ),
      getStatistics: tracked(
        "searchExecutionDiagnostics",
        "getStatistics",
        async () => ({
          declaredIndexCount: 1,
          declaredProviderCount: 1,
          declaredCollectionCount: 1,
          declaredSourceCount: 1,
        }),
      ),
      ...options.searchExecutionDiagnostics,
    },
    searchProviders: {
      listProviders: tracked("searchProviders", "listProviders", async () => [
        {
          id: "prov_1",
          kind: "meilisearch",
          label: "Fixture Provider",
          enabled: true,
          active: true,
          ownership: "tenant",
          capabilities: {
            keywords: true,
            phrases: true,
            filters: true,
            sorting: true,
            pagination: true,
            facets: true,
            highlighting: true,
            suggestions: true,
            semantic: false,
            vector: false,
            fuzzy: false,
          },
          apiKey: "sk-should-redact",
        },
      ]),
      getProvider: tracked(
        "searchProviders",
        "getProvider",
        async (_ctx, providerId: string) => ({
          id: providerId,
          kind: "meilisearch",
          label: "Fixture Provider",
          enabled: true,
          capabilities: {
            keywords: true,
            phrases: false,
            filters: true,
            sorting: true,
            pagination: true,
            facets: false,
            highlighting: true,
            suggestions: true,
            semantic: false,
            vector: false,
            fuzzy: false,
          },
          secret: "plaintext-secret",
        }),
      ),
      updateProvider: tracked(
        "searchProviders",
        "updateProvider",
        async (_ctx, providerId: string, input: { label?: string }) => ({
          id: providerId,
          kind: "meilisearch",
          label: input.label ?? "Fixture Provider",
          enabled: true,
          capabilities: {
            keywords: true,
            phrases: true,
            filters: true,
            sorting: true,
            pagination: true,
            facets: true,
            highlighting: true,
            suggestions: true,
            semantic: false,
            vector: false,
            fuzzy: false,
          },
        }),
      ),
      enableProvider: tracked("searchProviders", "enableProvider", async () => undefined),
      disableProvider: tracked(
        "searchProviders",
        "disableProvider",
        async () => undefined,
      ),
      ...options.searchProviders,
    },
    searchConfigurations: {
      list: tracked("searchConfigurations", "list", async () => [
        {
          id: "cfg_1",
          label: "Default",
          status: "active",
          currentVersion: 1,
          active: true,
          configuration: {
            defaultPageSize: 20,
            maxPageSize: 100,
            maxKeywordLength: 512,
            allowedProviderKinds: ["meilisearch"],
            enforceTenantIsolation: true,
            enforceOrganisationIsolation: true,
            enforcePermissionFilter: true,
          },
        },
      ]),
      get: tracked(
        "searchConfigurations",
        "get",
        async (_ctx, configurationId?: string) => ({
          id: configurationId ?? "cfg_1",
          label: "Default",
          status: "active",
          currentVersion: 1,
          active: true,
          configuration: {
            defaultPageSize: 20,
            maxPageSize: 100,
            maxKeywordLength: 512,
            allowedProviderKinds: ["meilisearch"],
            enforceTenantIsolation: true,
            enforceOrganisationIsolation: true,
            enforcePermissionFilter: true,
          },
        }),
      ),
      create: tracked(
        "searchConfigurations",
        "create",
        async (_ctx, input: { label?: string; configuration: unknown }) => ({
          id: "cfg_new",
          label: input.label ?? "New",
          status: "draft",
          currentVersion: 1,
          active: false,
          configuration: input.configuration,
        }),
      ),
      update: tracked(
        "searchConfigurations",
        "update",
        async (
          _ctx,
          configurationId: string,
          input: { label?: string; configuration: unknown },
        ) => ({
          id: configurationId,
          label: input.label ?? "Default",
          status: "active",
          currentVersion: 2,
          active: true,
          configuration: input.configuration,
        }),
      ),
      ...options.searchConfigurations,
    },
    searchCollections: {
      list: tracked("searchCollections", "list", async () => [
        {
          id: "col_1",
          name: "Documents",
          scope: "tenant",
          productIds: ["documents"],
          enabled: true,
        },
      ]),
      get: tracked(
        "searchCollections",
        "get",
        async (_ctx, collectionId: string) => ({
          id: collectionId,
          name: "Documents",
          scope: "tenant",
          enabled: true,
        }),
      ),
      create: tracked(
        "searchCollections",
        "create",
        async (_ctx, input: { name: string; scope: string }) => ({
          id: "col_new",
          name: input.name,
          scope: input.scope,
          enabled: true,
        }),
      ),
      update: tracked(
        "searchCollections",
        "update",
        async (
          _ctx,
          collectionId: string,
          input: { name?: string; enabled?: boolean },
        ) => ({
          id: collectionId,
          name: input.name ?? "Documents",
          scope: "tenant",
          enabled: input.enabled ?? true,
        }),
      ),
      ...options.searchCollections,
    },
    searchSources: {
      list: tracked("searchSources", "list", async () => [
        {
          id: "src_1",
          productId: "documents",
          label: "Documents Source",
          entityTypes: ["document"],
          enabled: true,
        },
      ]),
      get: tracked("searchSources", "get", async (_ctx, sourceId: string) => ({
        id: sourceId,
        productId: "documents",
        label: "Documents Source",
        entityTypes: ["document"],
        enabled: true,
      })),
      ...options.searchSources,
    },
    searchScopes: {
      list: tracked("searchScopes", "list", async () => [
        {
          id: "scope_1",
          scope: "tenant",
          label: "Tenant",
          enabled: true,
          metadata: {},
        },
      ]),
      get: tracked("searchScopes", "get", async (_ctx, scopeId: string) => ({
        id: scopeId,
        scope: "tenant",
        label: "Tenant",
        enabled: true,
        metadata: {},
      })),
      ...options.searchScopes,
    },
    searchProfiles: {
      list: tracked("searchProfiles", "list", async () => [
        { id: "profile_1", name: "Default Profile" },
      ]),
      get: tracked("searchProfiles", "get", async (_ctx, profileId: string) => ({
        id: profileId,
        name: "Default Profile",
      })),
      ...options.searchProfiles,
    },
    searchCapabilities: {
      getCapabilities: tracked(
        "searchCapabilities",
        "getCapabilities",
        async () => ({
          keywords: true,
          phrases: true,
          filters: true,
          sorting: true,
          pagination: true,
          facets: true,
          highlighting: true,
          suggestions: true,
          semantic: false,
          vector: false,
          fuzzy: false,
        }),
      ),
      ...options.searchCapabilities,
    },
    searchHealth: {
      getHealth: tracked("searchHealth", "getHealth", async () => ({
        status: "available",
        checkedAt: "2026-07-14T12:00:00.000Z",
      })),
      ...options.searchHealth,
    },
    searchDiagnostics: {
      getDiagnostics: tracked(
        "searchDiagnostics",
        "getDiagnostics",
        async () => ({
          health: {
            status: "available",
            checkedAt: "2026-07-14T12:00:00.000Z",
          },
          capabilities: {
            keywords: true,
            phrases: true,
            filters: true,
            sorting: true,
            pagination: true,
            facets: true,
            highlighting: true,
            suggestions: true,
            semantic: false,
            vector: false,
            fuzzy: false,
          },
          statistics: {
            declaredIndexCount: 1,
            declaredProviderCount: 1,
            declaredCollectionCount: 1,
            declaredSourceCount: 1,
          },
          configurationSummary: {
            defaultPageSize: 20,
            maxPageSize: 100,
            enforceTenantIsolation: true,
            enforcePermissionFilter: true,
          },
        }),
      ),
      ...options.searchDiagnostics,
    },
    searchStatistics: {
      getStatistics: tracked("searchStatistics", "getStatistics", async () => ({
        declaredIndexCount: 1,
        declaredProviderCount: 1,
        declaredCollectionCount: 1,
        declaredSourceCount: 1,
      })),
      ...options.searchStatistics,
    },
    searchAudit: {
      list: tracked("searchAudit", "list", async () => [
        {
          id: "audit_1",
          action: "search.query.execute",
          actorUserId: "user_1",
          tenantId: "tenant_a",
          createdAt: "2026-07-14T12:00:00.000Z",
        },
      ]),
      ...options.searchAudit,
    },
    searchValidation: {
      validateQuery: tracked("searchValidation", "validateQuery", async () => ({
        valid: true,
        issues: [],
      })),
      validateConfiguration: tracked(
        "searchValidation",
        "validateConfiguration",
        async () => ({ valid: true, issues: [] }),
      ),
      ...options.searchValidation,
    },
    users: {} as PlatformServiceGateway["users"],
    search: {} as PlatformServiceGateway["search"],
    assertContext: () => undefined,
  } as unknown as PlatformServiceGateway;
}

export function installMockGateway(options: MockGatewayOptions = {}): PlatformServiceGateway {
  const gateway = createMockPlatformGateway(options);
  setPlatformApiGatewayBootstrapForTests(
    createTestPlatformApiGatewayBootstrap(gateway, {
      authorizationMode: "production",
      providersRegistered: true,
    }),
  );
  return gateway;
}

export function buildMockSession(overrides: {
  readonly userId?: string;
  readonly tenantId?: string | null;
} = {}) {
  const userId = overrides.userId ?? API_TEST_USER_ID;
  const tenantId =
    overrides.tenantId === null ? undefined : (overrides.tenantId ?? API_TEST_TENANT_A);
  const now = new Date();
  return {
    session: {
      id: "sess-1",
      userId,
      expiresAt: new Date(Date.now() + 60_000),
      token: "token",
      createdAt: now,
      updatedAt: now,
    },
    user: {
      id: userId,
      email: "user@example.com",
      emailVerified: true,
      name: "Test User",
      createdAt: now,
      updatedAt: now,
      tenantId,
      activeTenantId: tenantId,
    },
    tenantId,
    tenantSource: tenantId ? ("user_active_tenant" as const) : ("none" as const),
  };
}
