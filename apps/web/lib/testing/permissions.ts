/**
 * UI-only Testing permission helpers.
 * Server remains authoritative — these only hide/disable controls.
 */

export type TestingPermissionSource =
  readonly string[] | ReadonlySet<string> | undefined | null;

function asSet(source: TestingPermissionSource): ReadonlySet<string> {
  if (!source) return new Set();
  if (source instanceof Set) return source;
  return new Set(source);
}

function matches(granted: ReadonlySet<string>, required: string): boolean {
  if (granted.has("*") || granted.has("testing.*")) return true;
  if (granted.has(required)) return true;
  const parts = required.split(".");
  if (parts.length >= 2 && granted.has(`${parts[0]}.*`)) return true;
  if (parts.length >= 3 && granted.has(`${parts[0]}.${parts[1]}.*`)) return true;
  return false;
}

export function hasTestingPermission(
  source: TestingPermissionSource,
  permission: string,
): boolean {
  return matches(asSet(source), permission);
}

export function canViewTesting(source: TestingPermissionSource): boolean {
  return hasTestingPermission(source, "testing.view");
}

export function canReadRequirements(source: TestingPermissionSource): boolean {
  return hasTestingPermission(source, "testing.requirements.read");
}

export function canCreatePlan(source: TestingPermissionSource): boolean {
  return hasTestingPermission(source, "testing.plans.create");
}

export function canCreateSuite(source: TestingPermissionSource): boolean {
  return hasTestingPermission(source, "testing.suites.create");
}

export function canCreateCase(source: TestingPermissionSource): boolean {
  return hasTestingPermission(source, "testing.cases.create");
}

export function canExecute(source: TestingPermissionSource): boolean {
  return hasTestingPermission(source, "testing.executions.execute");
}

export function canRegisterEvidence(source: TestingPermissionSource): boolean {
  return hasTestingPermission(source, "evidence.register");
}

export function canViewAutomation(source: TestingPermissionSource): boolean {
  return (
    hasTestingPermission(source, "automation.view") ||
    hasTestingPermission(source, "automation.jobs.read")
  );
}

export function canViewEvidence(source: TestingPermissionSource): boolean {
  return hasTestingPermission(source, "evidence.read");
}

export function canViewCoverage(source: TestingPermissionSource): boolean {
  return hasTestingPermission(source, "coverage.view");
}

export function canViewDefects(source: TestingPermissionSource): boolean {
  return hasTestingPermission(source, "defects.view");
}

export function canViewQuality(source: TestingPermissionSource): boolean {
  return hasTestingPermission(source, "quality.view");
}

export function canViewCertification(source: TestingPermissionSource): boolean {
  return hasTestingPermission(source, "certification.view");
}

export function canReviewCertification(source: TestingPermissionSource): boolean {
  return hasTestingPermission(source, "certification.review");
}

export function canApproveCertification(source: TestingPermissionSource): boolean {
  return hasTestingPermission(source, "certification.approve");
}

export function canRejectCertification(source: TestingPermissionSource): boolean {
  return hasTestingPermission(source, "certification.reject");
}

export function canViewRelease(source: TestingPermissionSource): boolean {
  return hasTestingPermission(source, "release.view");
}

export function canViewReports(source: TestingPermissionSource): boolean {
  return (
    hasTestingPermission(source, "reporting.view") ||
    hasTestingPermission(source, "report.view")
  );
}

export function canAdminTesting(source: TestingPermissionSource): boolean {
  return hasTestingPermission(source, "testing.admin");
}

export function canViewPipelines(source: TestingPermissionSource): boolean {
  return (
    hasTestingPermission(source, "pipeline.read") ||
    hasTestingPermission(source, "pipeline.*") ||
    hasTestingPermission(source, "pipeline.providers")
  );
}

export function canImportPipelines(source: TestingPermissionSource): boolean {
  return (
    hasTestingPermission(source, "pipeline.import") ||
    hasTestingPermission(source, "pipeline.*")
  );
}

export function canViewEngineeringIntelligence(
  source: TestingPermissionSource,
): boolean {
  return (
    hasTestingPermission(source, "engineering.view") ||
    hasTestingPermission(source, "engineering.*") ||
    hasTestingPermission(source, "analytics.view") ||
    hasTestingPermission(source, "analytics.*") ||
    hasTestingPermission(source, "quality.view") ||
    hasTestingPermission(source, "quality.*")
  );
}

export function canViewExecutiveDashboards(source: TestingPermissionSource): boolean {
  return (
    canViewEngineeringIntelligence(source) ||
    hasTestingPermission(source, "benchmark.view") ||
    hasTestingPermission(source, "benchmark.*") ||
    hasTestingPermission(source, "trend.view") ||
    hasTestingPermission(source, "trend.*")
  );
}

export function canArchive(source: TestingPermissionSource): boolean {
  return (
    hasTestingPermission(source, "testing.plans.update") ||
    hasTestingPermission(source, "certification.records.transition")
  );
}
