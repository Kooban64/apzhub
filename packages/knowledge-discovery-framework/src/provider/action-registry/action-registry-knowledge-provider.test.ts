import { describe, expect, it } from "vitest";

import { filterActionRegistryDto } from "@apzhub/command-framework/server";
import { createAuthWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";

import { createKnowledgeDiscoveryOrchestrator } from "../../orchestrator/knowledge-discovery-orchestrator";
import { createDefaultKnowledgeRegistry } from "../../registry/default-knowledge-registry";
import { PLATFORM_KNOWLEDGE_SOURCE_CATALOGUE } from "../../catalogue/platform-knowledge-source-catalogue";
import { KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION } from "../../server/knowledge-source-registry-schema-version";
import type { KnowledgeSourceRegistryDto } from "../../server/map-knowledge-source-registry-dto";
import {
  ACTION_REGISTRY_DTO_FIXTURE,
  ActionRegistryKnowledgeProvider,
  buildActionRegistryKnowledgeProviderDiagnostics,
  createActionRegistryKnowledgeProvider,
  registerActionRegistryKnowledgeProvider,
} from "./index";

function knowledgeDtoForPlatformActions(): KnowledgeSourceRegistryDto {
  const platformActions = PLATFORM_KNOWLEDGE_SOURCE_CATALOGUE.find(
    (source) => source.id === "platform.actions",
  );

  return {
    schemaVersion: KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
    frameworkVersion: "0.7.0",
    sources: platformActions ? [platformActions] : [],
  };
}

describe("ActionRegistryKnowledgeProvider", () => {
  it("returns mapped knowledge documents without executing actions", async () => {
    const provider = createActionRegistryKnowledgeProvider(
      ACTION_REGISTRY_DTO_FIXTURE.sample,
    );
    const result = await provider.query({ text: "theme" }, {});

    expect(result.status).toBe("ok");
    expect(result.documents.length).toBe(3);
    expect(result.documents.every((document) => document.actionRef !== undefined)).toBe(
      true,
    );
    expect(
      result.documents.every((document) => document.navigation === undefined),
    ).toBe(true);
    expect(result.documents[1]?.actionRef?.actionId).toBe("platform.theme.toggle");
  });

  it("returns empty result for empty action registry DTO", async () => {
    const provider = createActionRegistryKnowledgeProvider(
      ACTION_REGISTRY_DTO_FIXTURE.empty,
    );
    const result = await provider.query({ text: "theme" }, {});

    expect(result.status).toBe("empty");
    expect(result.documents).toEqual([]);
  });

  it("reports provider diagnostics", async () => {
    const provider = createActionRegistryKnowledgeProvider(
      ACTION_REGISTRY_DTO_FIXTURE.sample,
    );
    const result = await provider.query({ text: "" }, {});
    const diagnostics = buildActionRegistryKnowledgeProviderDiagnostics(
      ACTION_REGISTRY_DTO_FIXTURE.sample,
      result,
    );

    expect(diagnostics).toMatchObject({
      sourceId: "platform.actions",
      actionCount: 3,
      platformActionCount: 2,
      manifestActionCount: 1,
      paletteActionCount: 2,
      documentCount: 3,
    });
    expect(diagnostics.durationMs).toBeGreaterThanOrEqual(0);
  });
});

describe("ActionRegistryKnowledgeProvider with orchestrator", () => {
  it("supports keyword queries through orchestrator ranking", async () => {
    const registry = createDefaultKnowledgeRegistry();
    registerActionRegistryKnowledgeProvider(
      registry,
      ACTION_REGISTRY_DTO_FIXTURE.sample,
    );

    const orchestrator = createKnowledgeDiscoveryOrchestrator({
      registry,
      sourcesDto: knowledgeDtoForPlatformActions(),
    });

    const result = await orchestrator.query({ text: "theme" });

    expect(result.documents[0]?.actionRef?.actionId).toBe("platform.theme.toggle");
    expect(result.diagnostics.providerSuccessCount).toBe(1);
    expect(result.diagnostics.returnedDocumentCount).toBe(1);
  });

  it("supports fuzzy queries through orchestrator ranking", async () => {
    const registry = createDefaultKnowledgeRegistry();
    registerActionRegistryKnowledgeProvider(
      registry,
      ACTION_REGISTRY_DTO_FIXTURE.sample,
    );

    const orchestrator = createKnowledgeDiscoveryOrchestrator({
      registry,
      sourcesDto: knowledgeDtoForPlatformActions(),
    });

    const result = await orchestrator.query({ text: "tog" });

    expect(result.documents[0]?.actionRef?.actionId).toBe("platform.theme.toggle");
  });

  it("returns all action documents for empty query in deterministic order", async () => {
    const registry = createDefaultKnowledgeRegistry();
    registerActionRegistryKnowledgeProvider(
      registry,
      ACTION_REGISTRY_DTO_FIXTURE.sample,
    );

    const orchestrator = createKnowledgeDiscoveryOrchestrator({
      registry,
      sourcesDto: knowledgeDtoForPlatformActions(),
    });

    const result = await orchestrator.query({ text: "   " });

    expect(result.documents.map((document) => document.actionRef?.actionId)).toEqual([
      "platform.home.open",
      "platform.theme.toggle",
      "example.module.run",
    ]);
  });

  it("uses permission-filtered ActionRegistryDto input", async () => {
    const filteredActionDto = filterActionRegistryDto(
      ACTION_REGISTRY_DTO_FIXTURE.sample,
      createAuthWorkbenchPermissionAdapter({
        userId: "user-1",
        permissions: [],
      }),
    );

    const registry = createDefaultKnowledgeRegistry();
    registerActionRegistryKnowledgeProvider(registry, filteredActionDto);

    const orchestrator = createKnowledgeDiscoveryOrchestrator({
      registry,
      sourcesDto: knowledgeDtoForPlatformActions(),
    });

    const result = await orchestrator.query({ text: "" });

    expect(result.documents.map((document) => document.actionRef?.actionId)).toEqual([
      "platform.home.open",
      "example.module.run",
    ]);
    expect(
      buildActionRegistryKnowledgeProviderDiagnostics(
        filteredActionDto,
        result.providerResults[0]!,
      ),
    ).toMatchObject({
      actionCount: 2,
      documentCount: 2,
    });
  });

  it("does not query when platform.actions is absent from knowledge DTO boundary", async () => {
    const registry = createDefaultKnowledgeRegistry();
    registerActionRegistryKnowledgeProvider(
      registry,
      ACTION_REGISTRY_DTO_FIXTURE.sample,
    );

    const orchestrator = createKnowledgeDiscoveryOrchestrator({
      registry,
      sourcesDto: {
        schemaVersion: KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
        sources: [],
      },
    });

    const result = await orchestrator.query({ text: "theme" });

    expect(result.documents).toEqual([]);
    expect(result.diagnostics.queriedSourceCount).toBe(0);
  });
});

describe("registerActionRegistryKnowledgeProvider", () => {
  it("registers provider against platform.actions source", () => {
    const registry = createDefaultKnowledgeRegistry();
    const provider = registerActionRegistryKnowledgeProvider(
      registry,
      ACTION_REGISTRY_DTO_FIXTURE.sample,
    );

    expect(provider).toBeInstanceOf(ActionRegistryKnowledgeProvider);
    expect(registry.hasProvider("platform.actions")).toBe(true);
  });
});
