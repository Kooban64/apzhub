import { describe, expect, it } from "vitest";

import { createQepTestManagementRegistry } from "./compose";
import {
  createInMemoryTestManagementRepository,
  type InMemoryTestManagementRepository,
} from "./application/in-memory-repository";

function registry() {
  const repository =
    createInMemoryTestManagementRepository() as InMemoryTestManagementRepository;
  return {
    repository,
    service: createQepTestManagementRegistry({ repository }).service,
  };
}

describe("QEP Test management — Phase 3", () => {
  it("creates a Test Case bound to an application with a TS-* number", async () => {
    const { service } = registry();
    const created = await service.createTestCase({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "Login with valid credentials",
      steps: [
        { order: 1, action: "Open /login", expectedResult: "Login form is visible" },
      ],
    });
    expect(created.id.startsWith("tsp_")).toBe(true);
    expect(created.number).toMatch(/^TS-\d+$/);
    expect(created.applicationId).toBe("qapp-1");
    expect(created.steps).toHaveLength(1);
    expect(created.unbound).toBe(false);
    expect(created.lastResult).toBe("not_run");
  });

  it("rejects new Test Cases without application binding", async () => {
    const { service } = registry();
    await expect(
      service.createTestCase({
        tenantId: "tenant_a",
        applicationId: "",
        actorId: "user_1",
        title: "Login",
      }),
    ).rejects.toThrow("test_case.application_required");
  });

  it("does not introduce TC-* aliases", async () => {
    const { service } = registry();
    await expect(
      service.createTestCase({
        tenantId: "tenant_a",
        applicationId: "qapp-1",
        actorId: "user_1",
        title: "Login",
        number: "TC-101",
      }),
    ).rejects.toThrow("test_case.tc_alias_forbidden");
  });

  it("preserves an existing historical TS-* identifier", async () => {
    const { service } = registry();
    const created = await service.createTestCase({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "Historical case",
      number: "TS-142",
    });
    expect(created.number).toBe("TS-142");
  });

  it("stores ordered definition steps without execution state", async () => {
    const { service } = registry();
    const created = await service.createTestCase({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "Checkout",
      steps: [
        {
          order: 1,
          action: "Add item",
          testDataRef: "sku:DEMO",
          expectedResult: "Cart has item",
        },
        { order: 2, action: "Pay", expectedResult: "Order confirmed" },
      ],
    });
    expect(created.steps.map((step) => step.order)).toEqual([1, 2]);
    expect(created.steps[0]?.testDataRef).toBe("sku:DEMO");
    expect(created.steps[0]).not.toHaveProperty("actualResult");
    expect(created.steps[0]).not.toHaveProperty("outcome");
  });

  it("rejects raw secrets in test data", async () => {
    const { service } = registry();
    await expect(
      service.createTestCase({
        tenantId: "tenant_a",
        applicationId: "qapp-1",
        actorId: "user_1",
        title: "Login",
        steps: [
          {
            order: 1,
            action: "Enter password",
            testDataRef: "password=hunter2",
            expectedResult: "Authenticated",
          },
        ],
      }),
    ).rejects.toThrow("test_case.step.secrets_forbidden");
  });

  it("isolates Test Cases by tenant", async () => {
    const { service } = registry();
    await service.createTestCase({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "A",
    });
    const other = await service.listTestCases({
      tenantId: "tenant_b",
      applicationId: "qapp-1",
    });
    expect(other).toHaveLength(0);
  });

  it("links an Acceptance Criterion to a Test Case on the same application", async () => {
    const { service, repository } = registry();
    repository.seedCriterion({
      id: "qac-1",
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      requirementId: "req-1",
      criterionKey: "AC-12",
      text: "Valid credentials authenticate the user",
    });
    const created = await service.createTestCase({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "Login",
    });
    await service.linkAcceptanceCriterion({
      tenantId: "tenant_a",
      specificationId: created.id,
      criterionId: "qac-1",
      actorId: "user_1",
    });
    const loaded = await service.getTestCase("tenant_a", created.id);
    expect(loaded.criterionIds).toEqual(["qac-1"]);
    expect(loaded.lastResult).toBe("not_run");
  });

  it("rejects cross-application AC links", async () => {
    const { service, repository } = registry();
    repository.seedCriterion({
      id: "qac-2",
      tenantId: "tenant_a",
      applicationId: "qapp-other",
      requirementId: "req-1",
      criterionKey: "AC-99",
      text: "Other app",
    });
    const created = await service.createTestCase({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "Login",
    });
    await expect(
      service.linkAcceptanceCriterion({
        tenantId: "tenant_a",
        specificationId: created.id,
        criterionId: "qac-2",
        actorId: "user_1",
      }),
    ).rejects.toThrow("test_management.application_mismatch");
  });

  it("allocates SUITE-* keys and membership against Test Case ids", async () => {
    const { service } = registry();
    const testCase = await service.createTestCase({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "Login",
    });
    const suite = await service.createSuite({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      name: "Authentication",
    });
    expect(suite.suiteKey).toBe("SUITE-001");
    const withMember = await service.addSuiteMember({
      tenantId: "tenant_a",
      suiteId: suite.id,
      specificationId: testCase.id,
      actorId: "user_1",
    });
    expect(withMember.memberIds).toEqual([testCase.id]);
    expect(withMember.memberCount).toBe(1);
  });

  it("rejects cross-application Suite membership", async () => {
    const { service } = registry();
    const testCase = await service.createTestCase({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "Login",
    });
    const suite = await service.createSuite({
      tenantId: "tenant_a",
      applicationId: "qapp-2",
      actorId: "user_1",
      name: "Other",
    });
    await expect(
      service.addSuiteMember({
        tenantId: "tenant_a",
        suiteId: suite.id,
        specificationId: testCase.id,
        actorId: "user_1",
      }),
    ).rejects.toThrow("test_management.application_mismatch");
  });

  it("lets a Test Plan include Suites and individual Test Cases", async () => {
    const { service } = registry();
    const a = await service.createTestCase({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "A",
    });
    const b = await service.createTestCase({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "B",
    });
    const suite = await service.createSuite({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      name: "Core",
    });
    await service.addSuiteMember({
      tenantId: "tenant_a",
      suiteId: suite.id,
      specificationId: a.id,
      actorId: "user_1",
    });
    const plan = await service.createPlan({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "Sprint 12 regression",
      objective: "Cover authentication",
    });
    const withSuite = await service.addPlanSuite({
      tenantId: "tenant_a",
      planId: plan.id,
      suiteId: suite.id,
      actorId: "user_1",
    });
    expect(withSuite.internalExecutionPlanIds.length).toBeGreaterThan(0);
    const withBoth = await service.addPlanTestCase({
      tenantId: "tenant_a",
      planId: plan.id,
      specificationId: b.id,
      actorId: "user_1",
    });
    expect(withBoth.suiteIds).toEqual([suite.id]);
    expect(withBoth.specificationIds).toEqual([b.id]);
    expect(withBoth.progress.planned).toBe(2);
    expect(withBoth.progress.percent).toBe(0);
  });

  it("stores execution strategy with separated capability, surface, environment, and infrastructure", async () => {
    const { service, repository } = registry();
    repository.seedEnvironment({
      id: "env-qa",
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      name: "QA",
    });
    repository.seedTarget({
      id: "tgt-runner",
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      targetType: "managed_runner",
    });
    const plan = await service.createPlan({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "UAT",
      objective: "Browser verification",
    });
    const updated = await service.addStrategyGroup({
      tenantId: "tenant_a",
      planId: plan.id,
      actorId: "user_1",
      strategy: {
        name: "QA browsers",
        verificationCapability: "browser_automation",
        executionSurface: "web",
        environmentId: "env-qa",
        infrastructureTargetType: "managed_runner",
        infrastructureTargetId: "tgt-runner",
      },
    });
    expect(updated.strategy[0]?.verificationCapability).toBe("browser_automation");
    expect(updated.strategy[0]?.executionSurface).toBe("web");
    expect(updated.strategy[0]?.environmentId).toBe("env-qa");
    expect(updated.strategy[0]?.environmentName).toBe("QA");
    expect(updated.strategy[0]?.infrastructureTargetType).toBe("managed_runner");
  });

  it("refuses Web/API/Repository as infrastructure target types", async () => {
    const { service } = registry();
    const plan = await service.createPlan({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "SAST",
      objective: "Repository scan",
    });
    await expect(
      service.addStrategyGroup({
        tenantId: "tenant_a",
        planId: plan.id,
        actorId: "user_1",
        strategy: {
          name: "SAST",
          verificationCapability: "sast",
          executionSurface: "repository",
          infrastructureTargetType: "web",
        },
      }),
    ).rejects.toThrow("strategy.infrastructure_target.surface_not_allowed");
  });

  it("snapshots Test Case definition so later edits do not rewrite history", async () => {
    const { service } = registry();
    const created = await service.createTestCase({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "Login",
      steps: [{ order: 1, action: "Open login", expectedResult: "Form shown" }],
    });
    await service.snapshotTestCaseExecution({
      tenantId: "tenant_a",
      specificationId: created.id,
      executionId: "tex_1",
      executionKind: "test_execution",
    });
    await service.updateTestCase("tenant_a", created.id, "user_1", {
      steps: [{ order: 1, action: "Open /signin", expectedResult: "New form" }],
    });
    const snapshot = await service.getDefinitionSnapshot(
      "tenant_a",
      "tex_1",
      created.id,
    );
    expect(snapshot?.steps[0]?.action).toBe("Open login");
    const current = await service.getTestCase("tenant_a", created.id);
    expect(current.steps[0]?.action).toBe("Open /signin");
    expect(current.definitionVersion).toBe(2);
  });

  it("snapshots Suite membership so later members are not rewritten into history", async () => {
    const { service } = registry();
    const a = await service.createTestCase({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "A",
    });
    const b = await service.createTestCase({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "B",
    });
    const suite = await service.createSuite({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      name: "Auth",
    });
    await service.addSuiteMember({
      tenantId: "tenant_a",
      suiteId: suite.id,
      specificationId: a.id,
      actorId: "user_1",
    });
    await service.snapshotScope({
      tenantId: "tenant_a",
      executionId: "run-1",
      executionKind: "workspace_session",
      suiteId: suite.id,
    });
    await service.addSuiteMember({
      tenantId: "tenant_a",
      suiteId: suite.id,
      specificationId: b.id,
      actorId: "user_1",
    });
    const snapshot = await service.getScopeSnapshot("tenant_a", "run-1");
    expect(snapshot?.memberSpecificationIds).toEqual([a.id]);
    const current = await service.getSuite("tenant_a", suite.id);
    expect(current.memberIds).toEqual([a.id, b.id]);
  });

  it("presents both execution engines through one Executions read model", async () => {
    const { service } = registry();
    const plan = await service.createPlan({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "Plan",
      objective: "Run",
    });
    await service.recordExecution({
      id: "tex_formal",
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      planId: plan.id,
      mode: "manual",
      engine: "test_execution",
      result: "fail",
      executedAt: "2026-08-19T10:00:00.000Z",
      executedBy: "user_1",
    });
    await service.recordExecution({
      id: "exs_workspace",
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      planId: plan.id,
      mode: "suite_session",
      engine: "workspace_session",
      result: "pass",
      executedAt: "2026-08-19T11:00:00.000Z",
      executedBy: "user_1",
    });
    const listed = await service.listPlanExecutions("tenant_a", plan.id);
    expect(listed.map((row) => row.engine).sort()).toEqual([
      "test_execution",
      "workspace_session",
    ]);
    expect(
      listed.every((row) => row.mode === "manual" || row.mode === "suite_session"),
    ).toBe(true);
  });

  it("keeps coverage independent of latest result", async () => {
    const { service, repository } = registry();
    repository.seedCriterion({
      id: "qac-12",
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      requirementId: "req-1",
      criterionKey: "AC-12",
      text: "Login",
    });
    const created = await service.createTestCase({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "Login",
      number: "TS-142",
    });
    await service.linkAcceptanceCriterion({
      tenantId: "tenant_a",
      specificationId: created.id,
      criterionId: "qac-12",
      actorId: "user_1",
    });
    await service.recordExecution({
      id: "tex_fail",
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      specificationId: created.id,
      mode: "manual",
      engine: "test_execution",
      result: "fail",
      executedAt: "2026-08-19T12:00:00.000Z",
      executedBy: "user_1",
    });
    const loaded = await service.getTestCase("tenant_a", created.id);
    expect(loaded.criterionIds).toContain("qac-12");
    expect(loaded.lastResult).toBe("fail");
  });

  it("relates a defect to a formal Test Execution without a second defect model", async () => {
    const { service, repository } = registry();
    await service.relateDefectToTestExecution({
      tenantId: "tenant_a",
      testExecutionId: "tex_1",
      defectId: "def-1",
      actorId: "user_1",
    });
    const linked = await repository.listTestExecutionDefects("tenant_a", "tex_1");
    expect(linked).toEqual(["def-1"]);
  });
});

