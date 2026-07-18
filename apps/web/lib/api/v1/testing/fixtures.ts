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
import {
  asBenchmarkId,
  asBaselineId,
  asEngineeringHistoricalSnapshotId,
  asEngineeringSnapshotId,
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

export function buildTestSupportRequest(
  overrides: Partial<SupportTicket> = {},
): SupportTicket {
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

export function buildTestSupportArticle(
  overrides: Partial<SupportArticle> = {},
): SupportArticle {
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

export function buildTestSupportGroup(
  overrides: Partial<SupportGroup> = {},
): SupportGroup {
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

export function buildTestSupportUser(
  overrides: Partial<SupportUser> = {},
): SupportUser {
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

export function buildTestRequirement(
  overrides: Partial<Requirement> = {},
): Requirement {
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

export function buildTestExecution(
  overrides: Partial<ManualExecution> = {},
): ManualExecution {
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

export function buildTestCoverage(
  overrides: Partial<CoverageMetric> = {},
): CoverageMetric {
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

export function buildPipelineLinks(
  overrides: Partial<PipelineLinks> = {},
): PipelineLinks {
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
  readonly onCall?: (
    service: string,
    operation: string,
    ctx: ServiceRequestContext,
  ) => void;
  readonly reporting?: Partial<{
    listAvailableReports: (ctx: ServiceRequestContext) => Promise<readonly string[]>;
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
    list: (
      ctx: ServiceRequestContext,
      documentId: string,
    ) => Promise<readonly unknown[]>;
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
    list: (
      ctx: ServiceRequestContext,
      documentId: string,
    ) => Promise<readonly unknown[]>;
  }>;
  readonly documentDiagnostics?: Partial<{
    getDiagnostics: (ctx: ServiceRequestContext) => Promise<unknown>;
  }>;
  readonly workflow?: Partial<{
    workflows: Record<string, unknown>;
    versions: Record<string, unknown>;
    templates: Record<string, unknown>;
    categories: Record<string, unknown>;
    folders: Record<string, unknown>;
    validation: Record<string, unknown>;
    audit: Record<string, unknown>;
  }>;
  readonly notification?: Partial<{
    notifications: Record<string, unknown>;
    templates: Record<string, unknown>;
    preferences: Record<string, unknown>;
    categories: Record<string, unknown>;
    channels: Record<string, unknown>;
    recipients: Record<string, unknown>;
    references: Record<string, unknown>;
    audit: Record<string, unknown>;
    diagnostics: Record<string, unknown>;
  }>;
  readonly administration?: Partial<{
    modules: Record<string, unknown>;
    categories: Record<string, unknown>;
    sections: Record<string, unknown>;
    actions: Record<string, unknown>;
    permissions: Record<string, unknown>;
    audit: Record<string, unknown>;
    history: Record<string, unknown>;
    diagnostics: Record<string, unknown>;
    registrations: Record<string, unknown>;
    metadata: Record<string, unknown>;
    policies: Record<string, unknown>;
    references: Record<string, unknown>;
    capabilities: Record<string, unknown>;
    navigations: Record<string, unknown>;
    shortcuts: Record<string, unknown>;
    dashboards: Record<string, unknown>;
    widgets: Record<string, unknown>;
  }>;
  readonly identity?: Partial<{
    users: Record<string, unknown>;
    groups: Record<string, unknown>;
    roles: Record<string, unknown>;
    organisations: Record<string, unknown>;
    tenants: Record<string, unknown>;
    departments: Record<string, unknown>;
    positions: Record<string, unknown>;
    memberships: Record<string, unknown>;
    serviceAssignments: Record<string, unknown>;
    invitations: Record<string, unknown>;
    activation: Record<string, unknown>;
    deactivation: Record<string, unknown>;
    policies: Record<string, unknown>;
    audit: Record<string, unknown>;
    history: Record<string, unknown>;
    references: Record<string, unknown>;
    diagnostics: Record<string, unknown>;
  }>;
  readonly configuration?: Partial<{
    configurations: Record<string, unknown>;
    namespaces: Record<string, unknown>;
    groups: Record<string, unknown>;
    versions: Record<string, unknown>;
    overrides: Record<string, unknown>;
    scopes: Record<string, unknown>;
    validation: Record<string, unknown>;
    references: Record<string, unknown>;
    audit: Record<string, unknown>;
    diagnostics: Record<string, unknown>;
  }>;
  readonly observe?: Partial<Record<string, Record<string, unknown>>>;
  readonly metricsPlatform?: Partial<Record<string, Record<string, unknown>>>;
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
    updateProject: async (
      ctx: ServiceRequestContext,
      id: string,
      input: { name?: string },
    ) => {
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
          input.projectModuleId === null
            ? undefined
            : (input.projectModuleId ?? undefined),
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
      return buildTestSupportRequest({
        id,
        status: "closed",
        closedAt: "2026-07-10T12:00:00.000Z",
      });
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
      return buildTestSupportOrganization({
        id,
        ...(input as Partial<SupportOrganization>),
      });
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
    transitionStatus: tracked(
      "testing.cases",
      "transitionStatus",
      async (_ctx, id, status) => buildTestCase({ id, status }),
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
    get: tracked("testing.executions", "get", async (_ctx, id) =>
      buildTestExecution({ id }),
    ),
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
    complete: tracked(
      "testing.executions",
      "complete",
      async (_ctx, id, overallResult) =>
        buildTestExecution({
          id,
          status: "completed",
          overallResult,
          completedAt: TESTING_NOW,
        }),
    ),
    submitForReview: tracked(
      "testing.executions",
      "submitForReview",
      async (_ctx, id) => buildTestExecution({ id, status: "under_review" }),
    ),
    approve: tracked("testing.executions", "approve", async (_ctx, id, comments) =>
      buildTestExecution({
        id,
        status: "approved",
        comments: comments
          ? [
              {
                id: "comment-1",
                authorUserId: API_TEST_USER_ID,
                body: comments,
                createdAt: TESTING_NOW,
              },
            ]
          : [],
      }),
    ),
    reject: tracked("testing.executions", "reject", async (_ctx, id, comments) =>
      buildTestExecution({
        id,
        status: "rejected",
        comments: [
          {
            id: "comment-1",
            authorUserId: API_TEST_USER_ID,
            body: comments,
            createdAt: TESTING_NOW,
          },
        ],
      }),
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
    recordStepActual: tracked(
      "testing.executions",
      "recordStepActual",
      async (_ctx, id, stepId, actual) =>
        buildTestExecution({ id, stepActuals: [{ stepId, ...actual }] }),
    ),
    setStepStatus: tracked(
      "testing.executions",
      "setStepStatus",
      async (_ctx, id, stepId, status) =>
        buildTestExecution({ id, stepActuals: [{ stepId, status }] }),
    ),
    ...options.testing?.executions,
  };

  const testingEvidence: TestingEvidenceService = {
    listEvidence: tracked("testing.evidence", "listEvidence", async () => [
      buildTestEvidence(),
    ]),
    getEvidence: tracked("testing.evidence", "getEvidence", async (_ctx, id) =>
      buildTestEvidence({ id }),
    ),
    registerEvidence: tracked(
      "testing.evidence",
      "registerEvidence",
      async (_ctx, input) =>
        buildTestEvidence({ ...input, id: API_TEST_EVIDENCE_ID as EvidenceId }),
    ),
    submitEvidence: tracked("testing.evidence", "submitEvidence", async (_ctx, id) =>
      buildTestEvidence({ id, lifecycleStatus: "submitted" }),
    ),
    verifyEvidence: tracked(
      "testing.evidence",
      "verifyEvidence",
      async (_ctx, id, verificationState) =>
        buildTestEvidence({ id, lifecycleStatus: "verified", verificationState }),
    ),
    approveEvidence: tracked("testing.evidence", "approveEvidence", async (_ctx, id) =>
      buildTestEvidence({ id, lifecycleStatus: "approved", approvalState: "approved" }),
    ),
    rejectEvidence: tracked(
      "testing.evidence",
      "rejectEvidence",
      async (_ctx, id, reason) =>
        buildTestEvidence({
          id,
          lifecycleStatus: "rejected",
          verificationState: reason,
        }),
    ),
    archiveEvidence: tracked("testing.evidence", "archiveEvidence", async (_ctx, id) =>
      buildTestEvidence({ id, lifecycleStatus: "archived" }),
    ),
    ...options.testing?.evidence,
  };

  const testingAutomation: TestingAutomationService = {
    validateImport: tracked(
      "testing.automation",
      "validateImport",
      async () => undefined,
    ),
    importResult: tracked("testing.automation", "importResult", async () => ({
      importRecord: buildTestAutomationImport(),
      automatedExecutionId: "auto_exec_apztcms_012",
      createdRunCount: 1,
      createdResultCount: 1,
      registeredEvidenceIds: [API_TEST_EVIDENCE_ID],
      coverageSnapshotIds: [API_TEST_COVERAGE_ID],
    })),
    listImports: tracked("testing.automation", "listImports", async () => [
      buildTestAutomationImport(),
    ]),
    getImport: tracked("testing.automation", "getImport", async (_ctx, id) =>
      buildTestAutomationImport({ id }),
    ),
    listImportHistory: tracked(
      "testing.automation",
      "listImportHistory",
      async (_ctx, importId) => [
        {
          id: "import_history_apztcms_012",
          tenantId: API_TEST_TENANT_A,
          importId,
          eventType: "testing.automation.imported",
          occurredAt: TESTING_NOW,
          summary: "Import completed",
        } as AutomationImportHistory,
      ],
    ),
    getHistory: tracked("testing.automation", "getHistory", async () => []),
    listRuns: tracked("testing.automation", "listRuns", async () => []),
    getRun: tracked(
      "testing.automation",
      "getRun",
      async (_ctx, id) =>
        ({
          ...auditFields(),
          id,
          executionId: "auto_exec_apztcms_012",
          title: "HTTP API automation run",
          status: "pass",
        }) as AutomationRun,
    ),
    listResultItems: tracked("testing.automation", "listResultItems", async () => []),
    listCoverageSnapshots: tracked(
      "testing.automation",
      "listCoverageSnapshots",
      async (_ctx, importId) => [
        {
          ...auditFields(),
          id: "coverage_snapshot_apztcms_012",
          importId,
          summary: { covered: 1, total: 1, percentage: 100, kind: "requirement" },
          coveredCount: 1,
          totalCount: 1,
          percentage: 100,
        } as AutomationCoverageSnapshot,
      ],
    ),
    aggregateCoverage: tracked("testing.automation", "aggregateCoverage", async () => ({
      covered: 1,
      total: 1,
      percentage: 100,
      kind: "requirement",
    })),
    ...options.testing?.automation,
  };

  const testingCoverage: TestingCoverageService = {
    recompute: tracked("testing.coverage", "recompute", async () => [
      buildTestCoverage(),
    ]),
    recomputeAll: tracked("testing.coverage", "recomputeAll", async () => [
      buildTestCoverage(),
    ]),
    requestRecompute: tracked("testing.coverage", "requestRecompute", async (ctx) => ({
      accepted: true,
      correlationId: ctx.correlationId,
    })),
    listMetrics: tracked("testing.coverage", "listMetrics", async () => [
      buildTestCoverage(),
    ]),
    getMetric: tracked("testing.coverage", "getMetric", async (_ctx, id) =>
      buildTestCoverage({ id }),
    ),
    listMetricsByKind: tracked(
      "testing.coverage",
      "listMetricsByKind",
      async (_ctx, kind) => [buildTestCoverage({ kind })],
    ),
    listMetricsForPlan: tracked(
      "testing.coverage",
      "listMetricsForPlan",
      async (_ctx, planId) => [buildTestCoverage({ planId })],
    ),
    listMetricsForSubject: tracked(
      "testing.coverage",
      "listMetricsForSubject",
      async (_ctx, subjectId) => [buildTestCoverage({ subjectId })],
    ),
    ...options.testing?.coverage,
  };

  const testingDefects: TestingDefectService = {
    list: tracked("testing.defects", "list", async () => [buildTestDefect()]),
    get: tracked("testing.defects", "get", async (_ctx, id) => buildTestDefect({ id })),
    create: tracked("testing.defects", "create", async (_ctx, input) =>
      buildTestDefect({ ...input, id: API_TEST_DEFECT_ID as DefectLinkId }),
    ),
    link: tracked("testing.defects", "link", async (_ctx, id, entityKind, entityId) =>
      buildTestDefect({
        id,
        target: entityKind as DefectLink["target"],
        externalId: entityId,
      }),
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
    summarize: tracked(
      "testing.quality",
      "summarize",
      async (_ctx, scope) =>
        ({
          scope: scope ?? {},
          coverageMetrics: [buildTestCoverage()],
          openDefectsByStatus: { open: 1 },
          openDefectsByPriority: { high: 1 },
          computedAt: TESTING_NOW,
        }) as QualitySummary,
    ),
    getSnapshot: tracked(
      "testing.quality",
      "getSnapshot",
      async (_ctx, id) =>
        ({
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
        }) as QualitySnapshot,
    ),
    listSnapshots: tracked("testing.quality", "listSnapshots", async () => []),
    computeSnapshot: tracked("testing.quality", "computeSnapshot", async (ctx) =>
      testingQuality.getSnapshot(ctx, "quality_snapshot_apztcms_012"),
    ),
    compareSnapshots: tracked(
      "testing.quality",
      "compareSnapshots",
      async (ctx, baselineSnapshotId, currentSnapshotId) =>
        ({
          baselineSnapshotId,
          currentSnapshotId,
          deltas: [],
          computedAt: ctx.correlationId,
        }) as QualityTrendComparison,
    ),
    compareWindows: tracked(
      "testing.quality",
      "compareWindows",
      async (_ctx, baseline, current) =>
        ({
          baselineWindowLabel: baseline.label,
          currentWindowLabel: current.label,
          deltas: [],
          computedAt: TESTING_NOW,
        }) as QualityTrendComparison,
    ),
    ...options.testing?.quality,
  };

  const testingCertification: TestingCertificationService = {
    create: tracked("testing.certification", "create", async (_ctx, input) =>
      buildTestCertification({
        ...input,
        id: API_TEST_CERT_ID as CertificationRecordId,
      }),
    ),
    get: tracked("testing.certification", "get", async (_ctx, id) =>
      buildTestCertification({ id }),
    ),
    list: tracked("testing.certification", "list", async () => [
      buildTestCertification(),
    ]),
    prepareForPlan: tracked(
      "testing.certification",
      "prepareForPlan",
      async (_ctx, planId) => buildTestCertificationPreparation({ planId }),
    ),
    prepareForCertification: tracked(
      "testing.certification",
      "prepareForCertification",
      async (_ctx, certificationRecordId) =>
        buildTestCertificationPreparation({ certificationRecordId }),
    ),
    startReview: tracked("testing.certification", "startReview", async (_ctx, id) =>
      buildTestCertification({ id, status: "in_review" }),
    ),
    requestChanges: tracked(
      "testing.certification",
      "requestChanges",
      async (_ctx, id) => buildTestCertification({ id, status: "changes_required" }),
    ),
    submitForApproval: tracked(
      "testing.certification",
      "submitForApproval",
      async (_ctx, id) => buildTestCertification({ id, status: "awaiting_approval" }),
    ),
    approve: tracked("testing.certification", "approve", async (_ctx, id) =>
      buildTestCertification({ id, status: "approved", certifiedAt: TESTING_NOW }),
    ),
    conditionallyApprove: tracked(
      "testing.certification",
      "conditionallyApprove",
      async (_ctx, id, conditions) =>
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
    evaluateGate: tracked(
      "testing.certification",
      "evaluateGate",
      async (_ctx, certificationRecordId, gateKey) =>
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
    evaluateGates: tracked(
      "testing.certification",
      "evaluateGates",
      async (ctx, certificationRecordId) => [
        await testingCertification.evaluateGate(
          ctx,
          certificationRecordId,
          "requirement_coverage",
        ),
      ],
    ),
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
    getAuditHistory: tracked(
      "testing.certification",
      "getAuditHistory",
      async () => [],
    ),
    listAudit: tracked(
      "testing.certification",
      "listAudit",
      async (_ctx, certificationRecordId) => [
        {
          id: "cert_audit_apztcms_012",
          tenantId: API_TEST_TENANT_A,
          certificationRecordId,
          occurredAt: TESTING_NOW,
          action: "testing.certification.approved",
          summary: "Certification approved",
        } as CertificationAuditEntry,
      ],
    ),
    ...options.testing?.certification,
  };

  const testingReleaseReadiness: TestingReleaseReadinessService = {
    calculateForPlan: tracked(
      "testing.releaseReadiness",
      "calculateForPlan",
      async (_ctx, planId) => buildTestReleaseReadiness({ planId }),
    ),
    calculateForCertification: tracked(
      "testing.releaseReadiness",
      "calculateForCertification",
      async (_ctx, certificationRecordId) =>
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
    getLink: tracked(
      "testing.traceability",
      "getLink",
      async (_ctx, id) =>
        ({
          ...auditFields(),
          id,
          type: "covers",
          sourceKind: "requirement",
          sourceId: API_TEST_REQ_ID,
          targetKind: "test_case",
          targetId: API_TEST_CASE_ID,
        }) as TraceabilityLink,
    ),
    createLink: tracked(
      "testing.traceability",
      "createLink",
      async (_ctx, input) =>
        ({
          ...auditFields(),
          id: API_TEST_TRACE_ID as TraceabilityLinkId,
          ...input,
        }) as TraceabilityLink,
    ),
    removeLink: tracked("testing.traceability", "removeLink", async () => undefined),
    createRelationship: tracked(
      "testing.traceability",
      "createRelationship",
      async (_ctx, input) =>
        ({
          ...auditFields(),
          id: API_TEST_TRACE_ID as TraceabilityLinkId,
          ...input,
        }) as TraceabilityLink,
    ),
    removeRelationship: tracked(
      "testing.traceability",
      "removeRelationship",
      async () => undefined,
    ),
    getMatrixForRequirement: tracked(
      "testing.traceability",
      "getMatrixForRequirement",
      async (_ctx, requirementId) =>
        ({
          requirementId,
          requirementKey: "REQ-012",
          caseIds: [API_TEST_CASE_ID as TestCaseId],
          covered: true,
        }) as TraceabilityMatrixRow,
    ),
    listMatrix: tracked("testing.traceability", "listMatrix", async (ctx) => [
      await testingTraceability.getMatrixForRequirement(
        ctx,
        API_TEST_REQ_ID as RequirementId,
      ),
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
    get: tracked(
      "testing.approvals",
      "get",
      async (_ctx, id) =>
        ({
          ...auditFields(),
          id,
          certificationRecordId: API_TEST_CERT_ID as CertificationRecordId,
          status: "pending",
        }) as Approval,
    ),
    request: tracked(
      "testing.approvals",
      "request",
      async (_ctx, input) =>
        ({
          ...auditFields(),
          id: API_TEST_APPROVAL_ID as ApprovalId,
          ...input,
        }) as Approval,
    ),
    submitForReview: tracked(
      "testing.approvals",
      "submitForReview",
      async (_ctx, input) =>
        ({
          ...auditFields(),
          id: API_TEST_APPROVAL_ID as ApprovalId,
          certificationRecordId:
            input.certificationRecordId ?? (API_TEST_CERT_ID as CertificationRecordId),
          status: "pending",
          subjectKind: input.subjectKind,
          subjectId: input.subjectId,
        }) as Approval,
    ),
    decide: tracked(
      "testing.approvals",
      "decide",
      async (_ctx, id, decision) =>
        ({
          ...auditFields(),
          id,
          certificationRecordId: API_TEST_CERT_ID as CertificationRecordId,
          ...decision,
        }) as Approval,
    ),
    listHistory: tracked("testing.approvals", "listHistory", async () => [
      { at: TESTING_NOW, toStatus: "pending" } as ApprovalHistoryEntry,
    ]),
    ...options.testing?.approvals,
  };

  const testingDashboard: TestingDashboardService = {
    getDashboardSummary: tracked(
      "testing.dashboard",
      "getDashboardSummary",
      async () => ({
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
      }),
    ),
    ...options.testing?.dashboard,
  };

  const testingPipelines = {
    listPipelines: tracked("testing.pipelines", "listPipelines", async () => [
      buildSorPipeline(),
    ]),
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
    getLinks: tracked("testing.pipelines", "getLinks", async () =>
      buildPipelineLinks(),
    ),
    listJobs: tracked("testing.pipelines", "listJobs", async () => [
      buildPipelineJob(),
    ]),
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
    registerPipeline: tracked(
      "testing.pipelines",
      "registerPipeline",
      async (_ctx, input) =>
        buildSorPipeline({ ...input, id: API_TEST_PIPELINE_ID as PipelineId }),
    ),
    updatePipeline: tracked(
      "testing.pipelines",
      "updatePipeline",
      async (_ctx, id, input) => buildSorPipeline({ id, ...input }),
    ),
    archivePipeline: tracked("testing.pipelines", "archivePipeline", async (_ctx, id) =>
      buildSorPipeline({ id, status: "archived" }),
    ),
    importRun: tracked("testing.pipelines", "importRun", async () =>
      buildPipelineImportOutcome(),
    ),
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
    listImportHistory: tracked(
      "testing.pipelines",
      "listImportHistory",
      async () => [],
    ),
    linkArtifacts: tracked("testing.pipelines", "linkArtifacts", async (_ctx, runId) =>
      buildSorPipelineRun({ id: runId }),
    ),
    linkEvidence: tracked("testing.pipelines", "linkEvidence", async (_ctx, runId) =>
      buildSorPipelineRun({ id: runId }),
    ),
    linkCertifications: tracked(
      "testing.pipelines",
      "linkCertifications",
      async (_ctx, runId) => buildSorPipelineRun({ id: runId }),
    ),
    linkReleases: tracked("testing.pipelines", "linkReleases", async (_ctx, runId) =>
      buildSorPipelineRun({ id: runId }),
    ),
    ...options.testing?.pipelines,
  } as TestingPipelinesService;

  const testingPipelineRepositories: TestingPipelineRepositoryService = {
    getRepository: tracked("testing.pipelineRepositories", "getRepository", async () =>
      buildPipelineRepository(),
    ),
    ...options.testing?.pipelineRepositories,
  };

  const testingPipelineWorkflows: TestingPipelineWorkflowService = {
    listWorkflows: tracked("testing.pipelineWorkflows", "listWorkflows", async () => [
      buildPipelineWorkflow(),
    ]),
    getWorkflow: tracked(
      "testing.pipelineWorkflows",
      "getWorkflow",
      async (_ctx, _o, _r, id) => buildPipelineWorkflow({ id: String(id) }),
    ),
    ...options.testing?.pipelineWorkflows,
  };

  const testingPipelineRuns: TestingPipelineRunLiveService = {
    listRuns: tracked("testing.pipelineRuns", "listRuns", async () => [
      buildPipelineRunView(),
    ]),
    getRun: tracked("testing.pipelineRuns", "getRun", async (_ctx, _o, _r, runId) =>
      buildPipelineRunView({ id: String(runId) }),
    ),
    ...options.testing?.pipelineRuns,
  };

  const testingPipelineJobs: TestingPipelineJobService = {
    listJobs: tracked("testing.pipelineJobs", "listJobs", async () => [
      buildPipelineJob(),
    ]),
    getJob: tracked("testing.pipelineJobs", "getJob", async () => buildPipelineJob()),
    ...options.testing?.pipelineJobs,
  };

  const testingPipelineSteps: TestingPipelineStepService = {
    listSteps: tracked("testing.pipelineSteps", "listSteps", async () => [
      buildPipelineStep(),
    ]),
    ...options.testing?.pipelineSteps,
  };

  const testingPipelineArtifacts: TestingPipelineArtifactService = {
    listArtifacts: tracked("testing.pipelineArtifacts", "listArtifacts", async () => [
      buildPipelineArtifact(),
    ]),
    ...options.testing?.pipelineArtifacts,
  };

  const testingPipelineSummaries: TestingPipelineSummaryService = {
    retrieveSummary: tracked("testing.pipelineSummaries", "retrieveSummary", async () =>
      buildPipelineSummary(),
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
    id: asEngineeringSnapshotId(API_TEST_EI_SNAPSHOT_ID),
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
    id: asBenchmarkId("bench_fixture"),
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
    id: asBaselineId("base_fixture"),
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
    id: asEngineeringHistoricalSnapshotId("hist_fixture"),
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
    score: tracked(
      "testing.engineeringIntelligence",
      "score",
      async () => mockQualityScore,
    ),
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
      async (_ctx, id) => ({
        ...mockSnapshot,
        id: asEngineeringSnapshotId(String(id)),
      }),
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
    listTrends: tracked("testing.engineeringIntelligence", "listTrends", async () => [
      mockTrend,
    ]),
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
        listReportPlaceholders: tracked(
          "testing.reporting",
          "listReportPlaceholders",
          async () => [],
        ),
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
      validateReport: tracked("platformReporting", "validateReport", async () => ({
        valid: true,
        errors: [],
        warnings: [],
      })),
      previewReport: tracked("platformReporting", "previewReport", async () =>
        buildMockReportGenerationResult(true),
      ),
      generateReport: tracked("platformReporting", "generateReport", async () =>
        buildMockReportGenerationResult(false),
      ),
      renderReport: tracked("platformReporting", "renderReport", async () => ({
        format: "html",
        contentType: "text/html",
        encoding: "utf-8",
        body: "<p>Rendered</p>",
        byteLength: 18,
        checksumSha256: "renderhash",
      })),
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
      create: tracked(
        "documentService",
        "create",
        async (_ctx, input: { title?: string }) => ({
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
        }),
      ),
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
      update: tracked(
        "documentMetadata",
        "update",
        async (_ctx, input: { documentId: string; title?: string }) => ({
          id: "meta_1",
          documentId: input.documentId,
          title: input.title ?? "Doc",
          tenantId: "tenant_a",
          custom: {},
          createdAt: "2026-07-13T16:00:00.000Z",
          updatedAt: "2026-07-13T16:00:00.000Z",
        }),
      ),
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
        {
          id: "tag_1",
          tenantId: "tenant_a",
          name: "alpha",
          createdAt: "2026-07-13T16:00:00.000Z",
        },
      ]),
      list: tracked("documentTag", "list", async () => []),
      get: tracked("documentTag", "get", async () => null),
      ...options.documentTags,
    },
    documentClassification: {
      classify: tracked(
        "documentClassification",
        "classify",
        async (_ctx, input: { classification: string }) => ({
          code: input.classification,
        }),
      ),
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
                highlights: [{ field: "title", snippets: ["<em>Fixture</em> Hit"] }],
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
          suggestions: [{ text: query?.keywords ?? "doc", kind: "query" as const }],
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
      getReadiness: tracked("searchExecutionHealth", "getReadiness", async () => ({
        executionEnabled: true,
        providerBound: true,
        providerId: "prov_1",
        providerKind: "meilisearch",
        healthy: true,
      })),
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
      enableProvider: tracked(
        "searchProviders",
        "enableProvider",
        async () => undefined,
      ),
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
      get: tracked("searchCollections", "get", async (_ctx, collectionId: string) => ({
        id: collectionId,
        name: "Documents",
        scope: "tenant",
        enabled: true,
      })),
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
      getCapabilities: tracked("searchCapabilities", "getCapabilities", async () => ({
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
      })),
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
      getDiagnostics: tracked("searchDiagnostics", "getDiagnostics", async () => ({
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
      })),
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
    workflow: {
      workflows: {
        find: tracked("workflow.workflows", "find", async () => [
          {
            id: "wf_1",
            key: "onboarding",
            name: "Onboarding",
            lifecycle: "draft",
            updatedAt: "2026-07-15T12:00:00.000Z",
          },
        ]),
        create: tracked(
          "workflow.workflows",
          "create",
          async (_ctx, input: { key: string; name: string }) => ({
            id: "wf_1",
            key: input.key,
            name: input.name,
            lifecycle: "draft",
            tenantId: "tenant_a",
            createdAt: "2026-07-15T12:00:00.000Z",
            updatedAt: "2026-07-15T12:00:00.000Z",
            createdBy: "user_1",
            updatedBy: "user_1",
          }),
        ),
        get: tracked("workflow.workflows", "get", async () => ({
          id: "wf_1",
          key: "onboarding",
          name: "Onboarding",
          lifecycle: "draft",
          tenantId: "tenant_a",
          createdAt: "2026-07-15T12:00:00.000Z",
          updatedAt: "2026-07-15T12:00:00.000Z",
          createdBy: "user_1",
          updatedBy: "user_1",
        })),
        update: tracked(
          "workflow.workflows",
          "update",
          async (_ctx, input: { workflowId: string; name?: string }) => ({
            id: input.workflowId,
            key: "onboarding",
            name: input.name ?? "Onboarding",
            lifecycle: "draft",
            tenantId: "tenant_a",
            createdAt: "2026-07-15T12:00:00.000Z",
            updatedAt: "2026-07-15T13:00:00.000Z",
            createdBy: "user_1",
            updatedBy: "user_1",
          }),
        ),
        delete: tracked("workflow.workflows", "delete", async () => undefined),
        publish: tracked("workflow.workflows", "publish", async () => ({
          id: "wf_1",
          key: "onboarding",
          name: "Onboarding",
          lifecycle: "active",
          tenantId: "tenant_a",
          createdAt: "2026-07-15T12:00:00.000Z",
          updatedAt: "2026-07-15T14:00:00.000Z",
          createdBy: "user_1",
          updatedBy: "user_1",
        })),
        archive: tracked("workflow.workflows", "archive", async () => ({
          id: "wf_1",
          key: "onboarding",
          name: "Onboarding",
          lifecycle: "archived",
          tenantId: "tenant_a",
          createdAt: "2026-07-15T12:00:00.000Z",
          updatedAt: "2026-07-15T15:00:00.000Z",
          createdBy: "user_1",
          updatedBy: "user_1",
          archivedAt: "2026-07-15T15:00:00.000Z",
        })),
        restore: tracked("workflow.workflows", "restore", async () => ({
          id: "wf_1",
          key: "onboarding",
          name: "Onboarding",
          lifecycle: "restored",
          tenantId: "tenant_a",
          createdAt: "2026-07-15T12:00:00.000Z",
          updatedAt: "2026-07-15T16:00:00.000Z",
          createdBy: "user_1",
          updatedBy: "user_1",
        })),
        transition: tracked(
          "workflow.workflows",
          "transition",
          async (_ctx, input: { workflowId: string; to: string }) => ({
            id: input.workflowId,
            key: "onboarding",
            name: "Onboarding",
            lifecycle: input.to,
            tenantId: "tenant_a",
            createdAt: "2026-07-15T12:00:00.000Z",
            updatedAt: "2026-07-15T17:00:00.000Z",
            createdBy: "user_1",
            updatedBy: "user_1",
          }),
        ),
        ...(options.workflow?.workflows ?? {}),
      },
      versions: {
        list: tracked("workflow.versions", "list", async () => [
          {
            id: "wfv_1",
            workflowId: "wf_1",
            versionNumber: 1,
            status: "draft",
            lifecycle: "draft",
            graph: { nodes: [], connections: [] },
            variables: [],
            parameters: [],
            triggers: [],
            actions: [],
            conditions: [],
            connections: [],
            createdAt: "2026-07-15T12:00:00.000Z",
            createdBy: "user_1",
            tenantId: "tenant_a",
          },
        ]),
        create: tracked(
          "workflow.versions",
          "create",
          async (_ctx, input: { workflowId: string }) => ({
            id: "wfv_1",
            workflowId: input.workflowId,
            versionNumber: 1,
            status: "draft",
            lifecycle: "draft",
            graph: { nodes: [], connections: [] },
            variables: [],
            parameters: [],
            triggers: [],
            actions: [],
            conditions: [],
            connections: [],
            createdAt: "2026-07-15T12:00:00.000Z",
            createdBy: "user_1",
            tenantId: "tenant_a",
          }),
        ),
        get: tracked("workflow.versions", "get", async () => ({
          id: "wfv_1",
          workflowId: "wf_1",
          versionNumber: 1,
          status: "draft",
          lifecycle: "draft",
          graph: { nodes: [], connections: [] },
          variables: [],
          parameters: [],
          triggers: [],
          actions: [],
          conditions: [],
          connections: [],
          createdAt: "2026-07-15T12:00:00.000Z",
          createdBy: "user_1",
          tenantId: "tenant_a",
        })),
        ...(options.workflow?.versions ?? {}),
      },
      templates: {
        list: tracked("workflow.templates", "list", async () => [
          {
            id: "wft_1",
            key: "tmpl",
            name: "Template",
            lifecycle: "draft",
            graph: { nodes: [], connections: [] },
            parameters: [],
            variables: [],
            tenantId: "tenant_a",
            createdAt: "2026-07-15T12:00:00.000Z",
            updatedAt: "2026-07-15T12:00:00.000Z",
            createdBy: "user_1",
            updatedBy: "user_1",
          },
        ]),
        create: tracked(
          "workflow.templates",
          "create",
          async (_ctx, input: { key: string; name: string }) => ({
            id: "wft_1",
            key: input.key,
            name: input.name,
            lifecycle: "draft",
            graph: { nodes: [], connections: [] },
            parameters: [],
            variables: [],
            tenantId: "tenant_a",
            createdAt: "2026-07-15T12:00:00.000Z",
            updatedAt: "2026-07-15T12:00:00.000Z",
            createdBy: "user_1",
            updatedBy: "user_1",
          }),
        ),
        get: tracked("workflow.templates", "get", async () => ({
          id: "wft_1",
          key: "tmpl",
          name: "Template",
          lifecycle: "draft",
          graph: { nodes: [], connections: [] },
          parameters: [],
          variables: [],
          tenantId: "tenant_a",
          createdAt: "2026-07-15T12:00:00.000Z",
          updatedAt: "2026-07-15T12:00:00.000Z",
          createdBy: "user_1",
          updatedBy: "user_1",
        })),
        update: tracked(
          "workflow.templates",
          "update",
          async (_ctx, input: { templateId: string; name?: string }) => ({
            id: input.templateId,
            key: "tmpl",
            name: input.name ?? "Template",
            lifecycle: "draft",
            graph: { nodes: [], connections: [] },
            parameters: [],
            variables: [],
            tenantId: "tenant_a",
            createdAt: "2026-07-15T12:00:00.000Z",
            updatedAt: "2026-07-15T13:00:00.000Z",
            createdBy: "user_1",
            updatedBy: "user_1",
          }),
        ),
        delete: tracked("workflow.templates", "delete", async () => undefined),
        ...(options.workflow?.templates ?? {}),
      },
      categories: {
        list: tracked("workflow.categories", "list", async () => [
          {
            id: "wfc_1",
            name: "General",
            tenantId: "tenant_a",
            createdAt: "2026-07-15T12:00:00.000Z",
            updatedAt: "2026-07-15T12:00:00.000Z",
          },
        ]),
        create: tracked(
          "workflow.categories",
          "create",
          async (_ctx, input: { name: string }) => ({
            id: "wfc_1",
            name: input.name,
            tenantId: "tenant_a",
            createdAt: "2026-07-15T12:00:00.000Z",
            updatedAt: "2026-07-15T12:00:00.000Z",
          }),
        ),
        get: tracked("workflow.categories", "get", async () => ({
          id: "wfc_1",
          name: "General",
          tenantId: "tenant_a",
          createdAt: "2026-07-15T12:00:00.000Z",
          updatedAt: "2026-07-15T12:00:00.000Z",
        })),
        ...(options.workflow?.categories ?? {}),
      },
      folders: {
        list: tracked("workflow.folders", "list", async () => [
          {
            id: "wff_1",
            name: "Root",
            path: "/",
            tenantId: "tenant_a",
            createdAt: "2026-07-15T12:00:00.000Z",
            updatedAt: "2026-07-15T12:00:00.000Z",
          },
        ]),
        create: tracked(
          "workflow.folders",
          "create",
          async (_ctx, input: { name: string; path: string }) => ({
            id: "wff_1",
            name: input.name,
            path: input.path,
            tenantId: "tenant_a",
            createdAt: "2026-07-15T12:00:00.000Z",
            updatedAt: "2026-07-15T12:00:00.000Z",
          }),
        ),
        get: tracked("workflow.folders", "get", async () => ({
          id: "wff_1",
          name: "Root",
          path: "/",
          tenantId: "tenant_a",
          createdAt: "2026-07-15T12:00:00.000Z",
          updatedAt: "2026-07-15T12:00:00.000Z",
        })),
        ...(options.workflow?.folders ?? {}),
      },
      validation: {
        validate: tracked("workflow.validation", "validate", async () => ({
          valid: true,
          issues: [],
        })),
        ...(options.workflow?.validation ?? {}),
      },
      audit: {
        list: tracked("workflow.audit", "list", async () => [
          {
            id: "wfa_1",
            workflowId: "wf_1",
            action: "workflow.created",
            actorUserId: "user_1",
            tenantId: "tenant_a",
            createdAt: "2026-07-15T12:00:00.000Z",
          },
        ]),
        ...(options.workflow?.audit ?? {}),
      },
    },
    notification: {
      notifications: {
        list: tracked("notification.notifications", "list", async () => [
          {
            id: "ntf_1",
            tenantId: "tenant_a",
            title: "Welcome",
            status: "pending",
            priority: "normal",
            channelKinds: ["in_app"],
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T12:00:00.000Z",
            createdBy: "user_1",
            updatedBy: "user_1",
            revision: 1,
          },
        ]),
        get: tracked("notification.notifications", "get", async () => ({
          id: "ntf_1",
          tenantId: "tenant_a",
          title: "Welcome",
          status: "pending",
          priority: "normal",
          channelKinds: ["in_app"],
          createdAt: "2026-07-16T12:00:00.000Z",
          updatedAt: "2026-07-16T12:00:00.000Z",
          createdBy: "user_1",
          updatedBy: "user_1",
          revision: 1,
        })),
        create: tracked(
          "notification.notifications",
          "create",
          async (_ctx, input: { title: string }) => ({
            id: "ntf_1",
            tenantId: "tenant_a",
            title: input.title,
            status: "draft",
            priority: "normal",
            channelKinds: ["in_app"],
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T12:00:00.000Z",
            createdBy: "user_1",
            updatedBy: "user_1",
            revision: 1,
          }),
        ),
        updateMetadata: tracked(
          "notification.notifications",
          "updateMetadata",
          async (_ctx, input: { notificationId: string; title?: string }) => ({
            id: input.notificationId,
            tenantId: "tenant_a",
            title: input.title ?? "Welcome",
            status: "pending",
            priority: "normal",
            channelKinds: ["in_app"],
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T13:00:00.000Z",
            createdBy: "user_1",
            updatedBy: "user_1",
            revision: 2,
          }),
        ),
        archive: tracked(
          "notification.notifications",
          "archive",
          async (_ctx, notificationId: string) => ({
            id: notificationId,
            tenantId: "tenant_a",
            title: "Welcome",
            status: "archived",
            priority: "normal",
            channelKinds: ["in_app"],
            archivedAt: "2026-07-16T14:00:00.000Z",
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T14:00:00.000Z",
            createdBy: "user_1",
            updatedBy: "user_1",
            revision: 2,
          }),
        ),
        restore: tracked(
          "notification.notifications",
          "restore",
          async (_ctx, notificationId: string) => ({
            id: notificationId,
            tenantId: "tenant_a",
            title: "Welcome",
            status: "draft",
            priority: "normal",
            channelKinds: ["in_app"],
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T15:00:00.000Z",
            createdBy: "user_1",
            updatedBy: "user_1",
            revision: 3,
          }),
        ),
        transition: tracked(
          "notification.notifications",
          "transition",
          async (_ctx, input: { notificationId: string; to: string }) => ({
            id: input.notificationId,
            tenantId: "tenant_a",
            title: "Welcome",
            status: input.to,
            priority: "normal",
            channelKinds: ["in_app"],
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T16:00:00.000Z",
            createdBy: "user_1",
            updatedBy: "user_1",
            revision: 2,
          }),
        ),
        validate: tracked("notification.notifications", "validate", async () => ({
          valid: true,
          issues: [],
        })),
        ...(options.notification?.notifications ?? {}),
      },
      templates: {
        list: tracked("notification.templates", "list", async () => [
          {
            id: "ntt_1",
            tenantId: "tenant_a",
            key: "welcome",
            name: "Welcome",
            defaultPriority: "normal",
            defaultChannelKinds: ["in_app"],
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T12:00:00.000Z",
            createdBy: "user_1",
            updatedBy: "user_1",
            revision: 1,
          },
        ]),
        get: tracked("notification.templates", "get", async () => ({
          id: "ntt_1",
          tenantId: "tenant_a",
          key: "welcome",
          name: "Welcome",
          defaultPriority: "normal",
          defaultChannelKinds: ["in_app"],
          createdAt: "2026-07-16T12:00:00.000Z",
          updatedAt: "2026-07-16T12:00:00.000Z",
          createdBy: "user_1",
          updatedBy: "user_1",
          revision: 1,
        })),
        create: tracked(
          "notification.templates",
          "create",
          async (_ctx, input: { key: string; name: string }) => ({
            id: "ntt_1",
            tenantId: "tenant_a",
            key: input.key,
            name: input.name,
            defaultPriority: "normal",
            defaultChannelKinds: ["in_app"],
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T12:00:00.000Z",
            createdBy: "user_1",
            updatedBy: "user_1",
            revision: 1,
          }),
        ),
        update: tracked(
          "notification.templates",
          "update",
          async (_ctx, input: { templateId: string; name?: string }) => ({
            id: input.templateId,
            tenantId: "tenant_a",
            key: "welcome",
            name: input.name ?? "Welcome",
            defaultPriority: "normal",
            defaultChannelKinds: ["in_app"],
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T13:00:00.000Z",
            createdBy: "user_1",
            updatedBy: "user_1",
            revision: 2,
          }),
        ),
        archive: tracked(
          "notification.templates",
          "archive",
          async (_ctx, templateId: string) => ({
            id: templateId,
            tenantId: "tenant_a",
            key: "welcome",
            name: "Welcome",
            defaultPriority: "normal",
            defaultChannelKinds: ["in_app"],
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T14:00:00.000Z",
            createdBy: "user_1",
            updatedBy: "user_1",
            revision: 2,
          }),
        ),
        ...(options.notification?.templates ?? {}),
      },
      preferences: {
        list: tracked("notification.preferences", "list", async () => [
          {
            id: "ntp_1",
            tenantId: "tenant_a",
            userId: "user_1",
            channelKind: "in_app",
            enabled: true,
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T12:00:00.000Z",
          },
        ]),
        get: tracked("notification.preferences", "get", async () => ({
          id: "ntp_1",
          tenantId: "tenant_a",
          userId: "user_1",
          channelKind: "in_app",
          enabled: true,
          createdAt: "2026-07-16T12:00:00.000Z",
          updatedAt: "2026-07-16T12:00:00.000Z",
        })),
        update: tracked(
          "notification.preferences",
          "update",
          async (_ctx, input: { preferenceId: string; enabled?: boolean }) => ({
            id: input.preferenceId,
            tenantId: "tenant_a",
            userId: "user_1",
            channelKind: "in_app",
            enabled: input.enabled ?? true,
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T13:00:00.000Z",
          }),
        ),
        ...(options.notification?.preferences ?? {}),
      },
      categories: {
        list: tracked("notification.categories", "list", async () => [
          {
            id: "ntc_1",
            tenantId: "tenant_a",
            key: "system",
            name: "System",
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T12:00:00.000Z",
          },
        ]),
        get: tracked("notification.categories", "get", async () => ({
          id: "ntc_1",
          tenantId: "tenant_a",
          key: "system",
          name: "System",
          createdAt: "2026-07-16T12:00:00.000Z",
          updatedAt: "2026-07-16T12:00:00.000Z",
        })),
        ...(options.notification?.categories ?? {}),
      },
      channels: {
        list: tracked("notification.channels", "list", async () => [
          {
            id: "ntch_1",
            tenantId: "tenant_a",
            kind: "in_app",
            name: "In-app",
            enabled: true,
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T12:00:00.000Z",
          },
        ]),
        get: tracked("notification.channels", "get", async () => ({
          id: "ntch_1",
          tenantId: "tenant_a",
          kind: "in_app",
          name: "In-app",
          enabled: true,
          createdAt: "2026-07-16T12:00:00.000Z",
          updatedAt: "2026-07-16T12:00:00.000Z",
        })),
        ...(options.notification?.channels ?? {}),
      },
      recipients: {
        list: tracked("notification.recipients", "list", async () => [
          {
            id: "ntr_1",
            notificationId: "ntf_1",
            tenantId: "tenant_a",
            userId: "user_1",
            channelKind: "in_app",
            status: "pending",
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T12:00:00.000Z",
          },
        ]),
        get: tracked("notification.recipients", "get", async () => ({
          id: "ntr_1",
          notificationId: "ntf_1",
          tenantId: "tenant_a",
          userId: "user_1",
          channelKind: "in_app",
          status: "pending",
          createdAt: "2026-07-16T12:00:00.000Z",
          updatedAt: "2026-07-16T12:00:00.000Z",
        })),
        ...(options.notification?.recipients ?? {}),
      },
      references: {
        list: tracked("notification.references", "list", async () => [
          {
            id: "ntref_1",
            notificationId: "ntf_1",
            kind: "projects",
            resourceId: "proj_1",
            label: "Portal",
          },
        ]),
        get: tracked("notification.references", "get", async () => ({
          id: "ntref_1",
          notificationId: "ntf_1",
          kind: "projects",
          resourceId: "proj_1",
          label: "Portal",
        })),
        ...(options.notification?.references ?? {}),
      },
      audit: {
        list: tracked("notification.audit", "list", async () => [
          {
            id: "nta_1",
            tenantId: "tenant_a",
            notificationId: "ntf_1",
            action: "notification.created",
            actorUserId: "user_1",
            createdAt: "2026-07-16T12:00:00.000Z",
          },
        ]),
        get: tracked("notification.audit", "get", async () => ({
          id: "nta_1",
          tenantId: "tenant_a",
          notificationId: "ntf_1",
          action: "notification.created",
          actorUserId: "user_1",
          createdAt: "2026-07-16T12:00:00.000Z",
        })),
        ...(options.notification?.audit ?? {}),
      },
      diagnostics: {
        health: tracked("notification.diagnostics", "health", async () => ({
          status: "healthy",
          persistenceMode: "memory",
          deliveryEnabled: false,
          checkedAt: "2026-07-16T12:00:00.000Z",
        })),
        readiness: tracked("notification.diagnostics", "readiness", async () => ({
          ready: true,
          notificationEnabled: true,
          persistenceMode: "memory",
          deliveryEnabled: false,
          capabilities: ["metadata", "lifecycle", "templates", "preferences"],
        })),
        capabilities: tracked("notification.diagnostics", "capabilities", async () => ({
          delivery: false,
          channelsModelled: ["in_app", "email", "sms", "push"],
          lifecycle: [
            "draft",
            "pending",
            "queued",
            "delivered",
            "read",
            "acknowledged",
            "dismissed",
            "expired",
            "archived",
          ],
          facets: [
            "notifications",
            "templates",
            "preferences",
            "categories",
            "channels",
            "recipients",
            "references",
            "audit",
            "diagnostics",
          ],
        })),
        ...(options.notification?.diagnostics ?? {}),
      },
    },
    configuration: {
      configurations: {
        list: tracked("configuration.configurations", "list", async () => [
          {
            id: "cfg_1",
            tenantId: API_TEST_TENANT_A,
            namespaceId: "ns_1",
            keyId: "key_1",
            hierarchyLevel: "tenant",
            scope: { kind: "tenant", tenantId: API_TEST_TENANT_A },
            status: "draft",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("configuration.configurations", "get", async () => ({
          id: "cfg_1",
          tenantId: API_TEST_TENANT_A,
          namespaceId: "ns_1",
          keyId: "key_1",
          hierarchyLevel: "tenant",
          scope: { kind: "tenant", tenantId: API_TEST_TENANT_A },
          status: "draft",
          createdAt: "2026-07-16T00:00:00.000Z",
          updatedAt: "2026-07-16T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "configuration.configurations",
          "create",
          async (_ctx, input: { displayName: string; key: string }) => ({
            id: "cfg_new",
            tenantId: API_TEST_TENANT_A,
            namespaceId: "ns_1",
            keyId: "key_new",
            hierarchyLevel: "tenant",
            scope: { kind: "tenant", tenantId: API_TEST_TENANT_A },
            status: "draft",
            displayName: input.displayName,
            key: input.key,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        updateMetadata: tracked(
          "configuration.configurations",
          "updateMetadata",
          async (
            _ctx,
            input: { configurationId: string; hierarchyLevel?: string },
          ) => ({
            id: input.configurationId,
            tenantId: API_TEST_TENANT_A,
            namespaceId: "ns_1",
            keyId: "key_1",
            hierarchyLevel: input.hierarchyLevel ?? "tenant",
            scope: { kind: "tenant", tenantId: API_TEST_TENANT_A },
            status: "draft",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        archive: tracked(
          "configuration.configurations",
          "archive",
          async (_ctx, configurationId: string) => ({
            id: configurationId,
            tenantId: API_TEST_TENANT_A,
            namespaceId: "ns_1",
            keyId: "key_1",
            hierarchyLevel: "tenant",
            scope: { kind: "tenant", tenantId: API_TEST_TENANT_A },
            status: "archived",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 3,
          }),
        ),
        restore: tracked(
          "configuration.configurations",
          "restore",
          async (_ctx, configurationId: string) => ({
            id: configurationId,
            tenantId: API_TEST_TENANT_A,
            namespaceId: "ns_1",
            keyId: "key_1",
            hierarchyLevel: "tenant",
            scope: { kind: "tenant", tenantId: API_TEST_TENANT_A },
            status: "draft",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 4,
          }),
        ),
        transition: tracked(
          "configuration.configurations",
          "transition",
          async (_ctx, input: { configurationId: string; to: string }) => ({
            id: input.configurationId,
            tenantId: API_TEST_TENANT_A,
            namespaceId: "ns_1",
            keyId: "key_1",
            hierarchyLevel: "tenant",
            scope: { kind: "tenant", tenantId: API_TEST_TENANT_A },
            status: input.to,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 5,
          }),
        ),
        ...(options.configuration?.configurations ?? {}),
      },
      namespaces: {
        list: tracked("configuration.namespaces", "list", async () => [
          {
            id: "ns_1",
            tenantId: API_TEST_TENANT_A,
            key: "platform",
            name: "Platform",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          },
        ]),
        get: tracked("configuration.namespaces", "get", async () => ({
          id: "ns_1",
          tenantId: API_TEST_TENANT_A,
          key: "platform",
          name: "Platform",
          createdAt: "2026-07-16T00:00:00.000Z",
          updatedAt: "2026-07-16T00:00:00.000Z",
        })),
        create: tracked(
          "configuration.namespaces",
          "create",
          async (_ctx, input: { key: string; name: string }) => ({
            id: "ns_new",
            tenantId: API_TEST_TENANT_A,
            key: input.key,
            name: input.name,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        update: tracked(
          "configuration.namespaces",
          "update",
          async (_ctx, input: { namespaceId: string; name?: string }) => ({
            id: input.namespaceId,
            tenantId: API_TEST_TENANT_A,
            key: "platform",
            name: input.name ?? "Platform",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        ...(options.configuration?.namespaces ?? {}),
      },
      groups: {
        list: tracked("configuration.groups", "list", async () => [
          {
            id: "grp_1",
            tenantId: API_TEST_TENANT_A,
            namespaceId: "ns_1",
            key: "ui",
            name: "UI",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          },
        ]),
        get: tracked("configuration.groups", "get", async () => ({
          id: "grp_1",
          tenantId: API_TEST_TENANT_A,
          namespaceId: "ns_1",
          key: "ui",
          name: "UI",
          createdAt: "2026-07-16T00:00:00.000Z",
          updatedAt: "2026-07-16T00:00:00.000Z",
        })),
        create: tracked(
          "configuration.groups",
          "create",
          async (_ctx, input: { key: string; name: string; namespaceId: string }) => ({
            id: "grp_new",
            tenantId: API_TEST_TENANT_A,
            namespaceId: input.namespaceId,
            key: input.key,
            name: input.name,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        update: tracked(
          "configuration.groups",
          "update",
          async (_ctx, input: { groupId: string; name?: string }) => ({
            id: input.groupId,
            tenantId: API_TEST_TENANT_A,
            namespaceId: "ns_1",
            key: "ui",
            name: input.name ?? "UI",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        ...(options.configuration?.groups ?? {}),
      },
      versions: {
        list: tracked("configuration.versions", "list", async () => [
          {
            id: "ver_1",
            configurationId: "cfg_1",
            versionNumber: 1,
            immutable: true,
            isCurrent: false,
            createdAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
          },
        ]),
        get: tracked("configuration.versions", "get", async () => ({
          id: "ver_1",
          configurationId: "cfg_1",
          versionNumber: 1,
          immutable: true,
          isCurrent: false,
          createdAt: "2026-07-16T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
        })),
        create: tracked(
          "configuration.versions",
          "create",
          async (_ctx, input: { configurationId: string; label?: string }) => ({
            id: "ver_new",
            configurationId: input.configurationId,
            versionNumber: 2,
            immutable: true,
            isCurrent: false,
            label: input.label,
            createdAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
          }),
        ),
        publish: tracked("configuration.versions", "publish", async () => ({
          id: "ver_1",
          configurationId: "cfg_1",
          versionNumber: 1,
          immutable: true,
          isCurrent: true,
          createdAt: "2026-07-16T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
        })),
        deprecate: tracked("configuration.versions", "deprecate", async () => ({
          id: "ver_1",
          configurationId: "cfg_1",
          versionNumber: 1,
          immutable: true,
          isCurrent: false,
          createdAt: "2026-07-16T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
        })),
        ...(options.configuration?.versions ?? {}),
      },
      overrides: {
        list: tracked("configuration.overrides", "list", async () => [
          {
            id: "ovr_1",
            configurationId: "cfg_1",
            hierarchyLevel: "user",
            scope: { kind: "user", userId: API_TEST_USER_ID },
            valueId: "val_1",
            precedenceRank: 0,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          },
        ]),
        get: tracked("configuration.overrides", "get", async () => ({
          id: "ovr_1",
          configurationId: "cfg_1",
          hierarchyLevel: "user",
          scope: { kind: "user", userId: API_TEST_USER_ID },
          valueId: "val_1",
          precedenceRank: 0,
          createdAt: "2026-07-16T00:00:00.000Z",
          updatedAt: "2026-07-16T00:00:00.000Z",
        })),
        create: tracked(
          "configuration.overrides",
          "create",
          async (_ctx, input: { configurationId: string }) => ({
            id: "ovr_new",
            configurationId: input.configurationId,
            hierarchyLevel: "user",
            scope: { kind: "user", userId: API_TEST_USER_ID },
            valueId: "val_new",
            precedenceRank: 0,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        update: tracked(
          "configuration.overrides",
          "update",
          async (_ctx, input: { overrideId: string }) => ({
            id: input.overrideId,
            configurationId: "cfg_1",
            hierarchyLevel: "user",
            scope: { kind: "user", userId: API_TEST_USER_ID },
            valueId: "val_1",
            precedenceRank: 0,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        ...(options.configuration?.overrides ?? {}),
      },
      scopes: {
        list: tracked("configuration.scopes", "list", async () => [
          {
            configurationId: "cfg_1",
            scope: { kind: "tenant", tenantId: API_TEST_TENANT_A },
            scopeKind: "tenant",
          },
        ]),
        get: tracked("configuration.scopes", "get", async () => ({
          configurationId: "cfg_1",
          scope: { kind: "tenant", tenantId: API_TEST_TENANT_A },
          scopeKind: "tenant",
        })),
        ...(options.configuration?.scopes ?? {}),
      },
      validation: {
        validateMetadata: tracked(
          "configuration.validation",
          "validateMetadata",
          async () => ({ valid: true, errors: [] }),
        ),
        listRules: tracked("configuration.validation", "listRules", async () => [
          { kind: "string", description: "Validation rule metadata for string" },
        ]),
        ...(options.configuration?.validation ?? {}),
      },
      references: {
        list: tracked("configuration.references", "list", async () => [
          {
            id: "ref_1",
            configurationId: "cfg_1",
            kind: "projects",
            resourceId: "proj_1",
          },
        ]),
        get: tracked("configuration.references", "get", async () => ({
          id: "ref_1",
          configurationId: "cfg_1",
          kind: "projects",
          resourceId: "proj_1",
        })),
        ...(options.configuration?.references ?? {}),
      },
      audit: {
        list: tracked("configuration.audit", "list", async () => [
          {
            id: "aud_1",
            tenantId: API_TEST_TENANT_A,
            configurationId: "cfg_1",
            action: "created",
            actorUserId: API_TEST_USER_ID,
            createdAt: "2026-07-16T00:00:00.000Z",
          },
        ]),
        get: tracked("configuration.audit", "get", async () => ({
          id: "aud_1",
          tenantId: API_TEST_TENANT_A,
          configurationId: "cfg_1",
          action: "created",
          actorUserId: API_TEST_USER_ID,
          createdAt: "2026-07-16T00:00:00.000Z",
        })),
        ...(options.configuration?.audit ?? {}),
      },
      diagnostics: {
        health: tracked("configuration.diagnostics", "health", async () => ({
          status: "healthy",
          persistenceMode: "memory",
          runtimeApplyEnabled: false,
          checkedAt: "2026-07-16T00:00:00.000Z",
        })),
        readiness: tracked("configuration.diagnostics", "readiness", async () => ({
          ready: true,
          configurationEnabled: true,
          persistenceMode: "memory",
          runtimeApplyEnabled: false,
          capabilities: ["configurations"],
        })),
        capabilities: tracked(
          "configuration.diagnostics",
          "capabilities",
          async () => ({
            runtimeApply: false,
            lifecycle: [
              "draft",
              "validated",
              "approved",
              "published",
              "deprecated",
              "archived",
            ],
            facets: ["configurations", "namespaces", "groups", "versions"],
          }),
        ),
        ...(options.configuration?.diagnostics ?? {}),
      },
    },
    administration: {
      modules: {
        list: tracked("administration.modules", "list", async () => [
          {
            id: "mod_1",
            tenantId: API_TEST_TENANT_A,
            key: "projects",
            name: "Projects",
            status: "draft",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked(
          "administration.modules",
          "get",
          async (_ctx, moduleId: string) => ({
            id: moduleId,
            tenantId: API_TEST_TENANT_A,
            key: "projects",
            name: "Projects",
            status: "draft",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        create: tracked(
          "administration.modules",
          "create",
          async (_ctx, input: { key: string; name: string }) => ({
            id: "mod_new",
            tenantId: API_TEST_TENANT_A,
            key: input.key,
            name: input.name,
            status: "draft",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        updateMetadata: tracked(
          "administration.modules",
          "updateMetadata",
          async (_ctx, input: { moduleId: string; name?: string }) => ({
            id: input.moduleId,
            tenantId: API_TEST_TENANT_A,
            key: "projects",
            name: input.name ?? "Projects",
            status: "draft",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        archive: tracked(
          "administration.modules",
          "archive",
          async (_ctx, moduleId: string) => ({
            id: moduleId,
            tenantId: API_TEST_TENANT_A,
            key: "projects",
            name: "Projects",
            status: "archived",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        restore: tracked(
          "administration.modules",
          "restore",
          async (_ctx, moduleId: string) => ({
            id: moduleId,
            tenantId: API_TEST_TENANT_A,
            key: "projects",
            name: "Projects",
            status: "draft",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 3,
          }),
        ),
        transition: tracked(
          "administration.modules",
          "transition",
          async (_ctx, input: { moduleId: string; to: string }) => ({
            id: input.moduleId,
            tenantId: API_TEST_TENANT_A,
            key: "projects",
            name: "Projects",
            status: input.to,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.administration?.modules ?? {}),
      },
      categories: {
        list: tracked("administration.categories", "list", async () => [
          {
            id: "cat_1",
            tenantId: API_TEST_TENANT_A,
            key: "general",
            name: "General",
            ordering: 0,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          },
        ]),
        get: tracked("administration.categories", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "general",
          name: "General",
          ordering: 0,
          createdAt: "2026-07-16T00:00:00.000Z",
          updatedAt: "2026-07-16T00:00:00.000Z",
        })),
        create: tracked(
          "administration.categories",
          "create",
          async (_ctx, input: { key: string; name: string }) => ({
            id: "cat_new",
            tenantId: API_TEST_TENANT_A,
            key: input.key,
            name: input.name,
            ordering: 0,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        update: tracked(
          "administration.categories",
          "update",
          async (_ctx, input: { categoryId: string; name?: string }) => ({
            id: input.categoryId,
            tenantId: API_TEST_TENANT_A,
            key: "general",
            name: input.name ?? "General",
            ordering: 0,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        ...(options.administration?.categories ?? {}),
      },
      sections: {
        list: tracked("administration.sections", "list", async () => []),
        get: tracked("administration.sections", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          categoryId: "cat_1",
          key: "overview",
          name: "Overview",
          ordering: 0,
          createdAt: "2026-07-16T00:00:00.000Z",
          updatedAt: "2026-07-16T00:00:00.000Z",
        })),
        create: tracked(
          "administration.sections",
          "create",
          async (_ctx, input: { categoryId: string; key: string; name: string }) => ({
            id: "sec_new",
            tenantId: API_TEST_TENANT_A,
            categoryId: input.categoryId,
            key: input.key,
            name: input.name,
            ordering: 0,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        update: tracked(
          "administration.sections",
          "update",
          async (_ctx, input: { sectionId: string; name?: string }) => ({
            id: input.sectionId,
            tenantId: API_TEST_TENANT_A,
            categoryId: "cat_1",
            key: "overview",
            name: input.name ?? "Overview",
            ordering: 0,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        ...(options.administration?.sections ?? {}),
      },
      actions: {
        list: tracked("administration.actions", "list", async () => []),
        get: tracked("administration.actions", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "view",
          name: "View",
          kind: "view",
          createdAt: "2026-07-16T00:00:00.000Z",
          updatedAt: "2026-07-16T00:00:00.000Z",
        })),
        create: tracked(
          "administration.actions",
          "create",
          async (_ctx, input: { key: string; name: string; kind: string }) => ({
            id: "act_new",
            tenantId: API_TEST_TENANT_A,
            key: input.key,
            name: input.name,
            kind: input.kind,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        update: tracked(
          "administration.actions",
          "update",
          async (_ctx, input: { actionId: string; name?: string }) => ({
            id: input.actionId,
            tenantId: API_TEST_TENANT_A,
            key: "view",
            name: input.name ?? "View",
            kind: "view",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        ...(options.administration?.actions ?? {}),
      },
      permissions: {
        list: tracked("administration.permissions", "list", async () => []),
        get: tracked("administration.permissions", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "admin.read",
          name: "Admin Read",
          createdAt: "2026-07-16T00:00:00.000Z",
          updatedAt: "2026-07-16T00:00:00.000Z",
        })),
        create: tracked(
          "administration.permissions",
          "create",
          async (_ctx, input: { key: string; name: string }) => ({
            id: "perm_new",
            tenantId: API_TEST_TENANT_A,
            key: input.key,
            name: input.name,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        update: tracked(
          "administration.permissions",
          "update",
          async (_ctx, input: { permissionId: string; name?: string }) => ({
            id: input.permissionId,
            tenantId: API_TEST_TENANT_A,
            key: "admin.read",
            name: input.name ?? "Admin Read",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        ...(options.administration?.permissions ?? {}),
      },
      registrations: {
        list: tracked("administration.registrations", "list", async () => []),
        get: tracked(
          "administration.registrations",
          "get",
          async (_ctx, id: string) => ({
            id,
            tenantId: API_TEST_TENANT_A,
            moduleKey: "projects",
            version: "1.0.0",
            status: "draft",
            registeredAt: "2026-07-16T00:00:00.000Z",
            registeredBy: API_TEST_USER_ID,
          }),
        ),
        create: tracked(
          "administration.registrations",
          "create",
          async (_ctx, input: { moduleKey: string; version: string }) => ({
            id: "reg_new",
            tenantId: API_TEST_TENANT_A,
            moduleKey: input.moduleKey,
            version: input.version,
            status: "draft",
            registeredAt: "2026-07-16T00:00:00.000Z",
            registeredBy: API_TEST_USER_ID,
          }),
        ),
        update: tracked(
          "administration.registrations",
          "update",
          async (_ctx, input: { registrationId: string; version?: string }) => ({
            id: input.registrationId,
            tenantId: API_TEST_TENANT_A,
            moduleKey: "projects",
            version: input.version ?? "1.0.0",
            status: "draft",
            registeredAt: "2026-07-16T00:00:00.000Z",
            registeredBy: API_TEST_USER_ID,
          }),
        ),
        ...(options.administration?.registrations ?? {}),
      },
      policies: {
        list: tracked("administration.policies", "list", async () => []),
        get: tracked("administration.policies", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          kind: "access",
          key: "default",
          name: "Default",
          createdAt: "2026-07-16T00:00:00.000Z",
          updatedAt: "2026-07-16T00:00:00.000Z",
        })),
        create: tracked(
          "administration.policies",
          "create",
          async (_ctx, input: { kind: string; key: string; name: string }) => ({
            id: "pol_new",
            tenantId: API_TEST_TENANT_A,
            kind: input.kind,
            key: input.key,
            name: input.name,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        update: tracked(
          "administration.policies",
          "update",
          async (_ctx, input: { policyId: string; name?: string }) => ({
            id: input.policyId,
            tenantId: API_TEST_TENANT_A,
            kind: "access",
            key: "default",
            name: input.name ?? "Default",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        ...(options.administration?.policies ?? {}),
      },
      capabilities: {
        list: tracked("administration.capabilities", "list", async () => []),
        get: tracked(
          "administration.capabilities",
          "get",
          async (_ctx, id: string) => ({
            id,
            tenantId: API_TEST_TENANT_A,
            moduleId: "mod_1",
            key: "manage",
            name: "Manage",
            enabled: true,
            available: true,
            healthy: true,
            certified: false,
            productionReady: false,
            owner: "platform",
            version: "1.0.0",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        create: tracked(
          "administration.capabilities",
          "create",
          async (
            _ctx,
            input: {
              moduleId: string;
              key: string;
              name: string;
              owner: string;
              version: string;
            },
          ) => ({
            id: "cap_new",
            tenantId: API_TEST_TENANT_A,
            moduleId: input.moduleId,
            key: input.key,
            name: input.name,
            enabled: true,
            available: true,
            healthy: true,
            certified: false,
            productionReady: false,
            owner: input.owner,
            version: input.version,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        update: tracked(
          "administration.capabilities",
          "update",
          async (_ctx, input: { capabilityId: string; name?: string }) => ({
            id: input.capabilityId,
            tenantId: API_TEST_TENANT_A,
            moduleId: "mod_1",
            key: "manage",
            name: input.name ?? "Manage",
            enabled: true,
            available: true,
            healthy: true,
            certified: false,
            productionReady: false,
            owner: "platform",
            version: "1.0.0",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        ...(options.administration?.capabilities ?? {}),
      },
      navigations: {
        list: tracked("administration.navigations", "list", async () => []),
        get: tracked("administration.navigations", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          moduleId: "mod_1",
          key: "home",
          label: "Home",
          ordering: 0,
          visibility: "visible",
          createdAt: "2026-07-16T00:00:00.000Z",
          updatedAt: "2026-07-16T00:00:00.000Z",
        })),
        create: tracked(
          "administration.navigations",
          "create",
          async (
            _ctx,
            input: {
              moduleId: string;
              key: string;
              label: string;
              ordering: number;
              visibility: string;
            },
          ) => ({
            id: "nav_new",
            tenantId: API_TEST_TENANT_A,
            moduleId: input.moduleId,
            key: input.key,
            label: input.label,
            ordering: input.ordering,
            visibility: input.visibility,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        update: tracked(
          "administration.navigations",
          "update",
          async (_ctx, input: { navigationId: string; label?: string }) => ({
            id: input.navigationId,
            tenantId: API_TEST_TENANT_A,
            moduleId: "mod_1",
            key: "home",
            label: input.label ?? "Home",
            ordering: 0,
            visibility: "visible",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        ...(options.administration?.navigations ?? {}),
      },
      shortcuts: {
        list: tracked("administration.shortcuts", "list", async () => []),
        get: tracked("administration.shortcuts", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "open",
          label: "Open",
          ordering: 0,
          createdAt: "2026-07-16T00:00:00.000Z",
          updatedAt: "2026-07-16T00:00:00.000Z",
        })),
        create: tracked(
          "administration.shortcuts",
          "create",
          async (_ctx, input: { key: string; label: string; ordering: number }) => ({
            id: "sc_new",
            tenantId: API_TEST_TENANT_A,
            key: input.key,
            label: input.label,
            ordering: input.ordering,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        update: tracked(
          "administration.shortcuts",
          "update",
          async (_ctx, input: { shortcutId: string; label?: string }) => ({
            id: input.shortcutId,
            tenantId: API_TEST_TENANT_A,
            key: "open",
            label: input.label ?? "Open",
            ordering: 0,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        ...(options.administration?.shortcuts ?? {}),
      },
      dashboards: {
        list: tracked("administration.dashboards", "list", async () => [
          {
            id: "dash_1",
            tenantId: API_TEST_TENANT_A,
            key: "main",
            name: "Main",
            ordering: 0,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          },
        ]),
        get: tracked("administration.dashboards", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "main",
          name: "Main",
          ordering: 0,
          createdAt: "2026-07-16T00:00:00.000Z",
          updatedAt: "2026-07-16T00:00:00.000Z",
        })),
        create: tracked(
          "administration.dashboards",
          "create",
          async (_ctx, input: { key: string; name: string }) => ({
            id: "dash_new",
            tenantId: API_TEST_TENANT_A,
            key: input.key,
            name: input.name,
            ordering: 0,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        update: tracked(
          "administration.dashboards",
          "update",
          async (_ctx, input: { dashboardId: string; name?: string }) => ({
            id: input.dashboardId,
            tenantId: API_TEST_TENANT_A,
            key: "main",
            name: input.name ?? "Main",
            ordering: 0,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        ...(options.administration?.dashboards ?? {}),
      },
      widgets: {
        list: tracked("administration.widgets", "list", async () => [
          {
            id: "wid_1",
            dashboardId: "dash_1",
            key: "summary",
            name: "Summary",
            kind: "summary",
            ordering: 0,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          },
        ]),
        get: tracked("administration.widgets", "get", async (_ctx, id: string) => ({
          id,
          dashboardId: "dash_1",
          key: "summary",
          name: "Summary",
          kind: "summary",
          ordering: 0,
          createdAt: "2026-07-16T00:00:00.000Z",
          updatedAt: "2026-07-16T00:00:00.000Z",
        })),
        create: tracked(
          "administration.widgets",
          "create",
          async (
            _ctx,
            input: { dashboardId: string; key: string; name: string; kind: string },
          ) => ({
            id: "wid_new",
            dashboardId: input.dashboardId,
            key: input.key,
            name: input.name,
            kind: input.kind,
            ordering: 0,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        update: tracked(
          "administration.widgets",
          "update",
          async (_ctx, input: { widgetId: string; name?: string }) => ({
            id: input.widgetId,
            dashboardId: "dash_1",
            key: "summary",
            name: input.name ?? "Summary",
            kind: "summary",
            ordering: 0,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        ...(options.administration?.widgets ?? {}),
      },
      metadata: {
        list: tracked("administration.metadata", "list", async () => [
          { id: "meta_1", moduleId: "mod_1", notes: "n" },
        ]),
        get: tracked("administration.metadata", "get", async (_ctx, id: string) => ({
          id,
          moduleId: "mod_1",
        })),
        create: tracked(
          "administration.metadata",
          "create",
          async (_ctx, input: { moduleId: string }) => ({
            id: "meta_new",
            moduleId: input.moduleId,
          }),
        ),
        update: tracked(
          "administration.metadata",
          "update",
          async (_ctx, input: { metadataId: string }) => ({
            id: input.metadataId,
            moduleId: "mod_1",
          }),
        ),
        ...(options.administration?.metadata ?? {}),
      },
      references: {
        list: tracked("administration.references", "list", async () => [
          {
            id: "ref_1",
            moduleId: "mod_1",
            kind: "module",
            resourceId: "res_1",
          },
        ]),
        get: tracked("administration.references", "get", async (_ctx, id: string) => ({
          id,
          moduleId: "mod_1",
          kind: "module",
          resourceId: "res_1",
        })),
        create: tracked(
          "administration.references",
          "create",
          async (
            _ctx,
            input: { moduleId: string; kind: string; resourceId: string },
          ) => ({
            id: "ref_new",
            moduleId: input.moduleId,
            kind: input.kind,
            resourceId: input.resourceId,
          }),
        ),
        ...(options.administration?.references ?? {}),
      },
      audit: {
        list: tracked("administration.audit", "list", async () => [
          {
            id: "aud_1",
            tenantId: API_TEST_TENANT_A,
            moduleId: "mod_1",
            action: "created",
            actorUserId: API_TEST_USER_ID,
            createdAt: "2026-07-16T00:00:00.000Z",
          },
        ]),
        get: tracked("administration.audit", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          moduleId: "mod_1",
          action: "created",
          actorUserId: API_TEST_USER_ID,
          createdAt: "2026-07-16T00:00:00.000Z",
        })),
        ...(options.administration?.audit ?? {}),
      },
      history: {
        list: tracked("administration.history", "list", async () => [
          {
            id: "hist_1",
            moduleId: "mod_1",
            summary: "Created",
            actorUserId: API_TEST_USER_ID,
            createdAt: "2026-07-16T00:00:00.000Z",
          },
        ]),
        get: tracked("administration.history", "get", async (_ctx, id: string) => ({
          id,
          moduleId: "mod_1",
          summary: "Created",
          actorUserId: API_TEST_USER_ID,
          createdAt: "2026-07-16T00:00:00.000Z",
        })),
        ...(options.administration?.history ?? {}),
      },
      diagnostics: {
        health: tracked("administration.diagnostics", "health", async () => ({
          status: "healthy",
          persistenceMode: "memory",
          administrationEnabled: true,
          workbenchEnabled: false,
          httpEnabled: false,
          runtimeAdminEnabled: false,
          checkedAt: "2026-07-16T00:00:00.000Z",
        })),
        readiness: tracked("administration.diagnostics", "readiness", async () => ({
          ready: true,
          administrationEnabled: true,
          persistenceMode: "memory",
          workbenchEnabled: false,
          httpEnabled: false,
          runtimeAdminEnabled: false,
          capabilities: ["modules"],
        })),
        capabilities: tracked(
          "administration.diagnostics",
          "capabilities",
          async () => ({
            workbench: false,
            http: false,
            runtimeAdmin: false,
            lifecycle: ["draft", "registered", "active", "deprecated", "archived"],
            facets: ["modules", "categories", "sections"],
          }),
        ),
        list: tracked("administration.diagnostics", "list", async () => [
          {
            id: "diag_1",
            tenantId: API_TEST_TENANT_A,
            severity: "info",
            code: "OK",
            message: "ok",
            createdAt: "2026-07-16T00:00:00.000Z",
          },
        ]),
        get: tracked("administration.diagnostics", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          severity: "info",
          code: "OK",
          message: "ok",
          createdAt: "2026-07-16T00:00:00.000Z",
        })),
        ...(options.administration?.diagnostics ?? {}),
      },
    },
    identity: {
      users: {
        list: tracked("identity.users", "list", async () => [
          {
            id: "user_1",
            tenantId: API_TEST_TENANT_A,
            organisationId: "org_1",
            email: "user1@example.com",
            displayName: "Identity User One",
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("identity.users", "get", async (_ctx, userId: string) => ({
          id: userId,
          tenantId: API_TEST_TENANT_A,
          organisationId: "org_1",
          email: "user1@example.com",
          displayName: "Identity User One",
          status: "active",
          createdAt: "2026-07-16T00:00:00.000Z",
          updatedAt: "2026-07-16T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "identity.users",
          "create",
          async (_ctx, input: { displayName: string }) => ({
            id: "user_new",
            tenantId: API_TEST_TENANT_A,
            displayName: input.displayName,
            status: "draft",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "identity.users",
          "update",
          async (_ctx, input: { userId: string; displayName?: string }) => ({
            id: input.userId,
            tenantId: API_TEST_TENANT_A,
            displayName: input.displayName ?? "Identity User One",
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.identity?.users ?? {}),
      },
      groups: {
        list: tracked("identity.groups", "list", async () => [
          {
            id: "group_1",
            tenantId: API_TEST_TENANT_A,
            key: "engineering",
            name: "Engineering",
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("identity.groups", "get", async (_ctx, groupId: string) => ({
          id: groupId,
          tenantId: API_TEST_TENANT_A,
          key: "engineering",
          name: "Engineering",
          status: "active",
          createdAt: "2026-07-16T00:00:00.000Z",
          updatedAt: "2026-07-16T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "identity.groups",
          "create",
          async (_ctx, input: { key: string; name: string }) => ({
            id: "group_new",
            tenantId: API_TEST_TENANT_A,
            key: input.key,
            name: input.name,
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "identity.groups",
          "update",
          async (_ctx, input: { groupId: string; name?: string }) => ({
            id: input.groupId,
            tenantId: API_TEST_TENANT_A,
            key: "engineering",
            name: input.name ?? "Engineering",
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.identity?.groups ?? {}),
      },
      roles: {
        list: tracked("identity.roles", "list", async () => [
          {
            id: "role_1",
            tenantId: API_TEST_TENANT_A,
            key: "member",
            name: "Member",
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("identity.roles", "get", async (_ctx, roleId: string) => ({
          id: roleId,
          tenantId: API_TEST_TENANT_A,
          key: "member",
          name: "Member",
          status: "active",
          createdAt: "2026-07-16T00:00:00.000Z",
          updatedAt: "2026-07-16T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "identity.roles",
          "create",
          async (_ctx, input: { key: string; name: string }) => ({
            id: "role_new",
            tenantId: API_TEST_TENANT_A,
            key: input.key,
            name: input.name,
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "identity.roles",
          "update",
          async (_ctx, input: { roleId: string; name?: string }) => ({
            id: input.roleId,
            tenantId: API_TEST_TENANT_A,
            key: "member",
            name: input.name ?? "Member",
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.identity?.roles ?? {}),
      },
      organisations: {
        list: tracked("identity.organisations", "list", async () => [
          {
            id: "org_1",
            tenantId: API_TEST_TENANT_A,
            key: "acme",
            name: "Acme",
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked(
          "identity.organisations",
          "get",
          async (_ctx, organisationId: string) => ({
            id: organisationId,
            tenantId: API_TEST_TENANT_A,
            key: "acme",
            name: "Acme",
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        create: tracked(
          "identity.organisations",
          "create",
          async (_ctx, input: { key: string; name: string }) => ({
            id: "org_new",
            tenantId: API_TEST_TENANT_A,
            key: input.key,
            name: input.name,
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "identity.organisations",
          "update",
          async (_ctx, input: { organisationId: string; name?: string }) => ({
            id: input.organisationId,
            tenantId: API_TEST_TENANT_A,
            key: "acme",
            name: input.name ?? "Acme",
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.identity?.organisations ?? {}),
      },
      tenants: {
        list: tracked("identity.tenants", "list", async () => [
          {
            id: "tenant_1",
            key: "platform",
            name: "Platform",
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked(
          "identity.tenants",
          "get",
          async (_ctx, tenantRecordId: string) => ({
            id: tenantRecordId,
            key: "platform",
            name: "Platform",
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        create: tracked(
          "identity.tenants",
          "create",
          async (_ctx, input: { key: string; name: string }) => ({
            id: "tenant_new",
            key: input.key,
            name: input.name,
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "identity.tenants",
          "update",
          async (_ctx, input: { tenantRecordId: string; name?: string }) => ({
            id: input.tenantRecordId,
            key: "platform",
            name: input.name ?? "Platform",
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.identity?.tenants ?? {}),
      },
      departments: {
        list: tracked("identity.departments", "list", async () => [
          {
            id: "dept_1",
            tenantId: API_TEST_TENANT_A,
            organisationId: "org_1",
            key: "engineering",
            name: "Engineering",
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          },
        ]),
        get: tracked(
          "identity.departments",
          "get",
          async (_ctx, departmentId: string) => ({
            id: departmentId,
            tenantId: API_TEST_TENANT_A,
            organisationId: "org_1",
            key: "engineering",
            name: "Engineering",
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        create: tracked(
          "identity.departments",
          "create",
          async (
            _ctx,
            input: { key: string; name: string; organisationId: string },
          ) => ({
            id: "dept_new",
            tenantId: API_TEST_TENANT_A,
            organisationId: input.organisationId,
            key: input.key,
            name: input.name,
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        update: tracked(
          "identity.departments",
          "update",
          async (_ctx, input: { departmentId: string; name?: string }) => ({
            id: input.departmentId,
            tenantId: API_TEST_TENANT_A,
            organisationId: "org_1",
            key: "engineering",
            name: input.name ?? "Engineering",
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        ...(options.identity?.departments ?? {}),
      },
      positions: {
        list: tracked("identity.positions", "list", async () => [
          {
            id: "position_1",
            tenantId: API_TEST_TENANT_A,
            organisationId: "org_1",
            key: "engineer",
            name: "Engineer",
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          },
        ]),
        get: tracked("identity.positions", "get", async (_ctx, positionId: string) => ({
          id: positionId,
          tenantId: API_TEST_TENANT_A,
          organisationId: "org_1",
          key: "engineer",
          name: "Engineer",
          status: "active",
          createdAt: "2026-07-16T00:00:00.000Z",
          updatedAt: "2026-07-16T00:00:00.000Z",
        })),
        create: tracked(
          "identity.positions",
          "create",
          async (_ctx, input: { key: string; name: string }) => ({
            id: "position_new",
            tenantId: API_TEST_TENANT_A,
            key: input.key,
            name: input.name,
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        update: tracked(
          "identity.positions",
          "update",
          async (_ctx, input: { positionId: string; name?: string }) => ({
            id: input.positionId,
            tenantId: API_TEST_TENANT_A,
            key: "engineer",
            name: input.name ?? "Engineer",
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        ...(options.identity?.positions ?? {}),
      },
      memberships: {
        list: tracked("identity.memberships", "list", async () => [
          {
            id: "membership_1",
            tenantId: API_TEST_TENANT_A,
            userId: "user_1",
            kind: "group",
            targetId: "group_1",
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
          },
        ]),
        get: tracked(
          "identity.memberships",
          "get",
          async (_ctx, membershipId: string) => ({
            id: membershipId,
            tenantId: API_TEST_TENANT_A,
            userId: "user_1",
            kind: "group",
            targetId: "group_1",
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
          }),
        ),
        create: tracked(
          "identity.memberships",
          "create",
          async (_ctx, input: { userId: string; kind: string; targetId: string }) => ({
            id: "membership_new",
            tenantId: API_TEST_TENANT_A,
            userId: input.userId,
            kind: input.kind,
            targetId: input.targetId,
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
          }),
        ),
        update: tracked(
          "identity.memberships",
          "update",
          async (_ctx, input: { membershipId: string; status?: string }) => ({
            id: input.membershipId,
            tenantId: API_TEST_TENANT_A,
            userId: "user_1",
            kind: "group",
            targetId: "group_1",
            status: input.status ?? "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
          }),
        ),
        ...(options.identity?.memberships ?? {}),
      },
      serviceAssignments: {
        list: tracked("identity.serviceAssignments", "list", async () => [
          {
            id: "assignment_1",
            tenantId: API_TEST_TENANT_A,
            subjectKind: "user",
            subjectId: "user_1",
            serviceCapability: "projects",
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
          },
        ]),
        get: tracked(
          "identity.serviceAssignments",
          "get",
          async (_ctx, assignmentId: string) => ({
            id: assignmentId,
            tenantId: API_TEST_TENANT_A,
            subjectKind: "user",
            subjectId: "user_1",
            serviceCapability: "projects",
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
          }),
        ),
        create: tracked(
          "identity.serviceAssignments",
          "create",
          async (
            _ctx,
            input: {
              subjectKind: string;
              subjectId: string;
              serviceCapability: string;
            },
          ) => ({
            id: "assignment_new",
            tenantId: API_TEST_TENANT_A,
            subjectKind: input.subjectKind,
            subjectId: input.subjectId,
            serviceCapability: input.serviceCapability,
            status: "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
          }),
        ),
        update: tracked(
          "identity.serviceAssignments",
          "update",
          async (_ctx, input: { assignmentId: string; status?: string }) => ({
            id: input.assignmentId,
            tenantId: API_TEST_TENANT_A,
            subjectKind: "user",
            subjectId: "user_1",
            serviceCapability: "projects",
            status: input.status ?? "active",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
          }),
        ),
        ...(options.identity?.serviceAssignments ?? {}),
      },
      invitations: {
        list: tracked("identity.invitations", "list", async () => [
          {
            id: "invitation_1",
            tenantId: API_TEST_TENANT_A,
            email: "invitee@example.com",
            status: "sent",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
          },
        ]),
        get: tracked(
          "identity.invitations",
          "get",
          async (_ctx, invitationId: string) => ({
            id: invitationId,
            tenantId: API_TEST_TENANT_A,
            email: "invitee@example.com",
            status: "sent",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
          }),
        ),
        create: tracked(
          "identity.invitations",
          "create",
          async (_ctx, input: { email: string }) => ({
            id: "invitation_new",
            tenantId: API_TEST_TENANT_A,
            email: input.email,
            status: "draft",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
          }),
        ),
        update: tracked(
          "identity.invitations",
          "update",
          async (_ctx, input: { invitationId: string; status?: string }) => ({
            id: input.invitationId,
            tenantId: API_TEST_TENANT_A,
            email: "invitee@example.com",
            status: input.status ?? "sent",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
          }),
        ),
        ...(options.identity?.invitations ?? {}),
      },
      activation: {
        list: tracked("identity.activation", "list", async () => [
          {
            id: "activation_1",
            tenantId: API_TEST_TENANT_A,
            userId: "user_1",
            activatedAt: "2026-07-16T00:00:00.000Z",
            actorUserId: API_TEST_USER_ID,
            createdAt: "2026-07-16T00:00:00.000Z",
          },
        ]),
        get: tracked(
          "identity.activation",
          "get",
          async (_ctx, activationId: string) => ({
            id: activationId,
            tenantId: API_TEST_TENANT_A,
            userId: "user_1",
            activatedAt: "2026-07-16T00:00:00.000Z",
            actorUserId: API_TEST_USER_ID,
            createdAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        create: tracked(
          "identity.activation",
          "create",
          async (_ctx, input: { userId: string }) => ({
            id: "activation_new",
            tenantId: API_TEST_TENANT_A,
            userId: input.userId,
            activatedAt: "2026-07-16T00:00:00.000Z",
            actorUserId: API_TEST_USER_ID,
            createdAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        ...(options.identity?.activation ?? {}),
      },
      deactivation: {
        list: tracked("identity.deactivation", "list", async () => [
          {
            id: "deactivation_1",
            tenantId: API_TEST_TENANT_A,
            userId: "user_1",
            deactivatedAt: "2026-07-16T00:00:00.000Z",
            actorUserId: API_TEST_USER_ID,
            createdAt: "2026-07-16T00:00:00.000Z",
          },
        ]),
        get: tracked(
          "identity.deactivation",
          "get",
          async (_ctx, deactivationId: string) => ({
            id: deactivationId,
            tenantId: API_TEST_TENANT_A,
            userId: "user_1",
            deactivatedAt: "2026-07-16T00:00:00.000Z",
            actorUserId: API_TEST_USER_ID,
            createdAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        create: tracked(
          "identity.deactivation",
          "create",
          async (_ctx, input: { userId: string }) => ({
            id: "deactivation_new",
            tenantId: API_TEST_TENANT_A,
            userId: input.userId,
            deactivatedAt: "2026-07-16T00:00:00.000Z",
            actorUserId: API_TEST_USER_ID,
            createdAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        ...(options.identity?.deactivation ?? {}),
      },
      policies: {
        list: tracked("identity.policies", "list", async () => [
          {
            id: "policy_1",
            tenantId: API_TEST_TENANT_A,
            key: "default-access",
            name: "Default Access",
            kind: "access",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          },
        ]),
        get: tracked("identity.policies", "get", async (_ctx, policyId: string) => ({
          id: policyId,
          tenantId: API_TEST_TENANT_A,
          key: "default-access",
          name: "Default Access",
          kind: "access",
          createdAt: "2026-07-16T00:00:00.000Z",
          updatedAt: "2026-07-16T00:00:00.000Z",
        })),
        create: tracked(
          "identity.policies",
          "create",
          async (_ctx, input: { key: string; name: string; kind: string }) => ({
            id: "policy_new",
            tenantId: API_TEST_TENANT_A,
            key: input.key,
            name: input.name,
            kind: input.kind,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        update: tracked(
          "identity.policies",
          "update",
          async (_ctx, input: { policyId: string; name?: string }) => ({
            id: input.policyId,
            tenantId: API_TEST_TENANT_A,
            key: "default-access",
            name: input.name ?? "Default Access",
            kind: "access",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        ...(options.identity?.policies ?? {}),
      },
      audit: {
        list: tracked("identity.audit", "list", async () => [
          {
            id: "identity_audit_1",
            tenantId: API_TEST_TENANT_A,
            userId: "user_1",
            action: "created",
            actorUserId: API_TEST_USER_ID,
            createdAt: "2026-07-16T00:00:00.000Z",
          },
        ]),
        get: tracked("identity.audit", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          userId: "user_1",
          action: "created",
          actorUserId: API_TEST_USER_ID,
          createdAt: "2026-07-16T00:00:00.000Z",
        })),
        ...(options.identity?.audit ?? {}),
      },
      history: {
        list: tracked("identity.history", "list", async () => [
          {
            id: "identity_history_1",
            tenantId: API_TEST_TENANT_A,
            userId: "user_1",
            summary: "User created",
            actorUserId: API_TEST_USER_ID,
            createdAt: "2026-07-16T00:00:00.000Z",
          },
        ]),
        get: tracked("identity.history", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          userId: "user_1",
          summary: "User created",
          actorUserId: API_TEST_USER_ID,
          createdAt: "2026-07-16T00:00:00.000Z",
        })),
        ...(options.identity?.history ?? {}),
      },
      references: {
        list: tracked("identity.references", "list", async () => [
          {
            id: "identity_reference_1",
            tenantId: API_TEST_TENANT_A,
            userId: "user_1",
            kind: "user",
            target: "user_1",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          },
        ]),
        get: tracked("identity.references", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          userId: "user_1",
          kind: "user",
          target: "user_1",
          createdAt: "2026-07-16T00:00:00.000Z",
          updatedAt: "2026-07-16T00:00:00.000Z",
        })),
        create: tracked(
          "identity.references",
          "create",
          async (_ctx, input: { kind: string; target: string }) => ({
            id: "identity_reference_new",
            tenantId: API_TEST_TENANT_A,
            kind: input.kind,
            target: input.target,
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        update: tracked(
          "identity.references",
          "update",
          async (_ctx, input: { referenceId: string; target?: string }) => ({
            id: input.referenceId,
            tenantId: API_TEST_TENANT_A,
            kind: "user",
            target: input.target ?? "user_1",
            createdAt: "2026-07-16T00:00:00.000Z",
            updatedAt: "2026-07-16T00:00:00.000Z",
          }),
        ),
        ...(options.identity?.references ?? {}),
      },
      diagnostics: {
        health: tracked("identity.diagnostics", "health", async () => ({
          ok: true,
          checkedAt: "2026-07-16T00:00:00.000Z",
        })),
        readiness: tracked("identity.diagnostics", "readiness", async () => ({
          identityEnabled: true,
          persistenceMode: "memory",
          workbenchEnabled: false,
          httpEnabled: false,
          authenticationManaged: false,
          provisioningEnabled: false,
          directorySyncEnabled: false,
          facets: ["users", "groups", "roles"],
          serviceCapabilities: ["projects", "support"],
        })),
        capabilities: tracked("identity.diagnostics", "capabilities", async () => ({
          facets: [
            "users",
            "groups",
            "roles",
            "organisations",
            "tenants",
            "departments",
            "positions",
            "memberships",
            "serviceAssignments",
            "invitations",
            "activation",
            "deactivation",
            "policies",
            "audit",
            "history",
            "references",
          ],
        })),
        ...(options.identity?.diagnostics ?? {}),
      },
    },
    observe: {
      healthChecks: {
        list: tracked("observe.healthChecks", "list", async () => [
          {
            id: "hc_1",
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock healthChecks",
            status: "healthy",
            providerKind: "internal",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("observe.healthChecks", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          serviceKey: "platform-api",
          name: "Mock healthChecks",
          status: "healthy",
          providerKind: "internal",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "observe.healthChecks",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "hc_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "observe.healthChecks",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock healthChecks",
            status: "healthy",
            providerKind: "internal",
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.observe?.healthChecks ?? {}),
      },
      readinessChecks: {
        list: tracked("observe.readinessChecks", "list", async () => [
          {
            id: "rc_1",
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock readinessChecks",
            status: "healthy",
            providerKind: "internal",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("observe.readinessChecks", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          serviceKey: "platform-api",
          name: "Mock readinessChecks",
          status: "healthy",
          providerKind: "internal",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "observe.readinessChecks",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "rc_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "observe.readinessChecks",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock readinessChecks",
            status: "healthy",
            providerKind: "internal",
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.observe?.readinessChecks ?? {}),
      },
      livenessChecks: {
        list: tracked("observe.livenessChecks", "list", async () => [
          {
            id: "lc_1",
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock livenessChecks",
            status: "healthy",
            providerKind: "internal",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("observe.livenessChecks", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          serviceKey: "platform-api",
          name: "Mock livenessChecks",
          status: "healthy",
          providerKind: "internal",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "observe.livenessChecks",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "lc_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "observe.livenessChecks",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock livenessChecks",
            status: "healthy",
            providerKind: "internal",
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.observe?.livenessChecks ?? {}),
      },
      serviceHealth: {
        list: tracked("observe.serviceHealth", "list", async () => [
          {
            id: "sh_1",
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock serviceHealth",
            status: "healthy",
            providerKind: "internal",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("observe.serviceHealth", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          serviceKey: "platform-api",
          name: "Mock serviceHealth",
          status: "healthy",
          providerKind: "internal",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "observe.serviceHealth",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "sh_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "observe.serviceHealth",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock serviceHealth",
            status: "healthy",
            providerKind: "internal",
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.observe?.serviceHealth ?? {}),
      },
      serviceStatus: {
        list: tracked("observe.serviceStatus", "list", async () => [
          {
            id: "ss_1",
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock serviceStatus",
            status: "healthy",
            providerKind: "internal",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("observe.serviceStatus", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          serviceKey: "platform-api",
          name: "Mock serviceStatus",
          status: "healthy",
          providerKind: "internal",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "observe.serviceStatus",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "ss_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "observe.serviceStatus",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock serviceStatus",
            status: "healthy",
            providerKind: "internal",
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.observe?.serviceStatus ?? {}),
      },
      componentStatus: {
        list: tracked("observe.componentStatus", "list", async () => [
          {
            id: "cs_1",
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock componentStatus",
            status: "healthy",
            providerKind: "internal",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("observe.componentStatus", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          serviceKey: "platform-api",
          name: "Mock componentStatus",
          status: "healthy",
          providerKind: "internal",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "observe.componentStatus",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "cs_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "observe.componentStatus",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock componentStatus",
            status: "healthy",
            providerKind: "internal",
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.observe?.componentStatus ?? {}),
      },
      metricDefinitions: {
        list: tracked("observe.metricDefinitions", "list", async () => [
          {
            id: "md_1",
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock metricDefinitions",
            status: "healthy",
            providerKind: "internal",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("observe.metricDefinitions", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          serviceKey: "platform-api",
          name: "Mock metricDefinitions",
          status: "healthy",
          providerKind: "internal",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "observe.metricDefinitions",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "md_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "observe.metricDefinitions",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock metricDefinitions",
            status: "healthy",
            providerKind: "internal",
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.observe?.metricDefinitions ?? {}),
      },
      metricSamples: {
        list: tracked("observe.metricSamples", "list", async () => [
          {
            id: "ms_1",
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock metricSamples",
            status: "healthy",
            providerKind: "internal",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("observe.metricSamples", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          serviceKey: "platform-api",
          name: "Mock metricSamples",
          status: "healthy",
          providerKind: "internal",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "observe.metricSamples",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "ms_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "observe.metricSamples",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock metricSamples",
            status: "healthy",
            providerKind: "internal",
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.observe?.metricSamples ?? {}),
      },
      alertDefinitions: {
        list: tracked("observe.alertDefinitions", "list", async () => [
          {
            id: "ad_1",
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock alertDefinitions",
            status: "healthy",
            providerKind: "internal",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("observe.alertDefinitions", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          serviceKey: "platform-api",
          name: "Mock alertDefinitions",
          status: "healthy",
          providerKind: "internal",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "observe.alertDefinitions",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "ad_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "observe.alertDefinitions",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock alertDefinitions",
            status: "healthy",
            providerKind: "internal",
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.observe?.alertDefinitions ?? {}),
      },
      alertStates: {
        list: tracked("observe.alertStates", "list", async () => [
          {
            id: "as_1",
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock alertStates",
            status: "healthy",
            providerKind: "internal",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("observe.alertStates", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          serviceKey: "platform-api",
          name: "Mock alertStates",
          status: "healthy",
          providerKind: "internal",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "observe.alertStates",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "as_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "observe.alertStates",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock alertStates",
            status: "healthy",
            providerKind: "internal",
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.observe?.alertStates ?? {}),
      },
      dashboardDefinitions: {
        list: tracked("observe.dashboardDefinitions", "list", async () => [
          {
            id: "dd_1",
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock dashboardDefinitions",
            status: "healthy",
            providerKind: "internal",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked(
          "observe.dashboardDefinitions",
          "get",
          async (_ctx, id: string) => ({
            id,
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock dashboardDefinitions",
            status: "healthy",
            providerKind: "internal",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        create: tracked(
          "observe.dashboardDefinitions",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "dd_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "observe.dashboardDefinitions",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock dashboardDefinitions",
            status: "healthy",
            providerKind: "internal",
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.observe?.dashboardDefinitions ?? {}),
      },
      logSources: {
        list: tracked("observe.logSources", "list", async () => [
          {
            id: "ls_1",
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock logSources",
            status: "healthy",
            providerKind: "internal",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("observe.logSources", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          serviceKey: "platform-api",
          name: "Mock logSources",
          status: "healthy",
          providerKind: "internal",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "observe.logSources",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "ls_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "observe.logSources",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock logSources",
            status: "healthy",
            providerKind: "internal",
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.observe?.logSources ?? {}),
      },
      traceDefinitions: {
        list: tracked("observe.traceDefinitions", "list", async () => [
          {
            id: "td_1",
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock traceDefinitions",
            status: "healthy",
            providerKind: "internal",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("observe.traceDefinitions", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          serviceKey: "platform-api",
          name: "Mock traceDefinitions",
          status: "healthy",
          providerKind: "internal",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "observe.traceDefinitions",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "td_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "observe.traceDefinitions",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock traceDefinitions",
            status: "healthy",
            providerKind: "internal",
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.observe?.traceDefinitions ?? {}),
      },
      traceSpans: {
        list: tracked("observe.traceSpans", "list", async () => [
          {
            id: "ts_1",
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock traceSpans",
            status: "healthy",
            providerKind: "internal",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("observe.traceSpans", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          serviceKey: "platform-api",
          name: "Mock traceSpans",
          status: "healthy",
          providerKind: "internal",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "observe.traceSpans",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "ts_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "observe.traceSpans",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock traceSpans",
            status: "healthy",
            providerKind: "internal",
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.observe?.traceSpans ?? {}),
      },
      incidentReferences: {
        list: tracked("observe.incidentReferences", "list", async () => [
          {
            id: "ir_1",
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock incidentReferences",
            status: "healthy",
            providerKind: "internal",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("observe.incidentReferences", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          serviceKey: "platform-api",
          name: "Mock incidentReferences",
          status: "healthy",
          providerKind: "internal",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "observe.incidentReferences",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "ir_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "observe.incidentReferences",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock incidentReferences",
            status: "healthy",
            providerKind: "internal",
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.observe?.incidentReferences ?? {}),
      },
      maintenanceWindows: {
        list: tracked("observe.maintenanceWindows", "list", async () => [
          {
            id: "mw_1",
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock maintenanceWindows",
            status: "healthy",
            providerKind: "internal",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("observe.maintenanceWindows", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          serviceKey: "platform-api",
          name: "Mock maintenanceWindows",
          status: "healthy",
          providerKind: "internal",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "observe.maintenanceWindows",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "mw_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "observe.maintenanceWindows",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock maintenanceWindows",
            status: "healthy",
            providerKind: "internal",
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.observe?.maintenanceWindows ?? {}),
      },
      healthSummaries: {
        list: tracked("observe.healthSummaries", "list", async () => [
          {
            id: "hs_1",
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock healthSummaries",
            status: "healthy",
            providerKind: "internal",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("observe.healthSummaries", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          serviceKey: "platform-api",
          name: "Mock healthSummaries",
          status: "healthy",
          providerKind: "internal",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "observe.healthSummaries",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "hs_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "observe.healthSummaries",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock healthSummaries",
            status: "healthy",
            providerKind: "internal",
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.observe?.healthSummaries ?? {}),
      },
      metadata: {
        list: tracked("observe.metadata", "list", async () => [
          {
            id: "om_1",
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock metadata",
            status: "healthy",
            providerKind: "internal",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("observe.metadata", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          serviceKey: "platform-api",
          name: "Mock metadata",
          status: "healthy",
          providerKind: "internal",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "observe.metadata",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "om_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "observe.metadata",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            tenantId: API_TEST_TENANT_A,
            serviceKey: "platform-api",
            name: "Mock metadata",
            status: "healthy",
            providerKind: "internal",
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.observe?.metadata ?? {}),
      },
      diagnostics: {
        health: tracked("observe.diagnostics", "health", async () => ({
          status: "healthy",
          persistenceMode: "memory",
          providerExecutionEnabled: false,
          checkedAt: "2026-07-17T00:00:00.000Z",
        })),
        readiness: tracked("observe.diagnostics", "readiness", async () => ({
          ready: true,
          observeEnabled: true,
          persistenceMode: "memory",
          providerExecutionEnabled: false,
          capabilities: ["healthChecks", "metadata", "diagnostics"],
        })),
        capabilities: tracked("observe.diagnostics", "capabilities", async () => ({
          providerExecution: false,
          facets: [
            "healthChecks",
            "readinessChecks",
            "livenessChecks",
            "serviceHealth",
            "serviceStatus",
            "componentStatus",
            "metricDefinitions",
            "metricSamples",
            "alertDefinitions",
            "alertStates",
            "dashboardDefinitions",
            "logSources",
            "traceDefinitions",
            "traceSpans",
            "incidentReferences",
            "maintenanceWindows",
            "healthSummaries",
            "metadata",
            "diagnostics",
          ],
          metadataCompleteness: "foundation",
        })),
        list: tracked("observe.diagnostics", "list", async () => [
          {
            id: "pd_1",
            tenantId: API_TEST_TENANT_A,
            key: "platform",
            name: "Platform diagnostic",
            status: "healthy",
            providerKind: "internal",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("observe.diagnostics", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "platform",
          name: "Platform diagnostic",
          status: "healthy",
          providerKind: "internal",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "observe.diagnostics",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "pd_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "observe.diagnostics",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            tenantId: API_TEST_TENANT_A,
            key: "platform",
            name: "Platform diagnostic",
            status: "healthy",
            providerKind: "internal",
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.observe?.diagnostics ?? {}),
      },
    },
    metrics: {
      metrics: {
        list: tracked("metrics.metrics", "list", async () => [
          {
            id: "metrics_1",
            tenantId: API_TEST_TENANT_A,
            key: "mock_metrics",
            name: "Mock Metric",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("metrics.metrics", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "mock_metrics",
          name: "Mock Metric",
          status: "active",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "metrics.metrics",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "metrics_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "metrics.metrics",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            ...input,
            id: input.id,
            tenantId: API_TEST_TENANT_A,
            key: "mock_metrics",
            name: "Mock Metric",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.metricsPlatform?.metrics ?? {}),
      },
      definitions: {
        list: tracked("metrics.definitions", "list", async () => [
          {
            id: "definitions_1",
            tenantId: API_TEST_TENANT_A,
            key: "mock_definitions",
            name: "Mock Definition",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("metrics.definitions", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "mock_definitions",
          name: "Mock Definition",
          status: "active",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "metrics.definitions",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "definitions_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "metrics.definitions",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            ...input,
            id: input.id,
            tenantId: API_TEST_TENANT_A,
            key: "mock_definitions",
            name: "Mock Definition",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.metricsPlatform?.definitions ?? {}),
      },
      versions: {
        list: tracked("metrics.versions", "list", async () => [
          {
            id: "versions_1",
            tenantId: API_TEST_TENANT_A,
            key: "mock_versions",
            name: "Mock Version",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("metrics.versions", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "mock_versions",
          name: "Mock Version",
          status: "active",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "metrics.versions",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "versions_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "metrics.versions",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            ...input,
            id: input.id,
            tenantId: API_TEST_TENANT_A,
            key: "mock_versions",
            name: "Mock Version",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.metricsPlatform?.versions ?? {}),
      },
      categories: {
        list: tracked("metrics.categories", "list", async () => [
          {
            id: "categories_1",
            tenantId: API_TEST_TENANT_A,
            key: "mock_categories",
            name: "Mock Category",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("metrics.categories", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "mock_categories",
          name: "Mock Category",
          status: "active",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "metrics.categories",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "categories_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "metrics.categories",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            ...input,
            id: input.id,
            tenantId: API_TEST_TENANT_A,
            key: "mock_categories",
            name: "Mock Category",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.metricsPlatform?.categories ?? {}),
      },
      groups: {
        list: tracked("metrics.groups", "list", async () => [
          {
            id: "groups_1",
            tenantId: API_TEST_TENANT_A,
            key: "mock_groups",
            name: "Mock Group",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("metrics.groups", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "mock_groups",
          name: "Mock Group",
          status: "active",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "metrics.groups",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "groups_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "metrics.groups",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            ...input,
            id: input.id,
            tenantId: API_TEST_TENANT_A,
            key: "mock_groups",
            name: "Mock Group",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.metricsPlatform?.groups ?? {}),
      },
      dimensions: {
        list: tracked("metrics.dimensions", "list", async () => [
          {
            id: "dimensions_1",
            tenantId: API_TEST_TENANT_A,
            key: "mock_dimensions",
            name: "Mock Dimension",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("metrics.dimensions", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "mock_dimensions",
          name: "Mock Dimension",
          status: "active",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "metrics.dimensions",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "dimensions_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "metrics.dimensions",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            ...input,
            id: input.id,
            tenantId: API_TEST_TENANT_A,
            key: "mock_dimensions",
            name: "Mock Dimension",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.metricsPlatform?.dimensions ?? {}),
      },
      labels: {
        list: tracked("metrics.labels", "list", async () => [
          {
            id: "labels_1",
            tenantId: API_TEST_TENANT_A,
            key: "mock_labels",
            name: "Mock Label",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("metrics.labels", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "mock_labels",
          name: "Mock Label",
          status: "active",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "metrics.labels",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "labels_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "metrics.labels",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            ...input,
            id: input.id,
            tenantId: API_TEST_TENANT_A,
            key: "mock_labels",
            name: "Mock Label",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.metricsPlatform?.labels ?? {}),
      },
      units: {
        list: tracked("metrics.units", "list", async () => [
          {
            id: "units_1",
            tenantId: API_TEST_TENANT_A,
            key: "mock_units",
            name: "Mock Unit",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("metrics.units", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "mock_units",
          name: "Mock Unit",
          status: "active",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "metrics.units",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "units_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "metrics.units",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            ...input,
            id: input.id,
            tenantId: API_TEST_TENANT_A,
            key: "mock_units",
            name: "Mock Unit",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.metricsPlatform?.units ?? {}),
      },
      formulas: {
        list: tracked("metrics.formulas", "list", async () => [
          {
            id: "formulas_1",
            tenantId: API_TEST_TENANT_A,
            key: "mock_formulas",
            name: "Mock Formula",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("metrics.formulas", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "mock_formulas",
          name: "Mock Formula",
          status: "active",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "metrics.formulas",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "formulas_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "metrics.formulas",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            ...input,
            id: input.id,
            tenantId: API_TEST_TENANT_A,
            key: "mock_formulas",
            name: "Mock Formula",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.metricsPlatform?.formulas ?? {}),
      },
      aggregations: {
        list: tracked("metrics.aggregations", "list", async () => [
          {
            id: "aggregations_1",
            tenantId: API_TEST_TENANT_A,
            key: "mock_aggregations",
            name: "Mock Aggregation",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("metrics.aggregations", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "mock_aggregations",
          name: "Mock Aggregation",
          status: "active",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "metrics.aggregations",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "aggregations_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "metrics.aggregations",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            ...input,
            id: input.id,
            tenantId: API_TEST_TENANT_A,
            key: "mock_aggregations",
            name: "Mock Aggregation",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.metricsPlatform?.aggregations ?? {}),
      },
      thresholds: {
        list: tracked("metrics.thresholds", "list", async () => [
          {
            id: "thresholds_1",
            tenantId: API_TEST_TENANT_A,
            key: "mock_thresholds",
            name: "Mock Threshold",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("metrics.thresholds", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "mock_thresholds",
          name: "Mock Threshold",
          status: "active",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "metrics.thresholds",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "thresholds_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "metrics.thresholds",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            ...input,
            id: input.id,
            tenantId: API_TEST_TENANT_A,
            key: "mock_thresholds",
            name: "Mock Threshold",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.metricsPlatform?.thresholds ?? {}),
      },
      owners: {
        list: tracked("metrics.owners", "list", async () => [
          {
            id: "owners_1",
            tenantId: API_TEST_TENANT_A,
            key: "mock_owners",
            name: "Mock Owner",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("metrics.owners", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "mock_owners",
          name: "Mock Owner",
          status: "active",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "metrics.owners",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "owners_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "metrics.owners",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            ...input,
            id: input.id,
            tenantId: API_TEST_TENANT_A,
            key: "mock_owners",
            name: "Mock Owner",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.metricsPlatform?.owners ?? {}),
      },
      consumers: {
        list: tracked("metrics.consumers", "list", async () => [
          {
            id: "consumers_1",
            tenantId: API_TEST_TENANT_A,
            key: "mock_consumers",
            name: "Mock Consumer",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("metrics.consumers", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "mock_consumers",
          name: "Mock Consumer",
          status: "active",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "metrics.consumers",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "consumers_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "metrics.consumers",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            ...input,
            id: input.id,
            tenantId: API_TEST_TENANT_A,
            key: "mock_consumers",
            name: "Mock Consumer",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.metricsPlatform?.consumers ?? {}),
      },
      retentionPolicies: {
        list: tracked("metrics.retentionPolicies", "list", async () => [
          {
            id: "retention_policies_1",
            tenantId: API_TEST_TENANT_A,
            key: "mock_retentionPolicies",
            name: "Mock RetentionPolicy",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("metrics.retentionPolicies", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "mock_retentionPolicies",
          name: "Mock RetentionPolicy",
          status: "active",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "metrics.retentionPolicies",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "retention_policies_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "metrics.retentionPolicies",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            ...input,
            id: input.id,
            tenantId: API_TEST_TENANT_A,
            key: "mock_retentionPolicies",
            name: "Mock RetentionPolicy",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.metricsPlatform?.retentionPolicies ?? {}),
      },
      classifications: {
        list: tracked("metrics.classifications", "list", async () => [
          {
            id: "classifications_1",
            tenantId: API_TEST_TENANT_A,
            key: "mock_classifications",
            name: "Mock Classification",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("metrics.classifications", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "mock_classifications",
          name: "Mock Classification",
          status: "active",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "metrics.classifications",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "classifications_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "metrics.classifications",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            ...input,
            id: input.id,
            tenantId: API_TEST_TENANT_A,
            key: "mock_classifications",
            name: "Mock Classification",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.metricsPlatform?.classifications ?? {}),
      },
      dependencies: {
        list: tracked("metrics.dependencies", "list", async () => [
          {
            id: "dependencies_1",
            tenantId: API_TEST_TENANT_A,
            key: "mock_dependencies",
            name: "Mock Dependency",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("metrics.dependencies", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "mock_dependencies",
          name: "Mock Dependency",
          status: "active",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "metrics.dependencies",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "dependencies_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "metrics.dependencies",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            ...input,
            id: input.id,
            tenantId: API_TEST_TENANT_A,
            key: "mock_dependencies",
            name: "Mock Dependency",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.metricsPlatform?.dependencies ?? {}),
      },
      kpis: {
        list: tracked("metrics.kpis", "list", async () => [
          {
            id: "kpis_1",
            tenantId: API_TEST_TENANT_A,
            key: "mock_kpis",
            name: "Mock KPI",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("metrics.kpis", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "mock_kpis",
          name: "Mock KPI",
          status: "active",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "metrics.kpis",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "kpis_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "metrics.kpis",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            ...input,
            id: input.id,
            tenantId: API_TEST_TENANT_A,
            key: "mock_kpis",
            name: "Mock KPI",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.metricsPlatform?.kpis ?? {}),
      },
      kpiGroups: {
        list: tracked("metrics.kpiGroups", "list", async () => [
          {
            id: "kpi_groups_1",
            tenantId: API_TEST_TENANT_A,
            key: "mock_kpiGroups",
            name: "Mock KPIGroup",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("metrics.kpiGroups", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "mock_kpiGroups",
          name: "Mock KPIGroup",
          status: "active",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "metrics.kpiGroups",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "kpi_groups_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "metrics.kpiGroups",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            ...input,
            id: input.id,
            tenantId: API_TEST_TENANT_A,
            key: "mock_kpiGroups",
            name: "Mock KPIGroup",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.metricsPlatform?.kpiGroups ?? {}),
      },
      kpiTargets: {
        list: tracked("metrics.kpiTargets", "list", async () => [
          {
            id: "kpi_targets_1",
            tenantId: API_TEST_TENANT_A,
            key: "mock_kpiTargets",
            name: "Mock KPITarget",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("metrics.kpiTargets", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "mock_kpiTargets",
          name: "Mock KPITarget",
          status: "active",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "metrics.kpiTargets",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "kpi_targets_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "metrics.kpiTargets",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            ...input,
            id: input.id,
            tenantId: API_TEST_TENANT_A,
            key: "mock_kpiTargets",
            name: "Mock KPITarget",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.metricsPlatform?.kpiTargets ?? {}),
      },
      relationships: {
        list: tracked("metrics.relationships", "list", async () => [
          {
            id: "relationships_1",
            tenantId: API_TEST_TENANT_A,
            key: "mock_relationships",
            name: "Mock Relationship",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("metrics.relationships", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "mock_relationships",
          name: "Mock Relationship",
          status: "active",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "metrics.relationships",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "relationships_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "metrics.relationships",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            ...input,
            id: input.id,
            tenantId: API_TEST_TENANT_A,
            key: "mock_relationships",
            name: "Mock Relationship",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.metricsPlatform?.relationships ?? {}),
      },
      metadata: {
        list: tracked("metrics.metadata", "list", async () => [
          {
            id: "metadata_1",
            tenantId: API_TEST_TENANT_A,
            key: "mock_metadata",
            name: "Mock Metadata",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          },
        ]),
        get: tracked("metrics.metadata", "get", async (_ctx, id: string) => ({
          id,
          tenantId: API_TEST_TENANT_A,
          key: "mock_metadata",
          name: "Mock Metadata",
          status: "active",
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z",
          createdBy: API_TEST_USER_ID,
          updatedBy: API_TEST_USER_ID,
          revision: 1,
        })),
        create: tracked(
          "metrics.metadata",
          "create",
          async (_ctx, input: Record<string, unknown>) => ({
            id: "metadata_new",
            tenantId: API_TEST_TENANT_A,
            ...input,
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 1,
          }),
        ),
        update: tracked(
          "metrics.metadata",
          "update",
          async (_ctx, input: { id: string } & Record<string, unknown>) => ({
            ...input,
            id: input.id,
            tenantId: API_TEST_TENANT_A,
            key: "mock_metadata",
            name: "Mock Metadata",
            status: "active",
            createdAt: "2026-07-17T00:00:00.000Z",
            updatedAt: "2026-07-17T00:00:00.000Z",
            createdBy: API_TEST_USER_ID,
            updatedBy: API_TEST_USER_ID,
            revision: 2,
          }),
        ),
        ...(options.metricsPlatform?.metadata ?? {}),
      },
      diagnostics: {
        health: tracked("metrics.diagnostics", "health", async () => ({
          status: "healthy",
          persistenceMode: "memory",
          formulaExecutionEnabled: false,
          kpiExecutionEnabled: false,
          providerIntegrationEnabled: false,
          checkedAt: "2026-07-17T00:00:00.000Z",
        })),
        readiness: tracked("metrics.diagnostics", "readiness", async () => ({
          ready: true,
          metricsEnabled: true,
          persistenceMode: "memory",
          formulaExecutionEnabled: false,
          kpiExecutionEnabled: false,
          providerIntegrationEnabled: false,
          capabilities: [
            "metrics",
            "definitions",
            "versions",
            "categories",
            "groups",
            "dimensions",
            "labels",
            "units",
            "formulas",
            "aggregations",
            "thresholds",
            "owners",
            "consumers",
            "retentionPolicies",
            "classifications",
            "dependencies",
            "kpis",
            "kpiGroups",
            "kpiTargets",
            "relationships",
            "metadata",
          ],
        })),
        capabilities: tracked("metrics.diagnostics", "capabilities", async () => ({
          formulaExecution: false,
          kpiExecution: false,
          providerIntegration: false,
          facets: [
            "metrics",
            "definitions",
            "versions",
            "categories",
            "groups",
            "dimensions",
            "labels",
            "units",
            "formulas",
            "aggregations",
            "thresholds",
            "owners",
            "consumers",
            "retentionPolicies",
            "classifications",
            "dependencies",
            "kpis",
            "kpiGroups",
            "kpiTargets",
            "relationships",
            "metadata",
          ],
          metadataCompleteness: "platform-services",
        })),
        ...(options.metricsPlatform?.diagnostics ?? {}),
      },
    },
    users: {} as PlatformServiceGateway["users"],
    search: {} as PlatformServiceGateway["search"],
    assertContext: () => undefined,
  } as unknown as PlatformServiceGateway;
}

export function installMockGateway(
  options: MockGatewayOptions = {},
): PlatformServiceGateway {
  const gateway = createMockPlatformGateway(options);
  setPlatformApiGatewayBootstrapForTests(
    createTestPlatformApiGatewayBootstrap(gateway, {
      authorizationMode: "production",
      providersRegistered: true,
      workflowEnabled: true,
      workflowReadiness: {
        workflowEnabled: true,
        persistenceMode: "memory",
        executionEnabled: false,
        engineEnabled: false,
        engineProvider: "none",
      },
      notificationEnabled: true,
      notificationReadiness: {
        notificationEnabled: true,
        persistenceMode: "memory",
        deliveryEnabled: false,
      },
      configurationEnabled: true,
      configurationReadiness: {
        configurationEnabled: true,
        persistenceMode: "memory",
        runtimeApplyEnabled: false,
      },
      administrationEnabled: true,
      administrationReadiness: {
        administrationEnabled: true,
        persistenceMode: "memory",
        workbenchEnabled: false,
        httpEnabled: false,
        runtimeAdminEnabled: false,
      },
      identityEnabled: true,
      identityReadiness: {
        identityEnabled: true,
        persistenceMode: "memory",
        workbenchEnabled: false,
        httpEnabled: false,
        authenticationManaged: false,
        provisioningEnabled: false,
        directorySyncEnabled: false,
      },
      observeEnabled: true,
      observeReadiness: {
        observeEnabled: true,
        persistenceMode: "memory",
        providerExecutionEnabled: false,
      },
      metricsEnabled: true,
      metricsReadiness: {
        metricsEnabled: true,
        persistenceMode: "memory",
        formulaExecutionEnabled: false,
        kpiExecutionEnabled: false,
        providerIntegrationEnabled: false,
      },
    }),
  );
  return gateway;
}

export function buildMockSession(
  overrides: {
    readonly userId?: string;
    readonly tenantId?: string | null;
  } = {},
) {
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
