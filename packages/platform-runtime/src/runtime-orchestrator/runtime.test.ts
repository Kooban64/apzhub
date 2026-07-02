import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, beforeEach } from "vitest";

import { Runtime, createRuntimeOrchestratorState } from "./runtime";
import { Configuration } from "../configuration-manager";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(__dirname, "../../../../testing/fixtures/discovery");

describe("Runtime", () => {
  beforeEach(() => {
    Runtime._resetForTests();
    Configuration._resetForTests();
  });

  it("bootstraps the platform via Runtime.bootstrap()", async () => {
    const result = await Runtime.bootstrap({
      workspaceRoot: fixturesRoot,
      discovery: { roots: ["alpha", "beta"] },
    });

    expect(result.success).toBe(true);
    expect(Runtime.getStatus()).toBe("ready");
    expect(Runtime.getDiagnostics().platformReady).toBe(true);
    expect(Runtime.registry().count()).toBe(2);
  });

  it("returns diagnostics without bootstrapping when idle", () => {
    const diagnostics = Runtime.getDiagnostics();
    expect(diagnostics.status).toBe("idle");
    expect(diagnostics.steps).toEqual([]);
  });

  it("initialises when not ready and no-ops when already ready", async () => {
    await Runtime.bootstrap({
      workspaceRoot: fixturesRoot,
      discovery: { roots: ["alpha"] },
    });

    const second = await Runtime.initialise();
    expect(second.success).toBe(true);
    expect(Runtime.getStatus()).toBe("ready");
  });

  it("shutdown placeholder clears runtime state", async () => {
    await Runtime.bootstrap({
      workspaceRoot: fixturesRoot,
      discovery: { roots: ["alpha"] },
    });

    const shutdown = await Runtime.shutdown();
    expect(shutdown.success).toBe(true);
    expect(shutdown.message).toContain("placeholder");
    expect(Runtime.getStatus()).toBe("idle");
    expect(Runtime.getDiagnostics().registryCount).toBe(0);
  });

  it("restart placeholder shuts down then bootstraps again", async () => {
    await Runtime.bootstrap({
      workspaceRoot: fixturesRoot,
      discovery: { roots: ["alpha"] },
    });

    const restart = await Runtime.restart({
      workspaceRoot: fixturesRoot,
      discovery: { roots: ["alpha", "beta"] },
    });

    expect(restart.success).toBe(true);
    expect(restart.shutdownMessage).toContain("placeholder");
    expect(Runtime.registry().count()).toBe(2);
  });

  it("throws when registry is accessed before bootstrap", () => {
    expect(() => Runtime.registry()).toThrow(/not been bootstrapped/);
  });

  it("throws when health is accessed before bootstrap", () => {
    expect(() => Runtime.health()).toThrow(/not been bootstrapped/);
  });

  it("throws when configuration is accessed before bootstrap", () => {
    expect(() => Runtime.configuration()).toThrow(/not been bootstrapped/);
  });

  it("returns integrated diagnostics after bootstrap", async () => {
    await Runtime.bootstrap({
      workspaceRoot: fixturesRoot,
      discovery: { roots: ["alpha"] },
    });

    const diagnostics = Runtime.getDiagnostics();
    expect(diagnostics.configuration.validationStatus).toBe("valid");
    expect(diagnostics.health.status).toBe("healthy");
    expect(diagnostics.lifecycle.capabilityCount).toBe(1);
    expect(Runtime.registry().findById("discovery-alpha")?.lifecycleState).toBe(
      "active",
    );
  });

  it("exposes initial orchestrator state factory", () => {
    expect(createRuntimeOrchestratorState()).toEqual({
      status: "idle",
      context: null,
      registryFacade: null,
    });
  });

  it("records failed bootstrap status", async () => {
    const result = await Runtime.bootstrap({
      workspaceRoot: fixturesRoot,
      discovery: { roots: ["missing-root"] },
    });

    expect(result.success).toBe(false);
    expect(Runtime.getStatus()).toBe("failed");
  });
});
