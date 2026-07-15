/**
 * Module-level Testing client accessor and thin API wrappers.
 */

import type { TestingClient, TestingClientRequestOptions } from "./client";
import { createHttpTestingClient } from "./http-client";
import { createMockTestingClient } from "./mock-client";
import type {
  AdminSettingViewModel,
  ApprovalDecisionInput,
  AutomationRunViewModel,
  CaseViewModel,
  CertificationViewModel,
  CoverageSummaryViewModel,
  CreateCaseInput,
  CreatePlanInput,
  CreateSuiteInput,
  DashboardViewModel,
  DefectLinkViewModel,
  EvidenceSubmitInput,
  EvidenceViewModel,
  ExecutionViewModel,
  PlanViewModel,
  QualitySummaryViewModel,
  ReleaseReadinessViewModel,
  ReportPlaceholderViewModel,
  RequirementViewModel,
  StartExecutionInput,
  SuiteViewModel,
  TestingCollectionResult,
  TestingListParams,
} from "./types";

let testingClient: TestingClient =
  typeof process !== "undefined" && process.env.NODE_ENV === "test"
    ? createMockTestingClient()
    : createHttpTestingClient();

export function setTestingClient(client: TestingClient): void {
  testingClient = client;
}

export function getTestingClient(): TestingClient {
  return testingClient;
}

export function resetTestingClient(): void {
  testingClient = createMockTestingClient();
}

export function getDashboard(
  options?: TestingClientRequestOptions,
): Promise<DashboardViewModel> {
  return getTestingClient().getDashboard(options);
}

export function listRequirements(
  params?: TestingListParams,
  options?: TestingClientRequestOptions,
): Promise<TestingCollectionResult<RequirementViewModel>> {
  return getTestingClient().listRequirements(params, options);
}

export function listPlans(
  params?: TestingListParams,
  options?: TestingClientRequestOptions,
): Promise<TestingCollectionResult<PlanViewModel>> {
  return getTestingClient().listPlans(params, options);
}

export function getPlan(
  planId: string,
  options?: TestingClientRequestOptions,
): Promise<PlanViewModel> {
  return getTestingClient().getPlan(planId, options);
}

export function createPlan(
  input: CreatePlanInput,
  options?: TestingClientRequestOptions,
): Promise<PlanViewModel> {
  return getTestingClient().createPlan(input, options);
}

export function listSuites(
  params?: TestingListParams,
  options?: TestingClientRequestOptions,
): Promise<TestingCollectionResult<SuiteViewModel>> {
  return getTestingClient().listSuites(params, options);
}

export function createSuite(
  input: CreateSuiteInput,
  options?: TestingClientRequestOptions,
): Promise<SuiteViewModel> {
  return getTestingClient().createSuite(input, options);
}

export function listCases(
  params?: TestingListParams,
  options?: TestingClientRequestOptions,
): Promise<TestingCollectionResult<CaseViewModel>> {
  return getTestingClient().listCases(params, options);
}

export function createCase(
  input: CreateCaseInput,
  options?: TestingClientRequestOptions,
): Promise<CaseViewModel> {
  return getTestingClient().createCase(input, options);
}

export function listExecutions(
  params?: TestingListParams,
  options?: TestingClientRequestOptions,
): Promise<TestingCollectionResult<ExecutionViewModel>> {
  return getTestingClient().listExecutions(params, options);
}

export function getExecution(
  executionId: string,
  options?: TestingClientRequestOptions,
): Promise<ExecutionViewModel> {
  return getTestingClient().getExecution(executionId, options);
}

export function startExecution(
  input: StartExecutionInput,
  options?: TestingClientRequestOptions,
): Promise<ExecutionViewModel> {
  return getTestingClient().startExecution(input, options);
}

export function pauseExecution(
  executionId: string,
  options?: TestingClientRequestOptions,
): Promise<ExecutionViewModel> {
  return getTestingClient().pauseExecution(executionId, options);
}

