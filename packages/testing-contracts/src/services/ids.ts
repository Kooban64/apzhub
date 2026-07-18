export const TESTING_SERVICE_IDS = [
  "testing-service",
  "certification-service",
  "evidence-service",
  "traceability-service",
  "execution-service",
  "automation-service",
  "coverage-service",
  "approval-service",
  "reporting-service",
  "dashboard-service",
] as const;

export type TestingServiceId = (typeof TESTING_SERVICE_IDS)[number];

/** Named manual testing domain services delivered in APZTCMS-004. */
export const MANUAL_TESTING_SERVICE_IDS = [
  "requirement-service",
  "test-plan-service",
  "test-suite-service",
  "test-case-service",
  "manual-execution-service",
  "evidence-service",
  "approval-service",
  "traceability-service",
  "regression-service",
  "risk-service",
  "certification-preparation-service",
  "release-readiness-service",
] as const;

export type ManualTestingServiceId = (typeof MANUAL_TESTING_SERVICE_IDS)[number];

/** Automation result ingestion services (APZTCMS-007). */
export const AUTOMATION_INGESTION_SERVICE_IDS = [
  "automation-adapter-registry",
  "automation-normalization-service",
  "automation-validation-service",
  "automation-import-service",
  "automation-result-service",
  "automation-evidence-service",
  "automation-traceability-service",
  "automation-history-service",
  "automation-coverage-service",
  "automation-certification-preparation-service",
] as const;

export type AutomationIngestionServiceId =
  (typeof AUTOMATION_INGESTION_SERVICE_IDS)[number];

/** Quality intelligence domain services (APZTCMS-008). */
export const QUALITY_INTELLIGENCE_SERVICE_IDS = [
  "defect-link-service",
  "coverage-service",
  "quality-intelligence-service",
  "quality-trend-service",
  "regression-analysis-service",
  "release-readiness-service",
  "certification-readiness-service",
  "risk-aggregation-service",
  "quality-summary-service",
] as const;

export type QualityIntelligenceServiceId =
  (typeof QUALITY_INTELLIGENCE_SERVICE_IDS)[number];

/** Certification engine domain services (APZTCMS-009). */
export const CERTIFICATION_ENGINE_SERVICE_IDS = [
  "certification-service",
  "certification-workflow-service",
  "certification-rule-service",
  "certification-gate-service",
  "certification-evidence-service",
  "certification-approval-service",
  "certification-audit-service",
  "certification-history-service",
  "certification-validation-service",
  "certification-recommendation-service",
] as const;

export type CertificationEngineServiceId =
  (typeof CERTIFICATION_ENGINE_SERVICE_IDS)[number];

/** Platform Quality Integration Layer services (APZTCMS-014). */
export const PLATFORM_QUALITY_SERVICE_IDS = [
  "product-registry-service",
  "dependency-graph-service",
  "platform-quality-aggregation-service",
  "multi-product-certification-service",
  "product-health-service",
  "platform-dashboard-service",
  "platform-traceability-service",
  "platform-release-governance-service",
] as const;

export type PlatformQualityServiceId = (typeof PLATFORM_QUALITY_SERVICE_IDS)[number];

/** TCMS-only Release & Quality Governance services (APZTCMS-014). */
export const RELEASE_GOVERNANCE_SERVICE_IDS = ["release-governance-service"] as const;

export type ReleaseGovernanceServiceId =
  (typeof RELEASE_GOVERNANCE_SERVICE_IDS)[number];

/** External CI/CD pipeline ingestion services (APZTCMS-015). */
export const PIPELINE_SERVICE_IDS = [
  "pipeline-adapter-registry",
  "pipeline-normalization-service",
  "pipeline-validation-service",
  "pipeline-import-service",
] as const;

export type PipelineServiceId = (typeof PIPELINE_SERVICE_IDS)[number];

/** Alias for PIPELINE_SERVICE_IDS (CICD naming). */
export const CICD_SERVICE_IDS = PIPELINE_SERVICE_IDS;

export type CicdServiceId = PipelineServiceId;

/** Engineering intelligence domain services (APZTCMS-021). */
export const ENGINEERING_INTELLIGENCE_SERVICE_IDS = [
  "engineering-aggregation-service",
  "quality-scoring-service",
  "engineering-health-service",
  "trend-engine-service",
  "benchmark-service",
  "baseline-service",
  "historical-snapshot-service",
  "engineering-risk-service",
  "engineering-intelligence-service",
] as const;

export type EngineeringIntelligenceServiceId =
  (typeof ENGINEERING_INTELLIGENCE_SERVICE_IDS)[number];

/** Reporting framework services (APZTCMS-024). */
export const REPORTING_FRAMEWORK_SERVICE_IDS = [
  "reporting-service",
  "report-template-service",
  "report-render-service",
] as const;

export type ReportingFrameworkServiceId =
  (typeof REPORTING_FRAMEWORK_SERVICE_IDS)[number];
