import { describe, expect, it } from "vitest";

import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import {
  assertGlobalId,
  extractProvisionalProviderNativeId,
  generateGlobalId,
  isProvisionalProviderId,
  isValidGlobalId,
  parseGlobalId,
} from "./mapping/global-id";
import { InMemoryEntityMappingStore } from "./mapping/in-memory-entity-mapping-store";
import { MappingOrchestrator } from "./orchestration/mapping-orchestrator";
import { reconcileEntityMappings } from "./reconciliation/reconcile-entity-mappings";
import { ProviderRegistry } from "./providers/registry/provider-registry";
import { ProviderResolver } from "./providers/registry/provider-resolver";
import { createPlatformServices } from "./services/create-platform-services";
import {
  createMockProjectProvider,
  createMockTeamProvider,
  createMockWorkspaceProvider,
  TEST_CORRELATION_ID,
  TEST_SERVICE_CONTEXT,
  TEST_TENANT_ID,
  TEST_WORKSPACE,
} from "./testing/mock-providers";

describe("global ID generation", () => {
  it("generates opaque typed IDs without vendor markers", () => {
    const id = generateGlobalId("project");
    expect(id.startsWith("proj_")).toBe(true);
    expect(isProvisionalProviderId(id)).toBe(false);
    expect(isValidGlobalId(id)).toBe(true);
    expect(parseGlobalId(id)?.entityType).toBe("project");
  });

  it("rejects invalid and type-mismatched IDs", () => {
    expect(isValidGlobalId("proj_plane_abc")).toBe(false);
    expect(() => assertGlobalId("not-an-id", TEST_CORRELATION_ID)).toThrow(
      PlatformServiceError,
    );
    const id = generateGlobalId("workspace");
    expect(() => assertGlobalId(id, TEST_CORRELATION_ID, "project")).toThrow(
      PlatformServiceError,
    );
  });

  it("extracts provisional Plane-style native IDs", () => {
    expect(extractProvisionalProviderNativeId("proj_plane_abc", "project")).toBe("abc");
    expect(
      extractProvisionalProviderNativeId("sreq_zammad_42", "support_request"),
    ).toBe("42");
    expect(extractProvisionalProviderNativeId("abc", "project")).toBe("abc");
  });
});

describe("InMemoryEntityMappingStore", () => {
  it("creates and resolves mappings bidirectionally", async () => {
    const store = new InMemoryEntityMappingStore();
    const platformId = generateGlobalId("project");

    const created = await store.create({
      platformId,
      entityType: "project",
      providerId: "plane-project",
      integrationId: "plane",
      providerNativeId: "native-1",
      tenantId: TEST_TENANT_ID,
    });

    expect(created.revision).toBe(1);
    expect(
      await store.resolveProviderNativeId({ platformId, tenantId: TEST_TENANT_ID }),
    ).toBe("native-1");
    expect(
      await store.resolvePlatformId({
        tenantId: TEST_TENANT_ID,
        entityType: "project",
        providerId: "plane-project",
        providerNativeId: "native-1",
      }),
    ).toBe(platformId);
  });

  it("enforces uniqueness and detects conflicts", async () => {
    const store = new InMemoryEntityMappingStore();
    const platformId = generateGlobalId("project");

    await store.create({
      platformId,
      entityType: "project",
      providerId: "plane-project",
      integrationId: "plane",
      providerNativeId: "native-1",
      tenantId: TEST_TENANT_ID,
    });

    await expect(
      store.create({
        platformId,
        entityType: "project",
        providerId: "plane-project",
        integrationId: "plane",
        providerNativeId: "native-2",
        tenantId: TEST_TENANT_ID,
      }),
    ).rejects.toMatchObject({ code: "MAPPING_CONFLICT" });

    await expect(
      store.create({
        platformId: generateGlobalId("project"),
        entityType: "project",
        providerId: "plane-project",
        integrationId: "plane",
        providerNativeId: "native-1",
        tenantId: TEST_TENANT_ID,
      }),
    ).rejects.toMatchObject({ code: "MAPPING_CONFLICT" });
  });

  it("supports deactivate, revision checks, and parent-child listing", async () => {
    const store = new InMemoryEntityMappingStore();
    const parentId = generateGlobalId("project");
    const childId = generateGlobalId("sprint");

    await store.create({
      platformId: parentId,
      entityType: "project",
      providerId: "plane-project",
      integrationId: "plane",
      providerNativeId: "p1",
      tenantId: TEST_TENANT_ID,
    });

    const child = await store.create({
      platformId: childId,
      entityType: "sprint",
      providerId: "plane-project",
      integrationId: "plane",
      providerNativeId: "s1",
      parentPlatformId: parentId,
      parentProviderNativeId: "p1",
      tenantId: TEST_TENANT_ID,
    });

    const listed = await store.list({
      tenantId: TEST_TENANT_ID,
      parentPlatformId: parentId,
    });
    expect(listed).toHaveLength(1);

    await expect(
      store.update(
        childId,
        { status: "inactive", expectedRevision: 99 },
        TEST_TENANT_ID,
      ),
    ).rejects.toMatchObject({ code: "MAPPING_REVISION_CONFLICT" });

    const deactivated = await store.deactivate(childId, TEST_TENANT_ID);
    expect(deactivated.status).toBe("inactive");
    expect(deactivated.revision).toBe(child.revision + 1);

    await expect(
      store.resolveProviderNativeId({
        platformId: childId,
        tenantId: TEST_TENANT_ID,
        requireActive: true,
      }),
    ).rejects.toMatchObject({ code: "MAPPING_INACTIVE" });
  });

  it("returns immutable copies", async () => {
    const store = new InMemoryEntityMappingStore();
    const platformId = generateGlobalId("workspace");
    const created = await store.create({
      platformId,
      entityType: "workspace",
      providerId: "plane-workspace",
      integrationId: "plane",
      providerNativeId: "w1",
      tenantId: TEST_TENANT_ID,
      metadata: { a: "1" },
    });

    (created.metadata as Record<string, string>).a = "mutated";
    const reread = await store.getByPlatformId(platformId);
    expect(reread?.metadata.a).toBe("1");
  });
});

