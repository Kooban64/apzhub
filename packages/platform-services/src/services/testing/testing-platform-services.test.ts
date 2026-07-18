import { describe, expect, it, vi } from "vitest";

import {
  PlatformServiceError,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import {
  asAutomatedExecutionId,
  asExecutionSessionId,
  asTestCaseId,
  asTestPlanId,
  asTestStepId,
  type TestPlanId,
} from "@apzhub/testing-contracts";

import { DenyAllAuthorizationProvider } from "../../authorization/production-authorization-provider";
import { createPlatformServices } from "../create-platform-services";
import { createTestingPlatformServicesForTest } from "./create-testing-platform-services";

const ctx: ServiceRequestContext = {
  tenantId: "tenant_a",
  userId: "user_1",
  correlationId: "corr_1",
  permissions: [
    "*",
    "testing.*",
    "certification.*",
    "approval.*",
    "quality.*",
    "coverage.*",
    "defects.*",
    "release.*",
    "evidence.*",
    "traceability.*",
    "reporting.*",
    "report.*",
  ],
  organisationId: "org_1",
};

const ctxTenantB: ServiceRequestContext = {
  ...ctx,
  tenantId: "tenant_b",
  correlationId: "corr_2",
};

function createHarness() {
  const testing = createTestingPlatformServicesForTest({
    allowInMemoryPersistence: true,
  });
  const services = createPlatformServices({
    testing,
    authorizationMode: "allow-all",
  });
  return { services, testing };
}

async function createPlan(
  services: ReturnType<typeof createHarness>["services"],
  key = "PLAN-1",
) {
  return services.gateway.testing.plans.create(ctx, {
    tenantId: ctx.tenantId,
    key,
    name: `Plan ${key}`,
    status: "draft",
    suiteIds: [],
    requirementIds: [],
    riskIds: [],
  });
}

async function createSuiteAndCase(
  services: ReturnType<typeof createHarness>["services"],
  planId: TestPlanId,
) {
  const suite = await services.gateway.testing.suites.create(ctx, {
    tenantId: ctx.tenantId,
    key: "SUITE-1",
    name: "Smoke suite",
    status: "draft",
    planIds: [planId],
    caseIds: [],
    isRegression: true,
  });
  const testCase = await services.gateway.testing.cases.create(ctx, {
    tenantId: ctx.tenantId,
    key: "TC-1",
    title: "Valid login",
    status: "draft",
    priority: "high",
    suiteIds: [suite.id],
    requirementIds: [],
    steps: [
      {
        id: asTestStepId("step_1"),
        caseId: asTestCaseId("pending"),
        ordinal: 0,
        action: "Open login",
        expectedResult: "Login form is visible",
      },
    ],
    components: ["auth"],
  });
  return { suite, testCase };
}

describe("Testing platform gateway", () => {
  it("exposes testing when enabled and leaves Projects/Support unchanged when absent", () => {
    const { services } = createHarness();
    expect(services.gateway.testing.plans).toBeDefined();

    const withoutTesting = createPlatformServices({ authorizationMode: "allow-all" });
    expect(() => withoutTesting.gateway.testing).toThrow(PlatformServiceError);
    expect(withoutTesting.gateway.projects).toBeDefined();
    expect(() => withoutTesting.gateway.support).toThrow(PlatformServiceError);
  });
});

describe("Testing plans, suites, and cases", () => {
  it("creates, lists, gets, updates, clones, and archives plans", async () => {
    const { services } = createHarness();

    const plan = await createPlan(services);
    expect(plan.key).toBe("PLAN-1");
    expect(await services.gateway.testing.plans.list(ctx)).toHaveLength(1);
    expect((await services.gateway.testing.plans.get(ctx, plan.id)).id).toBe(plan.id);

    const updated = await services.gateway.testing.plans.update(ctx, plan.id, {
      name: "Updated plan",
      status: "review",
    });
    expect(updated.name).toBe("Updated plan");

    const cloned = await services.gateway.testing.plans.clone(ctx, plan.id, {
      key: "PLAN-1-C",
    });
    expect(cloned.parentPlanId).toBe(plan.id);

    const archived = await services.gateway.testing.plans.archive(ctx, plan.id);
    expect(archived.id).toBe(plan.id);
  });

  it("creates linked suites and cases and reads them back", async () => {
    const { services } = createHarness();
    const plan = await createPlan(services);
    const { suite, testCase } = await createSuiteAndCase(services, plan.id);

    expect((await services.gateway.testing.suites.list(ctx))[0]?.id).toBe(suite.id);
    expect(
      (await services.gateway.testing.suites.get(ctx, suite.id)).planIds,
    ).toContain(plan.id);
    expect((await services.gateway.testing.cases.list(ctx))[0]?.id).toBe(testCase.id);
    expect(
      (await services.gateway.testing.cases.get(ctx, testCase.id)).suiteIds,
    ).toContain(suite.id);
  });

  it("updates, clones, and archives suites and cases through the gateway", async () => {
    const { services } = createHarness();
    const plan = await createPlan(services);
    const { suite, testCase } = await createSuiteAndCase(services, plan.id);

    const updatedSuite = await services.gateway.testing.suites.update(ctx, suite.id, {
      name: "Updated smoke suite",
      status: "review",
      sortOrder: 3,
    });
    expect(updatedSuite.name).toBe("Updated smoke suite");
    const clonedSuite = await services.gateway.testing.suites.clone(ctx, suite.id, {
      key: "SUITE-1-C",
    });
    expect(clonedSuite.key).toBe("SUITE-1-C");
    expect(await services.gateway.testing.suites.archive(ctx, suite.id)).toMatchObject({
      id: suite.id,
    });

    const updatedCase = await services.gateway.testing.cases.update(ctx, testCase.id, {
      title: "Valid login with MFA",
      priority: "critical",
      tags: ["smoke"],
    });
    expect(updatedCase.priority).toBe("critical");
    await expect(
      services.gateway.testing.cases.transitionStatus(ctx, testCase.id, "review"),
    ).resolves.toMatchObject({ status: "review" });
    await expect(
      services.gateway.testing.cases.transitionStatus(ctx, testCase.id, "approved"),
    ).resolves.toMatchObject({ status: "approved" });
    const clonedCase = await services.gateway.testing.cases.clone(ctx, testCase.id, {
      key: "TC-1-C",
      title: "Valid login clone",
    });
    expect(clonedCase.parentCaseId).toBe(testCase.id);
    expect(
      await services.gateway.testing.cases.archive(ctx, testCase.id),
    ).toMatchObject({
      status: "archived",
    });
  });

  it("creates, lists, gets, updates, and archives requirements", async () => {
    const { services } = createHarness();

    const req = await services.gateway.testing.requirements.create(ctx, {
      tenantId: ctx.tenantId,
      key: "REQ-1",
      title: "Login is required",
      priority: "high",
      workItemRefs: [],
      riskIds: [],
    });
    expect(await services.gateway.testing.requirements.list(ctx)).toHaveLength(1);
    expect((await services.gateway.testing.requirements.get(ctx, req.id)).key).toBe(
      "REQ-1",
    );
    expect(
      await services.gateway.testing.requirements.update(ctx, req.id, {
        title: "Updated requirement",
        priority: "medium",
      }),
    ).toMatchObject({ title: "Updated requirement" });
    await expect(
      services.gateway.testing.requirements.archive(ctx, req.id),
    ).resolves.toMatchObject({ id: req.id });
  });
});

describe("Testing executions and evidence", () => {
  it("creates, starts, pauses, resumes, and rejects invalid transitions", async () => {
    const { services } = createHarness();
    const plan = await createPlan(services);
    const { testCase } = await createSuiteAndCase(services, plan.id);

    const created = await services.gateway.testing.executions.create(ctx, {
      tenantId: ctx.tenantId,
      sessionId: asExecutionSessionId("session_1"),
      caseId: testCase.id,
    });
    const started = await services.gateway.testing.executions.start(ctx, created.id);
    expect(started.status).toBe("in_progress");
    expect(
      (await services.gateway.testing.executions.pause(ctx, created.id)).status,
    ).toBe("paused");
    expect(
      (await services.gateway.testing.executions.resume(ctx, created.id)).status,
    ).toBe("in_progress");
    await services.gateway.testing.executions.complete(ctx, created.id, "pass");

    await expect(
      services.gateway.testing.executions.pause(ctx, created.id),
    ).rejects.toMatchObject({
      code: "INVALID_STATE_TRANSITION",
    });
  });

  it("covers assignment, blocking, review, reopen, cancel, archive, restore, and step recording", async () => {
    const { services } = createHarness();
    const plan = await createPlan(services);
    const { testCase } = await createSuiteAndCase(services, plan.id);
    const stepId = testCase.steps[0]!.id;

    const execution = await services.gateway.testing.executions.create(ctx, {
      tenantId: ctx.tenantId,
      sessionId: asExecutionSessionId("session_full"),
      caseId: testCase.id,
    });
    expect((await services.gateway.testing.executions.list(ctx))[0]?.id).toBe(
      execution.id,
    );
    expect(
      (await services.gateway.testing.executions.get(ctx, execution.id)).caseId,
    ).toBe(testCase.id);
    expect(
      await services.gateway.testing.executions.assign(ctx, execution.id, "tester_2"),
    ).toMatchObject({
      assigneeId: "tester_2",
      status: "assigned",
    });
    await services.gateway.testing.executions.start(ctx, execution.id);
    await expect(
      services.gateway.testing.executions.recordStepActual(ctx, execution.id, stepId, {
        status: "pass",
        actualResult: "Login form appeared",
        expectedSnapshot: "Login form is visible",
        comment: "ok",
      }),
    ).resolves.toMatchObject({ overallResult: "pass" });
    await expect(
      services.gateway.testing.executions.setStepStatus(
        ctx,
        execution.id,
        stepId,
        "pass",
      ),
    ).resolves.toMatchObject({ overallResult: "pass" });
    await expect(
      services.gateway.testing.executions.block(
        ctx,
        execution.id,
        "environment outage",
      ),
    ).resolves.toMatchObject({ status: "blocked", blockReason: "environment outage" });
    await expect(
      services.gateway.testing.executions.unblock(ctx, execution.id),
    ).resolves.toMatchObject({
      status: "in_progress",
    });
    await services.gateway.testing.executions.complete(ctx, execution.id, "pass");
    await expect(
      services.gateway.testing.executions.submitForReview(ctx, execution.id),
    ).resolves.toMatchObject({ status: "under_review" });
    await expect(
      services.gateway.testing.executions.approve(ctx, execution.id, "approved"),
    ).resolves.toMatchObject({ status: "approved", approvalState: "approved" });
    await expect(
      services.gateway.testing.executions.reopen(ctx, execution.id),
    ).resolves.toMatchObject({
      status: "under_review",
    });
    await expect(
      services.gateway.testing.executions.reject(ctx, execution.id, "needs evidence"),
    ).resolves.toMatchObject({ status: "rejected", approvalState: "rejected" });
    await expect(
      services.gateway.testing.executions.reopen(ctx, execution.id),
    ).resolves.toMatchObject({
      status: "in_progress",
    });

    const cancellable = await services.gateway.testing.executions.create(ctx, {
      tenantId: ctx.tenantId,
      sessionId: asExecutionSessionId("session_cancel"),
      caseId: testCase.id,
    });
    await expect(
      services.gateway.testing.executions.cancel(ctx, cancellable.id, "not needed"),
    ).resolves.toMatchObject({ status: "cancelled" });

    const archived = await services.gateway.testing.executions.create(ctx, {
      tenantId: ctx.tenantId,
      sessionId: asExecutionSessionId("session_archive"),
      caseId: testCase.id,
    });
    await expect(
      services.gateway.testing.executions.archive(ctx, archived.id),
    ).resolves.toMatchObject({
      status: "archived",
    });
    await expect(
      services.gateway.testing.executions.restore(ctx, archived.id),
    ).resolves.toMatchObject({
      status: "draft",
    });
  });

  it("registers, submits, and lists evidence metadata without exposing storage writes", async () => {
    const { services } = createHarness();

    const evidence = await services.gateway.testing.evidence.registerEvidence(ctx, {
      tenantId: ctx.tenantId,
      type: "screenshot",
      title: "Login screen",
      storageRef: "s3://evidence/login.png",
      checksum: "sha256-demo",
      mimeType: "image/png",
      sizeBytes: 42,
      lifecycleStatus: "captured",
    });

    const captured = await services.gateway.testing.evidence.getEvidence(
      ctx,
      evidence.id,
    );
    expect(captured.storageRef).toBe("s3://evidence/login.png");
    await services.gateway.testing.evidence.submitEvidence(ctx, evidence.id);
    expect(await services.gateway.testing.evidence.listEvidence(ctx)).toHaveLength(1);
    expect("putViaStorage" in services.gateway.testing.evidence).toBe(false);
  });

  it("verifies, approves, rejects, and archives evidence through lifecycle paths", async () => {
    const { services } = createHarness();

    const approvable = await services.gateway.testing.evidence.registerEvidence(ctx, {
      tenantId: ctx.tenantId,
      type: "log",
      title: "Execution log",
      storageRef: "s3://evidence/run.log",
      lifecycleStatus: "captured",
    });
    await services.gateway.testing.evidence.submitEvidence(ctx, approvable.id);
    await expect(
      services.gateway.testing.evidence.verifyEvidence(
        ctx,
        approvable.id,
        "checksum_ok",
      ),
    ).resolves.toMatchObject({
      lifecycleStatus: "verified",
      verificationState: "checksum_ok",
    });
    await expect(
      services.gateway.testing.evidence.approveEvidence(ctx, approvable.id),
    ).resolves.toMatchObject({
      lifecycleStatus: "approved",
      approvalState: "approved",
    });

    const rejectable = await services.gateway.testing.evidence.registerEvidence(ctx, {
      tenantId: ctx.tenantId,
      type: "screenshot",
      title: "Broken screenshot",
      storageRef: "s3://evidence/bad.png",
      lifecycleStatus: "captured",
    });
    await services.gateway.testing.evidence.submitEvidence(ctx, rejectable.id);
    await expect(
      services.gateway.testing.evidence.rejectEvidence(ctx, rejectable.id, "blurry"),
    ).resolves.toMatchObject({
      lifecycleStatus: "rejected",
      approvalState: "rejected",
    });
    await expect(
      services.gateway.testing.evidence.archiveEvidence(ctx, rejectable.id),
    ).resolves.toMatchObject({ lifecycleStatus: "archived" });
  });
});

describe("Testing automation, coverage, defects, quality, traceability, and approvals", () => {
  it("validates and imports automation results and reads runs, history, and coverage", async () => {
    const { services } = createHarness();
    const payload = {
      externalRunRef: "gw-auto-1",
      suites: [
        {
          name: "api",
          cases: [
            {
              title: "returns ok",
              status: "pass",
              requirementRefs: ["REQ-1"],
              steps: [{ name: "call endpoint", status: "pass" }],
            },
          ],
        },
      ],
      coverage: { covered: 9, total: 10, percentage: 90, kind: "suite" },
    };

    await expect(
      services.gateway.testing.automation.validateImport(ctx, {
        adapterKind: "generic_json",
        externalRunRef: "canonical-1",
        environment: {},
        suites: [{ name: "api", cases: [{ title: "returns ok", status: "pass" }] }],
        evidence: [],
        overallStatus: "pass",
      }),
    ).resolves.toBeUndefined();

    const outcome = await services.gateway.testing.automation.importResult(ctx, {
      adapterKind: "generic_json",
      payload,
    });
    expect(outcome.importRecord.status).toBe("completed");
    expect(await services.gateway.testing.automation.listImports(ctx)).toHaveLength(1);
    expect(
      await services.gateway.testing.automation.getImport(ctx, outcome.importRecord.id),
    ).toMatchObject({ externalRunRef: "gw-auto-1" });
    expect(
      await services.gateway.testing.automation.listImportHistory(
        ctx,
        outcome.importRecord.id,
      ),
    ).not.toHaveLength(0);
    expect(await services.gateway.testing.automation.getHistory(ctx)).not.toHaveLength(
      0,
    );

    const executionId = outcome.execution!.id;
    const runs = await services.gateway.testing.automation.listRuns(ctx, executionId);
    expect(runs).toHaveLength(1);
    await expect(
      services.gateway.testing.automation.getRun(ctx, runs[0]!.id),
    ).resolves.toMatchObject({ title: "returns ok" });
    expect(
      await services.gateway.testing.automation.listResultItems(ctx, runs[0]!.id),
    ).toHaveLength(1);
    expect(
      await services.gateway.testing.automation.listCoverageSnapshots(
        ctx,
        outcome.importRecord.id,
      ),
    ).toHaveLength(1);
    await expect(
      services.gateway.testing.automation.aggregateCoverage(ctx, executionId),
    ).resolves.toMatchObject({ covered: 9, total: 10, percentage: 90 });
    await expect(
      services.gateway.testing.automation.aggregateCoverage(
        ctx,
        asAutomatedExecutionId("missing_execution"),
      ),
    ).resolves.toEqual({});
  });

  it("recomputes coverage and reads quality summaries and snapshots", async () => {
    const { services } = createHarness();
    const plan = await createPlan(services);
    const { testCase } = await createSuiteAndCase(services, plan.id);

    const metrics = await services.gateway.testing.coverage.recompute(ctx, {
      planId: plan.id,
      subjectId: testCase.id,
    });
    expect(metrics.length).toBeGreaterThan(0);
    expect(await services.gateway.testing.coverage.listMetrics(ctx)).not.toHaveLength(
      0,
    );
    await expect(
      services.gateway.testing.coverage.getMetric(ctx, metrics[0]!.id),
    ).resolves.toMatchObject({ id: metrics[0]!.id });
    expect(
      await services.gateway.testing.coverage.listMetricsByKind(ctx, metrics[0]!.kind),
    ).not.toHaveLength(0);
    expect(
      await services.gateway.testing.coverage.listMetricsForPlan(ctx, plan.id),
    ).not.toHaveLength(0);
    expect(
      await services.gateway.testing.coverage.listMetricsForSubject(ctx, plan.id),
    ).not.toHaveLength(0);
    await expect(
      services.gateway.testing.coverage.requestRecompute(ctx, plan.id),
    ).resolves.toMatchObject({ accepted: true, correlationId: ctx.correlationId });
    await expect(
      services.gateway.testing.coverage.recomputeAll(ctx, { planId: plan.id }),
    ).resolves.toEqual(expect.any(Array));

    const summary = await services.gateway.testing.quality.summarize(ctx, {
      planId: plan.id,
    });
    expect(summary.computedAt).toEqual(expect.any(String));
    const baseline = await services.gateway.testing.quality.computeSnapshot(
      ctx,
      { planId: plan.id },
      "baseline",
    );
    const current = await services.gateway.testing.quality.computeSnapshot(
      ctx,
      { planId: plan.id },
      "current",
    );
    expect(
      (await services.gateway.testing.quality.listSnapshots(ctx)).length,
    ).toBeGreaterThanOrEqual(2);
    await expect(
      services.gateway.testing.quality.getSnapshot(ctx, baseline.id),
    ).resolves.toMatchObject({ label: "baseline" });
    await expect(
      services.gateway.testing.quality.compareSnapshots(ctx, baseline.id, current.id),
    ).resolves.toEqual(expect.any(Object));
    await expect(
      services.gateway.testing.quality.compareWindows(
        ctx,
        { label: "baseline", metrics: { passRate: 70 } },
        { label: "current", metrics: { passRate: 90 } },
      ),
    ).resolves.toEqual(expect.any(Object));
  });

  it("creates, links, lists, updates, and archives defects", async () => {
    const { services } = createHarness();
    const plan = await createPlan(services);

    const defect = await services.gateway.testing.defects.create(ctx, {
      tenantId: ctx.tenantId,
      providerKind: "projects",
      status: "open",
      summary: "Login defect",
      externalRef: "PROJ-1",
      severity: "major",
      priority: "high",
      planIds: [plan.id],
    });
    await expect(
      services.gateway.testing.defects.link(ctx, defect.id, "test_plan", plan.id),
    ).resolves.toMatchObject({ id: defect.id });
    expect(await services.gateway.testing.defects.list(ctx)).toHaveLength(1);
    await expect(
      services.gateway.testing.defects.get(ctx, defect.id),
    ).resolves.toMatchObject({
      providerKind: "projects",
      summary: "Login defect",
    });
    await expect(
      services.gateway.testing.defects.update(ctx, defect.id, {
        status: "in_progress",
        summary: "Triaged defect",
      }),
    ).resolves.toMatchObject({ status: "in_progress", summary: "Triaged defect" });
    await expect(
      services.gateway.testing.defects.archive(ctx, defect.id),
    ).resolves.toMatchObject({
      id: defect.id,
    });
  });

  it("creates traceability links and approval requests and decisions", async () => {
    const { services } = createHarness();
    const plan = await createPlan(services);
    const { testCase } = await createSuiteAndCase(services, plan.id);
    const req = await services.gateway.testing.requirements.create(ctx, {
      tenantId: ctx.tenantId,
      key: "REQ-T",
      title: "Traceable requirement",
      priority: "medium",
      workItemRefs: [],
      riskIds: [],
    });

    const link = await services.gateway.testing.traceability.createLink(ctx, {
      tenantId: ctx.tenantId,
      type: "covers",
      sourceKind: "test_case",
      sourceId: testCase.id,
      targetKind: "requirement",
      targetId: req.id,
      notes: "gateway",
    });
    await expect(
      services.gateway.testing.traceability.getLink(ctx, link.id),
    ).resolves.toMatchObject({
      id: link.id,
    });
    expect(await services.gateway.testing.traceability.listLinks(ctx)).toHaveLength(1);
    await expect(
      services.gateway.testing.traceability.getMatrixForRequirement(ctx, req.id),
    ).resolves.toMatchObject({ covered: true });
    expect(await services.gateway.testing.traceability.listMatrix(ctx)).toHaveLength(1);

    const relationship = await services.gateway.testing.traceability.createRelationship(
      ctx,
      {
        tenantId: ctx.tenantId,
        type: "related",
        sourceKind: "test_case",
        sourceId: testCase.id,
        targetKind: "release",
        targetId: "release_1",
      },
    );
    await services.gateway.testing.traceability.removeRelationship(
      ctx,
      relationship.id,
    );
    await services.gateway.testing.traceability.removeLink(ctx, link.id);

    const cert = await services.gateway.testing.certification.create(ctx, {
      tenantId: ctx.tenantId,
      key: "CERT-APP",
      name: "Approval cert",
      status: "draft",
      planId: plan.id,
      gateIds: [],
      approvalIds: [],
    });
    const approval = await services.gateway.testing.approvals.request(ctx, {
      tenantId: ctx.tenantId,
      certificationRecordId: cert.id,
      status: "pending",
      authorUserId: ctx.userId,
      subjectKind: "certification",
      subjectId: cert.id,
    });
    expect(await services.gateway.testing.approvals.list(ctx)).toHaveLength(1);
    await expect(
      services.gateway.testing.approvals.get(ctx, approval.id),
    ).resolves.toMatchObject({
      id: approval.id,
    });
    await expect(
      services.gateway.testing.approvals.decide(ctx, approval.id, {
        status: "approved",
        comments: "ok",
        decidedByUserId: ctx.userId,
      }),
    ).resolves.toMatchObject({ status: "approved" });
    expect(
      await services.gateway.testing.approvals.listHistory(ctx, approval.id),
    ).not.toHaveLength(0);

    const submitted = await services.gateway.testing.approvals.submitForReview(ctx, {
      subjectKind: "manual_execution",
      subjectId: "exec_1",
      comments: "review requested",
    });
    expect(submitted.subjectKind).toBe("manual_execution");
  });
});

describe("Testing certification, dashboard, reporting, and readiness", () => {
  it("covers certification APIs and keeps recommendations advisory", async () => {
    const { services, testing } = createHarness();
    const plan = await createPlan(services);
    const cert = await services.gateway.testing.certification.create(ctx, {
      tenantId: ctx.tenantId,
      key: "CERT-1",
      name: "Release certification",
      status: "awaiting_approval",
      planId: plan.id,
      gateIds: [],
      approvalIds: [],
    });

    expect((await services.gateway.testing.certification.list(ctx))[0]?.id).toBe(
      cert.id,
    );
    expect(
      (await services.gateway.testing.certification.get(ctx, cert.id)).planId,
    ).toBe(plan.id);
    const gates = await services.gateway.testing.certification.evaluateGates(
      ctx,
      cert.id,
    );
    expect(Array.isArray(gates)).toBe(true);
    await testing.domain.certification.recommendations.recommend(ctx, cert.id);
    await expect(
      services.gateway.testing.certification.getRecommendation(ctx, cert.id),
    ).resolves.toMatchObject({ advisoryOnly: true });
    expect(
      await services.gateway.testing.certification.listAudit(ctx, cert.id),
    ).toEqual(expect.any(Array));
    expect("autoApprove" in services.gateway.testing.certification).toBe(false);
    await expect(
      services.gateway.testing.certification.approve(ctx, cert.id, "human approval"),
    ).resolves.toMatchObject({ status: "approved" });
  });

  it("prepares certification records and walks manual workflow transitions", async () => {
    const { services } = createHarness();
    const plan = await createPlan(services);

    await expect(
      services.gateway.testing.certification.prepareForPlan(ctx, plan.id),
    ).resolves.toMatchObject({ planId: plan.id });

    const cert = await services.gateway.testing.certification.create(ctx, {
      tenantId: ctx.tenantId,
      key: "CERT-WF",
      name: "Workflow certification",
      status: "draft",
      planId: plan.id,
      gateIds: [],
      approvalIds: [],
    });
    await expect(
      services.gateway.testing.certification.prepareForCertification(ctx, cert.id),
    ).resolves.toMatchObject({ certificationRecordId: cert.id });

    const review = await services.gateway.testing.certification.create(ctx, {
      tenantId: ctx.tenantId,
      key: "CERT-REVIEW",
      name: "Review certification",
      status: "uat_ready",
      planId: plan.id,
      gateIds: [],
      approvalIds: [],
    });
    await expect(
      services.gateway.testing.certification.startReview(ctx, review.id, "ready"),
    ).resolves.toMatchObject({ status: "in_review" });
    await expect(
      services.gateway.testing.certification.requestChanges(
        ctx,
        review.id,
        "missing evidence",
      ),
    ).resolves.toMatchObject({ status: "changes_required" });

    const conditional = await services.gateway.testing.certification.create(ctx, {
      tenantId: ctx.tenantId,
      key: "CERT-COND",
      name: "Conditional certification",
      status: "uat_ready",
      planId: plan.id,
      gateIds: [],
      approvalIds: [],
    });
    await expect(
      services.gateway.testing.certification.startReview(ctx, conditional.id, "fixed"),
    ).resolves.toMatchObject({ status: "in_review" });
    await expect(
      services.gateway.testing.certification.submitForApproval(
        ctx,
        conditional.id,
        "submit",
      ),
    ).resolves.toMatchObject({ status: "awaiting_approval" });
    await expect(
      services.gateway.testing.certification.conditionallyApprove(
        ctx,
        conditional.id,
        "monitor",
      ),
    ).resolves.toMatchObject({ status: "conditionally_approved" });
    expect(
      await services.gateway.testing.certification.getAuditHistory(ctx, conditional.id),
    ).not.toHaveLength(0);

    const rejected = await services.gateway.testing.certification.create(ctx, {
      tenantId: ctx.tenantId,
      key: "CERT-REJ",
      name: "Rejected certification",
      status: "awaiting_approval",
      planId: plan.id,
      gateIds: [],
      approvalIds: [],
    });
    await expect(
      services.gateway.testing.certification.reject(ctx, rejected.id, "no"),
    ).resolves.toMatchObject({ status: "rejected" });
    await expect(
      services.gateway.testing.certification.archive(ctx, rejected.id, "done"),
    ).resolves.toMatchObject({ status: "archived" });

    const expiring = await services.gateway.testing.certification.create(ctx, {
      tenantId: ctx.tenantId,
      key: "CERT-EXP",
      name: "Expired certification",
      status: "approved",
      planId: plan.id,
      gateIds: [],
      approvalIds: [],
    });
    await expect(
      services.gateway.testing.certification.expire(ctx, expiring.id, "stale"),
    ).resolves.toMatchObject({ status: "expired" });
    await expect(
      services.gateway.testing.certification.evaluateGate(
        ctx,
        expiring.id,
        "traceability",
      ),
    ).resolves.toMatchObject({ gateKey: "traceability" });
  });

  it("returns typed dashboard, reporting templates as placeholders, and advisory release readiness", async () => {
    const { services } = createHarness();
    const plan = await createPlan(services);

    const dashboard = await services.gateway.testing.dashboard.getDashboardSummary(ctx);
    expect(dashboard.totals.plans).toBe(1);
    expect(dashboard.capturedAt).toEqual(expect.any(String));

    const placeholders =
      await services.gateway.testing.reporting.listReportPlaceholders(ctx);
    expect(placeholders.length).toBeGreaterThan(0);
    expect(placeholders[0]).toMatchObject({
      reason: "available",
      title: expect.any(String),
      id: expect.any(String),
    });

    const readiness = await services.gateway.testing.releaseReadiness.calculateForPlan(
      ctx,
      plan.id,
    );
    expect(readiness.planId).toBe(plan.id);
    expect(readiness.isDecision).toBe(false);
    const cert = await services.gateway.testing.certification.create(ctx, {
      tenantId: ctx.tenantId,
      key: "CERT-RR",
      name: "Readiness cert",
      status: "draft",
      planId: plan.id,
      gateIds: [],
      approvalIds: [],
    });
    await expect(
      services.gateway.testing.releaseReadiness.calculateForCertification(ctx, cert.id),
    ).resolves.toMatchObject({ certificationRecordId: cert.id, isDecision: false });
    await expect(
      services.gateway.testing.releaseReadiness.assessForPlan!(ctx, plan.id),
    ).resolves.toMatchObject({ planId: plan.id, isDecision: false });
    await expect(
      services.gateway.testing.releaseReadiness.assessForCertification!(ctx, cert.id),
    ).resolves.toMatchObject({ certificationRecordId: cert.id, isDecision: false });
  });
});

describe("Testing platform authorization, pipeline, tenancy, and errors", () => {
  it("denies missing permissions before executing the testing domain service", async () => {
    const testing = createTestingPlatformServicesForTest({
      allowInMemoryPersistence: true,
    });
    const listSpy = vi.spyOn(testing.domain.testPlans, "list");
    const services = createPlatformServices({
      testing,
      authorization: new DenyAllAuthorizationProvider(),
    });

    await expect(services.gateway.testing.plans.list(ctx)).rejects.toMatchObject({
      code: "PERMISSION_DENIED",
    });
    expect(listSpy).not.toHaveBeenCalled();
  });

  it("isolates tenants and maps missing resources to NOT_FOUND", async () => {
    const { services } = createHarness();
    const plan = await createPlan(services);

    await expect(
      services.gateway.testing.plans.get(ctxTenantB, plan.id),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(
      services.gateway.testing.plans.get(ctx, asTestPlanId("missing_plan")),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("invokes request pipeline logger and metrics for testing gateway operations", async () => {
    const testing = createTestingPlatformServicesForTest({
      allowInMemoryPersistence: true,
    });
    const log = vi.fn();
    const record = vi.fn();
    const services = createPlatformServices({
      testing,
      authorizationMode: "allow-all",
      logger: { log },
      metrics: { record },
    });

    await services.gateway.testing.plans.list(ctx);

    expect(log).toHaveBeenCalled();
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        service: "testingPlan",
        operation: "list",
      }),
    );
  });
});
