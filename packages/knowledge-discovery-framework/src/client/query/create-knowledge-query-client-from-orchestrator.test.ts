import { describe, expect, it } from "vitest";

import type { KnowledgeProvider } from "../../provider/knowledge-provider";
import { createDefaultKnowledgeRegistry } from "../../registry/default-knowledge-registry";
import { KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION } from "../../server/knowledge-source-registry-schema-version";
import type { KnowledgeSourceRegistryDto } from "../../server/map-knowledge-source-registry-dto";
import type { KnowledgeContext } from "../../types/knowledge-context";
import type { KnowledgeDocument } from "../../types/knowledge-document";
import type { KnowledgeQuery } from "../../types/knowledge-query";
import type { KnowledgeResult } from "../../types/knowledge-result";
import type { KnowledgeSource } from "../../types/knowledge-source";
import { createKnowledgeDiscoveryOrchestrator } from "../../orchestrator/knowledge-discovery-orchestrator";
import { createKnowledgeQueryClientFromOrchestrator } from "./create-knowledge-query-client-from-orchestrator";
import { createPlaceholderKnowledgeQueryClient } from "./create-placeholder-knowledge-query-client";

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

function createMockProvider(
  mockSource: KnowledgeSource,
  impl: (query: KnowledgeQuery, context: KnowledgeContext) => Promise<KnowledgeResult>,
): KnowledgeProvider {
  return {
    source: mockSource,
    query: impl,
  };
}

describe("createKnowledgeQueryClientFromOrchestrator", () => {
  it("delegates query to orchestrator and reports ready diagnostics", async () => {
    const registry = createDefaultKnowledgeRegistry();
    const mockSource = source({ id: "mock.actions", label: "Actions" });

    registry.registerProvider(
      createMockProvider(mockSource, async () => ({
        status: "ok",
        sourceId: mockSource.id,
        documents: [
          document({
            documentId: "theme.toggle",
            title: "Toggle Theme",
            sourceId: mockSource.id,
          }),
        ],
      })),
    );

    const sourcesDto: KnowledgeSourceRegistryDto = {
      schemaVersion: KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
      frameworkVersion: "0.6.0",
      sources: [{ ...mockSource, origin: "builtin" }],
    };

    const orchestrator = createKnowledgeDiscoveryOrchestrator({ registry, sourcesDto });
    const client = createKnowledgeQueryClientFromOrchestrator(orchestrator);

    const result = await client.query({ text: "theme" });

    expect(result.documents).toHaveLength(1);
    expect(result.diagnostics.providerSuccessCount).toBe(1);
    expect(client.getDiagnostics()).toEqual({ kind: "orchestrator", ready: true });
  });
});

describe("createPlaceholderKnowledgeQueryClient", () => {
  it("throws on query and reports not ready", async () => {
    const client = createPlaceholderKnowledgeQueryClient();

    await expect(client.query({ text: "theme" })).rejects.toThrow(/not configured/);
    expect(client.getDiagnostics().ready).toBe(false);
    expect(client.getDiagnostics().kind).toBe("placeholder");
  });
});