export function resumeExecution(
  executionId: string,
  options?: TestingClientRequestOptions,
): Promise<ExecutionViewModel> {
  return getTestingClient().resumeExecution(executionId, options);
}

export function listEvidence(
  params?: TestingListParams,
  options?: TestingClientRequestOptions,
): Promise<TestingCollectionResult<EvidenceViewModel>> {
  return getTestingClient().listEvidence(params, options);
}

export function submitEvidence(
  input: EvidenceSubmitInput,
  options?: TestingClientRequestOptions,
): Promise<EvidenceViewModel> {
  return getTestingClient().submitEvidence(input, options);
}

export function listAutomationRuns(
  params?: TestingListParams,
  options?: TestingClientRequestOptions,
): Promise<TestingCollectionResult<AutomationRunViewModel>> {
  return getTestingClient().listAutomationRuns(params, options);
}

export function listCoverage(
  options?: TestingClientRequestOptions,
): Promise<TestingCollectionResult<CoverageSummaryViewModel>> {
  return getTestingClient().listCoverage(options);
}

export function listDefects(
  params?: TestingListParams,
  options?: TestingClientRequestOptions,
): Promise<TestingCollectionResult<DefectLinkViewModel>> {
  return getTestingClient().listDefects(params, options);
}

export function listQualitySummaries(
  options?: TestingClientRequestOptions,
): Promise<TestingCollectionResult<QualitySummaryViewModel>> {
  return getTestingClient().listQualitySummaries(options);
}

export function listCertifications(
  params?: TestingListParams,
  options?: TestingClientRequestOptions,
): Promise<TestingCollectionResult<CertificationViewModel>> {
  return getTestingClient().listCertifications(params, options);
}

export function getCertification(
  certificationId: string,
  options?: TestingClientRequestOptions,
): Promise<CertificationViewModel> {
  return getTestingClient().getCertification(certificationId, options);
}

export function decideCertification(
  input: ApprovalDecisionInput,
  options?: TestingClientRequestOptions,
): Promise<CertificationViewModel> {
  return getTestingClient().decideCertification(input, options);
}

export function archiveCertification(
  certificationId: string,
  options?: TestingClientRequestOptions,
): Promise<CertificationViewModel> {
  return getTestingClient().archiveCertification(certificationId, options);
}

export function listReleaseReadiness(
  options?: TestingClientRequestOptions,
): Promise<TestingCollectionResult<ReleaseReadinessViewModel>> {
  return getTestingClient().listReleaseReadiness(options);
}

export function listReportPlaceholders(
  options?: TestingClientRequestOptions,
): Promise<TestingCollectionResult<ReportPlaceholderViewModel>> {
  return getTestingClient().listReportPlaceholders(options);
}

export function listAdminSettings(
  options?: TestingClientRequestOptions,
): Promise<TestingCollectionResult<AdminSettingViewModel>> {
  return getTestingClient().listAdminSettings(options);
}

export {
  getPipelineRepository,
  listPipelineWorkflows,
  getPipelineWorkflow,
  listLivePipelineRuns,
  getLivePipelineRun,
  listLivePipelineJobs,
  getLivePipelineJob,
  listLivePipelineSteps,
  listLivePipelineArtifacts,
  getLivePipelineSummary,
  listSorPipelines,
  getSorPipeline,
  listSorPipelineRuns,
  getSorPipelineRun,
  getPipelineLinks,
  listSorPipelineJobs,
  listSorPipelineStages,
  listPipelineProviders,
  importPipelineFromProvider,
  getPipelineClient,
  setPipelineClient,
  resetPipelineClient,
} from "./pipeline-api";

export {
  getEngineeringQualityScore,
  getEngineeringHealth,
  getEngineeringRisk,
  listEngineeringSnapshots,
  listEngineeringTrends,
  listEngineeringBenchmarks,
  compareEngineeringBenchmark,
  listEngineeringBaselines,
  listEngineeringHistorical,
  getEngineeringIntelligenceClient,
  setEngineeringIntelligenceClient,
  resetEngineeringIntelligenceClient,
} from "./engineering-intelligence-api";
