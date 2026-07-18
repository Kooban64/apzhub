/** APZ TCMS permission catalogue — keys only; no authz engine. */

export const TESTING_PERMISSIONS = [
  "testing.view",
  "testing.requirements.list",
  "testing.requirements.read",
  "testing.requirements.create",
  "testing.requirements.update",
  "testing.plans.list",
  "testing.plans.read",
  "testing.plans.create",
  "testing.plans.update",
  "testing.suites.list",
  "testing.suites.read",
  "testing.suites.create",
  "testing.suites.update",
  "testing.cases.list",
  "testing.cases.read",
  "testing.cases.create",
  "testing.cases.update",
  "testing.executions.list",
  "testing.executions.read",
  "testing.executions.create",
  "testing.executions.execute",
  "testing.admin",
] as const;

export const CERTIFICATION_PERMISSIONS = [
  "certification.view",
  "certification.records.list",
  "certification.records.read",
  "certification.records.create",
  "certification.records.transition",
  "certification.gates.evaluate",
  "certification.create",
  "certification.review",
  "certification.approve",
  "certification.reject",
  "certification.override",
  "certification.audit",
  "certification.admin",
] as const;

export const EVIDENCE_PERMISSIONS = [
  "evidence.list",
  "evidence.read",
  "evidence.register",
  "evidence.admin",
] as const;

export const TRACEABILITY_PERMISSIONS = [
  "traceability.list",
  "traceability.read",
  "traceability.link",
  "traceability.admin",
] as const;

export const AUTOMATION_PERMISSIONS = [
  "automation.jobs.list",
  "automation.jobs.read",
  "automation.jobs.enqueue",
  "automation.jobs.cancel",
  "automation.import",
  "automation.view",
  "automation.history",
  "automation.adapters",
  "automation.coverage",
  "automation.admin",
] as const;

/** External CI/CD pipeline metadata permissions (APZTCMS-015). */
export const PIPELINE_PERMISSIONS = [
  "pipeline.read",
  "pipeline.import",
  "pipeline.archive",
  "pipeline.audit",
  "pipeline.providers",
  "pipeline.link",
  "pipeline.admin",
] as const;

export const REPORTING_PERMISSIONS = [
  "reporting.view",
  "reporting.generate",
  "reporting.admin",
  "report.view",
  "report.generate",
  "report.preview",
  "report.templates",
  "report.audit",
  "report.admin",
] as const;

/** Platform-canonical report permissions (APZREPORT-001) — subset of REPORTING_PERMISSIONS. */
export {
  PLATFORM_REPORT_PERMISSIONS,
  PLATFORM_REPORTING_LEGACY_PERMISSIONS,
} from "@apzhub/reporting-contracts";

export const APPROVAL_PERMISSIONS = [
  "approval.list",
  "approval.read",
  "approval.request",
  "approval.decide",
  "approval.sign",
  "approval.admin",
] as const;

export const DASHBOARD_PERMISSIONS = [
  "dashboard.view",
  "dashboard.refresh",
  "dashboard.admin",
] as const;

export const QUALITY_PERMISSIONS = [
  "quality.view",
  "quality.compute",
  "quality.admin",
  "quality.score",
  "quality.analytics",
] as const;

export const ANALYTICS_PERMISSIONS = [
  "analytics.view",
  "analytics.compute",
  "analytics.admin",
] as const;

export const ENGINEERING_PERMISSIONS = [
  "engineering.view",
  "engineering.compute",
  "engineering.health",
  "engineering.admin",
] as const;

export const BENCHMARK_PERMISSIONS = [
  "benchmark.view",
  "benchmark.compute",
  "benchmark.admin",
] as const;

export const TREND_PERMISSIONS = [
  "trend.view",
  "trend.compute",
  "trend.admin",
] as const;

export const COVERAGE_PERMISSIONS = [
  "coverage.view",
  "coverage.compute",
  "coverage.admin",
] as const;

export const DEFECTS_PERMISSIONS = [
  "defects.view",
  "defects.link",
  "defects.update",
  "defects.admin",
] as const;

export const RELEASE_PERMISSIONS = [
  "release.view",
  "release.compute",
  "release.create",
  "release.update",
  "release.submit",
  "release.approve",
  "release.reject",
  "release.withdraw",
  "release.archive",
  "release.restore",
  "release.admin",
  "release.approvals.view",
  "release.approvals.request",
  "release.approvals.decide",
  "release.approvals.admin",
  "release.readiness.view",
  "release.readiness.evaluate",
  "release.readiness.admin",
  "release.audit.view",
  "release.audit.admin",
  "release.risk.view",
  "release.risk.evaluate",
  "release.risk.admin",
] as const;

export const PLATFORM_QUALITY_PERMISSIONS = [
  "platform-quality.view",
  "platform-quality.aggregate",
  "platform-quality.admin",
] as const;

