import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/load-shared-activity-timeline-context", () => ({
  loadSharedActivityTimelineContext: vi.fn(async () => null),
}));

vi.mock("@/lib/api/v1/gateway/bootstrap", () => ({
  getPlatformServiceGateway: vi.fn(async () => ({
    identity: { history: { list: async () => [] } },
  })),
}));

import { loadInspectionTimelineTabs } from "./effective-access-timeline";

describe("loadInspectionTimelineTabs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns honest empty activity/audit and unavailable sessions", async () => {
    const tabs = await loadInspectionTimelineTabs({
      userId: "user-1",
      serviceContext: {
        userId: "admin-1",
        tenantId: "org-1",
        permissions: ["identity.read"],
        correlationId: "c1",
      },
    });

    expect(tabs.sessions[0]?.status).toBe("unavailable");
    expect(tabs.activity[0]?.id).toBe("none");
    expect(tabs.audit[0]?.id).toBe("none");
    expect(tabs.sessions[0]?.why.toLowerCase()).toContain("not exposed");
  });
});
