import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi, afterEach } from "vitest";

import { Configuration } from "../configuration-manager";
import { Health } from "../health-manager";
import { STARTUP_STEP_ORDER } from "./types";
import { runStartupPipeline } from "./pipeline";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "../../../../");
const fixturesRoot = path.resolve(workspaceRoot, "testing/fixtures/discovery");

describe("runStartupPipeline", () => {
  afterEach(() => {
    Configuration._resetForTests();
    Health._resetForTests();
  });

  it("executes the approved startup sequence in order", () => {
    const { result, context } = runStartupPipeline({
      workspaceRoot: fixturesRoot,
      discovery: { roots: ["alpha", "beta"] },
      platformVersion: "0.2.0",
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe("ready");
    expect(result.diagnostics.platformReady).toBe(true);
    expect(result.diagnostics.steps.map((step) => step.step)).toEqual([
      ...STARTUP_STEP_ORDER,
    ]);
    expect(context.registry.count()).toBe(2);
    expect(context.lifecycle.getState("discovery-alpha")).toBe("active");
    expect(context.lifecycle.getState("discovery-beta")).toBe("active");
    expect(context.registry.getHealth("discovery-alpha")).toBe("healthy");
  });

  it("executes the Health Manager step after lifecycle initialisation", () => {
    const { result } = runStartupPipeline({
      workspaceRoot: fixturesRoot,
      discovery: { roots: ["alpha"] },
    });

    const healthStep = result.diagnostics.steps.find(
      (step) => step.step === "health-manager",
    );
    expect(healthStep?.success).toBe(true);
    expect(healthStep?.message).toContain("Runtime health healthy");
    expect(result.diagnostics.health.status).toBe("healthy");
    expect(result.diagnostics.startupDurationMs).toBeGreaterThanOrEqual(0);
  });

  it("stops startup on fatal discovery errors when failFast is enabled", () => {
    const { result } = runStartupPipeline({
      workspaceRoot: fixturesRoot,
      discovery: { roots: ["."] },
      failFast: true,
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe("failed");
    expect(
      result.diagnostics.steps.some(
        (step) => step.step === "discovery" && !step.success,
      ),
    ).toBe(true);
    expect(
      result.diagnostics.steps.some((step) => step.step === "platform-ready"),
    ).toBe(false);
  });

  it("surfaces subsystem failures in structured diagnostics", () => {
    const { result } = runStartupPipeline({
      workspaceRoot: fixturesRoot,
      discovery: { roots: ["bad-version"] },
      failFast: true,
    });

    expect(result.success).toBe(false);
    expect(result.diagnostics.fatalErrors.length).toBeGreaterThan(0);
    expect(result.diagnostics.fatalErrors[0]?.subsystem).toBeDefined();
  });

  it("fails when no capabilities are discovered", () => {
    const { result } = runStartupPipeline({
      workspaceRoot: fixturesRoot,
      discovery: { roots: ["missing-root"] },
    });

    expect(result.success).toBe(false);
    expect(result.diagnostics.steps[1]?.step).toBe("discovery");
    expect(result.diagnostics.steps[1]?.success).toBe(false);
  });

  it("invokes onPlatformReady when startup succeeds", () => {
    const ready = vi.fn();
    runStartupPipeline({
      workspaceRoot: fixturesRoot,
      discovery: { roots: ["alpha"] },
      onPlatformReady: ready,
    });

    expect(ready).toHaveBeenCalledTimes(1);
  });
});
