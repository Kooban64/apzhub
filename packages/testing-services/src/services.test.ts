import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import {
  asExecutionSessionId,
  asTestCaseId,
  asTestPlanId,
  asTestStepId,
  asTestSuiteId,
} from "@apzhub/testing-contracts";
import { createInMemoryTestingPersistence } from "@apzhub/testing-persistence";
import { describe, expect, it } from "vitest";

import {
  TESTING_SERVICES_VERSION,
  assertApprovalDecisionAllowed,
  assertExecutionStatusTransition,
  assertNoSelfLink,
  assertTestStatusTransition,
  canTransitionExecutionStatus,
  canTransitionTestStatus,
  createManualTestingServices,
  DomainRuleError,
} from "./index";

const ALL_PERMS = ["*"] as const;

function ctx(overrides?: Partial<ServiceRequestContext>): ServiceRequestContext {
  return {
    tenantId: "tenant_1",
    userId: "user_1",
    correlationId: "corr_1",
    permissions: ALL_PERMS,
    organisationId: "org_1",
    ...overrides,
  };
}

function services() {
  return createManualTestingServices({
    persistence: createInMemoryTestingPersistence(),
    now: () => "2026-07-12T10:00:00.000Z",
    id: (() => {
      let n = 0;
      return () => `id_${++n}`;
    })(),
  });
}

describe("@apzhub/testing-services", () => {
  it("exports version 0.11.0", () => {
    expect(TESTING_SERVICES_VERSION).toBe("0.11.0");
  });
});

describe("lifecycle state machines", () => {
  it("allows draft→review→approved and rejects illegal jumps", () => {
    expect(canTransitionTestStatus("draft", "review")).toBe(true);
    expect(canTransitionTestStatus("review", "approved")).toBe(true);
    expect(canTransitionTestStatus("approved", "deprecated")).toBe(true);
    expect(canTransitionTestStatus("draft", "approved")).toBe(false);
    expect(() => assertTestStatusTransition("draft", "archived")).not.toThrow();
    expect(() => assertTestStatusTransition("archived", "draft")).toThrow(
      DomainRuleError,
    );
  });

  it("treats ready as approved-compatible", () => {
    expect(canTransitionTestStatus("ready", "deprecated")).toBe(true);
  });

  it("supports execution pause/resume/complete/cancel", () => {
    expect(canTransitionExecutionStatus("draft", "assigned")).toBe(true);
    expect(canTransitionExecutionStatus("assigned", "in_progress")).toBe(true);
    expect(canTransitionExecutionStatus("in_progress", "paused")).toBe(true);
    expect(canTransitionExecutionStatus("paused", "in_progress")).toBe(true);
    expect(canTransitionExecutionStatus("in_progress", "completed")).toBe(true);
    expect(() => assertExecutionStatusTransition("completed", "paused")).toThrow(
      DomainRuleError,
    );
  });
});

describe("validation rules", () => {
  it("rejects self links and illegal approval transitions", () => {
    expect(() => assertNoSelfLink("test_case", "c1", "test_case", "c1")).toThrow(
      DomainRuleError,
    );
    expect(() => assertApprovalDecisionAllowed("pending", "approved")).not.toThrow();
    expect(() => assertApprovalDecisionAllowed("withdrawn", "approved")).toThrow(
      DomainRuleError,
    );
  });
});

describe("RequirementService / RiskService", () => {
  it("creates requirements and risks with extended fields", async () => {
    const svc = services();
    const req = await svc.requirements.create(ctx(), {
      tenantId: "tenant_1",
      key: "REQ-1",
      title: "Login required",
      priority: "high",
      workItemRefs: [],
      riskIds: [],
    });
    expect(req.key).toBe("REQ-1");

    const risk = await svc.risks.create(ctx(), {
      tenantId: "tenant_1",
      key: "RISK-1",
      title: "Auth bypass",
      level: "high",
      requirementIds: [req.id],
      severity: "critical",
      likelihood: "possible",
      impact: "major",
      businessCriticality: "mission_critical",
      regressionImportance: "mandatory",
    });
    expect(risk.likelihood).toBe("possible");
    expect(risk.regressionImportance).toBe("mandatory");
  });
});

