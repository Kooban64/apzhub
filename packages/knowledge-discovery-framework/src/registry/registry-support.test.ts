import { describe, expect, it } from "vitest";

import { createScaffoldKnowledgeProvider } from "../provider/scaffold-knowledge-provider";
import type { KnowledgeSource } from "../types/knowledge-source";
import {
  createPlaceholderKnowledgeRegistry,
  freezeKnowledgeSource,
  freezeKnowledgeSources,
} from "./index";

describe("freezeKnowledgeSource helpers", () => {
  const source: KnowledgeSource = {
    id: "platform.actions",
    label: "Actions",
    kind: "registry-projection",
    tier: "T0",
    priority: 10,
    status: "active",
    provides: ["command"],
  };

  it("freezes a single source", () => {
    const frozen = freezeKnowledgeSource(source);
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.provides)).toBe(true);
  });

  it("freezes source arrays", () => {
    const frozen = freezeKnowledgeSources([source]);
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen[0]?.provides)).toBe(true);
  });
});

describe("PlaceholderKnowledgeRegistry", () => {
  it("returns scaffold diagnostics and supports no-op registration APIs", () => {
    const registry = createPlaceholderKnowledgeRegistry();
    const provider = createScaffoldKnowledgeProvider({
      id: "platform.actions",
      label: "Actions",
      kind: "registry-projection",
      tier: "T0",
      priority: 10,
      status: "active",
      provides: ["command"],
    });

    registry.registerSource(provider.source);
    registry.registerManySources([provider.source]);
    registry.registerProvider(provider);
    registry.registerManyProviders([provider]);
    registry.replaceSource(provider.source);
    registry.recordFrameworkVersion("0.5.0");
    registry.recordManifestCapabilities(["cap-a"]);
    registry.clear();

    expect(registry.getDiagnostics().status).toBe("scaffold");
    expect(registry.listSources()).toEqual([]);
    expect(registry.getMetadata("platform.actions")).toBeUndefined();
    expect(registry.getRegistryMetadata().sourceMetadata).toEqual([]);
    expect(registry.registerManySourcesAtomic([]).ok).toBe(false);
    expect(registry.registerManyProvidersAtomic([]).ok).toBe(false);
  });
});
