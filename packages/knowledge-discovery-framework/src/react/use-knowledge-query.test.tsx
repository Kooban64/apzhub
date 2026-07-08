import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import type { KnowledgeQueryClient } from "../client/query";
import { sampleKnowledgeSourceRegistryDto } from "../client/test-fixtures";
import type { KnowledgeSourceRegistryDto } from "../server/map-knowledge-source-registry-dto";
import { KnowledgeDiscoveryProvider } from "./knowledge-discovery-context";
import { useKnowledgeQuery } from "./use-knowledge-query";

function createDiscoveryWrapper(
  queryClient: KnowledgeQueryClient,
  dto: KnowledgeSourceRegistryDto = sampleKnowledgeSourceRegistryDto(),
) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <KnowledgeDiscoveryProvider dto={dto} queryClient={queryClient}>
        {children}
      </KnowledgeDiscoveryProvider>
    );
  };
}

describe("useKnowledgeQuery", () => {
  it("starts in idle state with registry-aware diagnostics", () => {
    const queryClient: KnowledgeQueryClient = { query: vi.fn() };
    const { result } = renderHook(() => useKnowledgeQuery(), {
      wrapper: createDiscoveryWrapper(queryClient),
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRegistryReady).toBe(true);
    expect(result.current.diagnostics.registryReady).toBe(true);
    expect(result.current.diagnostics.queryClient.ready).toBe(true);
  });

  it("runs query lifecycle loading → success", async () => {
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
          durationMs: 2,
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

    const { result } = renderHook(() => useKnowledgeQuery(), {
      wrapper: createDiscoveryWrapper(queryClient),
    });

    await act(async () => {
      await result.current.query({ text: "theme" });
    });

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });

    expect(result.current.documents).toHaveLength(1);
    expect(result.current.text).toBe("theme");
    expect(result.current.diagnostics.query?.returnedDocumentCount).toBe(1);
    expect(result.current.error).toBeUndefined();
  });

  it("handles empty results as success", async () => {
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

    const { result } = renderHook(() => useKnowledgeQuery(), {
      wrapper: createDiscoveryWrapper(queryClient),
    });

    await act(async () => {
      await result.current.query({ text: "missing" });
    });

    expect(result.current.status).toBe("success");
    expect(result.current.documents).toEqual([]);
  });

  it("transitions to error when query client fails", async () => {
    const queryClient: KnowledgeQueryClient = {
      query: vi.fn().mockRejectedValue(new Error("Provider unavailable")),
    };

    const { result } = renderHook(() => useKnowledgeQuery(), {
      wrapper: createDiscoveryWrapper(queryClient),
    });

    await act(async () => {
      await result.current.query({ text: "theme" });
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error?.code).toBe("QUERY_FAILED");
    expect(result.current.documents).toEqual([]);
  });

  it("reports registry-not-ready when dto hydration failed", async () => {
    const queryClient: KnowledgeQueryClient = { query: vi.fn() };
    const invalidDto = {
      schemaVersion: 99,
      sources: [],
    } as unknown as KnowledgeSourceRegistryDto;

    const { result } = renderHook(() => useKnowledgeQuery(), {
      wrapper: createDiscoveryWrapper(queryClient, invalidDto),
    });

    await act(async () => {
      await result.current.query({ text: "theme" });
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error?.code).toBe("REGISTRY_NOT_READY");
    expect(queryClient.query).not.toHaveBeenCalled();
  });

  it("reset returns to idle", async () => {
    const queryClient: KnowledgeQueryClient = {
      query: vi.fn().mockResolvedValue({
        documents: [],
        diagnostics: {
          queryText: "theme",
          durationMs: 1,
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
    };

    const { result } = renderHook(() => useKnowledgeQuery(), {
      wrapper: createDiscoveryWrapper(queryClient),
    });

    await act(async () => {
      await result.current.query({ text: "theme" });
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.text).toBe("");
    expect(result.current.documents).toEqual([]);
  });

  it("throws outside KnowledgeDiscoveryProvider", () => {
    expect(() => renderHook(() => useKnowledgeQuery())).toThrow(
      "useKnowledgeService must be used within KnowledgeDiscoveryProvider",
    );
  });
});
