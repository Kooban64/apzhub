import { beforeEach, describe, expect, it } from "vitest";

import {
  _resetRuntimeInitForTests as resetLawRuntimeInit,
  ensurePlatformRuntimeReady as ensureLawBootstrap,
  WORKSPACE_ROOT as LAW_WORKSPACE_ROOT,
} from "../../law-platform/lib/runtime-init";
import {
  _resetRuntimeInitForTests as resetWebRuntimeInit,
  ensurePlatformRuntimeReady as ensureWebBootstrap,
  WORKSPACE_ROOT as WEB_WORKSPACE_ROOT,
} from "./runtime-init";

describe("application bootstrap parity", () => {
  beforeEach(() => {
    resetWebRuntimeInit();
    resetLawRuntimeInit();
  });

  it("uses the same workspace root and canonical bootstrap package for web and law-platform", async () => {
    expect(WEB_WORKSPACE_ROOT).toBe(LAW_WORKSPACE_ROOT);
    expect(WEB_WORKSPACE_ROOT).toMatch(/apz-portal$/);

    const [webBootstrap, lawBootstrap] = await Promise.all([
      ensureWebBootstrap(),
      ensureLawBootstrap(),
    ]);

    expect(webBootstrap.success).toBe(true);
    expect(lawBootstrap.success).toBe(true);
    expect(webBootstrap.diagnostics.platformReady).toBe(
      lawBootstrap.diagnostics.platformReady,
    );
    expect(webBootstrap.diagnostics.registryCount).toBe(
      lawBootstrap.diagnostics.registryCount,
    );
  });
});