describe("MappingOrchestrator", () => {
  it("creates mappings after provider create and requires reconciliation on persistence failure", async () => {
    const store = new InMemoryEntityMappingStore();
    const orchestrator = new MappingOrchestrator({ store });

    const mapping = await orchestrator.ensureMappingAfterCreate({
      ctx: TEST_SERVICE_CONTEXT,
      entityType: "project",
      providerId: "plane-project",
      integrationId: "plane",
      providerEntityId: "proj_plane_native-99",
      parentPlatformId: generateGlobalId("workspace"),
    });

    expect(mapping.providerNativeId).toBe("native-99");
    expect(isValidGlobalId(mapping.platformId)).toBe(true);

    const failingStore = {
      ...store,
      create: async () => {
        throw new Error("disk full");
      },
      getByProviderNativeId: async () => null,
    };

    const failing = new MappingOrchestrator({ store: failingStore as never });
    await expect(
      failing.ensureMappingAfterCreate({
        ctx: TEST_SERVICE_CONTEXT,
        entityType: "project",
        providerId: "plane-project",
        integrationId: "plane",
        providerEntityId: "proj_plane_x",
      }),
    ).rejects.toMatchObject({ code: "RECONCILIATION_REQUIRED" });
  });
});

describe("provider selection from mapping", () => {
  it("prefers mapped provider over active provider for existing entities", async () => {
    const registry = new ProviderRegistry();
    const mapped = createMockWorkspaceProvider({
      async getWorkspace(_ctx, id) {
        return { ...TEST_WORKSPACE, id, name: "Mapped Provider" };
      },
    });
    const active = createMockWorkspaceProvider({
      async getWorkspace(_ctx, id) {
        return { ...TEST_WORKSPACE, id, name: "Active Provider" };
      },
    });

    registry.register({
      providerId: "mapped-ws",
      integrationId: "engine-a",
      capability: "workspace",
      priority: 50,
      provider: mapped,
    });
    registry.register({
      providerId: "active-ws",
      integrationId: "engine-b",
      capability: "workspace",
      priority: 10,
      provider: active,
    });
    registry.setActiveProvider("workspace", "active-ws");

    const resolver = new ProviderResolver({ registry });
    const provider = resolver.resolveWorkspaceProvider(TEST_SERVICE_CONTEXT, {
      mappedProviderId: "mapped-ws",
    });

    const result = await provider.getWorkspace(TEST_SERVICE_CONTEXT, "native");
    expect(result.name).toBe("Mapped Provider");
  });
});

