import { describe, expect, it } from "vitest";

import type { KnowledgeProvider } from "../provider/knowledge-provider";
import { createDefaultKnowledgeRegistry } from "../registry/default-knowledge-registry";
import { KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION } from "../server/knowledge-source-registry-schema-version";
import type { KnowledgeSourceRegistryDto } from "../server/map-knowledge-source-registry-dto";
import type { KnowledgeContext } from "../types/knowledge-context";
import type { KnowledgeDocument } from "../types/knowledge-document";
import type { KnowledgeQuery } from "../types/knowledge-query";
import type { KnowledgeResult } from "../types/knowledge-result";
import type { KnowledgeSource } from "../types/knowledge-source";
import { createKnowledgeDiscoveryOrchestrator } from "./knowledge-discovery-orchestrator";

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
  source: KnowledgeSource,
  impl: (query: KnowledgeQuery, context: KnowledgeContext) => Promise<KnowledgeResult>,
): KnowledgeProvider {
  return {
    source,
    query: impl,
  };
}

function dtoFromSources(
  sources: KnowledgeSourceRegistryDto["sources"],
): KnowledgeSourceRegistryDto {
  return {
    schemaVersion: KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
    frameworkVersion: "0.6.0",
    sources,
  };
}

describe("KnowledgeDiscoveryOrchestrator", () => {
  it("returns keyword-ranked documents from mock providers", async () => {
    const registry = createDefaultKnowledgeRegistry();
    const lowPriority = source({
      id: "mock.low",
      label: "Low Priority",
      priority: 20,
    });
    const highPriority = source({
      id: "mock.high",
      label: "High Priority",
      priority: 5,
    });

    registry.registerProvider(
      createMockProvider(lowPriority, async () => ({
        status: "ok",
        sourceId: lowPriority.id,
        documents: [
          document({
            documentId: "theme.low",
            title: "Toggle Theme",
            sourceId: lowPriority.id,
          }),
        ],
      })),
    );
    registry.registerProvider(
      createMockProvider(highPriority, async () => ({
        status: "ok",
        sourceId: highPriority.id,
        documents: [
          document({
            documentId: "theme.high",
            title: "Theme Settings",
            sourceId: highPriority.id,
          }),
        ],
      })),
    );

    const orchestrator = createKnowledgeDiscoveryOrchestrator({
      registry,
      sourcesDto: dtoFromSources([
        {
          ...highPriority,
          origin: "builtin",
        },
        {
          ...lowPriority,
          origin: "manifest",
        },
      ]),
    });

    const result = await orchestrator.query({ text: "theme" });

    expect(result.documents.map((item) => item.documentId)).toEqual([
      "theme.high",
      "theme.low",
    ]);
    expect(result.diagnostics.providerSuccessCount).toBe(2);
    expect(result.diagnostics.queriedSourceCount).toBe(2);
    expect(result.providerResults).toHaveLength(2);
  });

  it("supports fuzzy matching on merged provider documents", async () => {
    const registry = createDefaultKnowledgeRegistry();
    const mockSource = source({ id: "mock.source", label: "Mock Source", priority: 1 });

    registry.registerProvider(
      createMockProvider(mockSource, async () => ({
        status: "ok",
        sourceId: mockSource.id,
        documents: [
          document({
            documentId: "workbench.view.open",
            title: "Open View",
            sourceId: mockSource.id,
          }),
        ],
      })),
    );

    const orchestrator = createKnowledgeDiscoveryOrchestrator({
      registry,
      sourcesDto: dtoFromSources([{ ...mockSource, origin: "builtin" }]),
    });

    const result = await orchestrator.query({ text: "ov" });

    expect(result.documents).toHaveLength(1);
    expect(result.documents[0]?.documentId).toBe("workbench.view.open");
  });

  it("handles empty query by returning provider documents in dispatch order", async () => {
    const registry = createDefaultKnowledgeRegistry();
    const first = source({ id: "mock.first", label: "First", priority: 1 });
    const second = source({ id: "mock.second", label: "Second", priority: 2 });

    registry.registerProvider(
      createMockProvider(first, async () => ({
        status: "ok",
        sourceId: first.id,
        documents: [
          document({ documentId: "doc.first", title: "First", sourceId: first.id }),
        ],
      })),
    );
    registry.registerProvider(
      createMockProvider(second, async () => ({
        status: "ok",
        sourceId: second.id,
        documents: [
          document({ documentId: "doc.second", title: "Second", sourceId: second.id }),
        ],
      })),
    );

    const orchestrator = createKnowledgeDiscoveryOrchestrator({
      registry,
      sourcesDto: dtoFromSources([
        { ...first, origin: "builtin" },
        { ...second, origin: "builtin" },
      ]),
    });

    const result = await orchestrator.query({ text: "   " });

    expect(result.documents.map((item) => item.documentId)).toEqual([
      "doc.first",
      "doc.second",
    ]);
    expect(result.diagnostics.returnedDocumentCount).toBe(2);
  });

  it("returns empty results when the filtered DTO has no active sources", async () => {
    const registry = createDefaultKnowledgeRegistry();
    const orchestrator = createKnowledgeDiscoveryOrchestrator({
      registry,
      sourcesDto: dtoFromSources([]),
    });

    const result = await orchestrator.query({ text: "theme" });

    expect(result.documents).toEqual([]);
    expect(result.providerResults).toEqual([]);
    expect(result.diagnostics.sourceCount).toBe(0);
  });

  it("deduplicates documents by documentId using first provider wins", async () => {
    const registry = createDefaultKnowledgeRegistry();
    const first = source({ id: "mock.first", label: "First", priority: 1 });
    const second = source({ id: "mock.second", label: "Second", priority: 2 });

    registry.registerProvider(
      createMockProvider(first, async () => ({
        status: "ok",
        sourceId: first.id,
        documents: [
          document({
            documentId: "shared.id",
            title: "First Provider Title",
            sourceId: first.id,
          }),
        ],
      })),
    );
    registry.registerProvider(
      createMockProvider(second, async () => ({
        status: "ok",
        sourceId: second.id,
        documents: [
          document({
            documentId: "shared.id",
            title: "Second Provider Title",
            sourceId: second.id,
          }),
        ],
      })),
    );

    const orchestrator = createKnowledgeDiscoveryOrchestrator({
      registry,
      sourcesDto: dtoFromSources([
        { ...first, origin: "builtin" },
        { ...second, origin: "builtin" },
      ]),
    });

    const result = await orchestrator.query({ text: "" });

    expect(result.documents).toHaveLength(1);
    expect(result.documents[0]?.title).toBe("First Provider Title");
    expect(result.diagnostics.deduplicatedDocumentCount).toBe(1);
    expect(result.diagnostics.mergedDocumentCount).toBe(2);
  });

  it("records provider failures without aborting other providers", async () => {
    const registry = createDefaultKnowledgeRegistry();
    const failing = source({ id: "mock.fail", label: "Fail", priority: 1 });
    const succeeding = source({ id: "mock.ok", label: "Ok", priority: 2 });

    registry.registerProvider(
      createMockProvider(failing, async () => {
        throw new Error("provider exploded");
      }),
    );
    registry.registerProvider(
      createMockProvider(succeeding, async () => ({
        status: "ok",
        sourceId: succeeding.id,
        documents: [
          document({
            documentId: "doc.ok",
            title: "Recovered",
            sourceId: succeeding.id,
          }),
        ],
      })),
    );

    const orchestrator = createKnowledgeDiscoveryOrchestrator({
      registry,
      sourcesDto: dtoFromSources([
        { ...failing, origin: "builtin" },
        { ...succeeding, origin: "builtin" },
      ]),
    });

    const result = await orchestrator.query({ text: "rec" });

    expect(result.documents).toHaveLength(1);
    expect(result.diagnostics.providerErrorCount).toBe(1);
    expect(result.diagnostics.providerSuccessCount).toBe(1);
    expect(result.providerResults[0]?.status).toBe("error");
    expect(result.providerResults[0]?.message).toContain("provider exploded");
  });

  it("only queries sources present in the filtered DTO boundary", async () => {
    const registry = createDefaultKnowledgeRegistry();
    const visible = source({ id: "mock.visible", label: "Visible", priority: 1 });
    const hidden = source({ id: "mock.hidden", label: "Hidden", priority: 2 });

    registry.registerProvider(
      createMockProvider(visible, async () => ({
        status: "ok",
        sourceId: visible.id,
        documents: [
          document({
            documentId: "doc.visible",
            title: "Visible",
            sourceId: visible.id,
          }),
        ],
      })),
    );
    registry.registerProvider(
      createMockProvider(hidden, async () => ({
        status: "ok",
        sourceId: hidden.id,
        documents: [
          document({ documentId: "doc.hidden", title: "Hidden", sourceId: hidden.id }),
        ],
      })),
    );

    const orchestrator = createKnowledgeDiscoveryOrchestrator({
      registry,
      sourcesDto: dtoFromSources([{ ...visible, origin: "builtin" }]),
    });

    const result = await orchestrator.query({ text: "" });

    expect(result.documents.map((item) => item.documentId)).toEqual(["doc.visible"]);
    expect(result.diagnostics.queriedSourceCount).toBe(1);
    expect(result.diagnostics.sourceCount).toBe(1);
  });

  it("skips DTO sources without registered providers and reports diagnostics", async () => {
    const registry = createDefaultKnowledgeRegistry();
    const withProvider = source({
      id: "mock.with",
      label: "With Provider",
      priority: 1,
    });
    const withoutProvider = source({
      id: "mock.without",
      label: "Without Provider",
      priority: 2,
    });

    registry.registerProvider(
      createMockProvider(withProvider, async () => ({
        status: "ok",
        sourceId: withProvider.id,
        documents: [
          document({
            documentId: "doc.with",
            title: "With",
            sourceId: withProvider.id,
          }),
        ],
      })),
    );

    const orchestrator = createKnowledgeDiscoveryOrchestrator({
      registry,
      sourcesDto: dtoFromSources([
        { ...withProvider, origin: "builtin" },
        { ...withoutProvider, origin: "manifest" },
      ]),
    });

    const result = await orchestrator.query({ text: "" });

    expect(result.diagnostics.skippedSourceCount).toBe(1);
    expect(result.diagnostics.skippedSourceIds).toEqual(["mock.without"]);
    expect(result.diagnostics.queriedSourceCount).toBe(1);
  });

  it("dispatches providers in deterministic priority order", async () => {
    const registry = createDefaultKnowledgeRegistry();
    const order: string[] = [];
    const second = source({ id: "mock.second", label: "Second", priority: 20 });
    const first = source({ id: "mock.first", label: "First", priority: 10 });

    registry.registerProvider(
      createMockProvider(second, async () => {
        order.push(second.id);
        return { status: "empty", sourceId: second.id, documents: [] };
      }),
    );
    registry.registerProvider(
      createMockProvider(first, async () => {
        order.push(first.id);
        return { status: "empty", sourceId: first.id, documents: [] };
      }),
    );

    const orchestrator = createKnowledgeDiscoveryOrchestrator({
      registry,
      sourcesDto: dtoFromSources([
        { ...second, origin: "builtin" },
        { ...first, origin: "builtin" },
      ]),
    });

    await orchestrator.query({ text: "" });

    expect(order).toEqual(["mock.first", "mock.second"]);
  });

  it("reports query diagnostics including duration", async () => {
    const registry = createDefaultKnowledgeRegistry();
    const mockSource = source({ id: "mock.source", label: "Mock", priority: 1 });

    registry.registerProvider(
      createMockProvider(mockSource, async () => ({
        status: "ok",
        sourceId: mockSource.id,
        documents: [
          document({ documentId: "doc.one", title: "One", sourceId: mockSource.id }),
        ],
        durationMs: 3,
      })),
    );

    const orchestrator = createKnowledgeDiscoveryOrchestrator({
      registry,
      sourcesDto: dtoFromSources([{ ...mockSource, origin: "builtin" }]),
    });

    const result = await orchestrator.query({ text: "one", limit: 1 });

    expect(result.diagnostics.queryText).toBe("one");
    expect(result.diagnostics.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.diagnostics.returnedDocumentCount).toBe(1);
    expect(result.diagnostics.mergedDocumentCount).toBe(1);
  });
});
