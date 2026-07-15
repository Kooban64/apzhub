import type { RepositoryContext } from "../types";
import type {
  ApprovalHistoryRecord,
  ApprovalRecord,
  AuditRecord,
  AutomationCoverageSnapshotRecord,
  AutomationDefinitionRecord,
  AutomationImportHistoryRecord,
  AutomationImportRecord,
  AutomationResultItemRecord,
  AutomationRunRecord,
  AutomatedExecutionRecord,
  PipelineImportHistoryRecord,
  PipelineImportRecord,
  PipelineRecord,
  PipelineRunRecord,
  EngineeringBaselineRecord,
  EngineeringBenchmarkRecord,
  EngineeringHistoricalSnapshotRecord,
  EngineeringQualitySummaryRecord,
  EngineeringSnapshotRecord,
  EngineeringTrendSeriesRecord,
  ReportGenerationMetadataRecord,
  ReportTemplateRecord,
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
  ExecutionHistoryRecord,
  ExecutionSessionRecord,
  ManualExecutionRecord,
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
} from "./records";
import type { ListQuery, PageResult } from "./types";

export interface CrudRepository<TCreate, TUpdate, TRecord extends { id: string }> {
  create(ctx: RepositoryContext, input: TCreate): Promise<TRecord>;
  update(
    ctx: RepositoryContext,
    id: string,
    expectedRevision: number,
    input: TUpdate,
  ): Promise<TRecord>;
  archive(
    ctx: RepositoryContext,
    id: string,
    expectedRevision: number,
  ): Promise<TRecord>;
  restore(
    ctx: RepositoryContext,
    id: string,
    expectedRevision: number,
  ): Promise<TRecord>;
  get(ctx: RepositoryContext, id: string): Promise<TRecord | undefined>;
  list(ctx: RepositoryContext, query?: ListQuery): Promise<PageResult<TRecord>>;
  search(ctx: RepositoryContext, query?: ListQuery): Promise<PageResult<TRecord>>;
}

type CreateBase<T> = Omit<
  T,
  | "id"
  | "revision"
  | "createdAt"
  | "updatedAt"
  | "archivedAt"
  | "tenantId"
  | "createdBy"
  | "updatedBy"
> & { id?: string; tenantId?: string };

export type RequirementCreate = CreateBase<RequirementRecord>;
export type RequirementUpdate = Partial<Omit<RequirementCreate, "id" | "key">>;

export type WorkItemCreate = CreateBase<WorkItemRecord>;
export type WorkItemUpdate = Partial<Omit<WorkItemCreate, "id" | "key">>;

export type RiskCreate = CreateBase<RiskRecord>;
export type RiskUpdate = Partial<Omit<RiskCreate, "id" | "key">>;

export type TestPlanCreate = CreateBase<TestPlanRecord>;
export type TestPlanUpdate = Partial<Omit<TestPlanCreate, "id" | "key">>;

export type TestSuiteCreate = CreateBase<TestSuiteRecord>;
export type TestSuiteUpdate = Partial<Omit<TestSuiteCreate, "id" | "key">>;

export type TestCaseCreate = CreateBase<TestCaseRecord>;
export type TestCaseUpdate = Partial<Omit<TestCaseCreate, "id" | "key">>;

export type TestStepCreate = CreateBase<TestStepRecord>;
export type TestStepUpdate = Partial<Omit<TestStepCreate, "id" | "caseId">>;

export type TestCaseVersionCreate = CreateBase<TestCaseVersionRecord>;
export type TestCaseVersionUpdate = Partial<
  Omit<TestCaseVersionCreate, "id" | "caseId" | "versionNumber">
>;

export type TestPlanVersionCreate = CreateBase<TestPlanVersionRecord>;
export type TestPlanVersionUpdate = Partial<
  Omit<TestPlanVersionCreate, "id" | "planId" | "versionNumber">
>;

export type TestSuiteVersionCreate = CreateBase<TestSuiteVersionRecord>;
export type TestSuiteVersionUpdate = Partial<
  Omit<TestSuiteVersionCreate, "id" | "suiteId" | "versionNumber">
>;

