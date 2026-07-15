import { describe, expect, it } from "vitest";

import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import { ProviderRegistry } from "./providers/registry/provider-registry";
import { ProviderResolver } from "./providers/registry/provider-resolver";
import {
  createMockSearchProvider,
  createMockWorkspaceProvider,
  TEST_CORRELATION_ID,
  TEST_SERVICE_CONTEXT,
} from "./testing/mock-providers";

describe("ProviderRegistry", () => {
  it("registers and lists providers by capability", () => {
    const registry = new ProviderRegistry();

    registry.register({
      providerId: "mock-workspace-a",
      integrationId: "mock-a",
      capability: "workspace",
      priority: 10,
      provider: createMockWorkspaceProvider(),
    });

    registry.register({
      providerId: "mock-search-a",
      integrationId: "mock-a",
      capability: "search",
      priority: 10,
      provider: createMockSearchProvider(),
    });

    expect(registry.list("workspace")).toHaveLength(1);
    expect(registry.list()).toHaveLength(2);
    expect(registry.getById("mock-workspace-a")?.integrationId).toBe("mock-a");
  });

  it("replaces a provider when registering the same providerId", () => {
    const registry = new ProviderRegistry();

    registry.register({
      providerId: "mock-workspace",
      integrationId: "first",
      capability: "workspace",
      priority: 10,
      provider: createMockWorkspaceProvider(),
    });

    registry.register({
      providerId: "mock-workspace",
      integrationId: "second",
      capability: "workspace",
      priority: 5,
      provider: createMockWorkspaceProvider(),
    });

    expect(registry.getById("mock-workspace")?.integrationId).toBe("second");
    expect(registry.list("workspace")).toHaveLength(1);
  });

  it("unregisters providers and clears active selection", () => {
    const registry = new ProviderRegistry();

    registry.register({
      providerId: "mock-workspace",
      integrationId: "mock",
      capability: "workspace",
      priority: 10,
      provider: createMockWorkspaceProvider(),
    });

    registry.setActiveProvider("workspace", "mock-workspace");
    expect(registry.unregister("mock-workspace")).toBe(true);
    expect(registry.getActiveProviderId("workspace")).toBeUndefined();
  });

  it("sets and reads active provider selection", () => {
    const registry = new ProviderRegistry();

    registry.register({
      providerId: "provider-low",
      integrationId: "mock",
      capability: "workspace",
      priority: 100,
      provider: createMockWorkspaceProvider(),
    });

    registry.register({
      providerId: "provider-high",
      integrationId: "mock",
      capability: "workspace",
      priority: 10,
      provider: createMockWorkspaceProvider(),
    });

    registry.setActiveProvider("workspace", "provider-low");
    expect(registry.getActiveProviderId("workspace")).toBe("provider-low");
  });

  it("sorts candidates by ascending priority", () => {
    const registry = new ProviderRegistry();

    registry.register({
      providerId: "slow",
      integrationId: "b",
      capability: "search",
      priority: 200,
      provider: createMockSearchProvider(),
    });

    registry.register({
      providerId: "fast",
      integrationId: "a",
      capability: "search",
      priority: 50,
      provider: createMockSearchProvider(),
    });

    expect(registry.listCandidates("search").map((entry: { providerId: string }) => entry.providerId)).toEqual([
      "fast",
      "slow",
    ]);
  });

  it("skips disabled providers during candidate listing", () => {
    const registry = new ProviderRegistry();

    registry.register({
      providerId: "disabled",
      integrationId: "mock",
      capability: "workspace",
      priority: 1,
      enabled: false,
      provider: createMockWorkspaceProvider(),
    });

    expect(registry.listCandidates("workspace")).toHaveLength(0);
  });
});

describe("ProviderResolver", () => {
  it("resolves the active provider when explicitly selected", async () => {
    const registry = new ProviderRegistry();
    const lowPriority = createMockWorkspaceProvider({
      async listWorkspaces() {
        return {
          items: [],
          totalCount: 0,
          page: 1,
          perPage: 20,
          hasNextPage: false,
        };
      },
    });
    const active = createMockWorkspaceProvider();

    registry.register({
      providerId: "low",
      integrationId: "mock",
      capability: "workspace",
      priority: 1,
      provider: lowPriority,
    });

    registry.register({
      providerId: "active",
      integrationId: "mock",
      capability: "workspace",
      priority: 100,
      provider: active,
    });

    registry.setActiveProvider("workspace", "active");

    const resolver = new ProviderResolver({ registry });
    const result = await resolver.resolveWorkspaceProvider(TEST_SERVICE_CONTEXT).listWorkspaces(
      TEST_SERVICE_CONTEXT,
    );

    expect(result.items[0]?.name).toBe("Test Workspace");
  });

  it("falls back to highest-priority provider when no active selection exists", () => {
    const registry = new ProviderRegistry();

    registry.register({
      providerId: "fallback",
      integrationId: "mock",
      capability: "search",
      priority: 10,
      provider: createMockSearchProvider(),
    });

    registry.register({
      providerId: "backup",
      integrationId: "mock",
      capability: "search",
      priority: 50,
      provider: createMockSearchProvider(),
    });

    const resolver = new ProviderResolver({ registry });
    const provider = resolver.resolveByCriteria(
      { tenantId: TEST_SERVICE_CONTEXT.tenantId, capability: "search" },
      TEST_CORRELATION_ID,
    );

    expect(provider).toBeDefined();
  });

  it("throws a platform error when no provider is registered", () => {
    const resolver = new ProviderResolver({ registry: new ProviderRegistry() });

    expect(() =>
      resolver.resolveWorkspaceProvider(TEST_SERVICE_CONTEXT),
    ).toThrow(PlatformServiceError);
  });

  it("prefers preferredProviderId in resolveByCriteria", () => {
    const registry = new ProviderRegistry();
    const preferred = createMockSearchProvider({
      async search() {
        return { status: "ok", documents: [{ id: "doc_1", kind: "project", title: "Alpha", sourceId: "projects", sourceLabel: "Projects" }] };
      },
    });

    registry.register({
      providerId: "preferred",
      integrationId: "a",
      capability: "search",
      priority: 100,
      provider: preferred,
    });

    registry.register({
      providerId: "other",
      integrationId: "b",
      capability: "search",
      priority: 1,
      provider: createMockSearchProvider(),
    });

    const resolver = new ProviderResolver({ registry });
    const provider = resolver.resolveByCriteria(
      {
        tenantId: TEST_SERVICE_CONTEXT.tenantId,
        capability: "search",
        preferredProviderId: "preferred",
      },
      TEST_CORRELATION_ID,
    );

    expect(provider).toBe(preferred);
  });
});
