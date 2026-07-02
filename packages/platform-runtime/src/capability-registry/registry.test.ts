import { describe, expect, it, vi } from "vitest";

import {
  buildCapabilityFromManifest,
  withCapabilityLifecycleState,
} from "../capability/factory";
import type { Capability } from "../capability/types";
import { resolveCapabilityDependencies } from "../dependency-graph/resolve";
import { createCapabilityRegistry } from "./registry";
import { RegistryOperationGuard } from "./guard";
import { CapabilityRegistryStore } from "./store";

const PLATFORM_VERSION = "0.2.0";

function componentCapability(id: string): Capability {
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
  if (!resolved.success) throw new Error(`Failed to resolve ${id}`);
  return resolved.capabilities[0]!;
}

describe("CapabilityRegistry", () => {
  it("registers a dependencies-resolved capability", () => {
    const registry = createCapabilityRegistry(PLATFORM_VERSION);
    const capability = componentCapability("button");

    const result = registry.register(capability);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.record.lifecycleState).toBe("registered");
      expect(result.record.runtimeStatus).toBe("registered");
      expect(result.record.registrationTimestamp).toBeTruthy();
    }

    expect(registry.exists("button")).toBe(true);
    expect(registry.count()).toBe(1);
  });

  it("rejects duplicate registrations", () => {
    const registry = createCapabilityRegistry(PLATFORM_VERSION);
    const capability = componentCapability("button");

    registry.register(capability);
    const duplicate = registry.register(capability);

    expect(duplicate.success).toBe(false);
    if (!duplicate.success) {
      expect(duplicate.errors[0]?.code).toBe("REGISTRY_DUPLICATE_ID");
    }
  });

  it("rejects capabilities not in dependencies-resolved state", () => {
    const registry = createCapabilityRegistry(PLATFORM_VERSION);
    const discovered = buildCapabilityFromManifest(
      {
        manifestSchemaVersion: "1.0",
        id: "discovered-only",
        name: "Discovered",
        version: "1.0.0",
        kind: "component",
        metadata: {},
        component: { theme: { supportsDarkMode: true } },
      },
      { lifecycleState: "discovered" },
    );

    const result = registry.register(discovered);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]?.code).toBe("REGISTRY_INVALID_LIFECYCLE");
    }
  });

  it("rejects empty registration batches", () => {
    const registry = createCapabilityRegistry(PLATFORM_VERSION);
    const result = registry.registerMany([]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]?.code).toBe("REGISTRY_INVALID_INPUT");
    }
  });

  it("rejects capabilities with empty id", () => {
    const registry = createCapabilityRegistry(PLATFORM_VERSION);
    const capability = { ...componentCapability("temp"), id: "" };
    const result = registry.register(capability);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.code === "REGISTRY_INVALID_INPUT")).toBe(true);
    }
  });

  it("rejects invalid manifests at registration", () => {
    const registry = createCapabilityRegistry(PLATFORM_VERSION);
    const capability = {
      ...componentCapability("bad-manifest"),
      manifest: {
        ...componentCapability("bad-manifest").manifest,
        version: "not-semver",
      },
    };

    const result = registry.register(capability);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]?.code).toBe("REGISTRY_MANIFEST_INVALID");
    }
  });

  it("updates runtime status and platform version metadata", () => {
    const registry = createCapabilityRegistry(PLATFORM_VERSION);
    registry.register(componentCapability("alpha"));

    expect(registry.updateRuntimeStatus("alpha", "pending-reload")).toBe(true);
    expect(registry.findById("alpha")?.runtimeStatus).toBe("pending-reload");
    expect(registry.updateRuntimeStatus("missing", "pending-reload")).toBe(false);

    registry.setPlatformVersion("0.3.0");
    expect(registry.snapshot().platformVersion).toBe("0.3.0");
  });

  it("returns undefined health for unknown capabilities", () => {
    const registry = createCapabilityRegistry(PLATFORM_VERSION);
    expect(registry.getHealth("missing")).toBeUndefined();
    expect(registry.updateHealth("missing", "healthy")).toBe(false);
  });

  it("registers batches using default alphabetical order", () => {
    const registry = createCapabilityRegistry(PLATFORM_VERSION);
    const a = componentCapability("zulu");
    const b = componentCapability("alpha");

    const result = registry.registerMany([a, b]);
    expect(result.success).toBe(true);
    expect(registry.getRegistrationOrder()).toEqual(["alpha", "zulu"]);
  });

  it("uses registry platform version when options omitted", () => {
    const registry = createCapabilityRegistry(PLATFORM_VERSION);
    const result = registry.register(componentCapability("solo"));
    expect(result.success).toBe(true);
  });

  it("rejects version-incompatible capabilities", () => {
    const registry = createCapabilityRegistry("0.1.0");
    const base = buildCapabilityFromManifest(
      {
        manifestSchemaVersion: "1.0",
        id: "versioned",
        name: "Versioned",
        version: "1.0.0",
        kind: "module",
        metadata: {},
        compatibility: { platformVersion: ">=99.0.0" },
        module: { status: "enabled" },
      },
      { lifecycleState: "validated" },
    );
    const resolved = resolveCapabilityDependencies([
      withCapabilityLifecycleState(base, "validated"),
    ]);
    if (!resolved.success) throw new Error("resolve failed");
    const capability = resolved.capabilities[0]!;

    const result = registry.register(capability);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]?.code).toBe("REGISTRY_VERSION_INCOMPATIBLE");
    }
  });

  it("preserves registration order when registering batches", () => {
    const registry = createCapabilityRegistry(PLATFORM_VERSION);
    const a = componentCapability("alpha");
    const b = componentCapability("beta");
    const c = componentCapability("charlie");

    registry.registerMany([c, a, b], undefined, ["alpha", "beta", "charlie"]);
    expect(registry.getRegistrationOrder()).toEqual(["alpha", "beta", "charlie"]);
  });

  it("rolls back batch registration on failure", () => {
    const registry = createCapabilityRegistry(PLATFORM_VERSION);
    const a = componentCapability("alpha");
    const b = componentCapability("beta");

    registry.register(a);
    const batch = registry.registerMany([a, b]);

    expect(batch.success).toBe(false);
    expect(registry.count()).toBe(1);
    expect(registry.exists("beta")).toBe(false);
  });

  it("unregisters capabilities", () => {
    const registry = createCapabilityRegistry(PLATFORM_VERSION);
    const capability = componentCapability("button");
    registry.register(capability);

    expect(registry.unregister("button")).toBe(true);
    expect(registry.exists("button")).toBe(false);
    expect(registry.unregister("button")).toBe(false);
  });

  it("supports lookup APIs", () => {
    const registry = createCapabilityRegistry(PLATFORM_VERSION);
    registry.register(componentCapability("alpha"));
    registry.register(componentCapability("beta"));

    expect(registry.findById("alpha")?.name).toBe("alpha");
    expect(registry.findByKind("component")).toHaveLength(2);
    expect(registry.findAll()).toHaveLength(2);
  });

  it("records lifecycle and health updates without determining them", () => {
    const registry = createCapabilityRegistry(PLATFORM_VERSION);
    registry.register(componentCapability("alpha"));

    expect(registry.updateLifecycleState("alpha", "initialised")).toBe(true);
    expect(registry.getLifecycleState("alpha")).toBe("initialised");

    expect(registry.updateHealth("alpha", "healthy")).toBe(true);
    expect(registry.getHealth("alpha")).toBe("healthy");

    expect(registry.updateLifecycleState("missing", "healthy" as never)).toBe(false);
  });

  it("produces deterministic snapshots", () => {
    const registry = createCapabilityRegistry(PLATFORM_VERSION);
    registry.register(componentCapability("alpha"));
    registry.register(componentCapability("beta"));

    const snapshot = registry.snapshot();
    expect(snapshot.platformVersion).toBe(PLATFORM_VERSION);
    expect(snapshot.capabilityCount).toBe(2);
    expect(snapshot.capabilitiesByKind.component).toBe(2);
    expect(snapshot.lifecycleSummary.registered).toBe(2);
    expect(snapshot.healthSummary.unknown).toBe(2);
    expect(snapshot.capabilities).toHaveLength(2);
    expect(snapshot.registryTimestamp).toBeTruthy();
  });

  it("clears the registry and bumps store generation", () => {
    const registry = createCapabilityRegistry(PLATFORM_VERSION);
    const before = registry.getStoreGeneration();
    registry.register(componentCapability("alpha"));

    registry.clear();

    expect(registry.count()).toBe(0);
    expect(registry.getStoreGeneration()).toBeGreaterThan(before);
  });

  it("supports extension point hooks", () => {
    const afterUnregister = vi.fn();
    const registry = createCapabilityRegistry(PLATFORM_VERSION, {
      beforeRegister: (record) => record.id !== "blocked",
      afterUnregister,
    });

    const blocked = registry.register(componentCapability("blocked"));
    expect(blocked.success).toBe(false);

    registry.register(componentCapability("allowed"));
    registry.unregister("allowed");
    expect(afterUnregister).toHaveBeenCalledWith("allowed");
  });

  it("handles stress registration and lookup at reasonable scale", () => {
    const registry = createCapabilityRegistry(PLATFORM_VERSION);
    const capabilities = Array.from({ length: 500 }, (_, index) =>
      componentCapability(`stress-cap-${index}`),
    );

    const batch = registry.registerMany(capabilities);
    expect(batch.success).toBe(true);
    expect(registry.count()).toBe(500);

    const start = performance.now();
    for (let i = 0; i < 500; i += 1) {
      expect(registry.findById(`stress-cap-${i}`)).toBeDefined();
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(500);
  });
});

describe("Registry support modules", () => {
  it("tracks guard generation", () => {
    const guard = new RegistryOperationGuard();
    expect(guard.getGeneration()).toBe(0);
    guard.bumpGeneration();
    expect(guard.getGeneration()).toBe(1);
  });

  it("throws on internal duplicate store insert", () => {
    const store = new CapabilityRegistryStore();
    const record = {
      id: "dup",
      name: "Dup",
      kind: "component" as const,
      version: "1.0.0",
      lifecycleState: "registered" as const,
      healthState: "unknown" as const,
      dependencies: {
        platform: [],
        services: [],
        integrations: [],
        modules: [],
        all: [],
      },
      metadata: {},
      manifest: componentCapability("dup").manifest,
      registrationTimestamp: new Date().toISOString(),
      platformVersionCompatibility: undefined,
      runtimeStatus: "registered" as const,
    };
    store.insert(record);
    expect(() => store.insert(record)).toThrow(/duplicate id/);
  });
});
