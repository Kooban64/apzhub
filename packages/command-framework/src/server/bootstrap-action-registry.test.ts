import { describe, expect, it } from "vitest";

import { createAllowAllWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";

import { createDefaultActionRegistry } from "../registry";
import { bootstrapActionRegistryFromCapabilities } from "./bootstrap-action-registry";
import { buildActionRegistryHydrationDiagnostics } from "./action-registry-hydration-diagnostics";
import { filterActionRegistryDto } from "./filter-action-registry-dto";
import { mapPlatformCapabilitiesToActionRecords } from "./map-capability-records";

describe("bootstrapActionRegistryFromCapabilities", () => {
  it("populates registry and returns unfiltered dto with diagnostics", () => {
    const result = bootstrapActionRegistryFromCapabilities([
      {
        id: "theme-cap",
        kind: "module",
        lifecycleState: "active",
        manifest: {
          workbench: {
            actions: [
              {
                id: "platform.theme.toggle",
                label: "Toggle Theme",
                handler: "service:theme-service:toggle",
                permission: "platform.theme.manage",
              },
            ],
          },
        },
      },
    ]);

    expect(result.ok).toBe(true);
    expect(result.dto.actions).toHaveLength(1);
    expect(result.registry.has("platform.theme.toggle")).toBe(true);
    expect(result.diagnostics.registeredCount).toBe(1);
    expect(result.diagnostics.filteredCount).toBe(1);
    expect(result.diagnostics.platformActionCount).toBe(0);
    expect(result.diagnostics.capabilityActionCount).toBe(1);
    expect(result.diagnostics.manifestCapabilityCount).toBe(1);
    expect(result.diagnostics.manifestCapabilities).toEqual(["theme-cap"]);
  });

  it("returns errors without registering when extraction fails", () => {
    const registry = createDefaultActionRegistry();
    const result = bootstrapActionRegistryFromCapabilities(
      [
        {
          id: "cap-a",
          kind: "module",
          lifecycleState: "active",
          manifest: {
            workbench: {
              actions: [{ id: "dup.action", label: "A", handler: "service:a:run" }],
            },
          },
        },
        {
          id: "cap-b",
          kind: "module",
          lifecycleState: "active",
          manifest: {
            workbench: {
              actions: [{ id: "dup.action", label: "B", handler: "service:b:run" }],
            },
          },
        },
      ],
      { registry },
    );

    expect(result.ok).toBe(false);
    expect(result.dto.actions).toHaveLength(0);
    expect(registry.list()).toHaveLength(0);
    expect(result.diagnostics.registeredCount).toBe(0);
  });
});

describe("mapPlatformCapabilitiesToActionRecords", () => {
  it("maps platform snapshots to extraction records", () => {
    const records = mapPlatformCapabilitiesToActionRecords([
      {
        id: "default-theme",
        kind: "module",
        lifecycleState: "active",
        manifest: { workbench: { actions: [] } },
      },
    ]);

    expect(records[0]?.id).toBe("default-theme");
  });
});

describe("buildActionRegistryHydrationDiagnostics", () => {
  it("reports filtered count after permission filter", () => {
    const bootstrap = bootstrapActionRegistryFromCapabilities([
      {
        id: "theme-cap",
        kind: "module",
        lifecycleState: "active",
        manifest: {
          workbench: {
            actions: [
              {
                id: "platform.public.action",
                label: "Public",
                handler: "service:public:run",
              },
              {
                id: "platform.admin.action",
                label: "Admin",
                handler: "service:admin:run",
                permission: "platform.admin.manage",
              },
            ],
          },
        },
      },
    ]);

    const filtered = filterActionRegistryDto(bootstrap.dto, {
      getContext: () => null,
      can: () => true,
      filter: (items) => items.filter((item) => !item.permission),
    });

    const diagnostics = buildActionRegistryHydrationDiagnostics(
      bootstrap.registry,
      filtered,
    );

    expect(diagnostics.registeredCount).toBe(2);
    expect(diagnostics.filteredCount).toBe(1);
    expect(diagnostics.manifestCapabilityCount).toBe(1);
  });

  it("reports full visibility with allow-all adapter", () => {
    const bootstrap = bootstrapActionRegistryFromCapabilities([
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
              },
            ],
          },
        },
      },
    ]);

    const filtered = filterActionRegistryDto(
      bootstrap.dto,
      createAllowAllWorkbenchPermissionAdapter(),
    );
    const diagnostics = buildActionRegistryHydrationDiagnostics(
      bootstrap.registry,
      filtered,
    );

    expect(diagnostics.registeredCount).toBe(1);
    expect(diagnostics.filteredCount).toBe(1);
  });
});
