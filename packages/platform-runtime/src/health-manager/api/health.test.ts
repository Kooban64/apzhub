import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

import {
  buildCapabilityFromManifest,
  withCapabilityLifecycleState,
} from "../../capability/factory";
import type { Capability } from "../../capability/types";
import { createCapabilityRegistry } from "../../capability-registry/registry";
import { resolveCapabilityDependencies } from "../../dependency-graph/resolve";
import { Configuration } from "../../configuration-manager";
import { createCapabilityLifecycleManager } from "../../lifecycle-manager/manager";
import { createRuntimeHealthManager } from "./health";
import type { HealthProvider, HealthProviderContext } from "../interfaces/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(
  __dirname,
  "../../../../../testing/fixtures/discovery",
);

function testCapability(id: string): Capability {
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

function buildContext(
  overrides: Partial<HealthProviderContext> = {},
): HealthProviderContext {
  Configuration.load({
    overrides: { workspaceRoot: fixturesRoot, platformVersion: "0.2.0" },
  });

  const capability = testCapability("button");

  const registry = createCapabilityRegistry("0.2.0");
  registry.register(capability);
  const lifecycle = createCapabilityLifecycleManager();
  lifecycle.reset(capability.id);
  lifecycle.transition(capability.id, "validated", { source: "test" });
  lifecycle.transition(capability.id, "dependencies-resolved", { source: "test" });
  lifecycle.transition(capability.id, "registered", { source: "test" });
  lifecycle.transition(capability.id, "initialised", { source: "test" });
  registry.updateLifecycleState(capability.id, "initialised");

  return {
    configuration: Configuration.getConfiguration()!,
    registry,
    lifecycle,
    capabilities: [capability],
    ...overrides,
  };
}

describe("RuntimeHealthManager", () => {
  afterEach(() => {
    Configuration._resetForTests();
  });

  it("registers and unregisters custom providers", () => {
    const manager = createRuntimeHealthManager({ providers: [] });
    const provider: HealthProvider = {
      id: "custom",
      name: "Custom Provider",
      check: () => ({
        providerId: "custom",
        providerName: "Custom Provider",
        status: "healthy",
        severity: "info",
        timestamp: "2026-01-01T00:00:00.000Z",
        summary: "ok",
        metadata: {},
      }),
    };

    expect(manager.registerProvider(provider).success).toBe(true);
    expect(manager.registerProvider(provider).success).toBe(false);
    expect(manager.unregisterProvider("custom")).toBe(true);
    expect(manager.unregisterProvider("missing")).toBe(false);
  });

  it("rejects invalid provider registration", () => {
    const manager = createRuntimeHealthManager({ providers: [] });
    const result = manager.registerProvider({
      id: "",
      name: "Invalid",
      check: () => ({}) as never,
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("HEALTH_INVALID_INPUT");
  });

  it("executes default providers and aggregates runtime health", () => {
    const manager = createRuntimeHealthManager();
    const result = manager.check(buildContext());

    expect(result.status).toBe("healthy");
    expect(result.providerResults).toHaveLength(4);
    expect(manager.getStatus()).toBe("healthy");
  });

  it("checks a single provider by id", () => {
    const manager = createRuntimeHealthManager();
    const context = buildContext();
    const result = manager.checkProvider("runtime", context);

    expect("providerId" in result && result.providerId).toBe("runtime");
    expect(manager.checkProvider("missing", context)).toMatchObject({
      code: "HEALTH_PROVIDER_NOT_FOUND",
    });
  });

  it("records provider execution failures", () => {
    const manager = createRuntimeHealthManager({
      providers: [
        {
          id: "broken",
          name: "Broken Provider",
          check: () => {
            throw new Error("provider exploded");
          },
        },
      ],
    });

    const result = manager.check(buildContext());
    expect(result.status).toBe("unhealthy");
    expect(result.failedProviders).toEqual(["broken"]);
  });

  it("records non-error provider execution failures", () => {
    const manager = createRuntimeHealthManager({
      providers: [
        {
          id: "broken",
          name: "Broken Provider",
          check: () => {
            throw "not-an-error-object";
          },
        },
      ],
    });

    const result = manager.check(buildContext());
    expect(result.failedProviders).toEqual(["broken"]);
    expect(result.providerResults[0]?.summary).toBe("Health provider check failed");
  });

  it("produces snapshots and diagnostics after checks", () => {
    const manager = createRuntimeHealthManager({
      now: () => "2026-01-01T00:00:00.000Z",
    });
    manager.check(buildContext());

    const snapshot = manager.snapshot();
    expect(snapshot.status).toBe("healthy");
    expect(snapshot.providerCount).toBe(4);

    const diagnostics = manager.getDiagnostics();
    expect(diagnostics.registeredProviders).toHaveLength(4);
    expect(diagnostics.lastExecution).toBe("2026-01-01T00:00:00.000Z");
    expect(diagnostics.snapshotTimestamp).toBe("2026-01-01T00:00:00.000Z");
    expect(diagnostics.extensionPoints).toContain("databaseProvider");
  });

  it("throws when snapshot is requested before a check", () => {
    const manager = createRuntimeHealthManager({ providers: [] });
    expect(() => manager.snapshot()).toThrow("Health check has not been executed");
  });

  it("returns unknown status and diagnostics before checks", () => {
    const manager = createRuntimeHealthManager({ providers: [] });
    expect(manager.getStatus()).toBe("unknown");
    expect(manager.getDiagnostics().summary).toContain("not been executed");
  });

  it("resets state for tests", () => {
    const manager = createRuntimeHealthManager({ providers: [] });
    manager.registerProvider({
      id: "temp",
      name: "Temp",
      check: () => ({
        providerId: "temp",
        providerName: "Temp",
        status: "healthy",
        severity: "info",
        timestamp: "2026-01-01T00:00:00.000Z",
        summary: "ok",
        metadata: {},
      }),
    });

    manager._resetForTests();
    expect(manager.getRegisteredProviderIds()).toHaveLength(4);
    expect(manager.getStatus()).toBe("unknown");
  });

  it("returns false when unregistering with empty id", () => {
    const manager = createRuntimeHealthManager({ providers: [] });
    expect(manager.unregisterProvider("")).toBe(false);
  });
});
