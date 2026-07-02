import { describe, expect, it } from "vitest";

import type { CapabilityManifest } from "../manifest-engine";
import { buildCapabilityFromManifest, withCapabilityLifecycleState } from "./factory";

const componentManifest: CapabilityManifest = {
  manifestSchemaVersion: "1.0",
  id: "test-component",
  name: "Test",
  version: "1.0.0",
  kind: "component",
  metadata: { category: "primitive" },
  component: { theme: { supportsDarkMode: true } },
};

describe("buildCapabilityFromManifest", () => {
  it("builds a capability with default lifecycle and health", () => {
    const capability = buildCapabilityFromManifest(componentManifest);

    expect(capability.id).toBe("test-component");
    expect(capability.kind).toBe("component");
    expect(capability.manifest).toBe(componentManifest);
    expect(capability.metadata).toEqual({ category: "primitive" });
    expect(capability.dependencies.all).toEqual([]);
    expect(capability.lifecycleState).toBe("discovered");
    expect(capability.healthState).toBe("unknown");
    expect(capability.version).toBe("1.0.0");
  });

  it("accepts lifecycle and health overrides", () => {
    const capability = buildCapabilityFromManifest(componentManifest, {
      lifecycleState: "validated",
      healthState: "healthy",
    });

    expect(capability.lifecycleState).toBe("validated");
    expect(capability.healthState).toBe("healthy");
  });
});

describe("withCapabilityLifecycleState", () => {
  it("returns the same reference when state unchanged", () => {
    const capability = buildCapabilityFromManifest(componentManifest, {
      lifecycleState: "validated",
    });
    expect(withCapabilityLifecycleState(capability, "validated")).toBe(capability);
  });

  it("returns a new object when state changes", () => {
    const capability = buildCapabilityFromManifest(componentManifest, {
      lifecycleState: "validated",
    });
    const next = withCapabilityLifecycleState(capability, "dependencies-resolved");
    expect(next).not.toBe(capability);
    expect(next.lifecycleState).toBe("dependencies-resolved");
  });
});
