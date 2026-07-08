import { describe, expect, it, vi } from "vitest";

import { createKnowledgeService } from "../service/create-knowledge-service";
import { createEmptyClientKnowledgeRegistryDiagnostics } from "../client-knowledge-registry-diagnostics";
import { executeKnowledgeQuery } from "./execute-knowledge-query";
import type { KnowledgeQueryClient } from "./knowledge-query-client";
import { KNOWLEDGE_QUERY_CLIENT_PLACEHOLDER_MESSAGE } from "./create-placeholder-knowledge-query-client";

describe("executeKnowledgeQuery", () => {
  const readyDiagnostics = createEmptyClientKnowledgeRegistryDiagnostics();

  function createTestService(queryClient: KnowledgeQueryClient) {
    return createKnowledgeService({
      queryClient,
      registryReady: true,
      registryDiagnostics: readyDiagnostics,
    });
  }

  it("returns error when registry is not ready", async () => {
    const queryClient: KnowledgeQueryClient = {
      query: vi.fn(),
    };

    const result = await executeKnowledgeQuery({
      input: { text: "theme" },
      service: createTestService(queryClient),
      registryReady: false,
      registryDiagnostics: {
        ...readyDiagnostics,
        status: "invalid",
      },
    });

    expect(result.state.status).toBe("error");
    expect(result.state.error?.code).toBe("REGISTRY_NOT_READY");
    expect(queryClient.query).not.toHaveBeenCalled();
  });

  it("returns success with documents from knowledge service", async () => {
    const queryClient: KnowledgeQueryClient = {
      query: vi.fn().mockResolvedValue({
        documents: [
          {
            documentId: "theme.toggle",
            title: "Toggle Theme",
            sourceId: "platform.actions",
            kind: "command",
          },
        ],
        diagnostics: {
          queryText: "theme",
          durationMs: 1,
          sourceCount: 1,
          queriedSourceCount: 1,
          skippedSourceCount: 0,
          skippedSourceIds: [],
          providerSuccessCount: 1,
          providerErrorCount: 0,
          providerEmptyCount: 0,
          providerNotImplementedCount: 0,
          mergedDocumentCount: 1,
          deduplicatedDocumentCount: 1,
          returnedDocumentCount: 1,
        },
        providerResults: [],
      }),
    };

    const result = await executeKnowledgeQuery({
      input: { text: "theme" },
      service: createTestService(queryClient),
      registryReady: true,
      registryDiagnostics: readyDiagnostics,
    });

    expect(result.state.status).toBe("success");
    expect(result.state.documents).toHaveLength(1);
    expect(result.state.diagnostics?.returnedDocumentCount).toBe(1);
    expect(result.state.error).toBeUndefined();
  });

  it("returns success with empty documents", async () => {
    const queryClient: KnowledgeQueryClient = {
      query: vi.fn().mockResolvedValue({
        documents: [],
        diagnostics: {
          queryText: "missing",
          durationMs: 1,
          sourceCount: 1,
          queriedSourceCount: 1,
          skippedSourceCount: 0,
          skippedSourceIds: [],
          providerSuccessCount: 0,
          providerErrorCount: 0,
          providerEmptyCount: 1,
          providerNotImplementedCount: 0,
          mergedDocumentCount: 0,
          deduplicatedDocumentCount: 0,
          returnedDocumentCount: 0,
        },
        providerResults: [],
      }),
    };

    const result = await executeKnowledgeQuery({
      input: { text: "missing" },
      service: createTestService(queryClient),
      registryReady: true,
      registryDiagnostics: readyDiagnostics,
    });

    expect(result.state.status).toBe("success");
    expect(result.state.documents).toEqual([]);
  });

  it("returns query client error when placeholder client throws", async () => {
    const queryClient: KnowledgeQueryClient = {
      query: vi
        .fn()
        .mockRejectedValue(new Error(KNOWLEDGE_QUERY_CLIENT_PLACEHOLDER_MESSAGE)),
    };

    const result = await executeKnowledgeQuery({
      input: { text: "theme" },
      service: createTestService(queryClient),
      registryReady: true,
      registryDiagnostics: readyDiagnostics,
    });

    expect(result.state.status).toBe("error");
    expect(result.state.error?.code).toBe("QUERY_CLIENT_ERROR");
  });

  it("returns query failed for unexpected errors", async () => {
    const queryClient: KnowledgeQueryClient = {
      query: vi.fn().mockRejectedValue(new Error("Network failure")),
    };

    const result = await executeKnowledgeQuery({
      input: { text: "theme" },
      service: createTestService(queryClient),
      registryReady: true,
      registryDiagnostics: readyDiagnostics,
    });

    expect(result.state.status).toBe("error");
    expect(result.state.error?.code).toBe("QUERY_FAILED");
    expect(result.state.error?.message).toBe("Network failure");
  });
});
