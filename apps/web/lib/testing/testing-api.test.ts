import { beforeEach, describe, expect, it } from "vitest";

import { TestingClientError } from "./errors";
import { createMockTestingClient, FIXTURE_IDS } from "./mock-client";
import {
  archiveCertification,
  createCase,
  createPlan,
  createSuite,
  decideCertification,
  getCertification,
  getDashboard,
  getExecution,
  getPlan,
  getTestingClient,
  listAdminSettings,
  listAutomationRuns,
  listCases,
  listCertifications,
  listCoverage,
  listDefects,
  listEvidence,
  listExecutions,
  listPlans,
  listQualitySummaries,
  listReleaseReadiness,
  listReportPlaceholders,
  listRequirements,
  listSuites,
  pauseExecution,
  resetTestingClient,
  resumeExecution,
  setTestingClient,
  startExecution,
  submitEvidence,
} from "./testing-api";

describe("testing-api client accessor", () => {
  beforeEach(() => {
    resetTestingClient();
  });

  it("delegates list and dashboard calls to the active client", async () => {
    const dashboard = await getDashboard();
    expect(dashboard.headline).toMatch(/overview/i);

    const plans = await listPlans();
    expect(plans.items.some((item) => item.id === FIXTURE_IDS.plan)).toBe(true);
  });

  it("supports setTestingClient and resetTestingClient", async () => {
    const customClient = createMockTestingClient();
    setTestingClient(customClient);
    expect(getTestingClient()).toBe(customClient);

    await createPlan({ name: "Custom client plan" });
    const plans = await customClient.listPlans();
    expect(plans.items.some((item) => item.name === "Custom client plan")).toBe(true);

    resetTestingClient();
    const defaultPlans = await listPlans();
    expect(
      defaultPlans.items.some((item) => item.name === "Custom client plan"),
    ).toBe(false);
    expect(
      defaultPlans.items.some((item) => item.name === "Release 2.4 Regression"),
    ).toBe(true);
  });

  it("propagates not-found errors from the client", async () => {
    await expect(getPlan("missing-plan")).rejects.toBeInstanceOf(TestingClientError);
    await expect(getExecution("missing-exec")).rejects.toBeInstanceOf(TestingClientError);
    await expect(getCertification("missing-cert")).rejects.toBeInstanceOf(
      TestingClientError,
    );
  });

  it("propagates aborted signal errors from the client", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(getDashboard({ signal: controller.signal })).rejects.toMatchObject({
      code: "ABORTED",
    });
  });

  it("delegates every list wrapper to the active client", async () => {
    const requirements = await listRequirements();
    expect(requirements.items.length).toBeGreaterThan(0);

    const suites = await listSuites();
    expect(suites.items.some((item) => item.id === FIXTURE_IDS.suite)).toBe(true);

    const cases = await listCases();
    expect(cases.items.some((item) => item.id === FIXTURE_IDS.case)).toBe(true);

    const executions = await listExecutions();
    expect(executions.items.some((item) => item.id === FIXTURE_IDS.execution)).toBe(true);

    const evidence = await listEvidence();
    expect(evidence.items.some((item) => item.id === FIXTURE_IDS.evidence)).toBe(true);

    const automation = await listAutomationRuns();
    expect(automation.items.some((item) => item.id === FIXTURE_IDS.automation)).toBe(true);

    const coverage = await listCoverage();
    expect(coverage.items.length).toBeGreaterThan(0);

    const defects = await listDefects();
    expect(defects.items.length).toBeGreaterThan(0);

    const quality = await listQualitySummaries();
    expect(quality.items.length).toBeGreaterThan(0);

    const certifications = await listCertifications();
    expect(
      certifications.items.some((item) => item.id === FIXTURE_IDS.certification),
    ).toBe(true);

    const release = await listReleaseReadiness();
    expect(release.items.some((item) => item.id === FIXTURE_IDS.release)).toBe(true);

    const reports = await listReportPlaceholders();
    expect(reports.items.length).toBeGreaterThan(0);

    const admin = await listAdminSettings();
    expect(admin.items.length).toBeGreaterThan(0);
  });

  it("delegates every mutation wrapper to the active client", async () => {
    const plan = await createPlan({ name: "API plan" });
    expect(plan.name).toBe("API plan");

    const suite = await createSuite({ name: "API suite", planId: FIXTURE_IDS.plan });
    expect(suite.name).toBe("API suite");

    const testCase = await createCase({
      title: "API case",
      suiteId: FIXTURE_IDS.suite,
    });
    expect(testCase.title).toBe("API case");

    const started = await startExecution({ caseId: FIXTURE_IDS.case });
    expect(started.status).toBe("in_progress");

    const paused = await pauseExecution(FIXTURE_IDS.execution);
    expect(paused.status).toBe("paused");

    const resumed = await resumeExecution(FIXTURE_IDS.execution);
    expect(resumed.status).toBe("in_progress");

    const evidence = await submitEvidence({
      executionId: FIXTURE_IDS.execution,
      title: "API evidence",
    });
    expect(evidence.title).toBe("API evidence");

    const reviewed = await decideCertification({
      certificationId: FIXTURE_IDS.certification,
      decision: "review",
      comment: "Review via API",
    });
    expect(reviewed.state).toBe("in_review");

    const approved = await decideCertification({
      certificationId: FIXTURE_IDS.certification,
      decision: "approve",
    });
    expect(approved.state).toBe("approved");

    resetTestingClient();
    const rejected = await decideCertification({
      certificationId: FIXTURE_IDS.certification,
      decision: "reject",
    });
    expect(rejected.state).toBe("rejected");

    resetTestingClient();
    const archived = await archiveCertification(FIXTURE_IDS.certification);
    expect(archived.state).toBe("archived");
  });

  it("delegates detail getters to the active client", async () => {
    const plan = await getPlan(FIXTURE_IDS.plan);
    expect(plan.name).toBe("Release 2.4 Regression");

    const execution = await getExecution(FIXTURE_IDS.execution);
    expect(execution.caseKey).toBe("TC-AUTH-001");

    const certification = await getCertification(FIXTURE_IDS.certification);
    expect(certification.name).toBe("Release 2.4 Certification");
  });
});
