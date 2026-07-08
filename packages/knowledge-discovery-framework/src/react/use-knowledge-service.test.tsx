import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { KnowledgeQueryClient } from "../client/query";
import { createKnowledgeService } from "../client/service";
import { KnowledgeDiscoveryProvider } from "./knowledge-discovery-context";
import { useKnowledgeService } from "./use-knowledge-service";

const knowledgeDto = {
  schemaVersion: 1 as const,
  frameworkVersion: "0.5.0",
  sources: [
    {
      id: "platform.actions",
      label: "Actions",
      kind: "registry-projection" as const,
      tier: "T0" as const,
      priority: 10,
      status: "active" as const,
      provides: ["command" as const],
      origin: "builtin" as const,
    },
  ],
};

function createWrapper(queryClient: KnowledgeQueryClient) {
  const service = createKnowledgeService({
    queryClient,
    registryReady: true,
  });

  return ({ children }: { readonly children: React.ReactNode }) => (
    <KnowledgeDiscoveryProvider dto={knowledgeDto} service={service}>
      {children}
    </KnowledgeDiscoveryProvider>
  );
}

describe("useKnowledgeService", () => {
  it("queries through the knowledge service", async () => {
    const queryClient: KnowledgeQueryClient = {
      query: vi.fn().mockResolvedValue({
        documents: [
          {
            documentId: "platform.actions:theme",
            sourceId: "platform.actions",
            kind: "command" as const,
            title: "Toggle Theme",
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

    const { result } = renderHook(() => useKnowledgeService(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.query({ text: "theme" });

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });

    expect(result.current.documents).toHaveLength(1);
    expect(result.current.serviceDiagnostics.queryAvailable).toBe(true);
  });

  it("throws outside KnowledgeDiscoveryProvider", () => {
    expect(() => renderHook(() => useKnowledgeService())).toThrow(
      "useKnowledgeService must be used within KnowledgeDiscoveryProvider",
    );
  });
});
