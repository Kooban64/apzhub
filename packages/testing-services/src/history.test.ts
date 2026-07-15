import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import { asExecutionSessionId } from "@apzhub/testing-contracts";
import { createInMemoryTestingPersistence } from "@apzhub/testing-persistence";
import { describe, expect, it } from "vitest";

import { createManualTestingServices } from "./index";

function ctx(): ServiceRequestContext {
  return {
    tenantId: "tenant_1",
    userId: "user_1",
    correlationId: "corr_1",
    permissions: ["*"],
    organisationId: "org_1",
  };
}

describe("immutable execution history", () => {
  it("appends history entries on lifecycle transitions", async () => {
    const persistence = createInMemoryTestingPersistence();
    const svc = createManualTestingServices({ persistence });
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
    const tc = await svc.testCases.create(rctx, {
      tenantId: "tenant_1",
      key: "TC-HIST",
      title: "History",
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
    await svc.manualExecutions.assignTester(rctx, exec.id, "t1");
    await svc.manualExecutions.start(rctx, exec.id);
    await svc.manualExecutions.pause(rctx, exec.id);
    await svc.manualExecutions.resume(rctx, exec.id);
    await svc.manualExecutions.complete(rctx, exec.id, "pass");

    const history = await persistence.executionHistory.listBySession(
      {
        tenantId: "tenant_1",
        actorUserId: "user_1",
        permissions: ["*"],
        organisationId: "org_1",
      },
      sess.id,
    );
    expect(history.items.length).toBeGreaterThanOrEqual(5);
    const types = history.items.map((h) => h.eventType);
    expect(types).toContain("manual_execution.created");
    expect(types).toContain("manual_execution.started");
    expect(types).toContain("manual_execution.paused");
    expect(types).toContain("manual_execution.completed");
    for (const entry of history.items) {
      expect(entry.sessionId).toBe(sess.id);
      expect(entry.summary.length).toBeGreaterThan(0);
    }
  });
});