export const PLATFORM_RELEASE_PERMISSIONS = [
  "platform-release.view",
  "platform-release.create",
  "platform-release.update",
  "platform-release.evaluate",
  "platform-release.admin",
] as const;

export const DEPENDENCY_PERMISSIONS = [
  "dependency.view",
  "dependency.manage",
  "dependency.validate",
  "dependency.admin",
] as const;

export const GOVERNANCE_PERMISSIONS = [
  "governance.view",
  "governance.approve",
  "governance.decide",
  "governance.admin",
] as const;

/** Extended quality.* keys for platform quality governance (APZTCMS-014). */
export const QUALITY_PLATFORM_PERMISSIONS = [
  "quality.registry.view",
  "quality.registry.manage",
  "quality.dashboard.view",
] as const;

/** Extended release.* keys kept for platform release objects (deduped vs RELEASE_PERMISSIONS). */
export const RELEASE_PLATFORM_PERMISSIONS = ["release.decide"] as const;

export const APZ_TCMS_PERMISSIONS = [
  ...TESTING_PERMISSIONS,
  ...CERTIFICATION_PERMISSIONS,
  ...EVIDENCE_PERMISSIONS,
  ...TRACEABILITY_PERMISSIONS,
  ...AUTOMATION_PERMISSIONS,
  ...PIPELINE_PERMISSIONS,
  ...REPORTING_PERMISSIONS,
  ...APPROVAL_PERMISSIONS,
  ...DASHBOARD_PERMISSIONS,
  ...QUALITY_PERMISSIONS,
  ...ANALYTICS_PERMISSIONS,
  ...ENGINEERING_PERMISSIONS,
  ...BENCHMARK_PERMISSIONS,
  ...TREND_PERMISSIONS,
  ...COVERAGE_PERMISSIONS,
  ...DEFECTS_PERMISSIONS,
  ...RELEASE_PERMISSIONS,
  ...PLATFORM_QUALITY_PERMISSIONS,
  ...PLATFORM_RELEASE_PERMISSIONS,
  ...DEPENDENCY_PERMISSIONS,
  ...GOVERNANCE_PERMISSIONS,
  ...QUALITY_PLATFORM_PERMISSIONS,
  ...RELEASE_PLATFORM_PERMISSIONS,
] as const;

export type TestingPermission = (typeof TESTING_PERMISSIONS)[number];
export type CertificationPermission = (typeof CERTIFICATION_PERMISSIONS)[number];
export type EvidencePermission = (typeof EVIDENCE_PERMISSIONS)[number];
export type TraceabilityPermission = (typeof TRACEABILITY_PERMISSIONS)[number];
export type AutomationPermission = (typeof AUTOMATION_PERMISSIONS)[number];
export type PipelinePermission = (typeof PIPELINE_PERMISSIONS)[number];
export type ReportingPermission = (typeof REPORTING_PERMISSIONS)[number];
export type ApprovalPermission = (typeof APPROVAL_PERMISSIONS)[number];
export type DashboardPermission = (typeof DASHBOARD_PERMISSIONS)[number];
export type QualityPermission = (typeof QUALITY_PERMISSIONS)[number];
export type AnalyticsPermission = (typeof ANALYTICS_PERMISSIONS)[number];
export type EngineeringPermission = (typeof ENGINEERING_PERMISSIONS)[number];
export type BenchmarkPermission = (typeof BENCHMARK_PERMISSIONS)[number];
export type TrendPermission = (typeof TREND_PERMISSIONS)[number];
export type CoveragePermission = (typeof COVERAGE_PERMISSIONS)[number];
export type DefectsPermission = (typeof DEFECTS_PERMISSIONS)[number];
export type ReleasePermission = (typeof RELEASE_PERMISSIONS)[number];
export type PlatformQualityPermission = (typeof PLATFORM_QUALITY_PERMISSIONS)[number];
export type PlatformReleasePermission = (typeof PLATFORM_RELEASE_PERMISSIONS)[number];
export type DependencyPermission = (typeof DEPENDENCY_PERMISSIONS)[number];
export type GovernancePermission = (typeof GOVERNANCE_PERMISSIONS)[number];
export type QualityPlatformPermission = (typeof QUALITY_PLATFORM_PERMISSIONS)[number];
export type ReleasePlatformPermission = (typeof RELEASE_PLATFORM_PERMISSIONS)[number];
export type ApzTcmsPermission = (typeof APZ_TCMS_PERMISSIONS)[number];

export function isApzTcmsPermission(value: string): value is ApzTcmsPermission {
  return (APZ_TCMS_PERMISSIONS as readonly string[]).includes(value);
}

export function listApzTcmsPermissions(): readonly ApzTcmsPermission[] {
  return APZ_TCMS_PERMISSIONS;
}

export function listPermissionsByPrefix(prefix: string): readonly ApzTcmsPermission[] {
  return APZ_TCMS_PERMISSIONS.filter((permission) => permission.startsWith(prefix));
}
