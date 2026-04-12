/** @vitest-environment node */
import { afterEach, describe, expect, it, vi } from "vitest";

import { buildLaunchTransportTarget, getLaunchAdapterHealth } from "@/lib/adapters/launch/launch-target-adapter";

describe("buildLaunchTransportTarget", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("mock source uses in-app stub routes", () => {
    vi.stubEnv("APZHUB_LAUNCH_SOURCE", "mock");
    expect(buildLaunchTransportTarget("mail", "jwt")).toMatchObject({
      kind: "jwt_internal",
      appRoute: expect.stringContaining("/workspace/launch/mock-jwt"),
    });
  });

  it("real + JWT secret uses mint API route", () => {
    vi.stubEnv("APZHUB_LAUNCH_SOURCE", "real");
    vi.stubEnv("APZHUB_LAUNCH_JWT_SIGNING_SECRET", "x".repeat(32));
    expect(buildLaunchTransportTarget("calendar", "jwt")).toEqual({
      kind: "jwt_internal",
      appRoute: "/api/workspace/launch/jwt?service=calendar",
    });
  });

  it("real + OIDC internal start flag uses oidc-start API", () => {
    vi.stubEnv("APZHUB_LAUNCH_SOURCE", "real");
    vi.stubEnv("APZHUB_LAUNCH_OIDC_USE_INTERNAL_START", "true");
    expect(buildLaunchTransportTarget("drive", "oidc")).toEqual({
      kind: "oidc_redirect",
      href: "/api/workspace/launch/oidc-start?service=drive",
    });
  });

  it("getLaunchAdapterHealth is healthy when JWT secret and OIDC template set", () => {
    vi.stubEnv("APZHUB_LAUNCH_SOURCE", "real");
    vi.stubEnv("APZHUB_LAUNCH_JWT_SIGNING_SECRET", "y".repeat(32));
    vi.stubEnv("APZHUB_LAUNCH_OIDC_URL_TEMPLATE", "https://idp.example/oauth?client=1&svc={service}&{query}&state={state}");
    expect(getLaunchAdapterHealth().signal).toBe("healthy");
  });
});
