import { describe, expect, it } from "vitest";

import { buildCapabilityFromManifest } from "../capability/factory";
import { buildDependencyGraph } from "./build";

describe("buildDependencyGraph axis resolution", () => {
  it("tags platform dependencies with the platform axis", () => {
    const platformCap = buildCapabilityFromManifest(
      {
        manifestSchemaVersion: "1.0",
        id: "axis-platform",
        name: "Platform Cap",
        version: "1.0.0",
        kind: "service",
        metadata: {},
        service: { category: "platform" },
      },
      { lifecycleState: "validated" },
    );
    const consumer = buildCapabilityFromManifest(
      {
        manifestSchemaVersion: "1.0",
        id: "axis-platform-consumer",
        name: "Consumer",
        version: "1.0.0",
        kind: "module",
        metadata: {},
        dependencies: { platform: ["axis-platform"] },
        module: { status: "enabled" },
      },
      { lifecycleState: "validated" },
    );

    const result = buildDependencyGraph([platformCap, consumer]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.graph.edges).toContainEqual({
        from: "axis-platform",
        to: "axis-platform-consumer",
        axis: "platform",
      });
    }
  });

  it("tags integration dependencies with the integrations axis", () => {
    const integration = buildCapabilityFromManifest(
      {
        manifestSchemaVersion: "1.0",
        id: "axis-integration",
        name: "Integration",
        version: "1.0.0",
        kind: "integration",
        metadata: {},
        integration: { type: "rest-api", capabilities: ["health"] },
      },
      { lifecycleState: "validated" },
    );
    const module = buildCapabilityFromManifest(
      {
        manifestSchemaVersion: "1.0",
        id: "axis-module",
        name: "Module",
        version: "1.0.0",
        kind: "module",
        metadata: {},
        dependencies: { integrations: ["axis-integration"] },
        module: { status: "enabled" },
      },
      { lifecycleState: "validated" },
    );

    const result = buildDependencyGraph([integration, module]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.graph.edges).toContainEqual({
        from: "axis-integration",
        to: "axis-module",
        axis: "integrations",
      });
    }
  });

  it("tags service and module dependencies with the correct axis", () => {
    const service = buildCapabilityFromManifest(
      {
        manifestSchemaVersion: "1.0",
        id: "axis-service",
        name: "Service",
        version: "1.0.0",
        kind: "service",
        metadata: {},
        service: { category: "platform" },
      },
      { lifecycleState: "validated" },
    );
    const moduleDep = buildCapabilityFromManifest(
      {
        manifestSchemaVersion: "1.0",
        id: "axis-module-dep",
        name: "Module Dep",
        version: "1.0.0",
        kind: "module",
        metadata: {},
        module: { status: "enabled" },
      },
      { lifecycleState: "validated" },
    );
    const module = buildCapabilityFromManifest(
      {
        manifestSchemaVersion: "1.0",
        id: "axis-module-consumer",
        name: "Module Consumer",
        version: "1.0.0",
        kind: "module",
        metadata: {},
        dependencies: {
          services: ["axis-service"],
          modules: ["axis-module-dep"],
        },
        module: { status: "enabled" },
      },
      { lifecycleState: "validated" },
    );

    const result = buildDependencyGraph([service, moduleDep, module]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.graph.edges).toContainEqual({
        from: "axis-service",
        to: "axis-module-consumer",
        axis: "services",
      });
      expect(result.graph.edges).toContainEqual({
        from: "axis-module-dep",
        to: "axis-module-consumer",
        axis: "modules",
      });
    }
  });
});