describe("mapping-aware workspace and project services", () => {
  it("normalises list/create/get to APZHUB global IDs", async () => {
    const registry = new ProviderRegistry();
    const createdNative = "native-project-1";

    registry.register({
      providerId: "mock-workspace",
      integrationId: "mock",
      capability: "workspace",
      priority: 10,
      provider: createMockWorkspaceProvider({
        async getWorkspace(_ctx, id) {
          return { ...TEST_WORKSPACE, id };
        },
      }),
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
                id: `proj_plane_${createdNative}`,
                tenantId: TEST_TENANT_ID,
                workspaceId: "ws_plane_test",
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
        async createProject(_ctx, input) {
          return {
            id: `proj_plane_${createdNative}`,
            tenantId: TEST_TENANT_ID,
            workspaceId: input.workspaceId,
            name: input.name,
            identifier: input.identifier,
            status: "active",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          };
        },
        async getProject(_ctx, id) {
          return {
            id: `proj_plane_${id}`,
            tenantId: TEST_TENANT_ID,
            workspaceId: "ws_plane_test",
            name: "Alpha",
            identifier: "APZ",
            status: "active",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          };
        },
      }),
    });

    const services = createPlatformServices({ registry });

    const workspaces = await services.workspace.listWorkspaces(TEST_SERVICE_CONTEXT);
    expect(isValidGlobalId(workspaces.items[0]!.id)).toBe(true);
    expect(isProvisionalProviderId(workspaces.items[0]!.id)).toBe(false);

    const workspaceId = workspaces.items[0]!.id;
    const created = await services.project.createProject(TEST_SERVICE_CONTEXT, {
      workspaceId,
      name: "Alpha",
      identifier: "APZ",
    });

    expect(isValidGlobalId(created.id)).toBe(true);
    expect(created.workspaceId).toBe(workspaceId);

    const fetched = await services.project.getProject(TEST_SERVICE_CONTEXT, created.id);
    expect(fetched.id).toBe(created.id);
    expect(fetched.identifier).toBe("APZ");
  });

  it("throws mapping not found for unknown global IDs", async () => {
    const registry = new ProviderRegistry();
    registry.register({
      providerId: "mock-project",
      integrationId: "mock",
      capability: "project",
      priority: 10,
      provider: createMockProjectProvider(),
    });

    const services = createPlatformServices({ registry });
    await expect(
      services.project.getProject(TEST_SERVICE_CONTEXT, generateGlobalId("project")),
    ).rejects.toMatchObject({ code: "MAPPING_NOT_FOUND" });
  });
});

