import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { Configuration, createRuntimeConfigurationManager } from "../index";

const ENV_KEYS = [
  "APZHUB_WORKSPACE_ROOT",
  "APZHUB_PLATFORM_VERSION",
  "APZHUB_RUNTIME_FAIL_FAST",
  "APZHUB_RUNTIME_MODE",
  "APZHUB_DISCOVERY_ROOTS",
] as const;

describe("Runtime Configuration Manager API", () => {
  afterEach(() => {
    Configuration._resetForTests();
    for (const key of ENV_KEYS) {
      delete process.env[key];
    }
  });

  it("loads configuration from defaults and overrides", () => {
    const result = Configuration.load({
      overrides: { workspaceRoot: "/tmp/apzhub", platformVersion: "0.2.0" },
    });

    expect(result.success).toBe(true);
    expect(result.configuration?.workspaceRoot).toBe(path.resolve("/tmp/apzhub"));
    expect(result.sources).toContain("defaults");
    expect(result.sources).toContain("overrides");
  });

  it("validates loaded configuration", () => {
    Configuration.load({ overrides: { workspaceRoot: "/tmp/apzhub" } });
    const validation = Configuration.validate();
    expect(validation.success).toBe(true);
  });

  it("gets and checks configuration values", () => {
    Configuration.load({
      overrides: { workspaceRoot: "/tmp/apzhub", failFast: false },
    });

    expect(Configuration.get("workspaceRoot")).toBe(path.resolve("/tmp/apzhub"));
    expect(Configuration.get("failFast")).toBe(false);
    expect(Configuration.has("platformVersion")).toBe(true);
    expect(Configuration.has("discovery.roots")).toBe(false);
  });

  it("returns snapshots and metadata", () => {
    Configuration.load({ overrides: { workspaceRoot: "/tmp/apzhub" } });
    const snapshot = Configuration.snapshot();
    expect(snapshot.version).toBe("1.0.0");
    expect(snapshot.configuration.workspaceRoot).toBe(path.resolve("/tmp/apzhub"));

    const metadata = Configuration.metadata();
    expect(metadata.schemaVersion).toBe("1.0.0");
    expect(metadata.extensionPoints).toContain("secretProvider");
  });

  it("returns diagnostics with validation status", () => {
    Configuration.load({ overrides: { workspaceRoot: "/tmp/apzhub" } });
    const diagnostics = Configuration.getDiagnostics();
    expect(diagnostics.validationStatus).toBe("valid");
    expect(diagnostics.metadata.sources.length).toBeGreaterThan(0);
  });

  it("reload placeholder returns deferred message", () => {
    const reload = Configuration.reload();
    expect(reload.placeholder).toBe(true);
    expect(reload.message).toContain("placeholder");
  });

  it("rejects invalid platform version", () => {
    const result = Configuration.load({
      overrides: { workspaceRoot: "/tmp/apzhub", platformVersion: "not-semver" },
    });

    expect(result.success).toBe(false);
    expect(result.errors?.[0]?.code).toBe("CONFIG_INVALID_VERSION");
  });

  it("reports unknown override keys", () => {
    Configuration.load({
      overrides: {
        workspaceRoot: "/tmp/apzhub",
        unknownSetting: true,
      } as never,
    });

    const validation = Configuration.validate();
    expect(validation.unknownKeys).toContain("unknownSetting");
    expect(validation.warnings[0]?.code).toBe("CONFIG_UNKNOWN_KEY");
  });

  it("loads environment variables through the configuration manager", () => {
    process.env.APZHUB_WORKSPACE_ROOT = "/env/workspace";
    process.env.APZHUB_PLATFORM_VERSION = "0.3.0";
    process.env.APZHUB_RUNTIME_FAIL_FAST = "false";

    const manager = createRuntimeConfigurationManager();
    const result = manager.load();

    expect(result.success).toBe(true);
    expect(result.configuration?.workspaceRoot).toBe(path.resolve("/env/workspace"));
    expect(result.configuration?.platformVersion).toBe("0.3.0");
    expect(result.configuration?.failFast).toBe(false);
    expect(result.sources).toContain("environment");
  });

  it("throws when snapshot requested before load", () => {
    const manager = createRuntimeConfigurationManager();
    expect(() => manager.snapshot()).toThrow(/not been loaded/);
  });

  it("reports not-loaded diagnostics", () => {
    const manager = createRuntimeConfigurationManager();
    const diagnostics = manager.getDiagnostics();
    expect(diagnostics.validationStatus).toBe("not-loaded");
    expect(diagnostics.missingValues.length).toBeGreaterThan(0);
  });

  it("rejects empty discovery roots", () => {
    const result = Configuration.load({
      overrides: {
        workspaceRoot: "/tmp/apzhub",
        discovery: { roots: [] },
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors?.[0]?.code).toBe("CONFIG_INVALID_RANGE");
  });

  it("returns undefined for get() before load", () => {
    const manager = createRuntimeConfigurationManager();
    expect(manager.get("workspaceRoot")).toBeUndefined();
    expect(manager.validate().success).toBe(false);
    expect(manager.getConfiguration()).toBeUndefined();
  });

  it("reads all configuration keys when discovery options are set", () => {
    Configuration.load({
      overrides: {
        workspaceRoot: "/tmp/apzhub",
        discovery: {
          roots: ["services"],
          manifestFileNames: ["component.yaml"],
          ignoreDirNames: ["node_modules"],
        },
      },
    });

    expect(Configuration.get("discovery.roots")).toEqual(["services"]);
    expect(Configuration.get("discovery.manifestFileNames")).toEqual([
      "component.yaml",
    ]);
    expect(Configuration.get("discovery.ignoreDirNames")).toEqual(["node_modules"]);
  });

  it("loads environment-only configuration", () => {
    process.env.APZHUB_RUNTIME_MODE = "production";

    const manager = createRuntimeConfigurationManager();
    const result = manager.load();

    expect(result.success).toBe(true);
    expect(result.sources).toEqual(["defaults", "environment"]);
    expect(result.configuration?.runtimeMode).toBe("production");
  });

  it("rejects invalid runtime mode enum", () => {
    const result = Configuration.load({
      overrides: {
        workspaceRoot: "/tmp/apzhub",
        runtimeMode: "staging" as never,
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors?.[0]?.code).toBe("CONFIG_INVALID_ENUM");
  });
});
