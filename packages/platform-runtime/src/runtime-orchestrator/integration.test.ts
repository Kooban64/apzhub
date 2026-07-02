import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Configuration } from "../configuration-manager";
import { Health } from "../health-manager";
import { STARTUP_STEP_ORDER } from "./types";
import {
  createOrchestratorContext,
  runCapabilityRegistryStep,
  runConfigurationStep,
  runDependencyGraphStep,
  runDiscoveryStep,
  runHealthManagerStep,
  runLifecycleManagerStep,
  runManifestEngineStep,
  runPlatformReadyStep,
  runStartupPipeline,
} from "./pipeline";
import { lifecycleError } from "../lifecycle-manager/errors";
import { Runtime } from "./runtime";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(__dirname, "../../../../testing/fixtures/discovery");
const workspaceRoot = path.resolve(__dirname, "../../../..");

describe("runtime integration", () => {
  afterEach(() => {
    Runtime._resetForTests();
    Configuration._resetForTests();
    Health._resetForTests();
  });

  it("bootstraps the full runtime flow with integrated diagnostics", async () => {
    const result = await Runtime.bootstrap({
      workspaceRoot: fixturesRoot,
      discovery: { roots: ["alpha", "beta"] },
    });

    expect(result.success).toBe(true);
    expect(result.diagnostics.platformReady).toBe(true);
    expect(result.diagnostics.steps.map((step) => step.step)).toEqual([
      ...STARTUP_STEP_ORDER,
    ]);
    expect(result.diagnostics.configuration.validationStatus).toBe("valid");
    expect(result.diagnostics.discovery.capabilityCount).toBe(2);
    expect(result.diagnostics.manifest.validatedCount).toBe(2);
    expect(result.diagnostics.dependencies.resolvedCount).toBe(2);
    expect(result.diagnostics.lifecycle.capabilityCount).toBe(2);
    expect(result.diagnostics.health.status).toBe("healthy");
    expect(result.diagnostics.startupDurationMs).toBeGreaterThanOrEqual(0);
    expect(Runtime.health().status).toBe("healthy");
    expect(Runtime.configuration().validationStatus).toBe("valid");
    expect(Runtime.registry().getComponents().length).toBeGreaterThan(0);
  });

  it("transitions capabilities to active at platform ready", async () => {
    await Runtime.bootstrap({
      workspaceRoot: fixturesRoot,
      discovery: { roots: ["alpha"] },
    });

    expect(Runtime.registry().findById("discovery-alpha")?.lifecycleState).toBe(
      "active",
    );
  });

  it("fails bootstrap when discovery finds no capabilities", async () => {
    const result = await Runtime.bootstrap({
      workspaceRoot: fixturesRoot,
      discovery: { roots: ["missing-root"] },
    });

    expect(result.success).toBe(false);
    expect(result.diagnostics.fatalErrors.length).toBeGreaterThan(0);
    expect(result.diagnostics.platformReady).toBe(false);
  });

  it("fails bootstrap on invalid manifest when failFast is enabled", async () => {
    const result = await Runtime.bootstrap({
      workspaceRoot: fixturesRoot,
      discovery: { roots: ["invalid"] },
      failFast: true,
    });

    expect(result.success).toBe(false);
    expect(
      result.diagnostics.steps.some(
        (step) =>
          (step.step === "manifest-engine" || step.step === "discovery") &&
          !step.success,
      ),
    ).toBe(true);
  });

  it("discovers scaffold manifests from the monorepo workspace", async () => {
    const result = await Runtime.bootstrap({
      workspaceRoot,
      failFast: false,
    });

    expect(result.success).toBe(true);
    expect(result.diagnostics.registryCount).toBeGreaterThan(5);
    expect(
      Runtime.registry()
        .getThemes()
        .some((theme) => theme.id === "apzhub-default-theme"),
    ).toBe(true);
    expect(
      Runtime.registry()
        .getServices()
        .some((service) => service.id === "platform-registry"),
    ).toBe(true);
    expect(
      Runtime.registry()
        .getEvents()
        .some((event) => event.id === "platform-registry-ready"),
    ).toBe(true);
    expect(
      Runtime.registry()
        .getComponents()
        .some((component) => component.id === "activity-bar"),
    ).toBe(true);
  });
});

describe("runStartupPipeline integration", () => {
  afterEach(() => {
    Configuration._resetForTests();
    Health._resetForTests();
  });

  it("includes discovery and dependency summaries in diagnostics", () => {
    const { result } = runStartupPipeline({
      workspaceRoot: fixturesRoot,
      discovery: { roots: ["alpha", "beta"] },
    });

    expect(result.success).toBe(true);
    expect(result.diagnostics.discovery.roots).toEqual(["alpha", "beta"]);
    expect(result.diagnostics.discovery.scannedRoots.length).toBe(2);
    expect(result.diagnostics.dependencies.resolvedCount).toBe(2);
    expect(result.diagnostics.dependencies.dependencyOrder.length).toBe(2);
  });

  it("fails when health providers report unhealthy with failFast enabled", () => {
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
  });

  it("fails platform-ready when lifecycle activation fails", () => {
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
    runHealthManagerStep(context);

    vi.spyOn(context.lifecycle, "transition").mockReturnValueOnce({
      success: false,
      capabilityId: "discovery-alpha",
      from: "healthy",
      to: "active",
      errors: [
        lifecycleError("LIFECYCLE_INVALID_INPUT", "forced platform-ready failure", {
          capabilityId: "discovery-alpha",
        }),
      ],
    });

    const result = runPlatformReadyStep(context, {});
    expect(result.success).toBe(false);
  });
});
