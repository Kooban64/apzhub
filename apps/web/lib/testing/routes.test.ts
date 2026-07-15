import { describe, expect, it } from "vitest";

import {
  isTestingRoute,
  resolveTestingRoute,
  resolveTestingSection,
  TESTING_BASE,
  TESTING_SECTIONS,
  testingCertificationPath,
  testingExecutionPath,
  testingPlanPath,
} from "./routes";

describe("testing routes", () => {
  it("detects testing routes", () => {
    expect(isTestingRoute(TESTING_BASE)).toBe(true);
    expect(isTestingRoute(`${TESTING_BASE}/plans`)).toBe(true);
    expect(isTestingRoute(`${TESTING_BASE}/plans/`)).toBe(true);
    expect(isTestingRoute("/workspace/support")).toBe(false);
    expect(isTestingRoute("/workspace/home")).toBe(false);
  });

  it("resolves dashboard and all sections", () => {
    expect(resolveTestingSection(TESTING_BASE)).toBe("dashboard");
    expect(resolveTestingSection(`${TESTING_BASE}/`)).toBe("dashboard");

    for (const section of TESTING_SECTIONS) {
      expect(resolveTestingSection(`${TESTING_BASE}/${section}`)).toBe(section);
      expect(resolveTestingSection(`${TESTING_BASE}/${section}/`)).toBe(section);
    }

    expect(resolveTestingSection(`${TESTING_BASE}/not-a-section`)).toBe("dashboard");
  });

  it("resolves dashboard route kind", () => {
    expect(resolveTestingRoute(TESTING_BASE)).toEqual({ kind: "dashboard" });
    expect(resolveTestingRoute(`${TESTING_BASE}/`)).toEqual({ kind: "dashboard" });
  });

  it("resolves section route kinds", () => {
    expect(resolveTestingRoute(`${TESTING_BASE}/requirements`)).toEqual({
      kind: "requirements",
    });
    expect(resolveTestingRoute(`${TESTING_BASE}/plans`)).toEqual({ kind: "plans" });
    expect(resolveTestingRoute(`${TESTING_BASE}/suites`)).toEqual({ kind: "suites" });
    expect(resolveTestingRoute(`${TESTING_BASE}/cases`)).toEqual({ kind: "cases" });
    expect(resolveTestingRoute(`${TESTING_BASE}/executions`)).toEqual({
      kind: "executions",
    });
    expect(resolveTestingRoute(`${TESTING_BASE}/automation`)).toEqual({
      kind: "automation",
    });
    expect(resolveTestingRoute(`${TESTING_BASE}/evidence`)).toEqual({ kind: "evidence" });
    expect(resolveTestingRoute(`${TESTING_BASE}/coverage`)).toEqual({ kind: "coverage" });
    expect(resolveTestingRoute(`${TESTING_BASE}/defects`)).toEqual({ kind: "defects" });
    expect(resolveTestingRoute(`${TESTING_BASE}/quality`)).toEqual({ kind: "quality" });
    expect(resolveTestingRoute(`${TESTING_BASE}/certification`)).toEqual({
      kind: "certification",
    });
    expect(resolveTestingRoute(`${TESTING_BASE}/release-readiness`)).toEqual({
      kind: "release-readiness",
    });
    expect(resolveTestingRoute(`${TESTING_BASE}/reports`)).toEqual({ kind: "reports" });
    expect(resolveTestingRoute(`${TESTING_BASE}/administration`)).toEqual({
      kind: "administration",
    });
    expect(resolveTestingRoute(`${TESTING_BASE}/pipelines`)).toEqual({
      kind: "pipelines",
    });
    expect(resolveTestingRoute(`${TESTING_BASE}/engineering-intelligence`)).toEqual({
      kind: "engineering-intelligence",
    });
    expect(resolveTestingRoute(`${TESTING_BASE}/executive-dashboards`)).toEqual({
      kind: "executive-dashboards",
      category: "executive",
    });
    expect(resolveTestingRoute(`${TESTING_BASE}/executive-dashboards/qa`)).toEqual({
      kind: "executive-dashboards",
      category: "qa",
    });
  });

  it("resolves pipeline repository and run detail routes", () => {
    expect(
      resolveTestingRoute(`${TESTING_BASE}/pipelines/repos/acme/portal`),
    ).toEqual({
      kind: "pipeline-repository",
      owner: "acme",
      repo: "portal",
    });
    expect(
      resolveTestingRoute(`${TESTING_BASE}/pipelines/repos/acme/portal/workflows`),
    ).toEqual({
      kind: "pipeline-workflows",
      owner: "acme",
      repo: "portal",
    });
    expect(
      resolveTestingRoute(`${TESTING_BASE}/pipelines/repos/acme/portal/runs`),
    ).toEqual({
      kind: "pipeline-runs",
      owner: "acme",
      repo: "portal",
    });
    expect(
      resolveTestingRoute(`${TESTING_BASE}/pipelines/repos/acme/portal/runs/99`),
    ).toEqual({
      kind: "pipeline-run-detail",
      owner: "acme",
      repo: "portal",
      runId: "99",
    });
  });

  it("resolves plan, execution, and certification detail routes", () => {
    const planId = "plan_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1";
    const executionId = "exec_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa4";
    const certificationId = "cert_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa7";

    expect(resolveTestingRoute(testingPlanPath(planId))).toEqual({
      kind: "plan-detail",
      planId,
    });
    expect(resolveTestingRoute(`${TESTING_BASE}/plans/new`)).toEqual({ kind: "plans" });
    expect(resolveTestingRoute(`${TESTING_BASE}/plans/create`)).toEqual({ kind: "plans" });

    expect(resolveTestingRoute(testingExecutionPath(executionId))).toEqual({
      kind: "execution-detail",
      executionId,
    });

    expect(resolveTestingRoute(testingCertificationPath(certificationId))).toEqual({
      kind: "certification-detail",
      certificationId,
    });
  });

  it("returns unknown for non-testing paths and dashboard for unrecognized sections", () => {
    expect(resolveTestingRoute("/workspace/other")).toEqual({ kind: "unknown" });
    expect(resolveTestingRoute(`${TESTING_BASE}/not-a-section`)).toEqual({
      kind: "dashboard",
    });
  });
});