export type RegressionSetCreate = CreateBase<RegressionSetRecord>;
export type RegressionSetUpdate = Partial<Omit<RegressionSetCreate, "id" | "key">>;

export type ExecutionSessionCreate = CreateBase<ExecutionSessionRecord>;
export type ExecutionSessionUpdate = Partial<Omit<ExecutionSessionCreate, "id">>;

export type ManualExecutionCreate = CreateBase<ManualExecutionRecord>;
export type ManualExecutionUpdate = Partial<Omit<ManualExecutionCreate, "id">>;

export type EvidenceCreate = CreateBase<EvidenceRecord>;
export type EvidenceUpdate = Partial<Omit<EvidenceCreate, "id">>;

export type ApprovalCreate = CreateBase<ApprovalRecord>;
export type ApprovalUpdate = Partial<Omit<ApprovalCreate, "id">>;

export type CertificationCreate = CreateBase<CertificationRecordRecord>;
export type CertificationUpdate = Partial<Omit<CertificationCreate, "id" | "key">>;

export type CertificationGateDefinitionCreate = CreateBase<CertificationGateDefinitionRecord>;
export type CertificationGateDefinitionUpdate = Partial<
  Omit<CertificationGateDefinitionCreate, "id">
>;

export type CertificationGateEvaluationCreate = CreateBase<CertificationGateEvaluationRecord>;
export type CertificationGateEvaluationUpdate = Partial<
  Omit<CertificationGateEvaluationCreate, "id" | "certificationRecordId" | "gateKey">
>;

export type CertificationRuleCreate = CreateBase<CertificationRuleRecord>;
export type CertificationRuleUpdate = Partial<Omit<CertificationRuleCreate, "id" | "key">>;

export type ReleaseReadinessCreate = CreateBase<ReleaseReadinessRecord>;
export type ReleaseReadinessUpdate = Partial<Omit<ReleaseReadinessCreate, "id">>;

export type ReleaseCreate = CreateBase<ReleaseRecord>;
export type ReleaseUpdate = Partial<Omit<ReleaseCreate, "id" | "key">>;

export type ReleaseScopeCreate = CreateBase<ReleaseScopeRecord>;
export type ReleaseScopeUpdate = Partial<
  Omit<ReleaseScopeCreate, "id" | "releaseId">
>;

export type ReleasePackageCreate = CreateBase<ReleasePackageRecord>;
export type ReleasePackageUpdate = Partial<
  Omit<ReleasePackageCreate, "id" | "releaseId">
>;

export type ReleaseCandidateCreate = CreateBase<ReleaseCandidateRecord>;
export type ReleaseCandidateUpdate = Partial<
  Omit<ReleaseCandidateCreate, "id" | "releaseId">
>;

export type ReleaseApprovalCreate = CreateBase<ReleaseApprovalRecord>;
export type ReleaseApprovalUpdate = Partial<
  Omit<ReleaseApprovalCreate, "id" | "releaseId">
>;

export type ReleaseDecisionCreate = CreateBase<ReleaseDecisionRecord>;
export type ReleaseDecisionUpdate = Partial<
  Omit<ReleaseDecisionCreate, "id" | "releaseId">
>;

export type ReleaseEvidenceCreate = CreateBase<ReleaseEvidenceRecord>;
export type ReleaseEvidenceUpdate = Partial<
  Omit<ReleaseEvidenceCreate, "id" | "releaseId">
>;

export type ReleaseDependencyCreate = CreateBase<ReleaseDependencyRecord>;
export type ReleaseDependencyUpdate = Partial<
  Omit<ReleaseDependencyCreate, "id" | "releaseId">
>;

export type ReleaseNoteCreate = CreateBase<ReleaseNoteRecord>;
export type ReleaseNoteUpdate = Partial<
  Omit<ReleaseNoteCreate, "id" | "releaseId">
>;

export type ReleaseRiskAssessmentCreate = CreateBase<ReleaseRiskAssessmentRecord>;
export type ReleaseRiskAssessmentUpdate = Partial<
  Omit<ReleaseRiskAssessmentCreate, "id" | "releaseId">
>;

