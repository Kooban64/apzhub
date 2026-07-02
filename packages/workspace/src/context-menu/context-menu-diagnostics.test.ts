import { describe, expect, it } from "vitest";

import { CLIENT_REGISTRY_HYDRATION_SYNC_STATE } from "@apzhub/command-framework/react";
import { buildContextMenuDiagnostics } from "./context-menu-diagnostics";

describe("buildContextMenuDiagnostics", () => {
  it("reports context menu surface metadata", () => {
    const diagnostics = buildContextMenuDiagnostics({
      open: true,
      visibleActionCount: 2,
      menuSurface: "workspace",
      selectionMode: "single",
      contextTypeCount: 1,
      registryDiagnostics: {
        status: "hydrated",
        actionCount: 5,
        platformActionCount: 2,
        capabilityActionCount: 3,
        platformActionIds: [],
        capabilityActionIds: [],
        toolbarRegionCount: 0,
        source: "server-dto",
        synchronisation: CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
      },
      executionCount: 1,
      lastExecutedActionId: "record.edit",
      lastExecutionOk: true,
    });

    expect(diagnostics.surface).toBe("context-menu");
    expect(diagnostics.menuSurface).toBe("workspace");
    expect(diagnostics.visibleActionCount).toBe(2);
    expect(diagnostics.registryReady).toBe(true);
  });
});
