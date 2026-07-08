import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { PLATFORM_KNOWLEDGE_SOURCE_CATALOGUE } from "../catalogue/platform-knowledge-source-catalogue";
import { KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION } from "../server/knowledge-source-registry-schema-version";
import type { KnowledgeSourceRegistryDto } from "../server/map-knowledge-source-registry-dto";
import { createEmptyKnowledgeSourceRegistryDto } from "../server/map-knowledge-source-registry-dto";
import { sampleKnowledgeSourceRegistryDto } from "../client/test-fixtures";
import { KnowledgeRegistryProvider } from "./knowledge-registry-context";
import { useKnowledgeRegistry } from "./use-knowledge-registry";

function createWrapper(
  dto: KnowledgeSourceRegistryDto = sampleKnowledgeSourceRegistryDto(),
) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <KnowledgeRegistryProvider dto={dto}>{children}</KnowledgeRegistryProvider>;
  };
}

describe("useKnowledgeRegistry", () => {
  it("returns isReady and hydrated sources after provider mount", async () => {
    const { result } = renderHook(() => useKnowledgeRegistry(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.sources).toHaveLength(
      PLATFORM_KNOWLEDGE_SOURCE_CATALOGUE.length,
    );
    expect(result.current.diagnostics.status).toBe("hydrated");
    expect(result.current.diagnostics.synchronisation.mode).toBe("hydration");
    expect(result.current.schemaVersion).toBe(
      KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
    );
    expect(result.current.frameworkVersion).toBe("0.5.0");
  });

  it("get and has resolve hydrated sources", async () => {
    const { result } = renderHook(() => useKnowledgeRegistry(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.has("platform.actions")).toBe(true);
    expect(result.current.get("platform.actions")?.label).toBe("Actions");
    expect(result.current.get("missing.source")).toBeUndefined();
  });

  it("list returns the same ordering as registry.list()", async () => {
    const { result } = renderHook(() => useKnowledgeRegistry(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.list().map((source) => source.id)).toEqual(
      result.current.sources.map((source) => source.id),
    );
  });

  it("reports importErrors for invalid dto", async () => {
    const invalidDto = {
      schemaVersion: 99,
      sources: [],
    } as unknown as KnowledgeSourceRegistryDto;

    const { result } = renderHook(() => useKnowledgeRegistry(), {
      wrapper: createWrapper(invalidDto),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(false);
    });

    expect(result.current.importErrors.length).toBeGreaterThan(0);
    expect(result.current.diagnostics.status).toBe("invalid");
  });

  it("handles empty dto", async () => {
    const { result } = renderHook(() => useKnowledgeRegistry(), {
      wrapper: createWrapper(createEmptyKnowledgeSourceRegistryDto()),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.sources).toHaveLength(0);
    expect(result.current.diagnostics.status).toBe("empty");
  });

  it("throws outside provider", () => {
    expect(() => renderHook(() => useKnowledgeRegistry())).toThrow(
      "useKnowledgeRegistry must be used within KnowledgeRegistryProvider",
    );
  });
});
