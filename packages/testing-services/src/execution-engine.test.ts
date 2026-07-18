import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import {
  asExecutionSessionId,
  asTestCaseId,
  asTestStepId,
  createDefaultApzTcmsConfiguration,
} from "@apzhub/testing-contracts";
import { createInMemoryTestingPersistence } from "@apzhub/testing-persistence";
import { describe, expect, it } from "vitest";

import { createManualTestingServices, DomainRuleError } from "./index";

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

async function seedSessionAndCase() {
  const persistence = createInMemoryTestingPersistence();
  const svc = createManualTestingServices({
    persistence,
    now: () => "2026-07-12T12:00:00.000Z",
    id: (() => {
      let n = 0;
      return () => `eid_${++n}`;
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
    { executionType: "manual", status: "draft" },
  );
  const createdCase = await svc.testCases.create(rctx, {
    tenantId: "tenant_1",
    key: "TC-ENG",
    title: "Engine case",
    status: "approved",
    priority: "medium",
    suiteIds: [],
    requirementIds: [],
    steps: [
      {
        id: asTestStepId("s1"),
        caseId: asTestCaseId("pending"),
        ordinal: 0,
        action: "Do ${action}",
        expectedResult: "See ${expected}",
      },
    ],
    parameters: [
      { key: "action", defaultValue: "click" },
      { key: "expected", defaultValue: "ok" },
    ],
  });
  return { persistence, svc, rctx, sess, createdCase };
}

describe("execution engine lifecycle", () => {
  it("runs create→assign→start→pause→resume→complete→review→approve", async () => {
    const { svc, rctx, sess, createdCase } = await seedSessionAndCase();
    const created = await svc.manualExecutions.create(rctx, {
      tenantId: "tenant_1",
      sessionId: asExecutionSessionId(sess.id),
      caseId: createdCase.id,
    });
    expect(created.status).toBe("draft");

    const assigned = await svc.manualExecutions.assignTester(
      rctx,
      created.id,
      "tester_1",
    );
    expect(assigned.status).toBe("assigned");
    expect(assigned.testerId).toBe("tester_1");

    await svc.manualExecutions.assignReviewer(rctx, created.id, "rev_1");
    const started = await svc.manualExecutions.start(rctx, created.id);
    expect(started.status).toBe("in_progress");

    await svc.manualExecutions.pause(rctx, created.id);
    expect(await svc.manualExecutions.getStatus(rctx, created.id)).toBe("paused");
    await svc.manualExecutions.resume(rctx, created.id);

    const completed = await svc.manualExecutions.complete(rctx, created.id, "pass");
    expect(completed.status).toBe("completed");
    expect(completed.overallResult).toBe("pass");

    const underReview = await svc.manualExecutions.submitForReview(rctx, created.id);
    expect(underReview.status).toBe("under_review");
    expect(underReview.approvalState).toBe("pending_review");

    const approved = await svc.manualExecutions.approve(rctx, created.id, "lgtm");
    expect(approved.status).toBe("approved");
    expect(approved.approvalState).toBe("approved");
  });

  it("supports cancel, reject→reopen, block/unblock, archive/restore", async () => {
    const { svc, rctx, sess, createdCase } = await seedSessionAndCase();
    const created = await svc.manualExecutions.create(rctx, {
      tenantId: "tenant_1",
      sessionId: asExecutionSessionId(sess.id),
      caseId: createdCase.id,
    });
    await svc.manualExecutions.start(rctx, created.id);
    await svc.manualExecutions.block(rctx, created.id, "env down");
    expect((await svc.manualExecutions.get(rctx, created.id)).status).toBe("blocked");
    await svc.manualExecutions.unblock(rctx, created.id);
    await svc.manualExecutions.complete(rctx, created.id, "pass");
    await svc.manualExecutions.submitForReview(rctx, created.id);
    const rejected = await svc.manualExecutions.reject(
      rctx,
      created.id,
      "needs rework",
    );
    expect(rejected.status).toBe("rejected");
    const reopened = await svc.manualExecutions.reopen(rctx, created.id);
    expect(reopened.status).toBe("in_progress");
    await svc.manualExecutions.complete(rctx, created.id, "pass");
    const archived = await svc.manualExecutions.archive(rctx, created.id);
    expect(archived.status).toBe("archived");
    expect(archived.archivedAt).toBeTruthy();
    const restored = await svc.manualExecutions.restore(rctx, created.id);
    expect(restored.status).toBe("draft");
    expect(restored.archivedAt).toBeUndefined();

    const other = await svc.manualExecutions.create(rctx, {
      tenantId: "tenant_1",
      sessionId: asExecutionSessionId(sess.id),
      caseId: createdCase.id,
    });
    await svc.manualExecutions.start(rctx, other.id);
    const cancelled = await svc.manualExecutions.cancel(rctx, other.id, "abort");
    expect(cancelled.status).toBe("cancelled");
  });

  it("rejects illegal transitions", async () => {
    const { svc, rctx, sess, createdCase } = await seedSessionAndCase();
    const created = await svc.manualExecutions.create(rctx, {
      tenantId: "tenant_1",
      sessionId: asExecutionSessionId(sess.id),
      caseId: createdCase.id,
    });
    await expect(svc.manualExecutions.complete(rctx, created.id)).rejects.toThrow(
      DomainRuleError,
    );
    await expect(svc.manualExecutions.pause(rctx, created.id)).rejects.toThrow(
      DomainRuleError,
    );
  });

  it("wires configuration for approval stages without breaking create", async () => {
    const persistence = createInMemoryTestingPersistence();
    const svc = createManualTestingServices({
      persistence,
      configuration: createDefaultApzTcmsConfiguration({
        execution: {
          approvalStages: [
            { stageKey: "peer", requiredRole: "reviewer", ordinal: 1 },
            { stageKey: "lead", requiredRole: "approver", ordinal: 2 },
          ],
        },
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
      key: "TC-CFG",
      title: "Cfg",
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
    expect(exec.status).toBe("draft");
  });
});
