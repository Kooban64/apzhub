import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { GET as getJwtLaunch } from "@/app/api/workspace/launch/jwt/route";
import { resetControlPlaneAdapterCache } from "@/lib/adapters/audit/control-plane-adapter";
import { getSessionSnapshot } from "@/lib/auth/get-session-server";
import { LAUNCH_CORRELATION_QUERY_PARAM } from "@/lib/launch/constants";
import type { SessionSnapshot } from "@/lib/auth/session-types";
import { LAUNCH_EXECUTION_ERROR_CODES } from "@/lib/launch/launch-execution-errors";
import { tryInsertLaunchEvent } from "@/lib/launch/repository/launch-events-repository";

vi.mock("@/lib/auth/get-session-server", () => ({
  getSessionSnapshot: vi.fn(),
}));

vi.mock("@/lib/launch/repository/launch-events-repository", () => ({
  tryInsertLaunchEvent: vi.fn().mockResolvedValue(undefined),
}));

const activeUser: SessionSnapshot = {
  sessionStatus: "active",
  user: {
    id: "user-jwt-test",
    email: "jwt-test@example.com",
    displayName: "JWT Test",
    status: "active",
  },
  platformRole: "user",
  availableModes: ["workspace"],
  defaultLandingMode: "workspace",
  defaultLandingPath: "/workspace",
  linkedAccounts: { google: "not_linked" },
};

describe("GET /api/workspace/launch/jwt", () => {
  beforeEach(() => {
    resetControlPlaneAdapterCache();
    vi.mocked(getSessionSnapshot).mockResolvedValue(activeUser);
    vi.mocked(tryInsertLaunchEvent).mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetControlPlaneAdapterCache();
  });

  it("returns 400 when launch source is not real", async () => {
    vi.stubEnv("APZHUB_LAUNCH_SOURCE", "mock");
    vi.stubEnv("APZHUB_LAUNCH_JWT_SIGNING_SECRET", "s".repeat(32));
    const res = await getJwtLaunch(new Request("http://localhost/api/workspace/launch/jwt?service=mail"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe(LAUNCH_EXECUTION_ERROR_CODES.LAUNCH_NOT_REAL_MODE);
    expect(vi.mocked(tryInsertLaunchEvent)).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: "failed",
        reasonCode: LAUNCH_EXECUTION_ERROR_CODES.LAUNCH_NOT_REAL_MODE,
        launchMethod: "jwt",
      }),
    );
  });

  it("redirects and sets cookie when configured and session active", async () => {
    vi.stubEnv("APZHUB_LAUNCH_SOURCE", "real");
    vi.stubEnv("APZHUB_LAUNCH_JWT_SIGNING_SECRET", "s".repeat(32));
    vi.stubEnv("APZHUB_LAUNCH_JWT_TTL_SECONDS", "3600");
    const cid = "test-correlation-jwt-1";
    const res = await getJwtLaunch(
      new Request("http://localhost/api/workspace/launch/jwt?service=mail", {
        headers: { "x-correlation-id": cid },
      }),
    );
    expect(res.status).toBe(307);
    const loc = res.headers.get("location") ?? "";
    expect(loc).toContain("/workspace/launch/internal-jwt");
    expect(loc).toContain("service=mail");
    expect(loc).toContain(`${LAUNCH_CORRELATION_QUERY_PARAM}=${encodeURIComponent(cid)}`);
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toBeTruthy();
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/Path=\/workspace\/launch/i);
    const calls = vi.mocked(tryInsertLaunchEvent).mock.calls.map((c) => c[0]);
    expect(calls.some((c) => c.outcome === "initiated")).toBe(true);
    expect(calls.some((c) => c.outcome === "redirect_started")).toBe(true);
  });

  it("returns 400 for invalid service id", async () => {
    vi.stubEnv("APZHUB_LAUNCH_SOURCE", "real");
    vi.stubEnv("APZHUB_LAUNCH_JWT_SIGNING_SECRET", "s".repeat(32));
    const res = await getJwtLaunch(new Request("http://localhost/api/workspace/launch/jwt?service=not-a-service"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe(LAUNCH_EXECUTION_ERROR_CODES.SERVICE_INVALID);
    expect(vi.mocked(tryInsertLaunchEvent)).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: "failed",
        reasonCode: LAUNCH_EXECUTION_ERROR_CODES.SERVICE_INVALID,
        serviceId: "not-a-service",
      }),
    );
  });
});
