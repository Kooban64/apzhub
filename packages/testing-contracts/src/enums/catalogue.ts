/** APZ TCMS domain enumerations — aligned to Domain Model / ADR certification states. */

/**
 * Canonical manual execution lifecycle statuses.
 * Path: draft → assigned → ready → in_progress → … → approved/rejected → archived.
 */
export const EXECUTION_LIFECYCLE_STATUSES = [
  "draft",
  "assigned",
  "ready",
  "in_progress",
  "paused",
  "blocked",
  "completed",
  "under_review",
  "approved",
  "rejected",
  "cancelled",
  "archived",
] as const;
export type ExecutionLifecycleStatus = (typeof EXECUTION_LIFECYCLE_STATUSES)[number];

/**
 * All persisted execution statuses — canonical + legacy aliases for backward compatibility.
 * Prefer canonical statuses for new work; use `canonicalizeExecutionStatus` for comparisons.
 */
export const EXECUTION_STATUSES = [
  ...EXECUTION_LIFECYCLE_STATUSES,
  "planned",
  "queued",
  "aborted",
  "failed",
] as const;
export type ExecutionStatus = (typeof EXECUTION_STATUSES)[number];

/** Evidence lifecycle — pending → captured → submitted → verified/rejected → approved → archived. */
export const EVIDENCE_LIFECYCLE_STATUSES = [
  "pending",
  "captured",
  "submitted",
  "verified",
  "rejected",
  "approved",
  "archived",
] as const;
export type EvidenceLifecycleStatus = (typeof EVIDENCE_LIFECYCLE_STATUSES)[number];

/**
 * Test asset lifecycle statuses.
 * `ready` is retained for backward compatibility; prefer `approved` for new work.
 * Lifecycle path: draft → review → approved → deprecated → archived.
 */
export const TEST_STATUSES = [
  "draft",
  "review",
  "ready",
  "approved",
  "deprecated",
  "archived",
] as const;
export type TestStatus = (typeof TEST_STATUSES)[number];

/** Canonical case lifecycle statuses (excludes legacy `ready`). */
export const TEST_CASE_LIFECYCLE_STATUSES = [
  "draft",
  "review",
  "approved",
  "deprecated",
  "archived",
] as const;
export type TestCaseLifecycleStatus = (typeof TEST_CASE_LIFECYCLE_STATUSES)[number];

export const TEST_RESULT_STATUSES = [
  "pass",
  "fail",
  "blocked",
  "skipped",
  "retest",
  "not_executed",
] as const;
export type TestResultStatus = (typeof TEST_RESULT_STATUSES)[number];

export const TEST_RUN_STATUSES = [
  "planned",
  "in_progress",
  "completed",
  "aborted",
] as const;
export type TestRunStatus = (typeof TEST_RUN_STATUSES)[number];

export const EVIDENCE_TYPES = [
  "screenshot",
  "log",
  "video",
  "trace",
  "report",
  "note",
  "attachment",
  "url",
  "other",
] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

/**
 * Canonical certification workflow lifecycle statuses (APZTCMS-009).
 * Path: draft → preparing → … → approved/conditionally_approved/rejected → expired/archived.
 */
export const CERTIFICATION_LIFECYCLE_STATUSES = [
  "draft",
  "preparing",
  "awaiting_evidence",
  "awaiting_review",
  "in_review",
  "changes_required",
  "awaiting_approval",
  "approved",
  "conditionally_approved",
  "rejected",
  "expired",
  "archived",
] as const;
export type CertificationLifecycleStatus =
  (typeof CERTIFICATION_LIFECYCLE_STATUSES)[number];

/**
 * All persisted certification statuses — canonical + legacy aliases.
 * Prefer canonical statuses for new work; use `canonicalizeCertificationStatus`.
 */
export const CERTIFICATION_STATUSES = [
  ...CERTIFICATION_LIFECYCLE_STATUSES,
  "development_ready",
  "qa_ready",
  "regression_ready",
  "uat_ready",
  "production_ready",
  "certified",
  "failed_certification",
  "conditional_approval",
] as const;
export type CertificationStatus = (typeof CERTIFICATION_STATUSES)[number];

export const CERTIFICATION_STATUS_LABELS: Readonly<
  Record<CertificationStatus, string>