export type ReleaseReadinessSnapshotCreate =
  CreateBase<ReleaseReadinessSnapshotRecord>;
export type ReleaseReadinessSnapshotUpdate = Partial<
  Omit<ReleaseReadinessSnapshotCreate, "id" | "releaseId">
>;

export type ReleaseSummarySnapshotCreate =
  CreateBase<ReleaseSummarySnapshotRecord>;
export type ReleaseSummarySnapshotUpdate = Partial<
  Omit<ReleaseSummarySnapshotCreate, "id" | "releaseId">
>;

export type CoverageCreate = CreateBase<CoverageRecord>;
export type CoverageUpdate = Partial<Omit<CoverageCreate, "id">>;

export type DefectLinkCreate = CreateBase<DefectLinkRecord>;
export type DefectLinkUpdate = Partial<Omit<DefectLinkCreate, "id">>;

export type QualitySnapshotCreate = CreateBase<QualitySnapshotRecord>;
export type QualitySnapshotUpdate = Partial<Omit<QualitySnapshotCreate, "id">>;

export type RegressionAnalysisCreate = CreateBase<RegressionAnalysisRecord>;
export type RegressionAnalysisUpdate = Partial<
  Omit<RegressionAnalysisCreate, "id">
>;

export type AutomationDefinitionCreate = CreateBase<AutomationDefinitionRecord>;
export type AutomationDefinitionUpdate = Partial<
  Omit<AutomationDefinitionCreate, "id" | "key">
>;

export type TraceabilityLinkCreate = CreateBase<TraceabilityLinkRecord>;
export type TraceabilityLinkUpdate = Partial<Omit<TraceabilityLinkCreate, "id">>;

export type ConfigurationCreate = CreateBase<ConfigurationRecord>;
export type ConfigurationUpdate = Partial<
  Omit<ConfigurationCreate, "id" | "configKey">
>;

export type RegistryEntryCreate = CreateBase<RegistryEntryRecord>;
export type RegistryEntryUpdate = Partial<
  Omit<RegistryEntryCreate, "id" | "registryKind" | "entryKey">
>;

export type AutomationImportCreate = CreateBase<AutomationImportRecord>;
export type AutomationImportUpdate = Partial<Omit<AutomationImportCreate, "id">>;

export type AutomatedExecutionCreate = CreateBase<AutomatedExecutionRecord>;
export type AutomatedExecutionUpdate = Partial<Omit<AutomatedExecutionCreate, "id">>;

export type AutomationRunCreate = CreateBase<AutomationRunRecord>;
export type AutomationRunUpdate = Partial<Omit<AutomationRunCreate, "id">>;

export type AutomationResultItemCreate = CreateBase<AutomationResultItemRecord>;
export type AutomationResultItemUpdate = Partial<
  Omit<AutomationResultItemCreate, "id">
>;

export type AutomationCoverageSnapshotCreate =
  CreateBase<AutomationCoverageSnapshotRecord>;
export type AutomationCoverageSnapshotUpdate = Partial<
  Omit<AutomationCoverageSnapshotCreate, "id">
>;

export type PipelineCreate = CreateBase<PipelineRecord>;
export type PipelineUpdate = Partial<Omit<PipelineCreate, "id" | "key">>;

export type PipelineImportCreate = CreateBase<PipelineImportRecord>;
export type PipelineImportUpdate = Partial<Omit<PipelineImportCreate, "id">>;

export type PipelineRunCreate = CreateBase<PipelineRunRecord>;
export type PipelineRunUpdate = Partial<Omit<PipelineRunCreate, "id">>;

export type EngineeringSnapshotCreate = CreateBase<EngineeringSnapshotRecord>;
export type EngineeringSnapshotUpdate = Partial<
  Omit<EngineeringSnapshotCreate, "id">
>;

export type EngineeringHistoricalSnapshotCreate =
  CreateBase<EngineeringHistoricalSnapshotRecord>;
export type EngineeringHistoricalSnapshotUpdate = Partial<
  Omit<EngineeringHistoricalSnapshotCreate, "id" | "immutable">
>;

export type EngineeringTrendSeriesCreate =
  CreateBase<EngineeringTrendSeriesRecord>;
