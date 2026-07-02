import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

import {
  bootstrapActionRegistry,
  filterActionRegistryDto,
  mapPlatformCapabilitiesToActionRecords,
} from "@apzhub/command-framework/server";
import { Runtime } from "@apzhub/platform-runtime/server";
import { createAllowAllWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

describe("platform asset bootstrap integration", () => {
  afterEach(() => {
    Runtime._resetForTests();
  });

  it("extracts platform actions, toolbar regions, and shortcuts after Runtime.bootstrap()", async () => {
    const bootstrap = await Runtime.bootstrap({
      workspaceRoot,
      failFast: false,
    });

    expect(bootstrap.success).toBe(true);

    const records = mapPlatformCapabilitiesToActionRecords(
      Runtime.registry().findAll(),
    );
    const result = bootstrapActionRegistry({ capabilityRecords: records });

    expect(result.ok).toBe(true);

    const manifestActions = result.registry
      .list()
      .filter((action) => action.source === "manifest")
      .map((action) => action.id);

    expect(manifestActions).toContain("platform.theme.toggle");
    expect(manifestActions).toContain("platform.home.navigate");
    expect(manifestActions.length).toBeGreaterThanOrEqual(2);

    expect(result.dto.toolbar.some((region) => region.region === "workspace")).toBe(
      true,
    );
    expect(
      result.dto.toolbar.some((region) =>
        region.items.some((item) => item.commandId === "platform.theme.toggle"),
      ),
    ).toBe(true);

    expect(result.shortcuts.registry.lookup("Ctrl+Shift+T")).toBe(
      "platform.theme.toggle",
    );
    expect(result.shortcuts.registry.lookup("Ctrl+Shift+H")).toBe(
      "platform.home.navigate",
    );

    const filtered = filterActionRegistryDto(
      result.dto,
      createAllowAllWorkbenchPermissionAdapter(),
    );

    expect(
      filtered.actions.filter((action) => action.source === "manifest").length,
    ).toBeGreaterThanOrEqual(2);
    expect(result.diagnostics.toolbarRegionCount).toBeGreaterThan(0);
    expect(result.diagnostics.toolbarItemCount).toBeGreaterThan(0);
    expect(result.diagnostics.registeredShortcutCount).toBeGreaterThanOrEqual(2);
  });
});
