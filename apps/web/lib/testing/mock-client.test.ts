import { describe, expect, it } from "vitest";

import { TestingClientError } from "./errors";
import { createMockTestingClient, FIXTURE_IDS } from "./mock-client";

describe("createMockTestingClient", () => {
  it("returns fixture data from list methods", async () => {
    const client = createMockTestingClient();

    const dashboard = await client.getDashboard();
    expect(dashboard.cards.length).toBeGreaterThan(0);
    expect(dashboard.recentCertifications[0]?.id).toBe(FIXTURE_IDS.certification);

    const requirements = await client.listRequirements();
    expect(requirements.items.some((item) => item.key === "REQ-AUTH-12")).toBe(true);

    const plans = await client.listPlans();
    expect(plans.items.some((item) => item.id === FIXTURE_IDS.plan)).toBe(true);

    const suites = await client.listSuites();
    expect(suites.items.some((item) => item.id === FIXTURE_IDS.suite)).toBe(true);

    const cases = await client.listCases();
    expect(cases.items.some((item) => item.id === FIXTURE_IDS.case)).toBe(true);

    const executions = await client.listExecutions();
    expect(executions.items.some((item) => item.id === FIXTURE_IDS.execution)).toBe(
      true,
    );

    const evidence = await client.listEvidence();
    expect(evidence.items.some((item) => item.id === FIXTURE_IDS.evidence)).toBe(true);

    const automation = await client.listAutomationRuns();
    expect(automation.items.some((item) => item.id === FIXTURE_IDS.automation)).toBe(
      true,
    );

    const coverage = await client.listCoverage();
    expect(coverage.items.some((item) => item.dimension === "Requirements")).toBe(true);

    const defects = await client.listDefects();
    expect(defects.items.length).toBeGreaterThan(0);

    const quality = await client.listQualitySummaries();
    expect(quality.items.length).toBeGreaterThan(0);

    const certifications = await client.listCertifications();
    expect(
      certifications.items.some((item) => item.id === FIXTURE_IDS.certification),
    ).toBe(true);

    const release = await client.listReleaseReadiness();
    expect(release.items.some((item) => item.id === FIXTURE_IDS.release)).toBe(true);

    const reports = await client.listReportPlaceholders();
    expect(reports.items.length).toBeGreaterThan(0);

    const admin = await client.listAdminSettings();
    expect(admin.items.length).toBeGreaterThan(0);
  });

  it("filters and sorts list results", async () => {
    const client = createMockTestingClient();

    const searched = await client.listRequirements({ search: "mfa" });
    expect(searched.items).toHaveLength(1);
    expect(searched.items[0]?.key).toBe("REQ-AUTH-18");

    const statusFiltered = await client.listPlans({ status: "active" });
    expect(statusFiltered.items.every((item) => item.status === "active")).toBe(true);

    const sorted = await client.listCases({ sort: "title", order: "desc" });
    expect(sorted.items.length).toBeGreaterThan(0);
  });

  it("throws not found for missing detail records", async () => {
    const client = createMockTestingClient();

    await expect(client.getPlan("missing-plan")).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
    } satisfies Partial<TestingClientError>);

    await expect(client.getExecution("missing-exec")).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
    });

    await expect(client.getCertification("missing-cert")).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
    });

    await expect(
      client.createSuite({ name: "Orphan suite", planId: "missing-plan" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    await expect(
      client.createCase({ title: "Orphan case", suiteId: "missing-suite" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("mutates in-memory state for create and lifecycle commands", async () => {
    const client = createMockTestingClient();

    const createdPlan = await client.createPlan({ name: "New plan" });
    const plans = await client.listPlans();
    expect(plans.items.some((item) => item.id === createdPlan.id)).toBe(true);

    const createdSuite = await client.createSuite({
      name: "New suite",
      planId: FIXTURE_IDS.plan,
    });
    expect(createdSuite.planId).toBe(FIXTURE_IDS.plan);
    const suites = await client.listSuites();
    expect(suites.items.some((item) => item.id === createdSuite.id)).toBe(true);

    const createdCase = await client.createCase({
      title: "New case",
      suiteId: FIXTURE_IDS.suite,
    });
    expect(createdCase.suiteId).toBe(FIXTURE_IDS.suite);
    const cases = await client.listCases();
    expect(cases.items.some((item) => item.id === createdCase.id)).toBe(true);

    const started = await client.startExecution({ caseId: FIXTURE_IDS.case });
    expect(started.status).toBe("in_progress");

    const paused = await client.pauseExecution(started.id);
    expect(paused.status).toBe("paused");

    const resumed = await client.resumeExecution(started.id);
    expect(resumed.status).toBe("in_progress");

    const evidence = await client.submitEvidence({
      executionId: started.id,
      title: "Note",
    });
    expect(evidence.title).toBe("Note");

    const reviewed = await client.decideCertification({
      certificationId: FIXTURE_IDS.certification,
      decision: "review",
      comment: "Needs waiver",
    });
    expect(reviewed.state).toBe("in_review");

    const approved = await client.decideCertification({
      certificationId: FIXTURE_IDS.certification,
      decision: "approve",
    });
    expect(approved.state).toBe("approved");
  });

  it("supports reject and archive certification decisions", async () => {
    const client = createMockTestingClient();

    const rejected = await client.decideCertification({
      certificationId: FIXTURE_IDS.certification,
      decision: "reject",
      comment: "Blocked",
    });
    expect(rejected.state).toBe("rejected");

    const archived = await client.archiveCertification(FIXTURE_IDS.certification);
    expect(archived.state).toBe("archived");
    expect(
      archived.audit.some((entry) => entry.action === "certification.archived"),
    ).toBe(true);
  });

  it("starts a new execution when no existing record matches the case", async () => {
    const client = createMockTestingClient();
    const newCase = await client.createCase({
      title: "Fresh case",
      suiteId: FIXTURE_IDS.suite,
    });

    const started = await client.startExecution({ caseId: newCase.id });
    expect(started.status).toBe("in_progress");
    expect(started.caseKey).toBe(newCase.key);
  });

  it("throws when AbortSignal is already aborted", async () => {
    const client = createMockTestingClient();
    const controller = new AbortController();
    controller.abort();

    await expect(
      client.getDashboard({ signal: controller.signal }),
    ).rejects.toMatchObject({
      code: "ABORTED",
      status: 499,
    });

    await expect(
      client.listPlans(undefined, { signal: controller.signal }),
    ).rejects.toMatchObject({
      code: "ABORTED",
    });

    await expect(
      client.createPlan({ name: "Aborted" }, { signal: controller.signal }),
    ).rejects.toMatchObject({ code: "ABORTED" });
  });
});
