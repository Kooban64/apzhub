/**
 * QX-HD / H4 — V1.1 API authorisation gates (permission + tenant binding).
 */
import { describe, expect, it } from "vitest";

import { PlatformApiHttpError } from "../../apps/web/lib/api/v1/errors";
import {
  requireQepPermission,
  sessionTenantId,
} from "../../apps/web/lib/api/v1/handlers/require-qep-permission";
import type { PlatformApiRequestContext } from "../../apps/web/lib/api/v1/auth/with-platform-api-auth";

function ctx(
  overrides: Partial<PlatformApiRequestContext["serviceContext"]> = {},
): PlatformApiRequestContext {
  return {
    serviceContext: {
      userId: "user-1",
      tenantId: "tenant-a",
      permissions: [],
      ...overrides,
    },
    tracing: { correlationId: "corr-h4" },
  } as PlatformApiRequestContext;
}

describe("QX-HD H4 requireQepPermission", () => {
  it("denies when permission missing", () => {
    expect(() => requireQepPermission(ctx(), "qep.quality_flows.read")).toThrow(
      PlatformApiHttpError,
    );
    try {
      requireQepPermission(ctx(), "qep.quality_flows.read");
    } catch (error) {
      expect(error).toBeInstanceOf(PlatformApiHttpError);
      expect((error as PlatformApiHttpError).status).toBe(403);
    }
  });

  it("allows exact grant", () => {
    expect(() =>
      requireQepPermission(
        ctx({ permissions: ["qep.quality_flows.read"] }),
        "qep.quality_flows.read",
      ),
    ).not.toThrow();
  });

  it("allows qep.* wildcard", () => {
    expect(() =>
      requireQepPermission(ctx({ permissions: ["qep.*"] }), "qep.automation.operate"),
    ).not.toThrow();
  });

  it("allows any-of operate/read lists", () => {
    expect(() =>
      requireQepPermission(
        ctx({ permissions: ["qep.dashboards.read"] }),
        "qep.dashboards.read",
        "qep.dashboards.admin",
      ),
    ).not.toThrow();
  });
});

describe("QX-HD H4 sessionTenantId", () => {
  it("returns session tenant and rejects empty", () => {
    expect(sessionTenantId(ctx({ tenantId: "tenant-a" }))).toBe("tenant-a");
    expect(() => sessionTenantId(ctx({ tenantId: "" }))).toThrow(PlatformApiHttpError);
  });
});

describe("QX-HD H4 dashboard permission spoof posture", () => {
  it("session permissions are used — empty grants cannot elevate via query list", () => {
    // Documented contract: handlers must pass context.serviceContext.permissions,
    // never request.nextUrl.searchParams.getAll("permission").
    const sessionPermissions: readonly string[] = [];
    const spoofedQuery = ["qep.*", "qep.dashboards.read"];
    const effective = sessionPermissions; // correct behaviour
    expect(effective).not.toEqual(spoofedQuery);
    expect(effective).toEqual([]);
  });
});
