import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import {
  asExecutionSessionId,
  asTestCaseId,
  asTestStepId,
} from "@apzhub/testing-contracts";
import { createInMemoryTestingPersistence } from "@apzhub/testing-persistence";
import { describe, expect, it } from "vitest";

import { computeOverallResultFromSteps, createManualTestingServices } from "./index";

function ctx(): ServiceRequestContext {
  return {
    tenantId: "tenant_1",
    userId: "user_1",
    correlationId: "corr_1",
    permissions: ["*"],
    organisationId: "org_1",
  };
}

describe("step engine", () => {
  it("substitutes parameters, nests steps, reorders, and contributes overall result", async () => {
    const persistence = createInMemoryTestingPersistence();
    const svc = createManualTestingServices({ persistence });
    const rctx = ctx();
    const sess = await persistence.executionSessions.create(
      {
        tenantId: "tenant_1",
        actorUserId: "user_1",
        permissions: ["*"],
      },
      { executionType: "manual", status: "draft" },
    );
    const parent = asTestStepId("parent");
    const child = asTestStepId("child");
    const tc = await svc.testCases.create(rctx, {
      tenantId: "tenant_1",
      key: "TC-STEP",
      title: "Steps",
      status: "approved",
      priority: "medium",
      suiteIds: [],
      requirementIds: [],
      steps: [
        {
          id: parent,
          caseId: asTestCaseId("case_step"),
          ordinal: 0,
          action: "Open ${url}",
          expectedResult: "Page ${page}",
        },
        {
          id: child,
          caseId: asTestCaseId("case_step"),
          ordinal: 1,
          action: "Click",
          expectedResult: "Done",
          parentStepId: parent,
          nestLevel: 1,
        },
      ],
    });

    const exec = await svc.manualExecutions.create(rctx, {
      tenantId: "tenant_1",
      sessionId: asExecutionSessionId(sess.id),
      caseId: tc.id,
      stepActuals: [
        {
          stepId: parent,
          ordinal: 0,
          expectedResult: "Page ${page}",
          status: "not_executed",
        },
        {
          stepId: child,
          ordinal: 1,
          parentStepId: parent,
          nestLevel: 1,
          expectedResult: "Done",
          status: "not_executed",
        },
      ],
    });
    await svc.manualExecutions.start(rctx, exec.id);
    await svc.manualExecutions.substituteParameters(rctx, exec.id, {
      url: "https://example.test",
      page: "Home",
    });
    const afterSub = await svc.manualExecutions.get(rctx, exec.id);
    expect(afterSub.parameterOverrides?.page).toBe("Home");
    expect(afterSub.stepActuals.find((s) => s.stepId === parent)?.expectedResult).toBe(
      "Page Home",
    );

    await svc.manualExecutions.recordStepActual(rctx, exec.id, parent, {
      status: "pass",
      actualResult: "Opened ${url}",
      expectedResult: "Page ${page}",
    });
    const recorded = await svc.manualExecutions.get(rctx, exec.id);
    expect(recorded.stepActuals.find((s) => s.stepId === parent)?.actualResult).toBe(
      "Opened https://example.test",
    );

    await svc.manualExecutions.setStepStatus(rctx, exec.id, child, "fail");
    const withFail = await svc.manualExecutions.get(rctx, exec.id);
    expect(withFail.overallResult).toBe("fail");

    await svc.manualExecutions.reorderSteps(rctx, exec.id, [child, parent]);
    const reordered = await svc.manualExecutions.get(rctx, exec.id);
    expect(reordered.stepActuals[0]?.stepId).toBe(child);
    expect(reordered.stepActuals[0]?.ordinal).toBe(0);

    const validation = await svc.manualExecutions.validateSteps(rctx, exec.id);
    expect(validation.valid).toBe(false);
    expect(validation.overallResult).toBe("fail");
  });

  it("computes overall result helpers", () => {
    expect(
      computeOverallResultFromSteps([
        { stepId: "a", status: "pass" },
        { stepId: "b", status: "pass" },
      ]),
    ).toBe("pass");
    expect(
      computeOverallResultFromSteps([
        { stepId: "a", status: "pass" },
        { stepId: "b", status: "fail" },
      ]),
    ).toBe("fail");
    expect(
      computeOverallResultFromSteps([
        { stepId: "a", status: "pass" },
        { stepId: "b", status: "blocked" },
      ]),
    ).toBe("blocked");
  });
});
