import { describe, expect, it } from "vitest";

import {
  canAdminTesting,
  canApproveCertification,
  canArchive,
  canCreateCase,
  canCreatePlan,
  canCreateSuite,
  canExecute,
  canReadRequirements,
  canRegisterEvidence,
  canRejectCertification,
  canReviewCertification,
  canViewAutomation,
  canViewCertification,
  canViewCoverage,
  canViewDefects,
  canViewEvidence,
  canViewQuality,
  canViewPipelines,
  canImportPipelines,
  canViewRelease,
  canViewReports,
  canViewTesting,
  hasTestingPermission,
} from "./permissions";

describe("testing permissions helpers", () => {
  it("treats empty source as denied for UI gating", () => {
    expect(canViewTesting(undefined)).toBe(false);
    expect(canViewTesting(null)).toBe(false);
    expect(canViewTesting([])).toBe(false);
    expect(canCreatePlan(undefined)).toBe(false);
    expect(canCreateSuite(null)).toBe(false);
    expect(canCreateCase([])).toBe(false);
    expect(canExecute(undefined)).toBe(false);
    expect(canRegisterEvidence(null)).toBe(false);
    expect(canViewAutomation([])).toBe(false);
    expect(canViewEvidence(undefined)).toBe(false);
    expect(canViewCoverage(null)).toBe(false);
    expect(canViewDefects([])).toBe(false);
    expect(canViewQuality(undefined)).toBe(false);
    expect(canViewCertification(null)).toBe(false);
    expect(canReviewCertification([])).toBe(false);
    expect(canApproveCertification(undefined)).toBe(false);
    expect(canRejectCertification(null)).toBe(false);
    expect(canViewRelease([])).toBe(false);
    expect(canViewReports(undefined)).toBe(false);
    expect(canAdminTesting(null)).toBe(false);
    expect(canArchive([])).toBe(false);
    expect(canReadRequirements(undefined)).toBe(false);
  });

  it("honours global and namespace wildcards", () => {
    expect(hasTestingPermission(["*"], "testing.plans.create")).toBe(true);
    expect(hasTestingPermission(["testing.*"], "testing.executions.execute")).toBe(
      true,
    );
    expect(hasTestingPermission(["certification.*"], "certification.approve")).toBe(
      true,
    );
    expect(hasTestingPermission(["testing.plans.*"], "testing.plans.create")).toBe(
      true,
    );
    expect(hasTestingPermission(["evidence.*"], "evidence.register")).toBe(true);
  });

  it("grants each can* helper when the exact permission is present", () => {
    expect(canViewTesting(["testing.view"])).toBe(true);
    expect(canReadRequirements(["testing.requirements.read"])).toBe(true);
    expect(canCreatePlan(["testing.plans.create"])).toBe(true);
    expect(canCreateSuite(["testing.suites.create"])).toBe(true);
    expect(canCreateCase(["testing.cases.create"])).toBe(true);
    expect(canExecute(["testing.executions.execute"])).toBe(true);
    expect(canRegisterEvidence(["evidence.register"])).toBe(true);
    expect(canViewAutomation(["automation.view"])).toBe(true);
    expect(canViewAutomation(["automation.jobs.read"])).toBe(true);
    expect(canViewEvidence(["evidence.read"])).toBe(true);
    expect(canViewCoverage(["coverage.view"])).toBe(true);
    expect(canViewDefects(["defects.view"])).toBe(true);
    expect(canViewQuality(["quality.view"])).toBe(true);
    expect(canViewCertification(["certification.view"])).toBe(true);
    expect(canReviewCertification(["certification.review"])).toBe(true);
    expect(canApproveCertification(["certification.approve"])).toBe(true);
    expect(canRejectCertification(["certification.reject"])).toBe(true);
    expect(canViewRelease(["release.view"])).toBe(true);
    expect(canViewReports(["reporting.view"])).toBe(true);
    expect(canViewReports(["report.view"])).toBe(true);
    expect(canAdminTesting(["testing.admin"])).toBe(true);
    expect(canViewPipelines(["pipeline.read"])).toBe(true);
    expect(canViewPipelines(["pipeline.*"])).toBe(true);
    expect(canImportPipelines(["pipeline.import"])).toBe(true);
    expect(canArchive(["testing.plans.update"])).toBe(true);
    expect(canArchive(["certification.records.transition"])).toBe(true);
    expect(hasTestingPermission(new Set(["testing.view"]), "testing.view")).toBe(true);
  });

  it("does not treat unrelated roles as authority", () => {
    expect(hasTestingPermission(["platform_admin"], "testing.view")).toBe(false);
    expect(hasTestingPermission(["agent"], "testing.plans.create")).toBe(false);
    expect(canApproveCertification(["certification.review"])).toBe(false);
    expect(canExecute(["evidence.register"])).toBe(false);
    expect(canArchive(["certification.approve"])).toBe(false);
  });
});
