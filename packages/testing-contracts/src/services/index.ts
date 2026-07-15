export type { TestingService } from "./testing-service";
export type { CertificationService } from "./certification-service";
export type {
  CertificationEngineRecordService,
  CertificationWorkflowService,
  CertificationRuleService,
  CertificationGateService,
  CertificationEvidenceService,
  CertificationApprovalService,
  CertificationAuditService,
  CertificationHistoryService,
  CertificationValidationService,
  CertificationRecommendationService,
} from "./certification-engine-service";
export type { EvidenceService } from "./evidence-service";
export type { TraceabilityService } from "./traceability-service";
export type { ExecutionService } from "./execution-service";
export type { AutomationService } from "./automation-service";
export type { CoverageService } from "./coverage-service";
export type { ApprovalService } from "./approval-service";
export type {
  ReportingService,
  GenerateReportInput,
  PreviewReportInput,
  ValidateReportInput,
  RegisterTemplateInput,
  RenderReportInput,
} from "./reporting-service";
export type {
  ReportDescriptor,
  ReportSection,
  ReportType,
  ReportOutputFormat,
  ReportBlock,
  ReportTemplate,
  ReportParameters,
  ReportRequest,
  ReportValidationResult,
  CanonicalReportDocument,
  RenderedReportOutput,
  ReportGenerationMetadata,
  ReportGenerationResult,
  TemplateSectionDefinition,
  TemplateBlockDefinition,
  ReportBranding,
} from "../domain/reporting";
export { REPORT_TYPES, REPORT_OUTPUT_FORMATS } from "../domain/reporting";
export type { DashboardService } from "./dashboard-service";
export type { RequirementService } from "./requirement-service";
export type { TestPlanService } from "./test-plan-service";
export type { TestSuiteService } from "./test-suite-service";
export type { TestCaseService } from "./test-case-service";
export type { ManualExecutionService, ManualExecutionCreateInput } from "./manual-execution-service";
export type { RegressionService } from "./regression-service";
export type { RiskService } from "./risk-service";
export type { CertificationPreparationService } from "./certification-preparation-service";
export type { ReleaseReadinessService } from "./release-readiness-service";
export type {
  DefectLinkService,
  DefectLinkCreateInput,
  DefectLinkUpdateInput,
} from "./defect-link-service";
export type { QualityIntelligenceService } from "./quality-intelligence-service";
export type { QualityTrendService } from "./quality-trend-service";
export type { RegressionAnalysisService } from "./regression-analysis-service";
export type { CertificationReadinessService } from "./certification-readiness-service";
export type { RiskAggregationService } from "./risk-aggregation-service";
export type { QualitySummaryService } from "./quality-summary-service";
export type {
  AutomationAdapterRegistry,
  AutomationNormalizationService,
  AutomationValidationService,
  AutomationImportInput,
  AutomationImportOutcome,
  AutomationImportService,
  AutomationResultService,
  AutomationEvidenceService,
  AutomationTraceabilityLinkInput,
  AutomationTraceabilityService,
  AutomationHistoryService,
  AutomationCoverageService,
  AutomationCertificationPreparationService,
} from "./automation-ingestion-service";
export type {
  ProductRegistryUpsertInput,
  ProductRegistryService,
  ProductDependencyCreateInput,
  DependencyGraphService,
  PlatformQualityAggregationInput,
  PlatformQualityAggregationService,
  MultiProductCertificationInput,
  MultiProductCertificationService,
  ProductHealthService,
  PlatformDashboardService,
  PlatformTraceabilityService,
  PlatformReleaseCreateInput,
  PlatformReleaseGovernanceService,
  PlatformQualityDomainServices,
} from "./platform-quality-service";
export type {
  ReleaseGovernanceService,
  ReleaseCreateInput,
  ReleaseMetadataUpdateInput,
  ReleaseScopeAddInput,
  ReleaseEvidenceAttachInput,
  ReleasePackageCreateInput,
  ReleaseCandidateCreateInput,
  ReleaseNoteCreateInput,
  ReleaseDependencyCreateInput,
  ReleaseApprovalRequestInput,
  ReleaseApprovalDecideInput,
} from "./release-governance-service";
export type {
  PipelineAdapterRegistry,
  PipelineNormalizationService,
  PipelineValidationService,
  PipelineRegisterInput,
  PipelineUpdateInput,
  PipelineImportInput,
  PipelineImportOutcome,
  PipelineSynchroniseMetadataInput,
  PipelineExecutionSummaryInput,
  PipelineImportService,
} from "./pipeline-service";
export type {
  EngineeringAggregationService,
  QualityScoringService,
  EngineeringHealthService,
  TrendEngineService,
  BenchmarkService,
  BaselineService,
  HistoricalSnapshotService,
  EngineeringRiskService,
  EngineeringIntelligenceService,
} from "./engineering-intelligence-service";
export {
  TESTING_SERVICE_IDS,
  MANUAL_TESTING_SERVICE_IDS,
  AUTOMATION_INGESTION_SERVICE_IDS,
  QUALITY_INTELLIGENCE_SERVICE_IDS,
  CERTIFICATION_ENGINE_SERVICE_IDS,
  PLATFORM_QUALITY_SERVICE_IDS,
  RELEASE_GOVERNANCE_SERVICE_IDS,
  PIPELINE_SERVICE_IDS,
  CICD_SERVICE_IDS,
  ENGINEERING_INTELLIGENCE_SERVICE_IDS,
  REPORTING_FRAMEWORK_SERVICE_IDS,
} from "./ids";
export type {
  TestingServiceId,
  ManualTestingServiceId,
  AutomationIngestionServiceId,
  QualityIntelligenceServiceId,
  CertificationEngineServiceId,
  PlatformQualityServiceId,
  ReleaseGovernanceServiceId,
  PipelineServiceId,
  CicdServiceId,
  EngineeringIntelligenceServiceId,
  ReportingFrameworkServiceId,
} from "./ids";