> = {
  draft: "Draft",
  preparing: "Preparing",
  awaiting_evidence: "Awaiting Evidence",
  awaiting_review: "Awaiting Review",
  in_review: "In Review",
  changes_required: "Changes Required",
  awaiting_approval: "Awaiting Approval",
  approved: "Approved",
  conditionally_approved: "Conditionally Approved",
  rejected: "Rejected",
  expired: "Expired",
  archived: "Archived",
  development_ready: "Development Ready",
  qa_ready: "QA Ready",
  regression_ready: "Regression Ready",
  uat_ready: "UAT Ready",
  production_ready: "Production Ready",
  certified: "Certified",
  failed_certification: "Failed Certification",
  conditional_approval: "Conditional Approval",
};

/** Gate evaluation outcomes for certification gates (APZTCMS-009). */
export const CERTIFICATION_GATE_OUTCOMES = [
  "pass",
  "fail",
  "warning",
  "not_applicable",
  "unknown",
  "pending",
] as const;
export type CertificationGateOutcome =
  (typeof CERTIFICATION_GATE_OUTCOMES)[number];

/** Built-in certification gate keys — custom keys are also allowed. */
export const CERTIFICATION_GATE_KEYS = [
  "execution_complete",
  "coverage_threshold",
  "evidence_complete",
  "manual_testing_complete",
  "automation_complete",
  "approvals_complete",
  "no_critical_defects",
  "risk_accepted",
  "compliance_complete",
  "documentation_complete",
] as const;
export type CertificationGateKey = (typeof CERTIFICATION_GATE_KEYS)[number];

/** Advisory recommendation codes — never authorize approval. */
export const CERTIFICATION_RECOMMENDATION_CODES = [
  "ready_for_review",
  "ready_for_approval",
  "conditionally_ready",
  "not_ready",
  "blocked",
] as const;
export type CertificationRecommendationCode =
  (typeof CERTIFICATION_RECOMMENDATION_CODES)[number];

export const APPROVAL_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "withdrawn",
  "conditional",
  "rework",
] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const APPROVAL_ROLES = ["author", "reviewer", "approver"] as const;
export type ApprovalRole = (typeof APPROVAL_ROLES)[number];

