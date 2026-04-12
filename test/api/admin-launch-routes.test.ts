import { describe, expect, it, vi, beforeEach } from "vitest";

import { GET as getLaunchEvents } from "@/app/api/admin/launch/events/route";
import { GET as getLaunchRecent } from "@/app/api/admin/launch/recent/route";
import { requireAdminSession } from "@/lib/auth/admin-api-guard";
import type { SessionSnapshot } from "@/lib/auth/session-types";
import { listRecentLaunchEvents, listRecentLaunchFailures } from "@/lib/launch/repository/launch-events-repository";

vi.mock("@/lib/auth/admin-api-guard", () => ({
  requireAdminSession: vi.fn(),
}));

vi.mock("@/lib/launch/repository/launch-events-repository", () => ({
  listRecentLaunchEvents: vi.fn(),
  listRecentLaunchFailures: vi.fn(),
}));

const adminSnap: SessionSnapshot = {
  sessionStatus: "active",
  user: {
    id: "00000000-0000-4000-8000-0000000000aa",
    email: "admin-launch-test@example.com",
    displayName: "Admin Launch Test",
    status: "active",
  },
  platformRole: "admin",
  availableModes: ["admin", "workspace"],
  defaultLandingMode: "admin",
  defaultLandingPath: "/admin",
  linkedAccounts: { google: "not_linked" },
};

describe("GET /api/admin/launch/*", () => {
  beforeEach(() => {
    vi.mocked(requireAdminSession).mockResolvedValue(adminSnap);
  });

  it("recent returns failure rows as DTOs", async () => {
    const createdAt = new Date("2024-01-02T00:00:00.000Z");
    vi.mocked(listRecentLaunchFailures).mockResolvedValue([
      {
        id: "00000000-0000-4000-8000-000000000001",
        userId: "u1",
        serviceId: "mail",
        launchMethod: "jwt",
        readinessAtDecision: null,
        outcome: "failed",
        reasonCode: "SESSION_REQUIRED",
        userMessage: "Sign in",
        operatorMessage: "op",
        correlationId: "c1",
        authSessionId: null,
        createdAt,
      },
    ]);

    const res = await getLaunchRecent(new Request("http://localhost/api/admin/launch/recent"));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { items: { outcome: string; createdAt: string }[] };
    expect(json.items).toHaveLength(1);
    expect(json.items[0]!.outcome).toBe("failed");
    expect(json.items[0]!.createdAt).toBe(createdAt.toISOString());
  });

  it("events lists recent rows", async () => {
    const createdAt = new Date("2024-01-03T00:00:00.000Z");
    vi.mocked(listRecentLaunchEvents).mockResolvedValue([
      {
        id: "00000000-0000-4000-8000-000000000002",
        userId: "u2",
        serviceId: "drive",
        launchMethod: "oidc",
        readinessAtDecision: null,
        outcome: "redirect_started",
        reasonCode: null,
        userMessage: "redirect",
        operatorMessage: null,
        correlationId: "c2",
        authSessionId: null,
        createdAt,
      },
    ]);

    const res = await getLaunchEvents(new Request("http://localhost/api/admin/launch/events?limit=10"));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { items: { launchMethod: string }[] };
    expect(json.items[0]!.launchMethod).toBe("oidc");
  });
});
