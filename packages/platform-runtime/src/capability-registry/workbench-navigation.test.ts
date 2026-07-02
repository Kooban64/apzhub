import { describe, expect, it } from "vitest";

import {
  buildCapabilityFromManifest,
  withCapabilityLifecycleState,
} from "../capability/factory";
import { resolveCapabilityDependencies } from "../dependency-graph/resolve";
import { createCapabilityRegistry } from "./registry";
import { createPlatformRegistry } from "./platform-registry";
import {
  contributionFromManifest,
  extractNavigationContribution,
  extractWorkbenchNavigationContributions,
} from "./workbench-navigation";
import type { RegisteredCapabilityRecord } from "./types";

function buildModuleManifest(id: string, workspace: string) {
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
    },
  };
}

function registerModule(
  registry: ReturnType<typeof createCapabilityRegistry>,
  id: string,
  workspace: string,
  lifecycle: "active" | "discovered" = "active",
): RegisteredCapabilityRecord {
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

  return registry.findById(id)!;
}

describe("workbench navigation extraction", () => {
  it("extracts navigation contribution from registered record", () => {
    const registry = createCapabilityRegistry("0.2.0");
    const record = registerModule(registry, "platform-home", "home", "discovered");
    const contribution = extractNavigationContribution(record);

    expect(contribution?.id).toBe("platform-home");
    expect(contribution?.workspace).toBe("home");
    expect(contribution?.level).toBe("activity-bar");
  });

  it("extracts active capabilities only from registry facade", () => {
    const registry = createCapabilityRegistry("0.2.0");
    registerModule(registry, "platform-home", "home", "active");
    registerModule(registry, "platform-administration", "administration", "discovered");

    const platformRegistry = createPlatformRegistry(registry);
    const result = platformRegistry.getWorkbenchNavigationContributions();

    expect(result.contributions).toHaveLength(1);
    expect(result.contributions[0]?.id).toBe("platform-home");
    expect(result.diagnostics.skippedInactive).toBe(1);
  });

  it("deduplicates navigation ids in extraction diagnostics", () => {
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
        id: "platform-home-dup",
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
          ...buildModuleManifest("platform-home-dup", "home"),
          workbench: {
            navigation: {
              level: "activity-bar",
              workspace: "home",
              id: "platform-home",
              order: 20,
            },
          },
        },
        registrationTimestamp: new Date().toISOString(),
        platformVersionCompatibility: undefined,
        runtimeStatus: "registered",
      },
    ];

    const result = extractWorkbenchNavigationContributions(records);
    expect(result.contributions).toHaveLength(1);
    expect(result.diagnostics.duplicateIds).toContain("platform-home");
  });

  it("supports contributionFromManifest helper", () => {
    const manifest = buildModuleManifest("platform-home", "home");
    expect(contributionFromManifest(manifest)?.label).toBe("platform-home");
  });
});
