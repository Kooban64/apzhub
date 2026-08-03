import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resolveLawApiTenant } from "../../apps/web/lib/api/tenant/tenant-resolver";

describe("APZHUB-LAW-ADOPT-003 EAB-04 tenant resolution", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("LAW_API_ALLOW_DEV_TENANT_FALLBACK", "false");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers auth_session tenant over header claim", () => {
    const sessionTenant = "t0000001-0000-4000-8000-000000000099";
    const headerTenant = "t0000002-0000-4000-8000-000000000002";

    const result = resolveLawApiTenant({
      session: {
        user: { id: "u1", tenantId: sessionTenant },
        session: { id: "s1" },
      } as never,
      request: {
        headers: {
          get: (name: string) =>
            name.toLowerCase() === "x-tenant-id" ? headerTenant : null,
        },
      } as never,
    });

    expect(result.source).toBe("auth_session");
    expect(result.tenantId).toBe(sessionTenant);
  });

  it("uses tenant_claim only when session lacks tenant", () => {
    const headerTenant = "t0000002-0000-4000-8000-000000000002";

    const result = resolveLawApiTenant({
      session: {
        user: { id: "u1" },
        session: { id: "s1" },
      } as never,
      request: {
        headers: {
          get: (name: string) =>
            name.toLowerCase() === "x-tenant-id" ? headerTenant : null,
        },
      } as never,
    });

    expect(result.source).toBe("tenant_claim");
    expect(result.tenantId).toBe(headerTenant);
  });
});
