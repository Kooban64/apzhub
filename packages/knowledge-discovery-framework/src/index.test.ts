import { describe, expect, it } from "vitest";

import {
  KNOWLEDGE_ACTIVE_LAYER,
  KNOWLEDGE_ARCHITECTURE_LAYERS,
  KNOWLEDGE_DISCOVERY_FRAMEWORK_STATUS,
  createDefaultKnowledgeRegistry,
  createKnowledgeDiscoveryContext,
  createPlaceholderKnowledgeRegistry,
  createScaffoldKnowledgeProvider,
} from "./index";

describe("@apzhub/knowledge-discovery-framework package", () => {
  it("exports registry status", () => {
    expect(KNOWLEDGE_DISCOVERY_FRAMEWORK_STATUS).toBe("service");
  });

  it("documents three-layer architecture with sources as active layer", () => {
    expect(KNOWLEDGE_ARCHITECTURE_LAYERS.sources).toBe("knowledge-sources");
    expect(KNOWLEDGE_ARCHITECTURE_LAYERS.index).toBe("knowledge-index");
    expect(KNOWLEDGE_ARCHITECTURE_LAYERS.experience).toBe("knowledge-experience");
    expect(KNOWLEDGE_ACTIVE_LAYER).toBe("knowledge-sources");
  });
});

describe("createKnowledgeDiscoveryContext", () => {
  it("defaults to DefaultKnowledgeRegistry", () => {
    const context = createKnowledgeDiscoveryContext();

    expect(context.status).toBe("service");
    expect(context.registry.getDiagnostics().status).toBe("empty");
  });

  it("allows registry dependency injection override", () => {
    const registry = createPlaceholderKnowledgeRegistry();
    const context = createKnowledgeDiscoveryContext({ registry });

    expect(context.registry).toBe(registry);
    expect(context.registry.getDiagnostics().status).toBe("scaffold");
  });
});

describe("ScaffoldKnowledgeProvider", () => {
  it("returns not_implemented without throwing", async () => {
    const provider = createScaffoldKnowledgeProvider({
      id: "platform.actions",
      label: "Actions",
      kind: "registry-projection",
      tier: "T0",
      priority: 10,
      status: "active",
      provides: ["command"],
    });

    const result = await provider.query({ text: "theme" }, {});

    expect(result.status).toBe("not_implemented");
    expect(result.documents).toEqual([]);
    expect(result.sourceId).toBe("platform.actions");
  });
});

describe("DefaultKnowledgeRegistry smoke", () => {
  it("registers source via package export", () => {
    const registry = createDefaultKnowledgeRegistry();
    registry.registerSource({
      id: "platform.capabilities",
      label: "Capabilities",
      kind: "registry-projection",
      tier: "T0",
      priority: 20,
      status: "planned",
      provides: ["capability"],
    });

    expect(registry.listMetadata()[0]?.healthStatus).toBe("planned");
  });
});
