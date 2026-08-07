import { beforeEach, describe, expect, it } from "vitest";

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import {
  createProjectsProductivityService,
  getMemoryProjectsProductivityStore,
  resetProjectsProductivityStoreForTests,
} from "./index";

function ctx(): ServiceRequestContext {
  return {
    tenantId: "t1",
    userId: "user_1",
    correlationId: "corr_1",
  } as ServiceRequestContext;
}

describe("Projects Productivity (PX-06 / W009)", () => {
  beforeEach(() => {
    resetProjectsProductivityStoreForTests();
  });

  it("creates personal saved searches only", async () => {
    const svc = createProjectsProductivityService(getMemoryProjectsProductivityStore());
    const saved = await svc.createSavedSearch(ctx(), {
      name: "Open critical exceptions",
      query: "exception critical",
      facets: { health: "critical" },
    });
    expect(saved.ownerUserId).toBe("user_1");
    expect(saved.scopeMode).toBe("global");
    const listed = await svc.listSavedSearches(ctx());
    expect(listed).toHaveLength(1);
  });

  it("requires explicit confirmation token for bulk operations", async () => {
    const svc = createProjectsProductivityService(getMemoryProjectsProductivityStore());
    const prepared = await svc.createBulkOperation(ctx(), {
      kind: "reassign_owner",
      objectIds: ["cmt_1", "cmt_2"],
      payload: { ownerPrincipalId: "user_2" },
    });
    expect(prepared.status).toBe("pending_confirm");

    await expect(
      svc.confirmBulkOperation(ctx(), prepared.id, {
        confirmationToken: "wrong",
      }),
    ).rejects.toThrow(/bulk_confirmation_invalid/);

    const executed = await svc.confirmBulkOperation(ctx(), prepared.id, {
      confirmationToken: prepared.confirmationToken,
      auditNote: "Continuity checked",
    });
    expect(executed.status).toBe("executed");
    expect(executed.executedAt).toBeTruthy();
  });

  it("resumes private productivity sessions", async () => {
    const svc = createProjectsProductivityService(getMemoryProjectsProductivityStore());
    const session = await svc.createSession(ctx(), {
      type: "Weekly Review",
      scopeSnapshot: { projectId: "prj_1", intent: "control" },
      openedObjectIds: ["exc_1"],
    });
    const resumed = await svc.resumeSession(ctx(), session.id);
    expect(resumed.lastResumedAt >= session.lastResumedAt).toBe(true);
  });

  it("exposes shortcut catalogue and cross-product targets", () => {
    const svc = createProjectsProductivityService(getMemoryProjectsProductivityStore());
    expect(svc.listShortcuts().some((s) => s.keys === "?")).toBe(true);
    expect(svc.listCrossProductTargets().map((t) => t.product)).toContain("workflow");
  });
});
