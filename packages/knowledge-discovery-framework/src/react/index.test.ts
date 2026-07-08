import { describe, expect, it } from "vitest";

import {
  KNOWLEDGE_DISCOVERY_REACT_STATUS,
  createEmptyKnowledgeSourceRegistryDto,
  createKnowledgeDiscoveryContext,
  createKnowledgeRegistryFromDto,
  createKnowledgeService,
  KnowledgeDiscoveryProvider,
  useKnowledgeQuery,
  useKnowledgeRegistry,
  useKnowledgeService,
} from "./index";

describe("@apzhub/knowledge-discovery-framework/react", () => {
  it("exports react service status", () => {
    expect(KNOWLEDGE_DISCOVERY_REACT_STATUS).toBe("service");
  });

  it("re-exports createKnowledgeRegistryFromDto", () => {
    const result = createKnowledgeRegistryFromDto(
      createEmptyKnowledgeSourceRegistryDto(),
    );
    expect(result.ok).toBe(true);
    expect(result.diagnostics.status).toBe("empty");
  });

  it("re-exports composition root for dependency injection", () => {
    const context = createKnowledgeDiscoveryContext();
    expect(context.status).toBe("service");
  });

  it("re-exports KnowledgeDiscoveryProvider and public hooks", () => {
    expect(KnowledgeDiscoveryProvider).toBeTypeOf("function");
    expect(useKnowledgeRegistry).toBeTypeOf("function");
    expect(useKnowledgeService).toBeTypeOf("function");
    expect(useKnowledgeQuery).toBeTypeOf("function");
  });

  it("exports knowledge service factory", () => {
    const service = createKnowledgeService({
      queryClient: {
        query: async () => ({
          documents: [],
          diagnostics: {
            queryText: "",
            durationMs: 0,
            sourceCount: 0,
            queriedSourceCount: 0,
            skippedSourceCount: 0,
            skippedSourceIds: [],
            providerSuccessCount: 0,
            providerErrorCount: 0,
            providerEmptyCount: 0,
            providerNotImplementedCount: 0,
            mergedDocumentCount: 0,
            deduplicatedDocumentCount: 0,
            returnedDocumentCount: 0,
          },
          providerResults: [],
        }),
      },
    });

    expect(service.getDiagnostics().serviceStatus).toBe("ready");
  });
});
