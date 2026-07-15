export const TESTING_SERVICES_VERSION = "0.11.0";

export {
  createManualTestingServices,
  createTestingDomainServices,
  createAutomationIngestionServices,
  createQualityIntelligenceServices,
  createCertificationEngineServices,
  createPlatformQualityDomainServices,
  createReleaseGovernanceServices,
  createPipelineIngestionServices,
  createEngineeringIntelligenceServices,
  createReportingFrameworkServices,
  type ManualTestingServices,
  type TestingDomainServices,
  type AutomationIngestionServices,
  type QualityIntelligenceServices,
  type CertificationEngineServices,
  type PlatformQualityDomainServices,
  type PlatformQualityServiceDeps,
  type ReleaseGovernanceServices,
  type PipelineIngestionServices,
  type EngineeringIntelligenceServices,
  type ReportingFrameworkServices,
} from "./factory";

export {
  createPlatformQualityStore,
  DEFAULT_PRODUCTS,
  worstQualityStatus,
  qualityStatusToReadiness,
  combineReadinessVerdicts,
  type PlatformQualityStore,
  type DefaultGovernedProductSpec,
} from "./platform-quality";

export type {
  ManualTestingServiceDeps,
  ServiceRuntime,
  Clock,
  IdGenerator,
} from "./services/types";

export { DomainEventCollector } from "./events";
export { toRepositoryContext } from "./mapping";

export {
  DomainRuleError,
  canTransitionTestStatus,
  assertTestStatusTransition,
  canTransitionExecutionStatus,
  assertExecutionStatusTransition,
  nextStatusAfterCancel,
  isTerminalExecutionStatus,
  isCompletedLikeExecutionStatus,
  canTransitionEvidenceLifecycle,
  assertEvidenceLifecycleTransition,
} from "./lifecycle";

export {
  createInMemoryEvidenceStorageProvider,
  createUnimplementedObjectStorageProvider,
} from "./storage";

export { computeOverallResultFromSteps } from "./services/manual-execution-service";

export {
  assertNonEmpty,
  assertValidTestStatus,
  assertValidPriority,
  assertValidTestResultStatus,
  assertValidLikelihood,
  assertValidCaseVersionReason,
  assertValidExecutionApprovalState,
  assertTraceabilityKinds,
  assertNoSelfLink,
  assertApprovalDecisionAllowed,
  assertOwnershipId,
  assertVersionBump,
  isKnownTraceabilityKind,
} from "./validation";

export {
  createAutomationAdapterRegistry,
  createVitestAdapter,
  createPlaywrightReportAdapter,
  createJunitXmlAdapter,
  createGenericJsonAdapter,
  createGenericTapAdapter,
  createAllureMetadataAdapter,
  createAutomationNormalizationService,
  fingerprintPayload,
} from "./automation";

export {
  createPipelineAdapterRegistry,
  createGenericCiAdapter,
  createPipelineNormalizationService,
  fingerprintPipelinePayload,
} from "./pipelines";

export {
  safePercent,
  coveragePercentage,
  computeOpenDefectImpact,
  computeDefectDensity,
  analyzeRegressionByCaseKey,
  overallReadinessScore,
  assertCoverageIntegrity,
  assertDefectCreateInput,
  assertRegressionInputs,
  assertReleaseCalculationInputs,
} from "./quality";

export {
  canTransitionCertificationStatus,
  assertCertificationTransition,
  isTerminalCertificationStatus,
  isApprovedLikeCertificationStatus,
  certificationTransitionsFrom,
  evaluateCertificationGate,
  mapGateOutcomesToRecommendation,
  recommendFromGateOutcomes,
  emptyEvidenceLinks,
  mergeEvidenceLinks,
  evidenceLinksFromJson,
  assertHasPermission,
  assertTenantOrganisationMatch,
  FORBIDDEN_CERTIFICATION_AUTOMATION_TOKENS,
} from "./certification";

export {
  canTransitionReleaseGovernanceStatus,
  assertReleaseGovernanceTransition,
  releaseGovernanceTransitionsFrom,
  evaluateReleaseReadiness,
  evaluateReleaseRisk,
  assertHasReleasePermission,
  createReleaseGovernanceService,
} from "./release-governance";

export {
  computeQualityScore,
  computeTrendDirection,
  computeTrendDelta,
  rollingAverage,
  healthStatusFromScore,
  riskLevelFromScore,
  aggregateRisk,
  normalizeWeights,
  clamp01to100,
  invertPenalty,
} from "./engineering-intelligence";

export {
  createReportingService,
  BUILTIN_REPORT_TEMPLATES,
  getBuiltinTemplate,
  listBuiltinTemplates,
  defaultTemplateIdFor,
  bindTemplateToDocument,
  validateTemplateBinding,
  sha256Hex,
  renderOutput,
  ReportingDomainError,
} from "./reporting";
