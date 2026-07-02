import { describe, expect, it } from "vitest";

import { extractToolbarRegionsFromCapabilities } from "./extract-toolbar";

describe("extractToolbarRegionsFromCapabilities", () => {
  it("merges toolbar regions from platform asset manifests", () => {
    const result = extractToolbarRegionsFromCapabilities(
      [
        {
          id: "apzhub-default-theme",
          kind: "theme",
          lifecycleState: "active",
          manifest: {
            workbench: {
              toolbar: [
                {
                  region: "workspace",
                  items: [
                    { commandId: "platform.theme.toggle", icon: "sun", order: 10 },
                  ],
                },
              ],
            },
          },
        },
      ],
      { knownActionIds: new Set(["platform.theme.toggle"]) },
    );

    expect(result.ok).toBe(true);
    expect(result.regions).toHaveLength(1);
    expect(result.regions[0]?.items[0]?.commandId).toBe("platform.theme.toggle");
    expect(result.diagnostics.extractedItemCount).toBe(1);
  });

  it("omits orphan commandId references with warnings", () => {
    const result = extractToolbarRegionsFromCapabilities(
      [
        {
          id: "theme-cap",
          kind: "theme",
          lifecycleState: "active",
          manifest: {
            workbench: {
              toolbar: [
                {
                  region: "workspace",
                  items: [{ commandId: "missing.action" }],
                },
              ],
            },
          },
        },
      ],
      { knownActionIds: new Set(["platform.theme.toggle"]) },
    );

    expect(result.regions[0]?.items).toHaveLength(0);
    expect(result.diagnostics.omittedOrphanCount).toBe(1);
    expect(result.warnings[0]?.code).toBe("ORPHAN_COMMAND_ID");
  });

  it("deduplicates command ids within a region", () => {
    const result = extractToolbarRegionsFromCapabilities(
      [
        {
          id: "cap-a",
          kind: "module",
          lifecycleState: "active",
          manifest: {
            workbench: {
              toolbar: [
                {
                  region: "workspace",
                  items: [{ commandId: "platform.theme.toggle" }],
                },
              ],
            },
          },
        },
        {
          id: "cap-b",
          kind: "module",
          lifecycleState: "active",
          manifest: {
            workbench: {
              toolbar: [
                {
                  region: "workspace",
                  items: [{ commandId: "platform.theme.toggle", label: "Duplicate" }],
                },
              ],
            },
          },
        },
      ],
      { knownActionIds: new Set(["platform.theme.toggle"]) },
    );

    expect(result.regions[0]?.items).toHaveLength(1);
  });
});
