import { describe, expect, it } from "vitest";

import { REQUEST_COMMAND_MAP } from "@apzhub/workbench-framework";

import { WORKBENCH_BRIDGE_ACTION_IDS } from "../bridge/workbench-bridge-action-ids";
import { createDefaultActionRegistry } from "../registry";
import {
  ACTION_FRAMEWORK_PLATFORM_VERSION,
  PLATFORM_ACTION_CATALOGUE,
  bootstrapActionRegistry,
  buildPlatformActionDescriptors,
  isCapabilityAction,
  isPlatformAction,
  registerPlatformActionCatalogue,
} from "./index";

describe("PLATFORM_ACTION_CATALOGUE", () => {
  it("covers every REQUEST_COMMAND_MAP workbench bridge id", () => {
    const mapIds = Object.values(REQUEST_COMMAND_MAP).filter(
      (id): id is string => typeof id === "string" && id.startsWith("workbench."),
    );

    expect(PLATFORM_ACTION_CATALOGUE).toHaveLength(mapIds.length);
    expect(PLATFORM_ACTION_CATALOGUE.map((entry) => entry.id).sort()).toEqual(
      [...mapIds].sort(),
    );
    expect(WORKBENCH_BRIDGE_ACTION_IDS).toHaveLength(PLATFORM_ACTION_CATALOGUE.length);
  });

  it("uses unique catalogue ids", () => {
    const ids = PLATFORM_ACTION_CATALOGUE.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("registerPlatformActionCatalogue", () => {
  it("registers all platform actions with builtin source and platform version", () => {
    const registry = createDefaultActionRegistry();
    const result = registerPlatformActionCatalogue(registry);

    expect(result.ok).toBe(true);
    expect(result.registeredCount).toBe(PLATFORM_ACTION_CATALOGUE.length);
    expect(result.platformVersion).toBe(ACTION_FRAMEWORK_PLATFORM_VERSION);

    for (const entry of PLATFORM_ACTION_CATALOGUE) {
      const descriptor = registry.get(entry.id);
      expect(descriptor).toBeDefined();
      expect(descriptor?.source).toBe("builtin");
      expect(descriptor?.handler).toBe(`workbench-bridge:${entry.id}`);
      expect(descriptor?.handlerKind).toBe("workbench-bridge");
      expect(descriptor?.version).toBe(ACTION_FRAMEWORK_PLATFORM_VERSION);
      expect(isPlatformAction(descriptor!)).toBe(true);
      expect(isCapabilityAction(descriptor!)).toBe(false);
    }
  });

  it("reports platform diagnostics after registration", () => {
    const registry = createDefaultActionRegistry();
    registerPlatformActionCatalogue(registry);

    const diagnostics = registry.getDiagnostics();
    expect(diagnostics.platformActionCount).toBe(PLATFORM_ACTION_CATALOGUE.length);
    expect(diagnostics.capabilityActionCount).toBe(0);
    expect(diagnostics.platformVersion).toBe(ACTION_FRAMEWORK_PLATFORM_VERSION);
    expect(diagnostics.platformActionIds).toEqual(
      PLATFORM_ACTION_CATALOGUE.map((entry) => entry.id).sort(),
    );
  });

  it("rejects duplicate registration on the same registry", () => {
    const registry = createDefaultActionRegistry();
    const first = registerPlatformActionCatalogue(registry);
    const second = registerPlatformActionCatalogue(registry);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    expect(second.errors[0]?.code).toBe("DUPLICATE_ID");
    expect(registry.getDiagnostics().registeredCount).toBe(
      PLATFORM_ACTION_CATALOGUE.length,
    );
  });

  it("list({ palette: true }) includes user-facing navigation and view commands", () => {
    const registry = createDefaultActionRegistry();
    registerPlatformActionCatalogue(registry);

    const paletteIds = registry.list({ palette: true }).map((action) => action.id);
    expect(paletteIds).toContain("workbench.view.open");
    expect(paletteIds).toContain("workbench.navigation.reveal");
    expect(paletteIds).not.toContain("workbench.context.set");
  });
});

describe("buildPlatformActionDescriptors", () => {
  it("accepts a custom platform version override", () => {
    const descriptors = buildPlatformActionDescriptors("9.9.9");
    expect(descriptors.every((descriptor) => descriptor.version === "9.9.9")).toBe(
      true,
    );
  });
});

describe("bootstrapActionRegistry", () => {
  it("registers platform catalogue then capability actions", () => {
    const result = bootstrapActionRegistry({
      capabilityRecords: [
        {
          id: "theme-cap",
          kind: "module",
          lifecycleState: "active",
          version: "2.1.0",
          manifest: {
            workbench: {
              actions: [
                {
                  id: "platform.theme.toggle",
                  label: "Toggle Theme",
                  handler: "service:theme-service:toggle",
                  shortcut: "Ctrl+Shift+T",
                },
              ],
            },
          },
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.platform.ok).toBe(true);
    expect(result.capabilities.ok).toBe(true);
    expect(result.registry.has("workbench.view.open")).toBe(true);
    expect(result.registry.has("platform.theme.toggle")).toBe(true);
    expect(result.registry.get("platform.theme.toggle")?.version).toBe("2.1.0");
    expect(result.registry.get("workbench.view.open")?.version).toBe(
      ACTION_FRAMEWORK_PLATFORM_VERSION,
    );

    const diagnostics = result.registry.getDiagnostics();
    expect(diagnostics.platformActionCount).toBe(PLATFORM_ACTION_CATALOGUE.length);
    expect(result.shortcuts.registry.lookup("Ctrl+Shift+T")).toBe(
      "platform.theme.toggle",
    );
    expect(diagnostics.capabilityActionCount).toBe(1);
    expect(diagnostics.capabilityActionIds).toEqual(["platform.theme.toggle"]);
  });

  it("rejects capability ids that collide with platform catalogue", () => {
    const result = bootstrapActionRegistry({
      capabilityRecords: [
        {
          id: "bad-cap",
          kind: "module",
          lifecycleState: "active",
          manifest: {
            workbench: {
              actions: [
                {
                  id: "workbench.view.open",
                  label: "Duplicate",
                  handler: "workbench-bridge:workbench.view.open",
                },
              ],
            },
          },
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.platform.ok).toBe(true);
    expect(result.capabilities.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("DUPLICATE_ID");
  });

  it("is repeatable on fresh registries", () => {
    const first = bootstrapActionRegistry();
    const second = bootstrapActionRegistry();

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(first.registry.getDiagnostics().registeredCount).toBe(
      second.registry.getDiagnostics().registeredCount,
    );
    expect(first.registry.getDiagnostics().platformActionIds).toEqual(
      second.registry.getDiagnostics().platformActionIds,
    );
  });

  it("includes platform and capability counts in hydration diagnostics", () => {
    const result = bootstrapActionRegistry({
      capabilityRecords: [
        {
          id: "cap-a",
          kind: "module",
          lifecycleState: "active",
          manifest: {
            workbench: {
              actions: [
                {
                  id: "platform.a.action",
                  label: "A",
                  handler: "service:a:run",
                  shortcut: "Ctrl+Shift+A",
                },
              ],
              toolbar: [
                {
                  region: "workspace",
                  items: [{ commandId: "platform.a.action" }],
                },
              ],
            },
          },
        },
      ],
    });

    expect(result.diagnostics.platformActionCount).toBe(
      PLATFORM_ACTION_CATALOGUE.length,
    );
    expect(result.diagnostics.capabilityActionCount).toBe(1);
    expect(result.diagnostics.platformVersion).toBe(ACTION_FRAMEWORK_PLATFORM_VERSION);
    expect(result.diagnostics.registeredCount).toBe(
      PLATFORM_ACTION_CATALOGUE.length + 1,
    );
    expect(result.diagnostics.toolbarRegionCount).toBe(1);
    expect(result.diagnostics.toolbarItemCount).toBe(1);
    expect(result.diagnostics.registeredShortcutCount).toBeGreaterThanOrEqual(1);
    expect(result.dto.toolbar[0]?.items[0]?.commandId).toBe("platform.a.action");
  });
});
