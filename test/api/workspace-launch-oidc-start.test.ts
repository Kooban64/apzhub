import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { GET as getOidcStart } from "@/app/api/workspace/launch/oidc-start/route";
import { resetControlPlaneAdapterCache } from "@/lib/adapters/audit/control-plane-adapter";
import { getSessionSnapshot } from "@/lib/auth/get-session-server";
import type { SessionSnapshot } from "@/lib/auth/session-types";
import { verifyOidcLaunchState } from "@/lib/launch/oidc/launch-oidc-state";
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
    id: "user-oidc-test",
    email: "oidc-test@example.com",
    displayName: "OIDC Test",
    status: "active",
  },
  platformRole: "user",
  availableModes: ["workspace"],
  defaultLandingMode: "workspace",
  defaultLandingPath: "/workspace",
  linkedAccounts: { google: "not_linked" },
};

describe("GET /api/workspace/launch/oidc-start", () => {
  beforeEach(() => {
    resetControlPlaneAdapterCache();
    vi.mocked(getSessionSnapshot).mockResolvedValue(activeUser);
    vi.mocked(tryInsertLaunchEvent).mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetControlPlaneAdapterCache();
  });

  it("redirects with expanded template placeholders", async () => {
    vi.stubEnv("APZHUB_LAUNCH_SOURCE", "real");
    vi.stubEnv("APZHUB_LAUNCH_OIDC_USE_INTERNAL_START", "true");
    vi.stubEnv("APZHUB_LAUNCH_JWT_SIGNING_SECRET", "k".repeat(32));
    vi.stubEnv(
      "APZHUB_LAUNCH_OIDC_URL_TEMPLATE",
      "https://idp.test/authorize?svc={service}&extra={query}&state={state}",
    );
    const res = await getOidcStart(
      new Request("http://localhost/api/workspace/launch/oidc-start?service=mail&foo=bar"),
    );
    expect(res.status).toBe(307);
    const loc = res.headers.get("location");
    expect(loc).toBeTruthy();
    const u = new URL(loc!);
    expect(u.origin).toBe("https://idp.test");
    expect(u.searchParams.get("svc")).toBe("mail");
    expect(u.searchParams.get("extra")).toBe("foo=bar");
    const state = u.searchParams.get("state")!;
    expect(state).toBeTruthy();
    expect(state.includes(".")).toBe(true);
    const v = verifyOidcLaunchState("k".repeat(32), state, 60);
    expect(v).toEqual({ ok: true, serviceId: "mail", userId: "user-oidc-test" });
    expect(vi.mocked(tryInsertLaunchEvent)).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: "redirect_started",
        launchMethod: "oidc",
        serviceId: "mail",
      }),
    );
  });
});
