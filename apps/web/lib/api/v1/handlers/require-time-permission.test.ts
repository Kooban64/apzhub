import { describe, expect, it } from "vitest";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { requireTimePermission } from "./require-time-permission";

function ctx(permissions: readonly string[] = []): PlatformApiRequestContext {
  return {
    tracing: {
      requestId: "req_t",
      correlationId: "corr_t",
      timestamp: "2026-08-08T00:00:00.000Z",
    },
    session: {} as PlatformApiRequestContext["session"],
    serviceContext: {
      tenantId: "tenant_t",
      userId: "user_t",
      permissions: [...permissions],
    } as PlatformApiRequestContext["serviceContext"],
  };
}

describe("TIME-PR-05 requireTimePermission", () => {
  it("denies when session lacks Time permissions", () => {
    expect(() => requireTimePermission(ctx(), "time.view")).toThrow(
      PlatformApiHttpError,
    );
  });

  it("allows time.view, time.*, and fine-grained wildcards", () => {
    expect(() => requireTimePermission(ctx(["time.view"]), "time.view")).not.toThrow();
    expect(() => requireTimePermission(ctx(["time.*"]), "time.manage")).not.toThrow();
    expect(() =>
      requireTimePermission(ctx(["time.timesheet.*"]), "time.timesheet.list"),
    ).not.toThrow();
  });
});
