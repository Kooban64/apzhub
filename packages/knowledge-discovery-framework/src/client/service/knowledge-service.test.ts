import { describe, expect, it, vi } from "vitest";

import { createKnowledgeService } from "./create-knowledge-service";
import { DefaultKnowledgeService } from "./default-knowledge-service";
import { createKnowledgeServiceFromHydration } from "./create-knowledge-service-from-hydration";
import { KNOWLEDGE_DISCOVERY_FRAMEWORK_STATUS } from "../../status";
import { ACTION_REGISTRY_DTO_FIXTURE } from "../../provider/action-registry/test-fixtures";
import { WORKBENCH_REGISTRY_DTO_FIXTURE } from "../../provider/workbench-navigation/test-fixtures";
import { KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION } from "../../server/knowledge-source-registry-schema-version";

describe("DefaultKnowledgeService", () => {
  it("delegates query to the internal query client", async () => {
    const query = vi.fn().mockResolvedValue({
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
    });
    const service = createKnowledgeService({
      queryClient: { query },
      registryReady: true,
    });

    await service.query({ text: "theme" });

    expect(query).toHaveBeenCalledWith({ text: "theme" });
    expect(service).toBeInstanceOf(DefaultKnowledgeService);
  });

  it("reports service diagnostics", () => {
    const service = createKnowledgeService({
      queryClient: {
        query: vi.fn(),
        getDiagnostics: () => ({ kind: "orchestrator", ready: true }),
      } as import("../query/knowledge-query-client").InstrumentedKnowledgeQueryClient,
      registryReady: true,
    });

    expect(service.getDiagnostics()).toMatchObject({
      frameworkStatus: KNOWLEDGE_DISCOVERY_FRAMEWORK_STATUS,
      serviceStatus: "ready",
      registryReady: true,
      queryAvailable: true,
      queryClient: { kind: "orchestrator", ready: true },
    });
  });
});

describe("createKnowledgeServiceFromHydration", () => {
  it("wires orchestrator-backed query behind the public service", async () => {
    const service = createKnowledgeServiceFromHydration({
      knowledgeDto: {
        schemaVersion: KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
        frameworkVersion: "0.5.0",
        sources: [
          {
            id: "platform.actions",
            label: "Actions",
            kind: "registry-projection",
            tier: "T0",
            priority: 10,
            status: "active",
            provides: ["command"],
            origin: "builtin",
          },
          {
            id: "platform.navigation",
            label: "Navigation",
            kind: "registry-projection",
            tier: "T0",
            priority: 20,
            status: "active",
            provides: ["navigation"],
            origin: "builtin",
          },
        ],
      },
      actionDto: ACTION_REGISTRY_DTO_FIXTURE.sample,
      workbenchDto: WORKBENCH_REGISTRY_DTO_FIXTURE.sample,
    });

    const result = await service.query({ text: "theme" });

    expect(result.documents.length).toBeGreaterThan(0);
    expect(service.getDiagnostics().queryAvailable).toBe(true);
    expect(service.getDiagnostics().queryClient.kind).toBe("orchestrator");
  });
});
