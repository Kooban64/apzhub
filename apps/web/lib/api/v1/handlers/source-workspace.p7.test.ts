import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { buildMockSession, buildTestServiceContext } from "../testing/fixtures";
import { handleSourceGetFile } from "./source-workspace";

function makeContext(permissions: readonly string[]): PlatformApiRequestContext {
  return {
    tracing: {
      requestId: "req-source",
      correlationId: "corr-source",
      timestamp: "2026-08-20T10:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext({
      tenantId: "tenant_a",
      permissions: [...permissions],
    }),
  };
}

describe("Source fail-closed (P7-03)", () => {
  it("rejects file reads when only qep.scm.read or qep.* is granted", async () => {
    const request = new NextRequest(
      "http://localhost/api/v1/source/repositories/r1/file?path=a.ts",
    );
    await expect(
      handleSourceGetFile(request, makeContext(["qep.scm.read", "qep.*"]), {
        params: Promise.resolve({ repositoryId: "r1" }),
      }),
    ).rejects.toBeInstanceOf(PlatformApiHttpError);
    try {
      await handleSourceGetFile(request, makeContext(["qep.scm.read", "qep.*"]), {
        params: Promise.resolve({ repositoryId: "r1" }),
      });
    } catch (error) {
      expect(error).toBeInstanceOf(PlatformApiHttpError);
      expect((error as PlatformApiHttpError).status).toBe(403);
    }
  });
});