describe("mapping-aware team and sprint operations", () => {
  it("maps team members and sprint parent relationships", async () => {
    const store = new InMemoryEntityMappingStore();
    const workspaceId = generateGlobalId("workspace");
    const projectId = generateGlobalId("project");

    await store.create({
      platformId: workspaceId,
      entityType: "workspace",
      providerId: "mock-workspace",
      integrationId: "mock",
      providerNativeId: "w1",
      tenantId: TEST_TENANT_ID,
    });
    await store.create({
      platformId: projectId,
      entityType: "project",
      providerId: "mock-project",
      integrationId: "mock",
      providerNativeId: "p1",
      parentPlatformId: workspaceId,
      parentProviderNativeId: "w1",
      tenantId: TEST_TENANT_ID,
    });

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
        async createSprint(_ctx, _projectId, input) {
          return {
            id: "sprint_plane_s1",
            projectId: "proj_plane_p1",
            name: input.name,
            status: "planned",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          };
        },
        async getSprint(_ctx, sprintRef) {
          expect(sprintRef).toBe("p1::s1");
          return {
            id: "sprint_plane_s1",
            projectId: "proj_plane_p1",
            name: "Sprint 1",
            status: "active",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          };
        },
        async listModules() {
          return { items: [], totalCount: 0, page: 1, perPage: 20, hasNextPage: false };
        },
        async createModule(_ctx, _projectId, input) {
          return {
            id: "module_plane_m1",
            projectId: "proj_plane_p1",
            name: input.name,
            status: "planned",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          };
        },
      }),
    });
    registry.register({
      providerId: "mock-team",
      integrationId: "mock",
      capability: "team",
      priority: 10,
      provider: createMockTeamProvider({
        async listTeam() {
          return {
            items: [
              {
                id: "member_plane_m1",
                projectId: "proj_plane_p1",
                userId: "user_plane_u1",
                role: "member",
                joinedAt: "2026-01-01T00:00:00.000Z",
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

    const services = createPlatformServices({ registry, mappingStore: store });

    const members = await services.team.listTeam(TEST_SERVICE_CONTEXT, projectId);
    expect(isValidGlobalId(members.items[0]!.id)).toBe(true);
    expect(members.items[0]!.projectId).toBe(projectId);

    const sprint = await services.project.createSprint(
      TEST_SERVICE_CONTEXT,
      projectId,
      {
        name: "Sprint 1",
      },
    );
    expect(isValidGlobalId(sprint.id)).toBe(true);
    expect(sprint.projectId).toBe(projectId);

    const fetched = await services.project.getSprint(TEST_SERVICE_CONTEXT, sprint.id);
    expect(fetched.id).toBe(sprint.id);

    const mod = await services.project.createModule(TEST_SERVICE_CONTEXT, projectId, {
      name: "Module A",
    });
    expect(isValidGlobalId(mod.id)).toBe(true);
  });
});

describe("PlatformServiceGateway", () => {
  it("exposes contracts and enforces request context", async () => {
    const registry = new ProviderRegistry();
    registry.register({
      providerId: "mock-workspace",
      integrationId: "mock",
      capability: "workspace",
      priority: 10,
      provider: createMockWorkspaceProvider(),
    });
    registry.register({
      providerId: "mock-search",
      integrationId: "mock",
      capability: "search",
      priority: 10,
      provider: {
        search: async () => ({ status: "ok" as const, documents: [] }),
        suggest: async () => [],
      },
    });
    registry.register({
      providerId: "mock-user",
      integrationId: "mock",
      capability: "user",
      priority: 10,
      provider: {
        listUsers: async () => ({
          items: [],
          totalCount: 0,
          page: 1,
          perPage: 20,
          hasNextPage: false,
        }),
        getUser: async () => {
          throw new Error("n/a");
        },
        getUserByEmail: async () => null,
        getUserProfile: async () => {
          throw new Error("n/a");
        },
        createUser: async () => {
          throw new Error("n/a");
        },
        updateUser: async () => {
          throw new Error("n/a");
        },
      },
    });
    registry.register({
      providerId: "mock-team",
      integrationId: "mock",
      capability: "team",
      priority: 10,
      provider: createMockTeamProvider(),
    });
    registry.register({
      providerId: "mock-project",
      integrationId: "mock",
      capability: "project",
      priority: 10,
      provider: createMockProjectProvider(),
    });

    const services = createPlatformServices({ registry });
    expect(services.gateway.workspaces).toBeDefined();
    expect(services.gateway.projects).toBeDefined();
    expect(services.gateway.teams).toBeDefined();
    expect(services.gateway.users).toBeDefined();
    expect(services.gateway.search).toBeDefined();

    expect(() => services.gateway.tasks).toThrow(PlatformServiceError);

    expect(() =>
      services.gateway.assertContext({
        tenantId: "",
        userId: "",
        correlationId: "",
        permissions: [],
      }),
    ).toThrow(PlatformServiceError);

    const listed =
      await services.gateway.workspaces.listWorkspaces(TEST_SERVICE_CONTEXT);
    expect(listed.items).toHaveLength(1);
  });
});

describe("reconciliation reporting", () => {
  it("detects missing mappings, orphans, duplicates, and inactive providers", async () => {
    const store = new InMemoryEntityMappingStore();
    const platformId = generateGlobalId("project");

    await store.create({
      platformId,
      entityType: "project",
      providerId: "plane-project",
      integrationId: "plane",
      providerNativeId: "known",
      tenantId: TEST_TENANT_ID,
    });

    await store.create({
      platformId: generateGlobalId("project"),
      entityType: "project",
      providerId: "plane-project",
      integrationId: "plane",
      providerNativeId: "orphan",
      tenantId: TEST_TENANT_ID,
    });

    const report = await reconcileEntityMappings({
      store,
      tenantId: TEST_TENANT_ID,
      inactiveProviderIds: ["plane-project"],
      providerEntities: [
        {
          tenantId: TEST_TENANT_ID,
          entityType: "project",
          providerId: "plane-project",
          integrationId: "plane",
          providerNativeId: "known",
        },
        {
          tenantId: TEST_TENANT_ID,
          entityType: "project",
          providerId: "plane-project",
          integrationId: "plane",
          providerNativeId: "unmapped",
        },
      ],
    });

    expect(report.issueCount).toBeGreaterThan(0);
    expect(
      report.issues.some((i) => i.kind === "provider_entity_missing_mapping"),
    ).toBe(true);
    expect(
      report.issues.some((i) => i.kind === "mapping_missing_provider_entity"),
    ).toBe(true);
    expect(
      report.issues.some((i) => i.kind === "inactive_provider_with_active_mapping"),
    ).toBe(true);
  });
});
