import { describe, expect, it } from "vitest";

import {
  KNOWLEDGE_DISCOVERY_SERVER_STATUS,
  createDefaultKnowledgeRegistry,
  createKnowledgeDiscoveryContext,
} from "./server";

describe("@apzhub/knowledge-discovery-framework/server", () => {
  it("exports server filter status", () => {
    expect(KNOWLEDGE_DISCOVERY_SERVER_STATUS).toBe("filter");
  });

  it("re-exports composition root for server bootstrap", () => {
    const context = createKnowledgeDiscoveryContext({
      registry: createDefaultKnowledgeRegistry(),
    });

    expect(context.registry.getDiagnostics().status).toBe("empty");
  });
});
