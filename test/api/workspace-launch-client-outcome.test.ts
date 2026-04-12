import { describe, expect, it, vi, beforeEach } from "vitest";

import { POST as postClientOutcome } from "@/app/api/workspace/launch/client-outcome/route";
import { getSessionSnapshot } from "@/lib/auth/get-session-server";
import type { SessionSnapshot } from "@/lib/auth/session-types";
import { tryInsertLaunchEvent } from "@/lib/launch/repository/launch-events-repository";

vi.mock("@/lib/auth/get-session-server", () => ({
  getSessionSnapshot: vi.fn(),
}));

vi.mock("@/lib/launch/repository/launch-events-repository", () => ({
  tryInsertLaunchEvent: vi.fn().mockResolvedValue(undefined),
}));

const userSnap: SessionSnapshot = {
  sessionStatus: "active",
  user: {
    id: "user-outcome-1",
    email: "u@example.com",
    displayName: "U",
    status: "active",
  },
  platformRole: "user",
  availableModes: ["workspace"],
  defaultLandingMode: "workspace",
  defaultLandingPath: "/workspace",
  linkedAccounts: { google: "not_linked" },
};

describe("POST /api/workspace/launch/client-outcome", () => {
  beforeEach(() => {
    vi.mocked(getSessionSnapshot).mockResolvedValue(userSnap);
    vi.mocked(tryInsertLaunchEvent).mockClear();
  });

  it("persists rejected launcher decision", async () => {
    const res = await postClientOutcome(
      new Request("http://localhost/api/workspace/launch/client-outcome", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-correlation-id": "cid-outcome-1" },
        body: JSON.stringify({
          allowed: false,
          serviceId: "mail",
          method: "jwt",
          readiness: "blocked",
          reasonCode: "not_provisioned",
          userMessage: "Not ready",
        }),
      }),
    );
    expect(res.status).toBe(200);
    expect(vi.mocked(tryInsertLaunchEvent)).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: "rejected",
        serviceId: "mail",
        launchMethod: "jwt",
        readinessAtDecision: "blocked",
        reasonCode: "not_provisioned",
        userMessage: "Not ready",
      }),
    );
  });

  it("returns 401 when not signed in", async () => {
    vi.mocked(getSessionSnapshot).mockResolvedValue({
      sessionStatus: "anonymous",
      user: null,
      platformRole: "user",
      availableModes: [],
      defaultLandingMode: "workspace",
      defaultLandingPath: "/workspace",
      linkedAccounts: { google: "not_linked" },
    });
    const res = await postClientOutcome(
      new Request("http://localhost/api/workspace/launch/client-outcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allowed: false,
          serviceId: "mail",
          method: "jwt",
          readiness: "blocked",
          userMessage: "x",
        }),
      }),
    );
    expect(res.status).toBe(401);
  });
});
