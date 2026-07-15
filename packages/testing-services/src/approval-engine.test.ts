import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import {
  asExecutionSessionId,
  createDefaultApzTcmsConfiguration,
} from "@apzhub/testing-contracts";
import { createInMemoryTestingPersistence } from "@apzhub/testing-persistence";
import { describe, expect, it } from "vitest";

import { createManualTestingServices } from "./index";

function ctx(): ServiceRequestContext {
  return {
    tenantId: "tenant_1",
    userId: "user_1",
    correlationId: "corr_1",
    permissions: ["*"],
  };
}

describe("approval engine multi-stage", () => {
  it("requires each stage before final approved and binds to execution", async () => {
    const persistence = createInMemoryTestingPersistence();
    const stages = [
      { stageKey: "peer", requiredRole: "reviewer", ordinal: 1 },
      { stageKey: "lead", requiredRole: "approver", ordinal: 2 },
    ] as const;
    const svc = createManualTestingServices({
      persistence,
      configuration: createDefaultApzTcmsConfiguration({
        execution: { approvalStages: [...stages] },
      }),
    });
    const rctx = ctx();
    const sess = await persistence.executionSessions.create(
      {
        tenantId: "tenant_1",
        actorUserId: "user_1",
        permissions: ["*"],
      },
      { executionType: "manual", status: "draft" },
    );
    const tc = await svc.testCases.create(rctx, {
      tenantId: "tenant_1",
      key: "TC-APR",
      title: "Approval case",
      status: "draft",
      priority: "low",
      suiteIds: [],
      requirementIds: [],
      steps: [],
    });
    const exec = await svc.manualExecutions.create(rctx, {
      tenantId: "tenant_1",
      sessionId: asExecutionSessionId(sess.id),
      caseId: tc.id,
    });
    await svc.manualExecutions.start(rctx, exec.id);
    await svc.manualExecutions.complete(rctx, exec.id, "pass");
    await svc.manualExecutions.submitForReview(rctx, exec.id);

    const approval = await svc.approvals.submitForReview(rctx, {
      subjectKind: "manual_execution",
      subjectId: exec.id,
      comments: "please review",
    });
    expect(approval.subjectKind).toBe("manual_execution");
    expect(approval.subjectId).toBe(exec.id);
    expect(approval.stages?.length).toBe(2);
    expect(approval.status).toBe("pending");
    expect(approval.currentStageOrdinal).toBe(1);

    const afterPeer = await svc.approvals.approveApproval(rctx, approval.id, "peer ok");
    expect(afterPeer.status).toBe("pending");
    expect(afterPeer.currentStageOrdinal).toBe(2);
    expect(afterPeer.stageDecisions?.length).toBe(1);

    const final = await svc.approvals.approveApproval(rctx, approval.id, "lead ok");
    expect(final.status).toBe("approved");
    expect(final.stageDecisions?.length).toBe(2);

    const hist = await svc.approvals.listApprovalHistory(rctx, approval.id);
    expect(hist.length).toBeGreaterThanOrEqual(2);

    await svc.manualExecutions.approve(rctx, exec.id);
    expect((await svc.manualExecutions.get(rctx, exec.id)).status).toBe("approved");
  });
});