describe("TestPlan / Suite / Case", () => {
  it("supports create, clone, version, status, ownership", async () => {
    const svc = services();
    const plan = await svc.testPlans.create(ctx(), {
      tenantId: "tenant_1",
      key: "PLAN-1",
      name: "Sprint plan",
      status: "draft",
      suiteIds: [],
      requirementIds: [],
      riskIds: [],
    });
    const cloned = await svc.testPlans.clone(ctx(), plan.id, { key: "PLAN-1-C" });
    expect(cloned.parentPlanId).toBe(plan.id);
    const versioned = await svc.testPlans.version(ctx(), plan.id);
    expect(versioned.versionNumber).toBe(2);
    await svc.testPlans.assignOwner(ctx(), plan.id, "owner_9");
    await svc.testPlans.setStatus(ctx(), plan.id, "review");

    const suite = await svc.testSuites.create(ctx(), {
      tenantId: "tenant_1",
      key: "SUITE-1",
      name: "Auth suite",
      status: "draft",
      planIds: [plan.id],
      caseIds: [],
      isRegression: true,
    });
    await svc.testSuites.reorder(ctx(), suite.id, 5);
    const suiteClone = await svc.testSuites.clone(ctx(), suite.id);
    expect(suiteClone.key).toContain("clone");

    const testCase = await svc.testCases.create(ctx(), {
      tenantId: "tenant_1",
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
          expectedResult: "Form visible",
        },
      ],
      preconditions: "User exists",
      postconditions: "Session created",
      parameters: [{ key: "username", defaultValue: "demo" }],
      components: ["auth"],
    });
    expect(testCase.preconditions).toBe("User exists");
    expect(testCase.parameters?.[0]?.key).toBe("username");

    await svc.testCases.transitionStatus(ctx(), testCase.id, "review");
    await svc.testCases.transitionStatus(ctx(), testCase.id, "approved");
    const caseClone = await svc.testCases.clone(ctx(), testCase.id, {
      key: "TC-1-C",
    });
    expect(caseClone.parentCaseId).toBe(testCase.id);

    const ver = await svc.testCases.version(ctx(), testCase.id, "manual_version");
    expect(ver.versionNumber).toBeGreaterThanOrEqual(1);
    const versions = await svc.testCases.listVersions(ctx(), testCase.id);
    expect(versions.length).toBeGreaterThan(0);

    const fromTemplate = await svc.testCases.createFromTemplate(
      ctx(),
      "login-template",
      {
        tenantId: "tenant_1",
        key: "TC-T",
        title: "From template",
      },
    );
    expect(fromTemplate.templateKey).toBe("login-template");
  });
});

describe("ManualExecutionService", () => {
  it("runs create/start/pause/resume/step/complete/restart lifecycle", async () => {
    const persistence = createInMemoryTestingPersistence();
    const local = createManualTestingServices({
      persistence,
      now: () => "2026-07-12T11:00:00.000Z",
      id: (() => {
        let n = 0;
        return () => `mid_${++n}`;
      })(),
    });
    const rctx = ctx();
    const sess = await persistence.executionSessions.create(
      {
        tenantId: "tenant_1",
        actorUserId: "user_1",
        permissions: ["*"],
        organisationId: "org_1",
      },
      {
        executionType: "manual",
        status: "in_progress",
      },
    );
    const createdCase = await local.testCases.create(rctx, {
      tenantId: "tenant_1",
      key: "TC-E",
      title: "Exec case",
      status: "approved",
      priority: "medium",
      suiteIds: [],
      requirementIds: [],
      steps: [
        {
          id: asTestStepId("s1"),
          caseId: asTestCaseId("case_pending"),
          ordinal: 0,
          action: "Do",
          expectedResult: "Ok",
        },
      ],
    });

    const created = await local.manualExecutions.create(rctx, {
      tenantId: "tenant_1",
      sessionId: asExecutionSessionId(sess.id),
      caseId: createdCase.id,
    });
    const exec = await local.manualExecutions.start(rctx, created.id);
    expect(exec.status).toBe("in_progress");
    await local.manualExecutions.pause(rctx, exec.id);
    await local.manualExecutions.resume(rctx, exec.id);
    const stepId = createdCase.steps[0]!.id;
    await local.manualExecutions.recordStepActual(rctx, exec.id, stepId, {
      status: "pass",
      actualResult: "worked",
      expectedSnapshot: "Ok",
      comment: "looks good",
    });
    await local.manualExecutions.addComment(rctx, exec.id, "note");
    const completed = await local.manualExecutions.complete(rctx, exec.id, "pass");
    expect(completed.status).toBe("completed");
    expect(completed.comments?.length).toBe(1);

    const restarted = await local.manualExecutions.restart(rctx, exec.id);
    expect(restarted.restartOfId).toBe(exec.id);
    expect(restarted.status).toBe("in_progress");

    const cancelled = await local.manualExecutions.cancel(rctx, restarted.id);
    expect(cancelled.status).toBe("cancelled");
    expect(local.events.listByType("manual_execution.started").length).toBeGreaterThan(
      0,
    );
  });
});

