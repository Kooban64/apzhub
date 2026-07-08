import { describe, expect, it } from "vitest";

import { createKnowledgeDiscoveryOrchestrator } from "./knowledge-discovery-orchestrator";
import { createDefaultKnowledgeRegistry } from "../registry/default-knowledge-registry";
import { createDefaultRankingEngine } from "../ranking";
import { KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION } from "../server/knowledge-source-registry-schema-version";
import type { KnowledgeProvider } from "../provider/knowledge-provider";
import type { KnowledgeDocument } from "../types/knowledge-document";
import type { KnowledgeResult } from "../types/knowledge-result";
import type { KnowledgeSource } from "../types/knowledge-source";

function source(
  overrides: Partial<KnowledgeSource> & Pick<KnowledgeSource, "id" | "label">,
): KnowledgeSource {
  return {
    kind: "registry-projection",
    tier: "T0",
    priority: 10,
    status: "active",
    provides: ["command"],
    ...overrides,
  };
}

function document(
  overrides: Partial<KnowledgeDocument> &
    Pick<KnowledgeDocument, "documentId" | "title">,
): KnowledgeDocument {
  return {
    sourceId: overrides.sourceId ?? "mock.source",
    kind: "command",
    ...overrides,
  };
}

describe("KnowledgeDiscoveryOrchestrator ranking integration", () => {
  it("delegates ranking to the injected ranking engine and reports diagnostics", async () => {
    const mockSource = source({ id: "mock.source", label: "Mock" });
    const registry = createDefaultKnowledgeRegistry();
    const provider: KnowledgeProvider = {
      source: mockSource,
      query: async (): Promise<KnowledgeResult> => ({
        status: "ok",
        sourceId: mockSource.id,
        documents: [
          document({
            documentId: "theme.high",
            title: "Theme Settings",
            sourceId: mockSource.id,
          }),
          document({
            documentId: "theme.low",
            title: "Toggle Theme",
            sourceId: mockSource.id,
          }),
        ],
      }),
    };
    registry.registerProvider(provider);

    const rankingEngine = createDefaultRankingEngine();
    const orchestrator = createKnowledgeDiscoveryOrchestrator({
      registry,
      sourcesDto: {
        schemaVersion: KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
        sources: [{ ...mockSource, origin: "builtin" }],
      },
      rankingEngine,
    });

    const result = await orchestrator.query({ text: "theme" });

    expect(result.documents[0]?.documentId).toBe("theme.high");
    expect(result.diagnostics.rankingStrategyId).toBe("fuzzy");
    expect(result.diagnostics.rankingInputCount).toBe(2);
    expect(result.diagnostics.rankingOutputCount).toBe(2);
  });
});
