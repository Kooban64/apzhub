import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it } from "vitest";

import {
  ensurePlatformRuntimeReady,
  getBootstrapPackageDiagnostics,
  resetPlatformBootstrapForTests,
} from "./server";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

describe("@apzhub/platform-bootstrap runtime cache", () => {
  beforeEach(() => {
    resetPlatformBootstrapForTests();
  });

  it("returns the same bootstrap promise for repeated calls", async () => {
    const first = ensurePlatformRuntimeReady(workspaceRoot);
    const second = ensurePlatformRuntimeReady(workspaceRoot);
    expect(first).toBe(second);
    await expect(first).resolves.toMatchObject({ success: true });
  });

  it("exposes canonical bootstrap package diagnostics", async () => {
    const bootstrap = await ensurePlatformRuntimeReady(workspaceRoot);
    const diagnostics = getBootstrapPackageDiagnostics(workspaceRoot, bootstrap);
    expect(diagnostics).toMatchObject({
      package: "@apzhub/platform-bootstrap",
      canonical: true,
      workspaceRootConfigured: true,
      runtimeReady: true,
    });
  });
});
