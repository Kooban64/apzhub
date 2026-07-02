import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, afterEach, vi } from "vitest";

import { Configuration } from "../configuration-manager";
import { Health } from "../health-manager";
import { lifecycleError } from "../lifecycle-manager/errors";
import { buildCapabilityFromManifest } from "../capability/factory";
import { withCapabilityLifecycleState } from "../capability/factory";
import {
  createOrchestratorContext,
  runCapabilityRegistryStep,
  runConfigurationStep,
  runDependencyGraphStep,
  runDiscoveryStep,
  runHealthManagerStep,
  runLifecycleManagerStep,
  runManifestEngineStep,
} from "./pipeline";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(__dirname, "../../../../testing/fixtures/discovery");

describe("orchestrator pipeline steps", () => {
  afterEach(() => {
    Configuration._resetForTests();
    Health._resetForTests();
  });

  it("fails configuration step when validation fails", () => {
    const context = createOrchestratorContext({ workspaceRoot: fixturesRoot });
    const result = runConfigurationStep(context, {
      workspaceRoot: fixturesRoot,
      platformVersion: "not-semver",
    });

    expect(result.success).toBe(false);
    expect(result.errors?.[0]?.subsystem).toBe("configuration-manager");
  });

  it("loads configuration in the configuration step", () => {
    const context = createOrchestratorContext({ workspaceRoot: fixturesRoot });
    const result = runConfigurationStep(context, { workspaceRoot: fixturesRoot });

    expect(result.success).toBe(true);
    expect(context.configuration.workspaceRoot).toBe(fixturesRoot);
  });

  it("continues discovery with diagnostics when failFast is disabled", () => {
    const context = createOrchestratorContext({
      workspaceRoot: fixturesRoot,
      failFast: false,
      discovery: { roots: ["."] },
    });
    runConfigurationStep(context, {
      workspaceRoot: fixturesRoot,
      failFast: false,
      discovery: { roots: ["."] },
    });

    const result = runDiscoveryStep(context);
    expect(result.success).toBe(true);
    expect(context.capabilities.length).toBeGreaterThan(0);
  });

  it("fails manifest-engine when platform version is incompatible", () => {
    const context = createOrchestratorContext({
      workspaceRoot: fixturesRoot,
      platformVersion: "0.1.0",
      failFast: true,
      discovery: { roots: ["alpha"] },
    });
    runConfigurationStep(context, {
      workspaceRoot: fixturesRoot,
      platformVersion: "0.1.0",
      discovery: { roots: ["alpha"] },
    });
    runDiscoveryStep(context);

    context.capabilities = context.capabilities.map((capability) =>
      buildCapabilityFromManifest(
        {
          ...capability.manifest,
          compatibility: { platformVersion: ">=99.0.0" },
        } as typeof capability.manifest,
        { lifecycleState: "discovered" },
      ),
    );
    for (const capability of context.capabilities) {
      context.lifecycle.reset(capability.id);
    }

    const result = runManifestEngineStep(context);
    expect(result.success).toBe(false);
    expect(result.errors?.[0]?.code).toBe("ORCHESTRATOR_MANIFEST_FAILED");
  });

  it("fails dependency-graph when capabilities are not validated", () => {
    const context = createOrchestratorContext({ workspaceRoot: fixturesRoot });
    context.capabilities = [
      buildCapabilityFromManifest(
        {
          manifestSchemaVersion: "1.0",
          id: "bad-state",
          name: "Bad",
          version: "1.0.0",
          kind: "component",
          metadata: {},
          component: { theme: { supportsDarkMode: true } },
        },
        { lifecycleState: "discovered" },
      ),
    ];

    const result = runDependencyGraphStep(context);
    expect(result.success).toBe(false);
    expect(result.errors?.[0]?.subsystem).toBe("dependency-graph");
  });

  it("fails capability-registry when registration preconditions fail", () => {
    const context = createOrchestratorContext({ workspaceRoot: fixturesRoot });
    const capability = buildCapabilityFromManifest(
      {
        manifestSchemaVersion: "1.0",
        id: "dup",
        name: "Dup",
        version: "1.0.0",
        kind: "component",
        metadata: {},
        component: { theme: { supportsDarkMode: true } },
      },
      { lifecycleState: "validated" },
    );
    const resolved = withCapabilityLifecycleState(capability, "dependencies-resolved");
    context.capabilities = [resolved];
    context.dependencyOrder = [resolved.id];
    context.registry.register(resolved);

    const result = runCapabilityRegistryStep(context);
    expect(result.success).toBe(false);
    expect(result.errors?.[0]?.code).toBe("ORCHESTRATOR_REGISTRY_FAILED");
  });

  it("fails lifecycle-manager when lifecycle state is out of sync", () => {
    const context = createOrchestratorContext({ workspaceRoot: fixturesRoot });
    const capability = buildCapabilityFromManifest(
      {
        manifestSchemaVersion: "1.0",
        id: "out-of-sync",
        name: "Out of sync",
        version: "1.0.0",
        kind: "component",
        metadata: {},
        component: { theme: { supportsDarkMode: true } },
      },
      { lifecycleState: "dependencies-resolved" },
    );

    context.capabilities = [capability];
    context.dependencyOrder = [capability.id];
    context.registry.registerMany([capability]);
    context.lifecycle.reset(capability.id);

    const result = runLifecycleManagerStep(context);
    expect(result.success).toBe(false);
    expect(result.errors?.[0]?.code).toBe("ORCHESTRATOR_LIFECYCLE_FAILED");
  });

  it("fails dependency-graph lifecycle sync when transition is invalid", () => {
    const context = createOrchestratorContext({ workspaceRoot: fixturesRoot });
    const capability = buildCapabilityFromManifest(
      {
        manifestSchemaVersion: "1.0",
        id: "failed-cap",
        name: "Failed",
        version: "1.0.0",
        kind: "component",
        metadata: {},
        component: { theme: { supportsDarkMode: true } },
      },
      { lifecycleState: "validated" },
    );

    context.capabilities = [capability];
    context.lifecycle.reset(capability.id);
    context.lifecycle.transition(capability.id, "validated");
    context.lifecycle.markFailed(capability.id);

    const result = runDependencyGraphStep(context);
    expect(result.success).toBe(false);
    expect(result.errors?.[0]?.code).toBe("ORCHESTRATOR_LIFECYCLE_FAILED");
  });

  it("evaluates health and transitions capabilities to healthy", () => {
    const context = createOrchestratorContext({
      workspaceRoot: fixturesRoot,
      discovery: { roots: ["alpha"] },
    });
    runConfigurationStep(context, {
      workspaceRoot: fixturesRoot,
      discovery: { roots: ["alpha"] },
    });
    runDiscoveryStep(context);
    runManifestEngineStep(context);
    runDependencyGraphStep(context);
    runCapabilityRegistryStep(context);
    runLifecycleManagerStep(context);

    const result = runHealthManagerStep(context);
    expect(result.success).toBe(true);
    expect(result.message).toContain("Runtime health");
    expect(context.lifecycle.getState("discovery-alpha")).toBe("healthy");
    expect(context.registry.getHealth("discovery-alpha")).toBe("healthy");
  });

  it("fails health step when runtime health is unhealthy and failFast is enabled", () => {
    const context = createOrchestratorContext({
      workspaceRoot: fixturesRoot,
      failFast: true,
      discovery: { roots: ["alpha"] },
    });
    runConfigurationStep(context, {
      workspaceRoot: fixturesRoot,
      failFast: true,
      discovery: { roots: ["alpha"] },
    });
    runDiscoveryStep(context);
    runManifestEngineStep(context);
    runDependencyGraphStep(context);
    runCapabilityRegistryStep(context);
    runLifecycleManagerStep(context);
    context.capabilities = [];

    const result = runHealthManagerStep(context);
    expect(result.success).toBe(false);
    expect(result.errors?.[0]?.code).toBe("ORCHESTRATOR_HEALTH_FAILED");
  });

  it("fails health step when lifecycle sync errors occur", () => {
    const context = createOrchestratorContext({
      workspaceRoot: fixturesRoot,
      discovery: { roots: ["alpha"] },
    });
    runConfigurationStep(context, {
      workspaceRoot: fixturesRoot,
      discovery: { roots: ["alpha"] },
    });
    runDiscoveryStep(context);
    runManifestEngineStep(context);
    runDependencyGraphStep(context);
    runCapabilityRegistryStep(context);
    runLifecycleManagerStep(context);

    vi.spyOn(context.lifecycle, "transition").mockReturnValueOnce({
      success: false,
      capabilityId: "discovery-alpha",
      from: "initialised",
      to: "healthy",
      errors: [
        lifecycleError("LIFECYCLE_INVALID_INPUT", "forced health transition failure", {
          capabilityId: "discovery-alpha",
        }),
      ],
    });

    const result = runHealthManagerStep(context);
    expect(result.success).toBe(false);
    expect(result.message).toContain("failed to update capability health state");
  });
});
