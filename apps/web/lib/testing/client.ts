/**
 * Typed Testing client contract (APZTCMS-010).
 *
 * UI components must only talk through this interface.
 * Default transport is HTTP outside tests and an in-process mock during tests.
 * The HTTP client implements this surface against `/api/v1/testing/*`.
 *
 * Boundary: never import `@apzhub/testing-services`, persistence, or repositories here
 * into React components — only this client API.
 */

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

export type TestingClientRequestOptions = {
  readonly signal?: AbortSignal;
  readonly correlationId?: string;
};

export interface TestingClient {
  getDashboard(options?: TestingClientRequestOptions): Promise<DashboardViewModel>;

  listRequirements(
    params?: TestingListParams,
    options?: TestingClientRequestOptions,
  ): Promise<TestingCollectionResult<RequirementViewModel>>;

  listPlans(
    params?: TestingListParams,
    options?: TestingClientRequestOptions,
  ): Promise<TestingCollectionResult<PlanViewModel>>;
  getPlan(
    planId: string,
    options?: TestingClientRequestOptions,
  ): Promise<PlanViewModel>;
  createPlan(
    input: CreatePlanInput,
    options?: TestingClientRequestOptions,
  ): Promise<PlanViewModel>;

  listSuites(
    params?: TestingListParams,
    options?: TestingClientRequestOptions,
  ): Promise<TestingCollectionResult<SuiteViewModel>>;
  createSuite(
    input: CreateSuiteInput,
    options?: TestingClientRequestOptions,
  ): Promise<SuiteViewModel>;

  listCases(
    params?: TestingListParams,
    options?: TestingClientRequestOptions,
  ): Promise<TestingCollectionResult<CaseViewModel>>;
  createCase(
    input: CreateCaseInput,
    options?: TestingClientRequestOptions,
  ): Promise<CaseViewModel>;

  listExecutions(
    params?: TestingListParams,
    options?: TestingClientRequestOptions,
  ): Promise<TestingCollectionResult<ExecutionViewModel>>;
  getExecution(
    executionId: string,
    options?: TestingClientRequestOptions,
  ): Promise<ExecutionViewModel>;
  startExecution(
    input: StartExecutionInput,
    options?: TestingClientRequestOptions,
  ): Promise<ExecutionViewModel>;
  pauseExecution(
    executionId: string,
    options?: TestingClientRequestOptions,
  ): Promise<ExecutionViewModel>;
  resumeExecution(
    executionId: string,
    options?: TestingClientRequestOptions,
  ): Promise<ExecutionViewModel>;

  listEvidence(
    params?: TestingListParams,
    options?: TestingClientRequestOptions,
  ): Promise<TestingCollectionResult<EvidenceViewModel>>;
  submitEvidence(
    input: EvidenceSubmitInput,
    options?: TestingClientRequestOptions,
  ): Promise<EvidenceViewModel>;

  listAutomationRuns(
    params?: TestingListParams,
    options?: TestingClientRequestOptions,
  ): Promise<TestingCollectionResult<AutomationRunViewModel>>;

  listCoverage(
    options?: TestingClientRequestOptions,
  ): Promise<TestingCollectionResult<CoverageSummaryViewModel>>;

  listDefects(
    params?: TestingListParams,
    options?: TestingClientRequestOptions,
  ): Promise<TestingCollectionResult<DefectLinkViewModel>>;

  listQualitySummaries(
    options?: TestingClientRequestOptions,
  ): Promise<TestingCollectionResult<QualitySummaryViewModel>>;

  listCertifications(
    params?: TestingListParams,
    options?: TestingClientRequestOptions,
  ): Promise<TestingCollectionResult<CertificationViewModel>>;
  getCertification(
    certificationId: string,
    options?: TestingClientRequestOptions,
  ): Promise<CertificationViewModel>;
  decideCertification(
    input: ApprovalDecisionInput,
    options?: TestingClientRequestOptions,
  ): Promise<CertificationViewModel>;
  archiveCertification(
    certificationId: string,
    options?: TestingClientRequestOptions,
  ): Promise<CertificationViewModel>;

  listReleaseReadiness(
    options?: TestingClientRequestOptions,
  ): Promise<TestingCollectionResult<ReleaseReadinessViewModel>>;

  listReportPlaceholders(
    options?: TestingClientRequestOptions,
  ): Promise<TestingCollectionResult<ReportPlaceholderViewModel>>;

  listAdminSettings(
    options?: TestingClientRequestOptions,
  ): Promise<TestingCollectionResult<AdminSettingViewModel>>;
}
