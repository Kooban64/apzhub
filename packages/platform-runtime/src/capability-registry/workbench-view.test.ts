import { describe, expect, it } from "vitest";

import {
  buildCapabilityFromManifest,
  withCapabilityLifecycleState,
} from "../capability/factory";
import { resolveCapabilityDependencies } from "../dependency-graph/resolve";
import { createCapabilityRegistry } from "./registry";
import { createPlatformRegistry } from "./platform-registry";
import {
  descriptorFromManifest,
  extractViewDescriptor,
  extractWorkbenchViewDescriptors,
} from "./workbench-view";
import type { RegisteredCapabilityRecord } from "./types";

function buildModuleManifest(id: string, workspace: string, withView = true) {
  return {
    manifestSchemaVersion: "1.0" as const,
    id,
    name: id,
    version: "1.0.0",
    kind: "module" as const,
    metadata: { category: "platform" },
    module: { category: "platform" },
    workbench: {
      navigation: {
        level: "activity-bar" as const,
        workspace,
        order: 10,
      },
      ...(withView
        ? {
            view: {
              title: id,
              workspace,
              route: `/workspace/${workspace}`,
              default: true,
            },
          }
        : {}),
    },
  };
}

function registerModule(
  registry: ReturnType<typeof createCapabilityRegistry>,
  id: string,
  workspace: string,
  lifecycle: "active" | "discovered" = "active",
): void {
  const base = buildCapabilityFromManifest(buildModuleManifest(id, workspace), {
    lifecycleState: "validated",
  });
  const resolved = resolveCapabilityDependencies([
    withCapabilityLifecycleState(base, "validated"),
  ]);
  if (!resolved.success) {
    throw new Error(`Failed to resolve ${id}`);
  }

  const capability = resolved.capabilities[0]!;
  const registration = registry.register(capability);
  if (!registration.success) {
    throw new Error(`Failed to register ${id}`);
  }

  if (lifecycle === "active") {
    registry.updateLifecycleState(id, "active");
  }
}

describe("workbench view extraction", () => {
  it("extracts view descriptor from registered record", () => {
    const registry = createCapabilityRegistry("0.2.0");
    registerModule(registry, "platform-home", "home", "active");
    const record = registry.findById("platform-home")!;
    const descriptor = extractViewDescriptor(record);

    expect(descriptor?.viewId).toBe("platform-home");
    expect(descriptor?.route).toBe("/workspace/home");
  });

  it("extracts active view descriptors from registry facade", () => {
    const registry = createCapabilityRegistry("0.2.0");
    registerModule(registry, "platform-home", "home", "active");
    registerModule(registry, "platform-administration", "administration", "discovered");

    const platformRegistry = createPlatformRegistry(registry);
    const result = platformRegistry.getWorkbenchViewDescriptors();

    expect(result.descriptors).toHaveLength(1);
    expect(result.descriptors[0]?.viewId).toBe("platform-home");
  });

  it("extracts descriptors via batch helper with diagnostics", () => {
    const registry = createCapabilityRegistry("0.2.0");
    registerModule(registry, "platform-home", "home", "active");
    registerModule(registry, "platform-administration", "administration", "discovered");

    const result = extractWorkbenchViewDescriptors(registry.findAll());
    expect(result.descriptors).toHaveLength(1);
    expect(result.diagnostics.skippedInactive).toBe(1);
  });

  it("builds descriptor from manifest", () => {
    const descriptor = descriptorFromManifest(
      buildModuleManifest("platform-home", "home"),
    );
    expect(descriptor?.title).toBe("platform-home");
  });

  it("deduplicates view ids in extraction diagnostics", () => {
    const records: RegisteredCapabilityRecord[] = [
      {
        id: "platform-home",
        name: "Home",
        kind: "module",
        version: "1.0.0",
        lifecycleState: "active",
        healthState: "unknown",
        dependencies: {
          platform: [],
          services: [],
          integrations: [],
          modules: [],
          all: [],
        },
        metadata: { category: "platform" },
        manifest: buildModuleManifest("platform-home", "home"),
        registrationTimestamp: new Date().toISOString(),
        platformVersionCompatibility: undefined,
        runtimeStatus: "registered",
      },
      {
        id: "platform-home-duplicate",
        name: "Duplicate",
        kind: "module",
        version: "1.0.0",
        lifecycleState: "active",
        healthState: "unknown",
        dependencies: {
          platform: [],
          services: [],
          integrations: [],
          modules: [],
          all: [],
        },
        metadata: { category: "platform" },
        manifest: {
          ...buildModuleManifest("platform-home-duplicate", "home"),
          workbench: {
            navigation: { level: "activity-bar", workspace: "home", order: 10 },
            view: {
              viewId: "platform-home",
              title: "Duplicate",
              workspace: "home",
              route: "/workspace/home",
            },
          },
        },
        registrationTimestamp: new Date().toISOString(),
        platformVersionCompatibility: undefined,
        runtimeStatus: "registered",
      },
    ];

    const result = extractWorkbenchViewDescriptors(records, { activeOnly: false });
    expect(result.descriptors).toHaveLength(1);
    expect(result.diagnostics.duplicateViewIds).toContain("platform-home");
  });
});