export type EngineeringTrendSeriesUpdate = Partial<
  Omit<EngineeringTrendSeriesCreate, "id">
>;

export type EngineeringBenchmarkCreate = CreateBase<EngineeringBenchmarkRecord>;
export type EngineeringBenchmarkUpdate = Partial<
  Omit<EngineeringBenchmarkCreate, "id">
>;

export type EngineeringBaselineCreate = CreateBase<EngineeringBaselineRecord>;
export type EngineeringBaselineUpdate = Partial<
  Omit<EngineeringBaselineCreate, "id">
>;

export type EngineeringQualitySummaryCreate =
  CreateBase<EngineeringQualitySummaryRecord>;
export type EngineeringQualitySummaryUpdate = Partial<
  Omit<EngineeringQualitySummaryCreate, "id">
>;

export type ReportTemplateCreate = CreateBase<ReportTemplateRecord>;
export type ReportTemplateUpdate = Partial<Omit<ReportTemplateCreate, "id">>;

export type ReportGenerationMetadataCreate =
  CreateBase<ReportGenerationMetadataRecord>;
export type ReportGenerationMetadataUpdate = Partial<
  Omit<ReportGenerationMetadataCreate, "id">
>;

export interface ExecutionHistoryRepository {
  append(
    ctx: RepositoryContext,
    input: Omit<ExecutionHistoryRecord, "occurredAt"> & { occurredAt?: string },
  ): Promise<ExecutionHistoryRecord>;
  listBySession(
    ctx: RepositoryContext,
    sessionId: string,
    query?: ListQuery,
  ): Promise<PageResult<ExecutionHistoryRecord>>;
  get(ctx: RepositoryContext, id: string): Promise<ExecutionHistoryRecord | undefined>;
}

export interface AuditRecordRepository {
  append(
    ctx: RepositoryContext,
    input: Omit<AuditRecord, "occurredAt"> & { occurredAt?: string },
  ): Promise<AuditRecord>;
  list(ctx: RepositoryContext, query?: ListQuery): Promise<PageResult<AuditRecord>>;
  get(ctx: RepositoryContext, id: string): Promise<AuditRecord | undefined>;
}

export interface CertificationAuditRepository {
  append(
    ctx: RepositoryContext,
    input: Omit<CertificationAuditRecord, "occurredAt"> & { occurredAt?: string },
  ): Promise<CertificationAuditRecord>;
  listByCertification(
    ctx: RepositoryContext,
    certificationRecordId: string,
    query?: ListQuery,
  ): Promise<PageResult<CertificationAuditRecord>>;
  get(ctx: RepositoryContext, id: string): Promise<CertificationAuditRecord | undefined>;
}

export interface CertificationHistoryRepository {
  append(
    ctx: RepositoryContext,
    input: Omit<CertificationHistoryRecord, "occurredAt"> & { occurredAt?: string },
  ): Promise<CertificationHistoryRecord>;
  listByCertification(
    ctx: RepositoryContext,
    certificationRecordId: string,
    query?: ListQuery,
  ): Promise<PageResult<CertificationHistoryRecord>>;
  get(ctx: RepositoryContext, id: string): Promise<CertificationHistoryRecord | undefined>;
}

export interface ReleaseAuditRepository {
  append(
    ctx: RepositoryContext,
    input: Omit<ReleaseAuditRecord, "occurredAt"> & { occurredAt?: string },
  ): Promise<ReleaseAuditRecord>;
  listByRelease(
    ctx: RepositoryContext,
    releaseId: string,
    query?: ListQuery,
  ): Promise<PageResult<ReleaseAuditRecord>>;
  get(ctx: RepositoryContext, id: string): Promise<ReleaseAuditRecord | undefined>;
}

export interface TestCaseVersionRepository {
  create(
    ctx: RepositoryContext,
    input: TestCaseVersionCreate,
  ): Promise<TestCaseVersionRecord>;
  get(ctx: RepositoryContext, id: string): Promise<TestCaseVersionRecord | undefined>;
  listByCase(
    ctx: RepositoryContext,
    caseId: string,
    query?: ListQuery,
  ): Promise<PageResult<TestCaseVersionRecord>>;
}

