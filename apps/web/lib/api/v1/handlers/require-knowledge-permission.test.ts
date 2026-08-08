/**
 * KNW-PR-05 — Knowledge API authorisation gates.
 */
import { describe, expect, it } from "vitest";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { requireKnowledgePermission } from "./require-knowledge-permission";

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
    tracing: { correlationId: "corr-knw-pr-05" },
  } as PlatformApiRequestContext;
}

describe("KNW-PR-05 requireKnowledgePermission", () => {
  it("denies when permission missing", () => {
    expect(() => requireKnowledgePermission(ctx(), "knowledge.view")).toThrow(
      PlatformApiHttpError,
    );
    try {
      requireKnowledgePermission(ctx(), "knowledge.view");
    } catch (error) {
      expect(error).toBeInstanceOf(PlatformApiHttpError);
      expect((error as PlatformApiHttpError).status).toBe(403);
      expect((error as PlatformApiHttpError).body.code).toBe("FORBIDDEN");
    }
  });

  it("allows exact grant and knowledge.*", () => {
    expect(() =>
      requireKnowledgePermission(
        ctx({ permissions: ["knowledge.view"] }),
        "knowledge.view",
      ),
    ).not.toThrow();
    expect(() =>
      requireKnowledgePermission(
        ctx({ permissions: ["knowledge.*"] }),
        "knowledge.admin",
      ),
    ).not.toThrow();
  });
});
