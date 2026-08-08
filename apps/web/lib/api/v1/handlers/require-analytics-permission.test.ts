/**
 * ANA-PR-05 — Analytics API authorisation gates.
 */
import { describe, expect, it } from "vitest";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import {
  analyticsSessionTenantId,
  requireAnalyticsPermission,
} from "./require-analytics-permission";

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
    tracing: { correlationId: "corr-ana-pr-05" },
  } as PlatformApiRequestContext;
}

describe("ANA-PR-05 requireAnalyticsPermission", () => {
  it("denies when permission missing", () => {
    expect(() => requireAnalyticsPermission(ctx(), "analytics.view")).toThrow(
      PlatformApiHttpError,
    );
    try {
      requireAnalyticsPermission(ctx(), "analytics.view");
    } catch (error) {
      expect(error).toBeInstanceOf(PlatformApiHttpError);
      expect((error as PlatformApiHttpError).status).toBe(403);
      expect((error as PlatformApiHttpError).body.code).toBe("FORBIDDEN");
    }
  });

  it("allows exact grant and analytics.*", () => {
    expect(() =>
      requireAnalyticsPermission(
        ctx({ permissions: ["analytics.view"] }),
        "analytics.view",
      ),
    ).not.toThrow();
    expect(() =>
      requireAnalyticsPermission(
        ctx({ permissions: ["analytics.*"] }),
        "analytics.admin",
      ),
    ).not.toThrow();
  });
});

describe("ANA-PR-05 analyticsSessionTenantId", () => {
  it("returns session tenant and rejects empty", () => {
    expect(analyticsSessionTenantId(ctx({ tenantId: "tenant-a" }))).toBe("tenant-a");
    expect(() => analyticsSessionTenantId(ctx({ tenantId: "" }))).toThrow(
      PlatformApiHttpError,
    );
  });
});
