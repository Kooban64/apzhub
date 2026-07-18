import { describe, expect, it } from "vitest";

import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import { isValidGlobalId } from "./mapping/global-id";
import { ProviderRegistry } from "./providers/registry/provider-registry";
import { ProviderResolver } from "./providers/registry/provider-resolver";
import { createPlatformServices } from "./services/create-platform-services";
import {
  createMockProjectProvider,
  createMockSearchProvider,
  createMockTeamProvider,
  createMockUserProvider,
  createMockWorkspaceProvider,
  TEST_SERVICE_CONTEXT,
  TEST_WORKSPACE,
} from "./testing/mock-providers";
import type {
  SearchQueryInput,
  ServiceRequestContext,
} from "@apzhub/platform-service-contracts";

function createTestBundle() {
  const registry = new ProviderRegistry();

  registry.register({
    providerId: "mock-workspace",
    integrationId: "mock",
    capability: "workspace",
    priority: 10,
    provider: createMockWorkspaceProvider(),
  });

  registry.register({
    providerId: "mock-project",
    integrationId: "mock",
    capability: "project",
    priority: 10,
    provider: createMockProjectProvider({
      async listProjects() {
        return {
          items: [
            {
              id: "proj_test_1",
              tenantId: TEST_SERVICE_CONTEXT.tenantId,
              workspaceId: TEST_WORKSPACE.id,
              name: "Alpha",
              identifier: "APZ",
              status: "active",
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-01T00:00:00.000Z",
            },
          ],
          totalCount: 1,
          page: 1,
          perPage: 20,
          hasNextPage: false,
        };
      },
    }),
  });

  registry.register({
    providerId: "mock-team",
    integrationId: "mock",
    capability: "team",
    priority: 10,
    provider: createMockTeamProvider(),
  });

  registry.register({
    providerId: "mock-user",
    integrationId: "mock",
    capability: "user",
    priority: 10,
    provider: createMockUserProvider(),
  });

  registry.register({
    providerId: "mock-search",
    integrationId: "mock",
    capability: "search",
    priority: 10,
    provider: createMockSearchProvider({
      async search(_ctx: ServiceRequestContext, input: SearchQueryInput) {
        return {
          status: "ok",
          documents: [
            {
              id: "doc_1",
              kind: "project",
              title: input.text,
              sourceId: "projects",
              sourceLabel: "Projects",
            },
          ],
        };
      },
    }),
  });

  return createPlatformServices({ registry });
}

describe("Platform service implementations", () => {
  it("delegates workspace list operations to the resolved provider", async () => {
    const services = createTestBundle();
    const result = await services.workspace.listWorkspaces(TEST_SERVICE_CONTEXT);

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.name).toBe("Test Workspace");
  });

  it("delegates project list operations through ProjectServiceImpl", async () => {
    const services = createTestBundle();
    const result = await services.project.listProjects(TEST_SERVICE_CONTEXT);

    expect(result.items[0]?.identifier).toBe("APZ");
    expect(isValidGlobalId(result.items[0]!.id)).toBe(true);
  });

  it("delegates search operations and preserves canonical documents", async () => {
    const services = createTestBundle();
    const result = await services.search.search(TEST_SERVICE_CONTEXT, {
      text: "Alpha",
    });

    expect(result.status).toBe("ok");
    expect(result.documents[0]?.title).toBe("Alpha");
    expect(result.documents[0]?.sourceLabel).toBe("Projects");
  });

  it("propagates provider errors as platform service errors", async () => {
    const registry = new ProviderRegistry();

    registry.register({
      providerId: "failing-user",
      integrationId: "mock",
      capability: "user",
      priority: 1,
      provider: createMockUserProvider({
        async getUser(ctx: ServiceRequestContext) {
          throw new PlatformServiceError({
            category: "not_found",
            code: "NOT_FOUND",
            message: "User not found",
            correlationId: ctx.correlationId,
            retryable: false,
          });
        },
      }),
    });

    const services = createPlatformServices({ registry });

    await expect(
      services.user.getUser(TEST_SERVICE_CONTEXT, "user_missing"),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("supports multiple providers and honors active selection", async () => {
    const registry = new ProviderRegistry();

    registry.register({
      providerId: "search-a",
      integrationId: "engine-a",
      capability: "search",
      priority: 10,
      provider: createMockSearchProvider({
        async search() {
          return { status: "ok", documents: [] };
        },
      }),
    });

    registry.register({
      providerId: "search-b",
      integrationId: "engine-b",
      capability: "search",
      priority: 20,
      provider: createMockSearchProvider({
        async search() {
          return {
            status: "ok",
            documents: [
              {
                id: "doc_b",
                kind: "project",
                title: "From B",
                sourceId: "projects",
                sourceLabel: "Projects",
              },
            ],
          };
        },
      }),
    });

    registry.setActiveProvider("search", "search-b");

    const services = createPlatformServices({ registry });
    const result = await services.search.search(TEST_SERVICE_CONTEXT, {
      text: "query",
    });

    expect(result.documents[0]?.title).toBe("From B");
  });

  it("throws when resolving unsupported capability providers", async () => {
    const services = createPlatformServices();
    await expect(
      services.workspace.listWorkspaces(TEST_SERVICE_CONTEXT),
    ).rejects.toBeInstanceOf(PlatformServiceError);
  });
});

describe("ProviderResolver integration with services", () => {
  it("resolves different providers per capability from one registry", () => {
    const registry = new ProviderRegistry();
    const resolver = new ProviderResolver({ registry });

    registry.register({
      providerId: "ws",
      integrationId: "mock",
      capability: "workspace",
      priority: 1,
      provider: createMockWorkspaceProvider(),
    });

    registry.register({
      providerId: "team",
      integrationId: "mock",
      capability: "team",
      priority: 1,
      provider: createMockTeamProvider(),
    });

    expect(resolver.resolveWorkspaceProvider(TEST_SERVICE_CONTEXT)).toBeDefined();
    expect(resolver.resolveTeamProvider(TEST_SERVICE_CONTEXT)).toBeDefined();
  });
});