export interface TestPlanVersionRepository {
  create(
    ctx: RepositoryContext,
    input: TestPlanVersionCreate,
  ): Promise<TestPlanVersionRecord>;
  get(ctx: RepositoryContext, id: string): Promise<TestPlanVersionRecord | undefined>;
  listByPlan(
    ctx: RepositoryContext,
    planId: string,
    query?: ListQuery,
  ): Promise<PageResult<TestPlanVersionRecord>>;
}

export interface TestSuiteVersionRepository {
  create(
    ctx: RepositoryContext,
    input: TestSuiteVersionCreate,
  ): Promise<TestSuiteVersionRecord>;
  get(ctx: RepositoryContext, id: string): Promise<TestSuiteVersionRecord | undefined>;
  listBySuite(
    ctx: RepositoryContext,
    suiteId: string,
    query?: ListQuery,
  ): Promise<PageResult<TestSuiteVersionRecord>>;
}

export interface ApprovalHistoryRepository {
  append(
    ctx: RepositoryContext,
    input: Omit<ApprovalHistoryRecord, "occurredAt"> & { occurredAt?: string },
  ): Promise<ApprovalHistoryRecord>;
  listByApproval(
    ctx: RepositoryContext,
    approvalId: string,
    query?: ListQuery,
  ): Promise<PageResult<ApprovalHistoryRecord>>;
  get(ctx: RepositoryContext, id: string): Promise<ApprovalHistoryRecord | undefined>;
}

export interface AutomationImportHistoryRepository {
  append(
    ctx: RepositoryContext,
    input: Omit<AutomationImportHistoryRecord, "occurredAt" | "tenantId"> & {
      occurredAt?: string;
      tenantId?: string;
    },
  ): Promise<AutomationImportHistoryRecord>;
  listByImport(
    ctx: RepositoryContext,
    importId: string,
    query?: ListQuery,
  ): Promise<PageResult<AutomationImportHistoryRecord>>;
  list(
    ctx: RepositoryContext,
    query?: ListQuery,
  ): Promise<PageResult<AutomationImportHistoryRecord>>;
  get(
    ctx: RepositoryContext,
    id: string,
  ): Promise<AutomationImportHistoryRecord | undefined>;
}

export interface PipelineImportHistoryRepository {
  append(
    ctx: RepositoryContext,
    input: Omit<PipelineImportHistoryRecord, "occurredAt" | "tenantId"> & {
      occurredAt?: string;
      tenantId?: string;
    },
  ): Promise<PipelineImportHistoryRecord>;
  listByImport(
    ctx: RepositoryContext,
    importId: string,
    query?: ListQuery,
  ): Promise<PageResult<PipelineImportHistoryRecord>>;
  list(
    ctx: RepositoryContext,
    query?: ListQuery,
  ): Promise<PageResult<PipelineImportHistoryRecord>>;
  get(
    ctx: RepositoryContext,
    id: string,
  ): Promise<PipelineImportHistoryRecord | undefined>;
}

