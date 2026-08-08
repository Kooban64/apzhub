/**
 * WF-PR-05 — Workflow API authorisation gates.
 */
import { describe, expect, it } from "vitest";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import {
  requireWorkflowPermission,
  workflowSessionTenantId,
} from "./require-workflow-permission";

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
    tracing: { correlationId: "corr-wf-pr-05" },
  } as PlatformApiRequestContext;
}

describe("WF-PR-05 requireWorkflowPermission", () => {
  it("denies when permission missing", () => {
    expect(() => requireWorkflowPermission(ctx(), "workflow.view")).toThrow(
      PlatformApiHttpError,
    );
    try {
      requireWorkflowPermission(ctx(), "workflow.view");
    } catch (error) {
      expect(error).toBeInstanceOf(PlatformApiHttpError);
      expect((error as PlatformApiHttpError).status).toBe(403);
      expect((error as PlatformApiHttpError).body.code).toBe("FORBIDDEN");
    }
  });

  it("allows exact grant and workflow.*", () => {
    expect(() =>
      requireWorkflowPermission(
        ctx({ permissions: ["workflow.view"] }),
        "workflow.view",
      ),
    ).not.toThrow();
    expect(() =>
      requireWorkflowPermission(
        ctx({ permissions: ["workflow.*"] }),
        "workflow.manage",
      ),
    ).not.toThrow();
  });

  it("allows any-of lists", () => {
    expect(() =>
      requireWorkflowPermission(
        ctx({ permissions: ["workflow.admin"] }),
        "workflow.view",
        "workflow.admin",
      ),
    ).not.toThrow();
  });
});

describe("WF-PR-05 workflowSessionTenantId", () => {
  it("returns session tenant and rejects empty", () => {
    expect(workflowSessionTenantId(ctx({ tenantId: "tenant-a" }))).toBe("tenant-a");
    expect(() => workflowSessionTenantId(ctx({ tenantId: "" }))).toThrow(
      PlatformApiHttpError,
    );
  });
});