describe("Evidence / Approval / Traceability", () => {
  it("registers evidence metadata", async () => {
    const svc = services();
    const evidence = await svc.evidence.registerEvidence(ctx(), {
      tenantId: "tenant_1",
      type: "screenshot",
      title: "Login screen",
      storageRef: "s3://bucket/a.png",
      checksum: "abc",
      mimeType: "image/png",
      sizeBytes: 12,
      url: "https://example.test/a.png",
    });
    expect(evidence.checksum).toBe("abc");
    const linked = await svc.evidence.linkEvidenceRelationship(ctx(), evidence.id, {
      kind: "execution",
      targetId: "exec_1",
    });
    expect(linked.relationships?.length).toBe(1);
  });

  it("links bidirectional traceability and builds matrix", async () => {
    const persistence = createInMemoryTestingPersistence();
    const svc = createManualTestingServices({ persistence });
    const rctx = ctx();
    const req = await svc.requirements.create(rctx, {
      tenantId: "tenant_1",
      key: "R1",
      title: "Req",
      priority: "medium",
      workItemRefs: [],
      riskIds: [],
    });
    const tc = await svc.testCases.create(rctx, {
      tenantId: "tenant_1",
      key: "C1",
      title: "Case",
      status: "draft",
      priority: "low",
      suiteIds: [],
      requirementIds: [req.id],
      steps: [],
    });
    await svc.traceability.linkEntities(rctx, {
      type: "covers",
      sourceKind: "test_case",
      sourceId: tc.id,
      targetKind: "requirement",
      targetId: req.id,
      tenantId: "tenant_1",
    });
    const bi = await svc.traceability.getBidirectional(rctx, "requirement", req.id);
    expect(bi.incoming.length).toBe(1);
    const matrix = await svc.traceability.getMatrixForRequirement(rctx, req.id);
    expect(matrix.covered).toBe(true);
  });
});

describe("Approvals / Regression / Readiness", () => {
  it("handles approval rework and readiness inputs", async () => {
    const persistence = createInMemoryTestingPersistence();
    const svc = createManualTestingServices({ persistence });
    const rctx = ctx();
    const plan = await svc.testPlans.create(rctx, {
      tenantId: "tenant_1",
      key: "P-READY",
      name: "Ready plan",
      status: "approved",
      suiteIds: [],
      requirementIds: [],
      riskIds: [],
    });
    const cert = await persistence.certificationRecords.create(
      {
        tenantId: "tenant_1",
        actorUserId: "user_1",
        permissions: ["*"],
      },
      {
        key: "CERT-1",
        name: "Cert",
        status: "qa_ready",
        planId: plan.id,
        gateIds: [],
        approvalIds: [],
      },
    );
    const approval = await svc.approvals.requestApproval(rctx, {
      tenantId: "tenant_1",
      certificationRecordId: cert.id as never,
      status: "pending",
      authorUserId: "user_1",
    });
    await svc.approvals.assignApprovalRole(rctx, approval.id, "reviewer", "rev_1");
    await svc.approvals.rejectApproval(rctx, approval.id, "needs fixes");
    const afterReject = await svc.approvals.getApproval(rctx, approval.id);
    expect(afterReject.status).toBe("rejected");
    await svc.approvals.requestRework(rctx, approval.id, "please rework");
    const hist = await svc.approvals.listApprovalHistory(rctx, approval.id);
    expect(hist.length).toBeGreaterThan(1);

    const reg = await svc.regression.create(rctx, {
      tenantId: "tenant_1",
      key: "REG-1",
      name: "Core regression",
      suiteIds: [asTestSuiteId("suite_x")],
      planId: asTestPlanId(plan.id),
    });
    expect(reg.key).toBe("REG-1");

    const prep = await svc.certificationPreparation.prepareForPlan(rctx, plan.id);
    expect(prep.computedAt).toBeTruthy();
    const readiness = await svc.releaseReadiness.calculateForPlan(rctx, plan.id);
    expect(readiness.isDecision).toBe(false);
    expect(readiness.suggestedStatus).toBeTruthy();
  });
});

describe("permissions", () => {
  it("denies create without grants", async () => {
    const svc = services();
    await expect(
      svc.requirements.create(ctx({ permissions: [] }), {
        tenantId: "tenant_1",
        key: "X",
        title: "X",
        priority: "low",
        workItemRefs: [],
        riskIds: [],
      }),
    ).rejects.toThrow();
  });
});