describe("QEP Test management — Phase 4", () => {
  async function seededPlan() {
    const { service, repository } = registry();
    repository.seedEnvironment({
      id: "env-1",
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      name: "QA",
    });
    const testCase = await service.createTestCase({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "Login",
      steps: [{ order: 1, action: "Open /login", expectedResult: "Form visible" }],
    });
    const other = await service.createTestCase({
      tenantId: "tenant_a",
      applicationId: "qapp-2",
      actorId: "user_1",
      title: "Other app case",
      steps: [{ order: 1, action: "Other", expectedResult: "Other" }],
    });
    const plan = await service.createPlan({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      title: "Sprint regression",
      objective: "Cover login",
    });
    await service.addPlanTestCase({
      tenantId: "tenant_a",
      planId: plan.id,
      specificationId: testCase.id,
      actorId: "user_1",
    });
    return { service, repository, testCase, other, plan };
  }

  it("rejects cross-application Plan scope", async () => {
    const { service, plan, other } = await seededPlan();
    await expect(
      service.addPlanTestCase({
        tenantId: "tenant_a",
        planId: plan.id,
        specificationId: other.id,
        actorId: "user_1",
      }),
    ).rejects.toThrow("test_management.application_mismatch");
  });

  it("resolves Plan execution scope from direct cases plus suite membership", async () => {
    const { service, plan, testCase } = await seededPlan();
    const suite = await service.createSuite({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      actorId: "user_1",
      name: "Auth",
    });
    await service.addSuiteMember({
      tenantId: "tenant_a",
      suiteId: suite.id,
      specificationId: testCase.id,
      actorId: "user_1",
    });
    await service.addPlanSuite({
      tenantId: "tenant_a",
      planId: plan.id,
      suiteId: suite.id,
      actorId: "user_1",
    });
    const scope = await service.resolvePlanExecutionScope({
      tenantId: "tenant_a",
      planId: plan.id,
    });
    expect(scope.applicationId).toBe("qapp-1");
    expect(scope.memberSpecificationIds).toEqual([testCase.id]);
  });

  it("freezes definition and strategy snapshots that later definition edits cannot rewrite", async () => {
    const { service, plan, testCase } = await seededPlan();
    await service.addStrategyGroup({
      tenantId: "tenant_a",
      planId: plan.id,
      actorId: "user_1",
      strategy: {
        name: "QA browsers",
        verificationCapability: "manual_verification",
        executionSurface: "manual",
        environmentId: "env-1",
      },
    });
    await service.freezeExecutionStart({
      tenantId: "tenant_a",
      executionId: "tex-run-1",
      executionKind: "test_execution",
      specificationId: testCase.id,
      planId: plan.id,
    });
    await service.updateTestCase("tenant_a", testCase.id, "user_1", {
      steps: [{ order: 1, action: "Changed later", expectedResult: "Changed" }],
    });
    const snapshot = await service.getDefinitionSnapshot(
      "tenant_a",
      "tex-run-1",
      testCase.id,
    );
    expect(snapshot?.steps[0]?.action).toBe("Open /login");
    const strategy = await service.getStrategySnapshot("tenant_a", "tex-run-1");
    expect(strategy?.environmentName).toBe("QA");
    expect(strategy?.verificationCapability).toBe("manual_verification");
  });

  it("records retest and rerun as distinct new-execution relations", async () => {
    const { service } = await seededPlan();
    await service.recordRelation({
      tenantId: "tenant_a",
      executionId: "tex-retest",
      relationKind: "retest",
      previousExecutionId: "tex-original",
      triggeringDefectId: "def-1",
      actorId: "user_1",
    });
    await service.recordRelation({
      tenantId: "tenant_a",
      executionId: "tex-rerun",
      relationKind: "rerun",
      previousExecutionId: "tex-original",
      actorId: "user_1",
    });
    const retest = await service.getExecutionRelation("tenant_a", "tex-retest");
    const rerun = await service.getExecutionRelation("tenant_a", "tex-rerun");
    expect(retest?.relationKind).toBe("retest");
    expect(retest?.triggeringDefectId).toBe("def-1");
    expect(rerun?.relationKind).toBe("rerun");
    expect(rerun?.triggeringDefectId).toBeUndefined();
    await expect(
      service.recordRelation({
        tenantId: "tenant_a",
        executionId: "tex-bad",
        relationKind: "retest",
        previousExecutionId: "tex-original",
        actorId: "user_1",
      }),
    ).rejects.toThrow("retest.defect_required");
  });

  it("lists presented executions for one application without a third store", async () => {
    const { service, plan } = await seededPlan();
    await service.recordExecution({
      id: "tex_app",
      tenantId: "tenant_a",
      applicationId: "qapp-1",
      planId: plan.id,
      mode: "manual",
      engine: "test_execution",
      status: "completed",
      result: "fail",
      executedAt: "2026-08-19T12:00:00.000Z",
      executedBy: "user_1",
    });
    await service.recordExecution({
      id: "tex_other",
      tenantId: "tenant_a",
      applicationId: "qapp-2",
      mode: "manual",
      engine: "test_execution",
      status: "completed",
      result: "pass",
      executedAt: "2026-08-19T12:00:00.000Z",
      executedBy: "user_1",
    });
    const listed = await service.listPresentedExecutions({
      tenantId: "tenant_a",
      applicationId: "qapp-1",
    });
    expect(listed.map((row) => row.id)).toEqual(["tex_app"]);
    expect(listed[0]?.status).toBe("completed");
    expect(listed[0]?.result).toBe("fail");
  });
});
