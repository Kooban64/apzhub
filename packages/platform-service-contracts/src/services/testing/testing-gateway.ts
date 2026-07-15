import type { TestingApprovalService } from "./testing-approval-service";
import type { TestingAutomationService } from "./testing-automation-service";
import type { TestingCaseService } from "./testing-case-service";
import type { TestingCertificationService } from "./testing-certification-service";
import type { TestingCoverageService } from "./testing-coverage-service";
import type { TestingDashboardService } from "./testing-dashboard-service";
import type { TestingDefectService } from "./testing-defect-service";
import type { TestingEvidenceService } from "./testing-evidence-service";
import type { TestingExecutionService } from "./testing-execution-service";
import type { TestingPlanService } from "./testing-plan-service";
import type { TestingPipelineArtifactService } from "./testing-pipeline-artifact-service";
import type { TestingPipelineJobService } from "./testing-pipeline-job-service";
import type { TestingPipelineRepositoryService } from "./testing-pipeline-repository-service";
import type { TestingPipelineRunLiveService } from "./testing-pipeline-run-live-service";
import type { TestingPipelineStepService } from "./testing-pipeline-step-service";
import type { TestingPipelineSummaryService } from "./testing-pipeline-summary-service";
import type { TestingPipelineWorkflowService } from "./testing-pipeline-workflow-service";
import type { TestingPipelinesService } from "./testing-pipelines-service";
import type { TestingQualityService } from "./testing-quality-service";
import type { TestingEngineeringIntelligenceService } from "./testing-engineering-intelligence-service";
import type { TestingReleaseGovernanceService } from "./testing-release-governance-service";
import type { TestingReleaseReadinessService } from "./testing-release-readiness-service";
import type { TestingReportingService } from "./testing-reporting-service";
import type { TestingRequirementService } from "./testing-requirement-service";
import type { TestingSuiteService } from "./testing-suite-service";
import type { TestingTraceabilityService } from "./testing-traceability-service";

export interface TestingPlatformGateway {
  readonly plans: TestingPlanService;
  readonly suites: TestingSuiteService;
  readonly cases: TestingCaseService;
  readonly requirements: TestingRequirementService;
  readonly executions: TestingExecutionService;
  readonly evidence: TestingEvidenceService;
  readonly automation: TestingAutomationService;
  readonly coverage: TestingCoverageService;
  readonly defects: TestingDefectService;
  readonly quality: TestingQualityService;
  readonly engineeringIntelligence: TestingEngineeringIntelligenceService;
  readonly certification: TestingCertificationService;
  readonly releaseReadiness: TestingReleaseReadinessService;
  /** TCMS-only release governance (APZTCMS-014) — not platform-quality. */
  readonly releaseGovernance: TestingReleaseGovernanceService;
  /** External CI/CD pipeline SoR metadata (APZTCMS-015/017). */
  readonly pipelines: TestingPipelinesService;
  /** Live CI repository metadata (APZTCMS-017). */
  readonly pipelineRepositories: TestingPipelineRepositoryService;
  /** Live CI workflow definitions (APZTCMS-017). */
  readonly pipelineWorkflows: TestingPipelineWorkflowService;
  /** Live CI run reads (APZTCMS-017) — distinct from SoR pipelines.getRun. */
  readonly pipelineRuns: TestingPipelineRunLiveService;
  /** Live CI artifact references (APZTCMS-017). */
  readonly pipelineArtifacts: TestingPipelineArtifactService;
  /** Live CI jobs (APZTCMS-017). */
  readonly pipelineJobs: TestingPipelineJobService;
  /** Live CI steps (APZTCMS-017). */
  readonly pipelineSteps: TestingPipelineStepService;
  /** Live CI run summaries (APZTCMS-017). */
  readonly pipelineSummaries: TestingPipelineSummaryService;
  readonly traceability: TestingTraceabilityService;
  readonly approvals: TestingApprovalService;
  readonly dashboard: TestingDashboardService;
  readonly reporting: TestingReportingService;
}