export const SEVERITIES = ["info", "minor", "major", "critical", "blocker"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const PRIORITIES = ["low", "medium", "high", "critical"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const RISK_LEVELS = ["low", "medium", "high", "critical"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const LIKELIHOODS = ["rare", "unlikely", "possible", "likely", "almost_certain"] as const;
export type Likelihood = (typeof LIKELIHOODS)[number];

export const IMPACTS = ["negligible", "minor", "moderate", "major", "severe"] as const;
export type Impact = (typeof IMPACTS)[number];

export const BUSINESS_CRITICALITIES = [
  "low",
  "medium",
  "high",
  "mission_critical",
] as const;
export type BusinessCriticality = (typeof BUSINESS_CRITICALITIES)[number];

export const REGRESSION_IMPORTANCES = [
  "none",
  "low",
  "medium",
  "high",
  "mandatory",
] as const;
export type RegressionImportance = (typeof REGRESSION_IMPORTANCES)[number];

export const CASE_VERSION_REASONS = [
  "created",
  "edited",
  "cloned",
  "status_change",
  "template_applied",
  "rework",
  "manual_version",
] as const;
export type CaseVersionReason = (typeof CASE_VERSION_REASONS)[number];

export const AUTOMATION_TYPES = [
  "unit",
  "integration",
  "e2e",
  "api",
  "performance",
  "security",
  "accessibility",
  "other",
] as const;
export type AutomationType = (typeof AUTOMATION_TYPES)[number];

export const EXECUTION_TYPES = ["manual", "automated", "hybrid"] as const;
export type ExecutionType = (typeof EXECUTION_TYPES)[number];

export const TRACEABILITY_LINK_TYPES = [
  "covers",
  "verifies",
  "related",
  "blocks",
  "derived_from",
] as const;
export type TraceabilityLinkType = (typeof TRACEABILITY_LINK_TYPES)[number];

/** Entity kinds allowed in bidirectional traceability chains. */
export const TRACEABILITY_ENTITY_KINDS = [
  "requirement",
  "feature",
  "story",
  "task",
  "epic",
  "test_plan",
  "test_suite",
  "test_case",
  "manual_execution",
  "automated_execution",
  "automation_import",
  "automation_run",
  "evidence",
  "certification",
  "release",
  "defect",
  "risk",
  "work_item",
] as const;
export type TraceabilityEntityKind = (typeof TRACEABILITY_ENTITY_KINDS)[number];

export const QUALITY_GATE_STATUSES = [
  "pending",
  "passed",
  "failed",
  "waived",
  "not_applicable",
] as const;
export type QualityGateStatus = (typeof QUALITY_GATE_STATUSES)[number];

export const AUTOMATION_JOB_STATUSES = [
  "queued",
  "running",
  "succeeded",
  "failed",
  "cancelled",
] as const;
export type AutomationJobStatus = (typeof AUTOMATION_JOB_STATUSES)[number];

/** Result-ingestion adapters — parse only; never execute tests. */
export const AUTOMATION_ADAPTER_KINDS = [
  "vitest",
  "playwright",
  "junit_xml",
  "generic_json",
  "generic_tap",
  "allure_metadata",
] as const;
export type AutomationAdapterKind = (typeof AUTOMATION_ADAPTER_KINDS)[number];

/** Lifecycle of an automation result import batch. */
export const AUTOMATION_IMPORT_STATUSES = [
  "pending",
  "validating",
  "importing",
  "completed",
  "failed",
  "duplicate",
  "corrected",
] as const;
export type AutomationImportStatus = (typeof AUTOMATION_IMPORT_STATUSES)[number];

/**
 * Canonical normalized result statuses for imported automation cases/steps.
 * Unknown provider states map safely to `unknown`.
 */
export const NORMALIZED_RESULT_STATUSES = [
  "pass",
  "fail",
  "skipped",
  "blocked",
  "timed_out",
  "cancelled",
  "errored",
  "unknown",
] as const;
export type NormalizedResultStatus = (typeof NORMALIZED_RESULT_STATUSES)[number];

export const RELEASE_READINESS_STATUSES = [
  "not_ready",
  "partially_ready",
  "ready",
  "blocked",
] as const;
export type ReleaseReadinessStatus = (typeof RELEASE_READINESS_STATUSES)[number];

/** Canonical APZHUB products in the Platform Product Registry (APZTCMS-014). */
export const PLATFORM_PRODUCT_KEYS = [
  "projects",
  "support",
  "testing",
  "identity",
  "documents",
  "analytics",
  "workflow",
  "administration",
] as const;
export type PlatformProductKey = (typeof PLATFORM_PRODUCT_KEYS)[number];

export const PLATFORM_QUALITY_STATUSES = [
  "healthy",
  "degraded",
  "at_risk",
  "blocked",
  "unknown",
] as const;
export type PlatformQualityStatus = (typeof PLATFORM_QUALITY_STATUSES)[number];

/** Platform release readiness verdicts (governance aggregate). */
export const PLATFORM_RELEASE_READINESS_VERDICTS = [
  "READY",
  "READY_WITH_WARNINGS",
  "NOT_READY",
] as const;
export type PlatformReleaseReadinessVerdict =
  (typeof PLATFORM_RELEASE_READINESS_VERDICTS)[number];

export const DEPENDENCY_RELATION_KINDS = [
  "upstream",
  "downstream",
] as const;
export type DependencyRelationKind = (typeof DEPENDENCY_RELATION_KINDS)[number];

export const DEPENDENCY_REQUIREMENT_KINDS = [
  "required",
  "optional",
] as const;
export type DependencyRequirementKind =
  (typeof DEPENDENCY_REQUIREMENT_KINDS)[number];

export const PLATFORM_RELEASE_LIFECYCLE_STATUSES = [
  "draft",
  "scoping",
  "candidate",
  "in_review",
  "approved",
  "rejected",
  "released",
  "withdrawn",
  "archived",
] as const;
export type PlatformReleaseLifecycleStatus =
  (typeof PLATFORM_RELEASE_LIFECYCLE_STATUSES)[number];

export const PLATFORM_GOVERNANCE_APPROVAL_KINDS = [
  "technical",
  "qa",
  "business",
  "security",
  "executive",
] as const;
export type PlatformGovernanceApprovalKind =
  (typeof PLATFORM_GOVERNANCE_APPROVAL_KINDS)[number];

/**
 * TCMS-only release governance lifecycle (APZTCMS-014).
 * Path: draft → planning → ready_for_review → ready_for_approval →
 * approved | conditionally_approved | rejected → withdrawn | superseded | archived.
 */
export const RELEASE_GOVERNANCE_STATUSES = [
  "draft",
  "planning",
  "ready_for_review",
  "ready_for_approval",
  "approved",
  "conditionally_approved",
  "rejected",
  "withdrawn",
  "superseded",
  "archived",
] as const;
export type ReleaseGovernanceStatus =
  (typeof RELEASE_GOVERNANCE_STATUSES)[number];

export const RELEASE_APPROVAL_STAGE_KINDS = [
  "technical",
  "qa",
  "business",
  "security",
  "executive",
] as const;
export type ReleaseApprovalStageKind =
  (typeof RELEASE_APPROVAL_STAGE_KINDS)[number];

export const RELEASE_ADVISORY_VERDICTS = [
  "READY",
  "READY_WITH_WARNINGS",
  "NOT_READY",
] as const;
export type ReleaseAdvisoryVerdict = (typeof RELEASE_ADVISORY_VERDICTS)[number];

export const RELEASE_SCOPE_KINDS = [
  "plan",
  "suite",
  "case",
  "execution",
  "requirement",
  "certification",
  "evidence",
  "coverage",
  "defect",
  "risk",
  "automation",
  "pipeline",
  "other",
] as const;
export type ReleaseScopeKind = (typeof RELEASE_SCOPE_KINDS)[number];

/** External CI/CD provider kinds — only `generic_ci` is implemented in APZTCMS-015. */
export const PIPELINE_PROVIDER_KINDS = [
  "generic_ci",
  "github_actions",
  "gitlab_ci",
  "azure_devops",
  "jenkins",
  "circleci",
  "buildkite",
] as const;
export type PipelineProviderKind = (typeof PIPELINE_PROVIDER_KINDS)[number];

/** Canonical pipeline / run status values. */
export const PIPELINE_RUN_STATUSES = [
  "queued",
  "running",
  "passed",
  "failed",
  "cancelled",
  "skipped",
  "timed_out",
  "unknown",
] as const;
export type PipelineRunStatus = (typeof PIPELINE_RUN_STATUSES)[number];

/** Lifecycle of a pipeline import batch. */
export const PIPELINE_IMPORT_STATUSES = [
  "pending",
  "validating",
  "importing",
  "completed",
  "failed",
  "duplicate",
  "corrected",
] as const;
export type PipelineImportStatus = (typeof PIPELINE_IMPORT_STATUSES)[number];

/** Internal pipeline event kinds (domain records — not Event Bus). */
export const PIPELINE_EVENT_KINDS = [
  "queued",
  "running",
  "passed",
  "failed",
  "cancelled",
  "retried",
  "approved",
  "rejected",
  "completed",
] as const;
export type PipelineEventKind = (typeof PIPELINE_EVENT_KINDS)[number];

/** Pipeline approval kinds (metadata only). */
export const PIPELINE_APPROVAL_KINDS = [
  "technical",
  "qa",
  "security",
  "business",
  "operations",
] as const;
export type PipelineApprovalKind = (typeof PIPELINE_APPROVAL_KINDS)[number];

/** Historical period kinds for engineering intelligence (APZTCMS-021). */
export const HISTORICAL_PERIOD_KINDS = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "release",
  "custom",
] as const;
export type HistoricalPeriodKind = (typeof HISTORICAL_PERIOD_KINDS)[number];

/** Trend directions — no forecasting. */
export const TREND_DIRECTIONS = [
  "increase",
  "decrease",
  "stable",
  "improving",
  "declining",
  "unknown",
] as const;
export type TrendDirection = (typeof TREND_DIRECTIONS)[number];

/** Trend series kinds. */
export const TREND_SERIES_KINDS = [
  "quality",
  "coverage",
  "execution",
  "automation",
  "regression",
  "release",
  "certification",
  "defect",
  "lead_time",
  "stability",
  "risk",
  "velocity",
] as const;
export type TrendSeriesKind = (typeof TREND_SERIES_KINDS)[number];

/** Engineering health status bands. */
export const ENGINEERING_HEALTH_STATUSES = [
  "healthy",
  "watch",
  "at_risk",
  "critical",
  "unknown",
] as const;
export type EngineeringHealthStatus = (typeof ENGINEERING_HEALTH_STATUSES)[number];

/** Indicator kinds for quality / engineering indicators. */
export const INDICATOR_KINDS = [
  "quality",
  "coverage",
  "automation",
  "manual_execution",
  "certification",
  "release",
  "defect",
  "stability",
  "risk",
  "pipeline",
  "approval",
  "velocity",
] as const;
export type IndicatorKind = (typeof INDICATOR_KINDS)[number];

export const AI_SUGGESTION_KINDS = [
  "case_draft",
  "failure_triage",
  "coverage_gap",
  "gate_insight",
] as const;
export type AISuggestionKind = (typeof AI_SUGGESTION_KINDS)[number];

export const AI_SUGGESTION_STATUSES = [
  "pending",
  "accepted",
  "rejected",
  "expired",
] as const;
export type AISuggestionStatus = (typeof AI_SUGGESTION_STATUSES)[number];

export const WORK_ITEM_REF_KINDS = ["feature", "epic", "story", "task"] as const;
export type WorkItemRefKind = (typeof WORK_ITEM_REF_KINDS)[number];

export const DEFECT_LINK_TARGETS = [
  "project_task",
  "support_ticket",
  "requirement",
  "plan",
  "suite",
  "case",
  "manual_execution",
  "automation_execution",
  "evidence",
  "risk",
  "work_item",
] as const;
export type DefectLinkTarget = (typeof DEFECT_LINK_TARGETS)[number];

export const DEFECT_PROVIDER_KINDS = [
  "internal",
  "projects",
  "support",
  "external_generic",
] as const;
export type DefectProviderKind = (typeof DEFECT_PROVIDER_KINDS)[number];

export const DEFECT_STATUSES = [
  "open",
  "in_progress",
  "resolved",
  "verified",
  "closed",
  "reopened",
  "cancelled",
] as const;
export type DefectStatus = (typeof DEFECT_STATUSES)[number];

export const COVERAGE_METRIC_KINDS = [
  "requirement",
  "risk",
  "suite",
  "plan",
  "code_ref",
  "feature",
  "story",
  "case",
  "manual",
  "automation",
  "execution",
  "release",
] as const;
export type CoverageMetricKind = (typeof COVERAGE_METRIC_KINDS)[number];

export const READINESS_DIMENSION_STATUSES = [
  "ready",
  "partial",
  "blocked",
] as const;
export type ReadinessDimensionStatus = (typeof READINESS_DIMENSION_STATUSES)[number];

export const EXECUTION_APPROVAL_STATES = [
  "none",
  "pending_review",
  "approved",
  "rejected",
] as const;
export type ExecutionApprovalState = (typeof EXECUTION_APPROVAL_STATES)[number];

/**
 * Maps legacy `ready` to canonical `approved` for lifecycle comparisons.
 * Other statuses pass through unchanged.
 */
export function canonicalizeTestStatus(status: TestStatus): TestCaseLifecycleStatus | TestStatus {
  if (status === "ready") return "approved";
  return status;
}

/**
 * Maps legacy execution statuses to canonical lifecycle statuses.
 * - planned → draft
 * - queued → assigned
 * - aborted → cancelled
 * - failed → blocked
 */
export function canonicalizeExecutionStatus(
  status: ExecutionStatus,
): ExecutionLifecycleStatus {
  switch (status) {
    case "planned":
      return "draft";
    case "queued":
      return "assigned";
    case "aborted":
      return "cancelled";
    case "failed":
      return "blocked";
    default:
      return status as ExecutionLifecycleStatus;
  }
}

/**
 * Maps legacy certification statuses to canonical workflow lifecycle statuses.
 * - development_ready / qa_ready / regression_ready → preparing
 * - uat_ready → awaiting_review
 * - production_ready → awaiting_approval
 * - certified → approved
 * - failed_certification → rejected
 * - conditional_approval → conditionally_approved
 */
export function canonicalizeCertificationStatus(
  status: CertificationStatus,
): CertificationLifecycleStatus {
  switch (status) {
    case "development_ready":
    case "qa_ready":
    case "regression_ready":
      return "preparing";
    case "uat_ready":
      return "awaiting_review";
    case "production_ready":
      return "awaiting_approval";
    case "certified":
      return "approved";
    case "failed_certification":
      return "rejected";
    case "conditional_approval":
      return "conditionally_approved";
    default:
      return status as CertificationLifecycleStatus;
  }
}

export function isEnumMember<T extends string>(
  values: readonly T[],
  candidate: string,
): candidate is T {
  return (values as readonly string[]).includes(candidate);
}

export function isExecutionStatus(value: string): value is ExecutionStatus {
  return isEnumMember(EXECUTION_STATUSES, value);
}

export function isExecutionLifecycleStatus(
  value: string,
): value is ExecutionLifecycleStatus {
  return isEnumMember(EXECUTION_LIFECYCLE_STATUSES, value);
}

export function isEvidenceLifecycleStatus(
  value: string,
): value is EvidenceLifecycleStatus {
  return isEnumMember(EVIDENCE_LIFECYCLE_STATUSES, value);
}

export function isTestStatus(value: string): value is TestStatus {
  return isEnumMember(TEST_STATUSES, value);
}

export function isTestCaseLifecycleStatus(
  value: string,
): value is TestCaseLifecycleStatus {
  return isEnumMember(TEST_CASE_LIFECYCLE_STATUSES, value);
}

export function isTestResultStatus(value: string): value is TestResultStatus {
  return isEnumMember(TEST_RESULT_STATUSES, value);
}

export function isTestRunStatus(value: string): value is TestRunStatus {
  return isEnumMember(TEST_RUN_STATUSES, value);
}

export function isEvidenceType(value: string): value is EvidenceType {
  return isEnumMember(EVIDENCE_TYPES, value);
}

export function isCertificationStatus(value: string): value is CertificationStatus {
  return isEnumMember(CERTIFICATION_STATUSES, value);
}

export function isCertificationLifecycleStatus(
  value: string,
): value is CertificationLifecycleStatus {
  return isEnumMember(CERTIFICATION_LIFECYCLE_STATUSES, value);
}

export function isCertificationGateOutcome(
  value: string,
): value is CertificationGateOutcome {
  return isEnumMember(CERTIFICATION_GATE_OUTCOMES, value);
}

export function isCertificationGateKey(
  value: string,
): value is CertificationGateKey {
  return isEnumMember(CERTIFICATION_GATE_KEYS, value);
}

export function isCertificationRecommendationCode(
  value: string,
): value is CertificationRecommendationCode {
  return isEnumMember(CERTIFICATION_RECOMMENDATION_CODES, value);
}

export function isApprovalStatus(value: string): value is ApprovalStatus {
  return isEnumMember(APPROVAL_STATUSES, value);
}

export function isApprovalRole(value: string): value is ApprovalRole {
  return isEnumMember(APPROVAL_ROLES, value);
}

export function isSeverity(value: string): value is Severity {
  return isEnumMember(SEVERITIES, value);
}

export function isPriority(value: string): value is Priority {
  return isEnumMember(PRIORITIES, value);
}

export function isRiskLevel(value: string): value is RiskLevel {
  return isEnumMember(RISK_LEVELS, value);
}

export function isLikelihood(value: string): value is Likelihood {
  return isEnumMember(LIKELIHOODS, value);
}

export function isImpact(value: string): value is Impact {
  return isEnumMember(IMPACTS, value);
}

export function isBusinessCriticality(value: string): value is BusinessCriticality {
  return isEnumMember(BUSINESS_CRITICALITIES, value);
}

export function isRegressionImportance(value: string): value is RegressionImportance {
  return isEnumMember(REGRESSION_IMPORTANCES, value);
}

export function isCaseVersionReason(value: string): value is CaseVersionReason {
  return isEnumMember(CASE_VERSION_REASONS, value);
}

export function isTraceabilityEntityKind(
  value: string,
): value is TraceabilityEntityKind {
  return isEnumMember(TRACEABILITY_ENTITY_KINDS, value);
}

export function isAutomationType(value: string): value is AutomationType {
  return isEnumMember(AUTOMATION_TYPES, value);
}

export function isAutomationAdapterKind(
  value: string,
): value is AutomationAdapterKind {
  return isEnumMember(AUTOMATION_ADAPTER_KINDS, value);
}

export function isAutomationImportStatus(
  value: string,
): value is AutomationImportStatus {
  return isEnumMember(AUTOMATION_IMPORT_STATUSES, value);
}

export function isNormalizedResultStatus(
  value: string,
): value is NormalizedResultStatus {
  return isEnumMember(NORMALIZED_RESULT_STATUSES, value);
}

export function isExecutionType(value: string): value is ExecutionType {
  return isEnumMember(EXECUTION_TYPES, value);
}

export function isExecutionApprovalState(
  value: string,
): value is ExecutionApprovalState {
  return isEnumMember(EXECUTION_APPROVAL_STATES, value);
}

export function isDefectProviderKind(value: string): value is DefectProviderKind {
  return isEnumMember(DEFECT_PROVIDER_KINDS, value);
}

export function isDefectStatus(value: string): value is DefectStatus {
  return isEnumMember(DEFECT_STATUSES, value);
}

export function isDefectLinkTarget(value: string): value is DefectLinkTarget {
  return isEnumMember(DEFECT_LINK_TARGETS, value);
}

export function isCoverageMetricKind(value: string): value is CoverageMetricKind {
  return isEnumMember(COVERAGE_METRIC_KINDS, value);
}

export function isReadinessDimensionStatus(
  value: string,
): value is ReadinessDimensionStatus {
  return isEnumMember(READINESS_DIMENSION_STATUSES, value);
}

export function isPlatformProductKey(value: string): value is PlatformProductKey {
  return isEnumMember(PLATFORM_PRODUCT_KEYS, value);
}

export function isPlatformQualityStatus(
  value: string,
): value is PlatformQualityStatus {
  return isEnumMember(PLATFORM_QUALITY_STATUSES, value);
}

export function isPlatformReleaseReadinessVerdict(
  value: string,
): value is PlatformReleaseReadinessVerdict {
  return isEnumMember(PLATFORM_RELEASE_READINESS_VERDICTS, value);
}

export function isDependencyRelationKind(
  value: string,
): value is DependencyRelationKind {
  return isEnumMember(DEPENDENCY_RELATION_KINDS, value);
}

export function isDependencyRequirementKind(
  value: string,
): value is DependencyRequirementKind {
  return isEnumMember(DEPENDENCY_REQUIREMENT_KINDS, value);
}

export function isPlatformReleaseLifecycleStatus(
  value: string,
): value is PlatformReleaseLifecycleStatus {
  return isEnumMember(PLATFORM_RELEASE_LIFECYCLE_STATUSES, value);
}

export function isReleaseGovernanceStatus(
  value: string,
): value is ReleaseGovernanceStatus {
  return isEnumMember(RELEASE_GOVERNANCE_STATUSES, value);
}

export function isReleaseApprovalStageKind(
  value: string,
): value is ReleaseApprovalStageKind {
  return isEnumMember(RELEASE_APPROVAL_STAGE_KINDS, value);
}

export function isReleaseAdvisoryVerdict(
  value: string,
): value is ReleaseAdvisoryVerdict {
  return isEnumMember(RELEASE_ADVISORY_VERDICTS, value);
}

export function isReleaseScopeKind(value: string): value is ReleaseScopeKind {
  return isEnumMember(RELEASE_SCOPE_KINDS, value);
}

export function isPipelineProviderKind(value: string): value is PipelineProviderKind {
  return isEnumMember(PIPELINE_PROVIDER_KINDS, value);
}

export function isPipelineRunStatus(value: string): value is PipelineRunStatus {
  return isEnumMember(PIPELINE_RUN_STATUSES, value);
}

export function isPipelineImportStatus(value: string): value is PipelineImportStatus {
  return isEnumMember(PIPELINE_IMPORT_STATUSES, value);
}

export function isPipelineEventKind(value: string): value is PipelineEventKind {
  return isEnumMember(PIPELINE_EVENT_KINDS, value);
}

export function isPipelineApprovalKind(value: string): value is PipelineApprovalKind {
  return isEnumMember(PIPELINE_APPROVAL_KINDS, value);
}

export function isHistoricalPeriodKind(
  value: string,
): value is HistoricalPeriodKind {
  return isEnumMember(HISTORICAL_PERIOD_KINDS, value);
}

export function isTrendDirection(value: string): value is TrendDirection {
  return isEnumMember(TREND_DIRECTIONS, value);
}

export function isTrendSeriesKind(value: string): value is TrendSeriesKind {
  return isEnumMember(TREND_SERIES_KINDS, value);
}

export function isEngineeringHealthStatus(
  value: string,
): value is EngineeringHealthStatus {
  return isEnumMember(ENGINEERING_HEALTH_STATUSES, value);
}

export function isIndicatorKind(value: string): value is IndicatorKind {
  return isEnumMember(INDICATOR_KINDS, value);
}

export function isPlatformGovernanceApprovalKind(
  value: string,
): value is PlatformGovernanceApprovalKind {
  return isEnumMember(PLATFORM_GOVERNANCE_APPROVAL_KINDS, value);
}

export function certificationStatusLabel(status: CertificationStatus): string {
  return CERTIFICATION_STATUS_LABELS[status];
}
