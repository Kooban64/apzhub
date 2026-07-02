import { describe, expect, it } from "vitest";

import {
  buildCapabilityFromManifest,
  withCapabilityLifecycleState,
} from "../capability/factory";
import { resolveCapabilityDependencies } from "../dependency-graph/resolve";
import { createCapabilityRegistry } from "./registry";
import { createPlatformRegistry } from "./platform-registry";

function componentCapability(id: string) {
  const base = buildCapabilityFromManifest(
    {
      manifestSchemaVersion: "1.0",
      id,
      name: id,
      version: "1.0.0",
      kind: "component",
      metadata: { category: "primitive" },
      component: { theme: { supportsDarkMode: true } },
    },
    { lifecycleState: "validated" },
  );
  const resolved = resolveCapabilityDependencies([
    withCapabilityLifecycleState(base, "validated"),
  ]);
  if (!resolved.success) {
    throw new Error(`Failed to resolve ${id}`);
  }

  return resolved.capabilities[0]!;
}

describe("PlatformRegistry", () => {
  it("exposes kind-specific facades", () => {
    const registry = createCapabilityRegistry("0.2.0");
    registry.register(componentCapability("button"));
    registry.register(
      withCapabilityLifecycleState(
        buildCapabilityFromManifest(
          {
            manifestSchemaVersion: "1.0",
            id: "platform-registry",
            name: "Platform Registry",
            version: "1.0.0",
            kind: "service",
            metadata: { category: "platform" },
            service: { category: "platform" },
          },
          { lifecycleState: "validated" },
        ),
        "dependencies-resolved",
      ),
    );

    const platformRegistry = createPlatformRegistry(registry);
    expect(platformRegistry.getComponents()).toHaveLength(1);
    expect(platformRegistry.getServices()).toHaveLength(1);
    expect(platformRegistry.getThemes()).toHaveLength(0);
    expect(platformRegistry.getCapability("button")?.id).toBe("button");
    expect(platformRegistry.getState().capabilityCount).toBe(2);
    expect(platformRegistry.toJSON().capabilityCount).toBe(2);
  });

  it("filters capabilities by category", () => {
    const registry = createCapabilityRegistry("0.2.0");
    registry.register(componentCapability("button"));
    const platformRegistry = createPlatformRegistry(registry);

    expect(platformRegistry.getComponents({ category: "primitive" })).toHaveLength(1);
    expect(platformRegistry.getComponents({ category: "shell" })).toHaveLength(0);
  });

  it("reports mixed registry health and lifecycle state summaries", () => {
    const registry = createCapabilityRegistry("0.2.0");
    registry.register(componentCapability("button"));
    registry.register(componentCapability("input"));
    registry.updateHealth("button", "healthy");
    registry.updateHealth("input", "unhealthy");
    registry.updateLifecycleState("button", "active");
    registry.updateLifecycleState("input", "healthy");

    const platformRegistry = createPlatformRegistry(registry);
    expect(platformRegistry.getHealth().status).toBe("mixed");
    expect(platformRegistry.getState().lifecycleState).toBe("mixed");
    expect(platformRegistry.getCommands()).toEqual([]);
    expect(platformRegistry.getWorkers()).toEqual([]);
  });

  it("reports uniform lifecycle and health states", () => {
    const registry = createCapabilityRegistry("0.2.0");
    registry.register(componentCapability("button"));
    registry.updateHealth("button", "healthy");
    registry.updateLifecycleState("button", "active");

    const platformRegistry = createPlatformRegistry(registry);
    expect(platformRegistry.getHealth().status).toBe("healthy");
    expect(platformRegistry.getState().lifecycleState).toBe("active");
    expect(platformRegistry.findAll()).toHaveLength(1);
    expect(platformRegistry.getCapabilityRegistry()).toBe(registry);
  });

  it("exposes empty kind facades for unused capability kinds", () => {
    const platformRegistry = createPlatformRegistry(createCapabilityRegistry("0.2.0"));
    expect(platformRegistry.getModules()).toEqual([]);
    expect(platformRegistry.getIntegrations()).toEqual([]);
    expect(platformRegistry.getThemes()).toEqual([]);
    expect(platformRegistry.getSearchProviders()).toEqual([]);
    expect(platformRegistry.getDashboards()).toEqual([]);
    expect(platformRegistry.getWidgets()).toEqual([]);
    expect(platformRegistry.getReports()).toEqual([]);
    expect(platformRegistry.getAiProviders()).toEqual([]);
    expect(platformRegistry.getFeatureFlags()).toEqual([]);
    expect(platformRegistry.getEvents()).toEqual([]);
  });
});