export interface TestingPersistence {
  readonly requirements: CrudRepository<
    RequirementCreate,
    RequirementUpdate,
    RequirementRecord
  >;
  readonly workItems: CrudRepository<WorkItemCreate, WorkItemUpdate, WorkItemRecord>;
  readonly risks: CrudRepository<RiskCreate, RiskUpdate, RiskRecord>;
  readonly testPlans: CrudRepository<TestPlanCreate, TestPlanUpdate, TestPlanRecord>;
  readonly testSuites: CrudRepository<
    TestSuiteCreate,
    TestSuiteUpdate,
    TestSuiteRecord
  >;
  readonly testCases: CrudRepository<TestCaseCreate, TestCaseUpdate, TestCaseRecord>;
  readonly testSteps: CrudRepository<TestStepCreate, TestStepUpdate, TestStepRecord>;
  readonly testCaseVersions: TestCaseVersionRepository;
  readonly testPlanVersions: TestPlanVersionRepository;
  readonly testSuiteVersions: TestSuiteVersionRepository;
  readonly regressionSets: CrudRepository<
    RegressionSetCreate,
    RegressionSetUpdate,
    RegressionSetRecord
  >;
  readonly executionSessions: CrudRepository<
    ExecutionSessionCreate,
    ExecutionSessionUpdate,
    ExecutionSessionRecord
  >;
  readonly manualExecutions: CrudRepository<
    ManualExecutionCreate,
    ManualExecutionUpdate,
    ManualExecutionRecord
  >;
  readonly executionHistory: ExecutionHistoryRepository;
  readonly evidence: CrudRepository<EvidenceCreate, EvidenceUpdate, EvidenceRecord>;
  readonly approvals: CrudRepository<ApprovalCreate, ApprovalUpdate, ApprovalRecord>;
  readonly approvalHistory: ApprovalHistoryRepository;
  readonly certificationRecords: CrudRepository<
    CertificationCreate,
    CertificationUpdate,
    CertificationRecordRecord
  >;
  readonly certificationGateDefinitions: CrudRepository<
    CertificationGateDefinitionCreate,
    CertificationGateDefinitionUpdate,
    CertificationGateDefinitionRecord
  >;
  readonly certificationGateEvaluations: CrudRepository<
    CertificationGateEvaluationCreate,
    CertificationGateEvaluationUpdate,
    CertificationGateEvaluationRecord
  >;
  readonly certificationRules: CrudRepository<
    CertificationRuleCreate,
    CertificationRuleUpdate,
    CertificationRuleRecord
  >;
  readonly certificationAudits: CertificationAuditRepository;
  readonly certificationHistory: CertificationHistoryRepository;
  readonly releaseReadiness: CrudRepository<
    ReleaseReadinessCreate,
    ReleaseReadinessUpdate,
    ReleaseReadinessRecord
  >;
  readonly releases: CrudRepository<ReleaseCreate, ReleaseUpdate, ReleaseRecord>;
  readonly releaseScopes: CrudRepository<
    ReleaseScopeCreate,
    ReleaseScopeUpdate,
    ReleaseScopeRecord
  >;
  readonly releasePackages: CrudRepository<
    ReleasePackageCreate,
    ReleasePackageUpdate,
    ReleasePackageRecord
  >;
  readonly releaseCandidates: CrudRepository<
    ReleaseCandidateCreate,
    ReleaseCandidateUpdate,
    ReleaseCandidateRecord
  >;
  readonly releaseApprovals: CrudRepository<
    ReleaseApprovalCreate,
    ReleaseApprovalUpdate,
    ReleaseApprovalRecord
  >;
  readonly releaseDecisions: CrudRepository<
    ReleaseDecisionCreate,
    ReleaseDecisionUpdate,
    ReleaseDecisionRecord
  >;
  readonly releaseEvidence: CrudRepository<
    ReleaseEvidenceCreate,
    ReleaseEvidenceUpdate,
    ReleaseEvidenceRecord
  >;
  readonly releaseDependencies: CrudRepository<
    ReleaseDependencyCreate,
    ReleaseDependencyUpdate,
    ReleaseDependencyRecord
  >;
  readonly releaseNotes: CrudRepository<
    ReleaseNoteCreate,
    ReleaseNoteUpdate,
    ReleaseNoteRecord
  >;
  readonly releaseRiskAssessments: CrudRepository<
    ReleaseRiskAssessmentCreate,
    ReleaseRiskAssessmentUpdate,
    ReleaseRiskAssessmentRecord
  >;
  readonly releaseReadinessSnapshots: CrudRepository<
    ReleaseReadinessSnapshotCreate,
    ReleaseReadinessSnapshotUpdate,
    ReleaseReadinessSnapshotRecord
  >;
  readonly releaseSummarySnapshots: CrudRepository<
    ReleaseSummarySnapshotCreate,
    ReleaseSummarySnapshotUpdate,
    ReleaseSummarySnapshotRecord
  >;
  readonly releaseAudits: ReleaseAuditRepository;
  readonly coverageRecords: CrudRepository<
    CoverageCreate,
    CoverageUpdate,
    CoverageRecord
  >;
  readonly defectLinks: CrudRepository<
    DefectLinkCreate,
    DefectLinkUpdate,
    DefectLinkRecord
  >;
  readonly qualitySnapshots: CrudRepository<
    QualitySnapshotCreate,
    QualitySnapshotUpdate,
    QualitySnapshotRecord
  >;
  readonly regressionAnalyses: CrudRepository<
    RegressionAnalysisCreate,
    RegressionAnalysisUpdate,
    RegressionAnalysisRecord
  >;
  readonly automationDefinitions: CrudRepository<
    AutomationDefinitionCreate,
    AutomationDefinitionUpdate,
    AutomationDefinitionRecord
  >;
  readonly automationImports: CrudRepository<
    AutomationImportCreate,
    AutomationImportUpdate,
    AutomationImportRecord
  >;
  readonly automatedExecutions: CrudRepository<
    AutomatedExecutionCreate,
    AutomatedExecutionUpdate,
    AutomatedExecutionRecord
  >;
  readonly automationRuns: CrudRepository<
    AutomationRunCreate,
    AutomationRunUpdate,
    AutomationRunRecord
  >;
  readonly automationResultItems: CrudRepository<
    AutomationResultItemCreate,
    AutomationResultItemUpdate,
    AutomationResultItemRecord
  >;
  readonly automationImportHistory: AutomationImportHistoryRepository;
  readonly automationCoverageSnapshots: CrudRepository<
    AutomationCoverageSnapshotCreate,
    AutomationCoverageSnapshotUpdate,
    AutomationCoverageSnapshotRecord
  >;
  readonly pipelines: CrudRepository<PipelineCreate, PipelineUpdate, PipelineRecord>;
  readonly pipelineImports: CrudRepository<
    PipelineImportCreate,
    PipelineImportUpdate,
    PipelineImportRecord
  >;
  readonly pipelineRuns: CrudRepository<
    PipelineRunCreate,
    PipelineRunUpdate,
    PipelineRunRecord
  >;
  readonly pipelineImportHistory: PipelineImportHistoryRepository;
  readonly engineeringSnapshots: CrudRepository<
    EngineeringSnapshotCreate,
    EngineeringSnapshotUpdate,
    EngineeringSnapshotRecord
  >;
  readonly engineeringHistoricalSnapshots: CrudRepository<
    EngineeringHistoricalSnapshotCreate,
    EngineeringHistoricalSnapshotUpdate,
    EngineeringHistoricalSnapshotRecord
  >;
  readonly engineeringTrendSeries: CrudRepository<
    EngineeringTrendSeriesCreate,
    EngineeringTrendSeriesUpdate,
    EngineeringTrendSeriesRecord
  >;
  readonly engineeringBenchmarks: CrudRepository<
    EngineeringBenchmarkCreate,
    EngineeringBenchmarkUpdate,
    EngineeringBenchmarkRecord
  >;
  readonly engineeringBaselines: CrudRepository<
    EngineeringBaselineCreate,
    EngineeringBaselineUpdate,
    EngineeringBaselineRecord
  >;
  readonly engineeringQualitySummaries: CrudRepository<
    EngineeringQualitySummaryCreate,
    EngineeringQualitySummaryUpdate,
    EngineeringQualitySummaryRecord
  >;
  readonly reportTemplates: CrudRepository<
    ReportTemplateCreate,
    ReportTemplateUpdate,
    ReportTemplateRecord
  >;
  readonly reportGenerationMetadata: CrudRepository<
    ReportGenerationMetadataCreate,
    ReportGenerationMetadataUpdate,
    ReportGenerationMetadataRecord
  >;
  readonly traceabilityLinks: CrudRepository<
    TraceabilityLinkCreate,
    TraceabilityLinkUpdate,
    TraceabilityLinkRecord
  >;
  readonly auditRecords: AuditRecordRepository;
  readonly configurations: CrudRepository<
    ConfigurationCreate,
    ConfigurationUpdate,
    ConfigurationRecord
  >;
  readonly registryEntries: CrudRepository<
    RegistryEntryCreate,
    RegistryEntryUpdate,
    RegistryEntryRecord
  >;
  runInTransaction<T>(fn: (persistence: TestingPersistence) => Promise<T>): Promise<T>;
}
