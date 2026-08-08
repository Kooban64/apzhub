/**
 * SUP-PR-05 — Support API authorisation gates.
 */
import { describe, expect, it } from "vitest";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import {
  requireSupportPermission,
  supportSessionTenantId,
} from "./require-support-permission";

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
    tracing: { correlationId: "corr-sup-pr-05" },
  } as PlatformApiRequestContext;
}

describe("SUP-PR-05 requireSupportPermission", () => {
  it("denies when permission missing", () => {
    expect(() => requireSupportPermission(ctx(), "support.requests.list")).toThrow(
      PlatformApiHttpError,
    );
    try {
      requireSupportPermission(ctx(), "support.requests.list");
    } catch (error) {
      expect(error).toBeInstanceOf(PlatformApiHttpError);
      expect((error as PlatformApiHttpError).status).toBe(403);
      expect((error as PlatformApiHttpError).body.code).toBe("FORBIDDEN");
    }
  });

  it("allows exact grant and support.*", () => {
    expect(() =>
      requireSupportPermission(
        ctx({ permissions: ["support.requests.list"] }),
        "support.requests.list",
      ),
    ).not.toThrow();
    expect(() =>
      requireSupportPermission(
        ctx({ permissions: ["support.*"] }),
        "support.requests.create",
      ),
    ).not.toThrow();
  });

  it("allows any-of lists", () => {
    expect(() =>
      requireSupportPermission(
        ctx({ permissions: ["support.requests.read"] }),
        "support.requests.read",
        "support.requests.list",
      ),
    ).not.toThrow();
  });
});

describe("SUP-PR-05 supportSessionTenantId", () => {
  it("returns session tenant and rejects empty", () => {
    expect(supportSessionTenantId(ctx({ tenantId: "tenant-a" }))).toBe("tenant-a");
    expect(() => supportSessionTenantId(ctx({ tenantId: "" }))).toThrow(
      PlatformApiHttpError,
    );
  });
});
