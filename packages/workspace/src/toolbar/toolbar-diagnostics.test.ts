import { describe, expect, it } from "vitest";

import { CLIENT_REGISTRY_HYDRATION_SYNC_STATE } from "@apzhub/command-framework/react";

import { buildToolbarDiagnostics } from "./toolbar-diagnostics";

describe("buildToolbarDiagnostics", () => {
  it("reports toolbar surface diagnostics", () => {
    const diagnostics = buildToolbarDiagnostics({
      region: "workspace",
      visibleActionCount: 2,
      registryDiagnostics: {
        status: "hydrated",
        actionCount: 5,
        platformActionCount: 2,
        capabilityActionCount: 3,
        platformActionIds: [],
        capabilityActionIds: [],
        toolbarRegionCount: 1,
        source: "server-dto",
        synchronisation: CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
      },
      executionCount: 1,
      lastExecutedActionId: "a.save",
      lastExecutionOk: true,
    });

    expect(diagnostics.surface).toBe("toolbar");
    expect(diagnostics.region).toBe("workspace");
    expect(diagnostics.visibleActionCount).toBe(2);
    expect(diagnostics.registryReady).toBe(true);
  });
});
