import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { buildCapabilityFromManifest } from "../capability/factory";
import type { Capability } from "../capability/types";
import type { CapabilityManifest } from "../manifest-engine";
import { parseCapabilityManifestYaml } from "../manifest-engine/validate";
import { buildDependencyGraph } from "./build";
import { getTopologicalOrder, resolveCapabilityDependencies } from "./resolve";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, "../../../../testing/fixtures/registry");

function loadValidatedCapability(fileName: string): Capability {
  const yaml = readFileSync(path.join(fixturesDir, fileName), "utf8");
  const parsed = parseCapabilityManifestYaml(yaml);
  if (!parsed.success) {
    throw new Error(`Fixture ${fileName} failed validation`);
  }
  return buildCapabilityFromManifest(parsed.data, { lifecycleState: "validated" });
}

function validatedFromManifest(manifest: CapabilityManifest): Capability {
  return buildCapabilityFromManifest(manifest, { lifecycleState: "validated" });
}

describe("buildDependencyGraph", () => {
  it("builds edges from dependency to dependent", () => {
    const service = loadValidatedCapability("dependency-graph-service-a.yaml");
    const module = loadValidatedCapability("dependency-graph-module-b.yaml");
    const result = buildDependencyGraph([service, module]);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.graph.edges).toContainEqual({
        from: "graph-service-a",
        to: "graph-module-b",
        axis: "services",
      });
    }
  });
});

