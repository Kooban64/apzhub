import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

import {
  buildCapabilityFromManifest,
  withCapabilityLifecycleState,
} from "../../../capability/factory";
import type { Capability } from "../../../capability/types";
import { createCapabilityRegistry } from "../../../capability-registry/registry";
import { resolveCapabilityDependencies } from "../../../dependency-graph/resolve";
import { Configuration } from "../../../configuration-manager";
import { createCapabilityLifecycleManager } from "../../../lifecycle-manager/manager";
import { createConfigurationHealthProvider } from "./configuration-provider";
import { createLifecycleHealthProvider } from "./lifecycle-provider";
import { createRegistryHealthProvider } from "./registry-provider";
import { createRuntimeHealthProvider } from "./runtime-provider";
import type { HealthProviderContext } from "../../interfaces/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(
  __dirname,
  "../../../../../../testing/fixtures/discovery",
);

function testCapability(id: string): Capability {
  const base = buildCapabilityFromManifest(
    {
      manifestSchemaVersion: "1.0",
      id,
      name: id,
      version: "1.0.0",
      kind: "component",
      metadata: {},
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
  options: {
    register?: boolean;
    initialised?: boolean;
    platformVersion?: string;
  } = {},
): HealthProviderContext {
  Configuration.load({
    overrides: {
      workspaceRoot: fixturesRoot,
      platformVersion: options.platformVersion ?? "0.2.0",
    },
  });

  const capability = testCapability("button");
  const registry = createCapabilityRegistry(options.platformVersion ?? "0.2.0");
  const lifecycle = createCapabilityLifecycleManager();
  lifecycle.reset(capability.id);

  if (options.register ?? true) {
    registry.register(capability);
  }

  if (options.initialised ?? true) {
    lifecycle.transition(capability.id, "validated", { source: "test" });
    lifecycle.transition(capability.id, "dependencies-resolved", { source: "test" });
    lifecycle.transition(capability.id, "registered", { source: "test" });
    lifecycle.transition(capability.id, "initialised", { source: "test" });
    registry.updateLifecycleState(capability.id, "initialised");
  }

  return {
    configuration: Configuration.getConfiguration()!,
    registry,
    lifecycle,
    capabilities: [capability],
  };
}

describe("configuration health provider", () => {
  afterEach(() => {
    Configuration._resetForTests();
  });

  it("reports unhealthy when configuration is not loaded", () => {
    Configuration._resetForTests();
    const context = {
      configuration: {
        workspaceRoot: fixturesRoot,
        platformVersion: "0.2.0",
        failFast: true,
        runtimeMode: "development" as const,
        discovery: {},
      },
      registry: createCapabilityRegistry("0.2.0"),
      lifecycle: createCapabilityLifecycleManager(),
      capabilities: [],
    };
    const result = createConfigurationHealthProvider().check(context);

    expect(result.status).toBe("unhealthy");
    expect(result.severity).toBe("critical");
  });

  it("reports healthy when configuration is valid", () => {
    const result = createConfigurationHealthProvider().check(buildContext());
    expect(result.status).toBe("healthy");
  });

  it("reports unhealthy when configuration validation fails", () => {
    Configuration.load({ overrides: { platformVersion: "not-semver" } });
    const result = createConfigurationHealthProvider().check(
      buildContext({ platformVersion: "not-semver" }),
    );

    expect(result.status).toBe("unhealthy");
  });
});

describe("runtime health provider", () => {
  afterEach(() => {
    Configuration._resetForTests();
  });

  it("reports healthy runtime integrity", () => {
    const result = createRuntimeHealthProvider().check(buildContext());
    expect(result.status).toBe("healthy");
  });

  it("reports unhealthy when capabilities are missing", () => {
    const context = buildContext();
    const result = createRuntimeHealthProvider().check({
      ...context,
      capabilities: [],
    });
    expect(result.status).toBe("unhealthy");
  });

  it("reports unhealthy when workspace root is empty", () => {
    const context = buildContext();
    const result = createRuntimeHealthProvider().check({
      ...context,
      configuration: { ...context.configuration, workspaceRoot: "" },
    });
    expect(result.status).toBe("unhealthy");
    expect(result.metadata.issues).toContain("workspaceRoot is empty");
  });

  it("reports unhealthy when platform version is invalid", () => {
    const context = buildContext();
    const result = createRuntimeHealthProvider().check({
      ...context,
      configuration: { ...context.configuration, platformVersion: "bad-version" },
    });
    expect(result.status).toBe("unhealthy");
  });

  it("reports unhealthy when registry is empty while capabilities exist", () => {
    const context = buildContext({ register: false });
    const result = createRuntimeHealthProvider().check(context);
    expect(result.status).toBe("unhealthy");
  });

  it("reports unhealthy when registry count mismatches capabilities", () => {
    const context = buildContext();
    context.registry.register(testCapability("extra"));
    const result = createRuntimeHealthProvider().check(context);
    expect(result.status).toBe("unhealthy");
  });
});

describe("registry health provider", () => {
  afterEach(() => {
    Configuration._resetForTests();
  });

  it("reports unhealthy when registry is empty", () => {
    const context = buildContext({ register: false });
    const result = createRegistryHealthProvider().check(context);
    expect(result.status).toBe("unhealthy");
  });

  it("reports degraded when platform versions differ", () => {
    Configuration.load({
      overrides: { workspaceRoot: fixturesRoot, platformVersion: "0.3.0" },
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

    const context: HealthProviderContext = {
      configuration: Configuration.getConfiguration()!,
      registry,
      lifecycle,
      capabilities: [capability],
    };
    const result = createRegistryHealthProvider().check(context);
    expect(result.status).toBe("degraded");
  });

  it("reports healthy for a populated registry", () => {
    const result = createRegistryHealthProvider().check(buildContext());
    expect(result.status).toBe("healthy");
  });

  it("reports degraded when registry contains unhealthy capabilities", () => {
    const context = buildContext();
    context.registry.updateHealth("button", "unhealthy");
    const result = createRegistryHealthProvider().check(context);
    expect(result.status).toBe("degraded");
  });
});

describe("lifecycle health provider", () => {
  afterEach(() => {
    Configuration._resetForTests();
  });

  it("reports healthy when capabilities are initialised", () => {
    const result = createLifecycleHealthProvider().check(buildContext());
    expect(result.status).toBe("healthy");
  });

  it("reports degraded when capabilities are not initialised", () => {
    const result = createLifecycleHealthProvider().check(
      buildContext({ initialised: false }),
    );
    expect(result.status).toBe("degraded");
  });

  it("reports unhealthy when capabilities are failed", () => {
    const context = buildContext({ initialised: false });
    context.lifecycle.transition("button", "failed", { source: "test" });
    const result = createLifecycleHealthProvider().check(context);
    expect(result.status).toBe("unhealthy");
  });
});
