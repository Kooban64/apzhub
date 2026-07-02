import { describe, expect, it } from "vitest";

import { validateCapabilityManifest } from "@apzhub/platform-runtime/manifest-engine";

describe("workbench.actions manifest schema", () => {
  it("validates workbench.actions block on module manifests", () => {
    const result = validateCapabilityManifest({
      manifestSchemaVersion: "1.0",
      id: "default-theme",
      name: "Default Theme",
      version: "1.0.0",
      kind: "module",
      metadata: { category: "platform" },
      module: { category: "platform" },
      workbench: {
        actions: [
          {
            id: "platform.theme.toggle",
            label: "Toggle Theme",
            handler: "service:theme-service:toggle",
            permission: "platform.theme.manage",
            palette: true,
            group: "appearance",
            order: 10,
          },
        ],
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts legacy workbench.commands alias", () => {
    const result = validateCapabilityManifest({
      manifestSchemaVersion: "1.0",
      id: "legacy-theme",
      name: "Legacy Theme",
      version: "1.0.0",
      kind: "module",
      metadata: { category: "platform" },
      module: { category: "platform" },
      workbench: {
        commands: [
          {
            id: "platform.theme.legacy",
            label: "Legacy Toggle",
            handler: "service:theme-service:toggle",
          },
        ],
      },
    });

    expect(result.success).toBe(true);
  });

  it("validates workbench.toolbar block on theme manifests", () => {
    const result = validateCapabilityManifest({
      manifestSchemaVersion: "1.0",
      id: "theme-toolbar",
      name: "Theme Toolbar",
      version: "1.0.0",
      kind: "theme",
      metadata: { category: "platform" },
      theme: { mode: "system" },
      workbench: {
        actions: [
          {
            id: "platform.theme.toggle",
            label: "Toggle Theme",
            handler: "service:theme-service:toggle",
          },
        ],
        toolbar: [
          {
            region: "workspace",
            items: [{ commandId: "platform.theme.toggle", icon: "sun", order: 10 }],
          },
        ],
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects unknown workbench action fields", () => {
    const result = validateCapabilityManifest({
      manifestSchemaVersion: "1.0",
      id: "bad-action",
      name: "Bad",
      version: "1.0.0",
      kind: "module",
      metadata: { category: "platform" },
      module: { category: "platform" },
      workbench: {
        actions: [
          {
            id: "platform.bad",
            label: "Bad",
            handler: "service:bad:run",
            unexpected: true,
          },
        ],
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects action rows missing required label", () => {
    const result = validateCapabilityManifest({
      manifestSchemaVersion: "1.0",
      id: "missing-label",
      name: "Missing Label",
      version: "1.0.0",
      kind: "module",
      metadata: { category: "platform" },
      module: { category: "platform" },
      workbench: {
        actions: [
          {
            id: "platform.missing.label",
            handler: "service:bad:run",
          },
        ],
      },
    });

    expect(result.success).toBe(false);
  });
});