describe("resolveCapabilityDependencies", () => {
  it("resolves a single capability with no dependencies", () => {
    const capability = validatedFromManifest({
      manifestSchemaVersion: "1.0",
      id: "solo",
      name: "Solo",
      version: "1.0.0",
      kind: "component",
      metadata: {},
      component: { theme: { supportsDarkMode: true } },
    });

    const result = resolveCapabilityDependencies([capability]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.order).toEqual(["solo"]);
      expect(result.capabilities[0]?.lifecycleState).toBe("dependencies-resolved");
    }
  });

  it("resolves a linear chain in dependency-first order", () => {
    const service = loadValidatedCapability("dependency-graph-service-a.yaml");
    const moduleB = loadValidatedCapability("dependency-graph-module-b.yaml");
    const integration = loadValidatedCapability("dependency-graph-integration-d.yaml");
    const moduleC = loadValidatedCapability("dependency-graph-module-c.yaml");

    const result = resolveCapabilityDependencies([
      moduleC,
      service,
      moduleB,
      integration,
    ]);
    expect(result.success).toBe(true);
    if (result.success) {
      const { order } = result;
      expect(order.indexOf("graph-service-a")).toBeLessThan(
        order.indexOf("graph-module-b"),
      );
      expect(order.indexOf("graph-integration-d")).toBeLessThan(
        order.indexOf("graph-module-c"),
      );
      expect(order.indexOf("graph-module-b")).toBeLessThan(
        order.indexOf("graph-module-c"),
      );
      expect(order).toHaveLength(4);
    }
  });

  it("resolves diamond dependencies", () => {
    const base = validatedFromManifest({
      manifestSchemaVersion: "1.0",
      id: "base",
      name: "Base",
      version: "1.0.0",
      kind: "service",
      metadata: {},
      service: { category: "platform" },
    });
    const left = validatedFromManifest({
      manifestSchemaVersion: "1.0",
      id: "left",
      name: "Left",
      version: "1.0.0",
      kind: "module",
      metadata: {},
      dependencies: { services: ["base"] },
      module: { status: "enabled" },
    });
    const right = validatedFromManifest({
      manifestSchemaVersion: "1.0",
      id: "right",
      name: "Right",
      version: "1.0.0",
      kind: "module",
      metadata: {},
      dependencies: { services: ["base"] },
      module: { status: "enabled" },
    });
    const top = validatedFromManifest({
      manifestSchemaVersion: "1.0",
      id: "top",
      name: "Top",
      version: "1.0.0",
      kind: "module",
      metadata: {},
      dependencies: { modules: ["left", "right"] },
      module: { status: "enabled" },
    });

    const result = resolveCapabilityDependencies([top, left, right, base]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.order.indexOf("base")).toBeLessThan(result.order.indexOf("left"));
      expect(result.order.indexOf("base")).toBeLessThan(result.order.indexOf("right"));
      expect(result.order.indexOf("left")).toBeLessThan(result.order.indexOf("top"));
      expect(result.order.indexOf("right")).toBeLessThan(result.order.indexOf("top"));
    }
  });

  it("detects missing dependencies", () => {
    const capability = loadValidatedCapability("dependency-graph-missing.yaml");
    const result = resolveCapabilityDependencies([capability]);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]?.code).toBe("MISSING_DEPENDENCY");
      expect(result.errors[0]?.dependencyId).toBe("nonexistent-service");
      expect(result.partialGraph).toBeDefined();
    }
  });

  it("detects circular dependencies", () => {
    const a = loadValidatedCapability("dependency-graph-cycle-a.yaml");
    const b = loadValidatedCapability("dependency-graph-cycle-b.yaml");
    const result = resolveCapabilityDependencies([a, b]);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]?.code).toBe("CYCLE_DETECTED");
      expect(result.errors[0]?.cycle?.length).toBeGreaterThan(1);
    }
  });

  it("accepts platform seed dependencies without input capability", () => {
    const capability = loadValidatedCapability("dependency-graph-platform-seed.yaml");
    const result = resolveCapabilityDependencies([capability]);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.order).toEqual(["graph-platform-seed"]);
      expect(result.graph.edges).toHaveLength(0);
    }
  });

  it("rejects duplicate capability ids", () => {
    const capability = validatedFromManifest({
      manifestSchemaVersion: "1.0",
      id: "dup",
      name: "Dup",
      version: "1.0.0",
      kind: "component",
      metadata: {},
      component: { theme: { supportsDarkMode: true } },
    });

    const result = resolveCapabilityDependencies([capability, capability]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.code === "INVALID_INPUT")).toBe(true);
    }
  });

  it("rejects capabilities not in validated state", () => {
    const capability = buildCapabilityFromManifest({
      manifestSchemaVersion: "1.0",
      id: "discovered-only",
      name: "Discovered",
      version: "1.0.0",
      kind: "component",
      metadata: {},
      component: { theme: { supportsDarkMode: true } },
    });

    const result = resolveCapabilityDependencies([capability]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]?.code).toBe("INVALID_INPUT");
    }
  });

  it("rejects empty capability set", () => {
    const result = resolveCapabilityDependencies([]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]?.code).toBe("EMPTY_GRAPH");
    }
  });

  it("resolves SPR-001 UI components independently", () => {
    const componentDirs = [
      "button",
      "input",
      "card",
      "header",
      "sidebar",
      "status-bar",
      "shell-layout",
    ];
    const uiDir = path.resolve(__dirname, "../../../../packages/ui/src/components");
    const capabilities = componentDirs.map((dir) => {
      const yaml = readFileSync(path.join(uiDir, dir, "component.yaml"), "utf8");
      const parsed = parseCapabilityManifestYaml(yaml);
      if (!parsed.success) throw new Error(`Invalid component ${dir}`);
      return buildCapabilityFromManifest(parsed.data, { lifecycleState: "validated" });
    });

    const result = resolveCapabilityDependencies(capabilities);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.capabilities).toHaveLength(7);
      expect(result.order).toHaveLength(7);
    }
  });

  it("produces deterministic order across runs", () => {
    const caps = ["c", "b", "a"].map((id) =>
      validatedFromManifest({
        manifestSchemaVersion: "1.0",
        id,
        name: id,
        version: "1.0.0",
        kind: "component",
        metadata: {},
        component: { theme: { supportsDarkMode: true } },
      }),
    );

    const first = resolveCapabilityDependencies(caps);
    const second = resolveCapabilityDependencies(caps);
    expect(first.success && second.success).toBe(true);
    if (first.success && second.success) {
      expect(first.order).toEqual(second.order);
      expect(first.order).toEqual(["a", "b", "c"]);
    }
  });

  it("supports additional platform seeds via config", () => {
    const capability = validatedFromManifest({
      manifestSchemaVersion: "1.0",
      id: "custom-seed-user",
      name: "Custom",
      version: "1.0.0",
      kind: "service",
      metadata: {},
      dependencies: { platform: ["custom-platform-cap"] },
      service: { category: "platform" },
    });

    const withoutSeed = resolveCapabilityDependencies([capability]);
    expect(withoutSeed.success).toBe(false);

    const withSeed = resolveCapabilityDependencies([capability], {
      additionalPlatformSeeds: ["custom-platform-cap"],
    });
    expect(withSeed.success).toBe(true);
  });

  it("rejects empty capability id", () => {
    const capability = validatedFromManifest({
      manifestSchemaVersion: "1.0",
      id: "x",
      name: "X",
      version: "1.0.0",
      kind: "component",
      metadata: {},
      component: { theme: { supportsDarkMode: true } },
    });
    const invalid = { ...capability, id: "" };

    const result = resolveCapabilityDependencies([invalid]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.errors.some((e) => e.code === "INVALID_INPUT" && e.field === "id"),
      ).toBe(true);
    }
  });

  it("uses platform axis when dependency axis cannot be determined", () => {
    const base = validatedFromManifest({
      manifestSchemaVersion: "1.0",
      id: "base-cap",
      name: "Base",
      version: "1.0.0",
      kind: "service",
      metadata: {},
      service: { category: "platform" },
    });
    const dependent: Capability = {
      ...validatedFromManifest({
        manifestSchemaVersion: "1.0",
        id: "dependent-cap",
        name: "Dependent",
        version: "1.0.0",
        kind: "module",
        metadata: {},
        module: { status: "enabled" },
      }),
      dependencies: {
        platform: [],
        services: [],
        integrations: [],
        modules: [],
        all: ["base-cap"],
      },
    };

    const buildResult = buildDependencyGraph([base, dependent]);
    expect(buildResult.success).toBe(true);
    if (buildResult.success) {
      expect(buildResult.graph.edges[0]?.axis).toBe("platform");
    }
  });

  it("detects cycles with branching graph paths", () => {
    const mk = (id: string, deps: string[]): Capability =>
      validatedFromManifest({
        manifestSchemaVersion: "1.0",
        id,
        name: id,
        version: "1.0.0",
        kind: "module",
        metadata: {},
        dependencies: { modules: deps },
        module: { status: "enabled" },
      });

    const a = mk("branch-a", ["branch-b", "branch-c"]);
    const b = mk("branch-b", ["branch-d"]);
    const c = mk("branch-c", ["branch-a"]);
    const d = mk("branch-d", []);

    const result = resolveCapabilityDependencies([a, b, c, d]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]?.code).toBe("CYCLE_DETECTED");
    }
  });
});

describe("getTopologicalOrder", () => {
  it("returns dependency-first order for a simple graph", () => {
    const order = getTopologicalOrder({
      nodes: ["a", "b"],
      edges: [{ from: "a", to: "b", axis: "services" }],
    });
    expect(order).toEqual(["a", "b"]);
  });

  it("handles parallel branches with shared downstream nodes", () => {
    const order = getTopologicalOrder({
      nodes: ["root", "left", "right", "sink"],
      edges: [
        { from: "root", to: "left", axis: "services" },
        { from: "root", to: "right", axis: "services" },
        { from: "left", to: "sink", axis: "services" },
        { from: "right", to: "sink", axis: "services" },
      ],
    });

    expect(order.indexOf("root")).toBeLessThan(order.indexOf("left"));
    expect(order.indexOf("root")).toBeLessThan(order.indexOf("right"));
    expect(order.indexOf("left")).toBeLessThan(order.indexOf("sink"));
    expect(order.indexOf("right")).toBeLessThan(order.indexOf("sink"));
  });
});
