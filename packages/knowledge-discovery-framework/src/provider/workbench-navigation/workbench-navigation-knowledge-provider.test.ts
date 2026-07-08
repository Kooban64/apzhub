import { describe, expect, it } from "vitest";

import { filterWorkbenchRegistryDto } from "@apzhub/workbench-framework/server";
import { createAuthWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";

import { createKnowledgeDiscoveryOrchestrator } from "../../orchestrator/knowledge-discovery-orchestrator";
import { createDefaultKnowledgeRegistry } from "../../registry/default-knowledge-registry";
import { PLATFORM_KNOWLEDGE_SOURCE_CATALOGUE } from "../../catalogue/platform-knowledge-source-catalogue";
import { KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION } from "../../server/knowledge-source-registry-schema-version";
import type { KnowledgeSourceRegistryDto } from "../../server/map-knowledge-source-registry-dto";
import {
  buildWorkbenchNavigationKnowledgeProviderDiagnostics,
  createWorkbenchNavigationKnowledgeProvider,
  registerWorkbenchNavigationKnowledgeProvider,
  WorkbenchNavigationKnowledgeProvider,
  WORKBENCH_REGISTRY_DTO_FIXTURE,
} from "./index";

function knowledgeDtoForPlatformNavigation(): KnowledgeSourceRegistryDto {
  const platformNavigation = PLATFORM_KNOWLEDGE_SOURCE_CATALOGUE.find(
    (source) => source.id === "platform.navigation",
  );

  return {
    schemaVersion: KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
    frameworkVersion: "0.8.0",
    sources: platformNavigation ? [platformNavigation] : [],
  };
}

describe("WorkbenchNavigationKnowledgeProvider", () => {
  it("returns mapped navigation documents without executing navigation", async () => {
    const provider = createWorkbenchNavigationKnowledgeProvider(
      WORKBENCH_REGISTRY_DTO_FIXTURE.sample,
    );
    const result = await provider.query({ text: "overview" }, {});

    expect(result.status).toBe("ok");
    expect(result.documents.length).toBeGreaterThan(0);
    expect(
      result.documents.every((document) => document.navigation !== undefined),
    ).toBe(true);
    expect(result.documents.every((document) => document.actionRef === undefined)).toBe(
      true,
    );
  });

  it("returns empty result for empty navigation DTO", async () => {
    const provider = createWorkbenchNavigationKnowledgeProvider(
      WORKBENCH_REGISTRY_DTO_FIXTURE.empty,
    );
    const result = await provider.query({ text: "home" }, {});

    expect(result.status).toBe("empty");
    expect(result.documents).toEqual([]);
  });

  it("reports provider diagnostics", async () => {
    const provider = createWorkbenchNavigationKnowledgeProvider(
      WORKBENCH_REGISTRY_DTO_FIXTURE.sample,
    );
    const result = await provider.query({ text: "" }, {});
    const diagnostics = buildWorkbenchNavigationKnowledgeProviderDiagnostics(
      WORKBENCH_REGISTRY_DTO_FIXTURE.sample,
      result,
    );

    expect(diagnostics).toMatchObject({
      sourceId: "platform.navigation",
      navItemCount: 5,
      viewCount: 2,
      activityBarCount: 2,
      sidebarCount: 3,
      workspaceCount: 2,
      parentLinkedCount: 3,
      skippedHiddenCount: 1,
    });
    expect(diagnostics.durationMs).toBeGreaterThanOrEqual(0);
  });
});

describe("WorkbenchNavigationKnowledgeProvider with orchestrator", () => {
  it("supports keyword queries through orchestrator ranking", async () => {
    const registry = createDefaultKnowledgeRegistry();
    registerWorkbenchNavigationKnowledgeProvider(
      registry,
      WORKBENCH_REGISTRY_DTO_FIXTURE.sample,
    );

    const orchestrator = createKnowledgeDiscoveryOrchestrator({
      registry,
      sourcesDto: knowledgeDtoForPlatformNavigation(),
    });

    const result = await orchestrator.query({ text: "administration" });

    expect(result.documents[0]?.title).toBe("Administration");
    expect(result.diagnostics.providerSuccessCount).toBe(1);
  });

  it("supports fuzzy queries through orchestrator ranking", async () => {
    const registry = createDefaultKnowledgeRegistry();
    registerWorkbenchNavigationKnowledgeProvider(
      registry,
      WORKBENCH_REGISTRY_DTO_FIXTURE.sample,
    );

    const orchestrator = createKnowledgeDiscoveryOrchestrator({
      registry,
      sourcesDto: knowledgeDtoForPlatformNavigation(),
    });

    const result = await orchestrator.query({ text: "ovr" });

    expect(
      result.documents[0]?.metadata?.navItemId ?? result.documents[0]?.metadata?.viewId,
    ).toBe("platform-home-overview");
  });

  it("returns all navigation documents for empty query in deterministic order", async () => {
    const registry = createDefaultKnowledgeRegistry();
    registerWorkbenchNavigationKnowledgeProvider(
      registry,
      WORKBENCH_REGISTRY_DTO_FIXTURE.sample,
    );

    const orchestrator = createKnowledgeDiscoveryOrchestrator({
      registry,
      sourcesDto: knowledgeDtoForPlatformNavigation(),
    });

    const result = await orchestrator.query({ text: "   " });

    expect(
      result.documents.map(
        (document) => document.metadata?.navItemId ?? document.metadata?.viewId,
      ),
    ).toEqual([
      "platform-administration",
      "platform-administration-users",
      "platform-home",
      "platform-home-overview",
      "platform-home-settings",
      "platform-administration-users",
      "platform-home-overview",
    ]);
  });

  it("uses permission-filtered WorkbenchRegistryDto input", async () => {
    const filteredRegistryDto = filterWorkbenchRegistryDto(
      WORKBENCH_REGISTRY_DTO_FIXTURE.sample,
      createAuthWorkbenchPermissionAdapter({
        userId: "user-1",
        permissions: [],
      }),
    );

    const registry = createDefaultKnowledgeRegistry();
    registerWorkbenchNavigationKnowledgeProvider(registry, filteredRegistryDto);

    const orchestrator = createKnowledgeDiscoveryOrchestrator({
      registry,
      sourcesDto: knowledgeDtoForPlatformNavigation(),
    });

    const result = await orchestrator.query({ text: "" });

    expect(
      result.documents.some(
        (document) => document.metadata?.navItemId === "platform-administration",
      ),
    ).toBe(false);
    expect(
      buildWorkbenchNavigationKnowledgeProviderDiagnostics(
        filteredRegistryDto,
        result.providerResults[0]!,
      ).navItemCount,
    ).toBe(3);
  });

  it("does not query when platform.navigation is absent from knowledge DTO boundary", async () => {
    const registry = createDefaultKnowledgeRegistry();
    registerWorkbenchNavigationKnowledgeProvider(
      registry,
      WORKBENCH_REGISTRY_DTO_FIXTURE.sample,
    );

    const orchestrator = createKnowledgeDiscoveryOrchestrator({
      registry,
      sourcesDto: {
        schemaVersion: KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
        sources: [],
      },
    });

    const result = await orchestrator.query({ text: "home" });

    expect(result.documents).toEqual([]);
    expect(result.diagnostics.queriedSourceCount).toBe(0);
  });
});

describe("registerWorkbenchNavigationKnowledgeProvider", () => {
  it("registers provider against platform.navigation source", () => {
    const registry = createDefaultKnowledgeRegistry();
    const provider = registerWorkbenchNavigationKnowledgeProvider(
      registry,
      WORKBENCH_REGISTRY_DTO_FIXTURE.sample,
    );

    expect(provider).toBeInstanceOf(WorkbenchNavigationKnowledgeProvider);
    expect(registry.hasProvider("platform.navigation")).toBe(true);
  });
});
