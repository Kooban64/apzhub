import { describe, expect, it, vi } from "vitest";

import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import {
  extractProvisionalProviderNativeId,
  generateGlobalId,
  isProvisionalProviderId,
  isValidGlobalId,
} from "./mapping/global-id";
import { InMemoryEntityMappingStore } from "./mapping/in-memory-entity-mapping-store";
import { resolveOperationAuthorization } from "./authorization/operation-authorization-map";
import { PLATFORM_SERVICE_PERMISSION_CATALOGUE } from "./authorization/permission-catalogue";
import { createZammadSupportProvider } from "./providers/zammad/zammad-support-provider";
import { ProviderRegistry } from "./providers/registry/provider-registry";
import { ProviderResolver } from "./providers/registry/provider-resolver";
import {
  createPlatformServices,
  createPlatformServicesWithZammad,
  PLATFORM_SERVICES_VERSION,
  registerZammadProviders,
} from "./services/create-platform-services";
import { TEST_SERVICE_CONTEXT } from "./testing/mock-providers";
import {
  AUTH_TEST_TENANT_A,
  buildActiveSnapshot,
  buildServiceContext,
  createAuthzTestResolver,
} from "./testing/authorization-fixtures";
import { createDefaultProductionPolicies } from "./authorization/production-policies";
import { InMemoryAuthorizationAuditSink } from "./authorization/authorization-audit";

const TEST_ZAMMAD_TICKET = {
  id: "sreq_zammad_42",
  tenantId: TEST_SERVICE_CONTEXT.tenantId,
  displayId: "10042",
  title: "Login issue",
  groupId: "sgrp_zammad_7",
  requesterId: "suser_zammad_3",
  assigneeId: "suser_zammad_9",
  organizationId: "sorg_zammad_2",
  status: "open" as const,
  priority: "normal" as const,
  createdAt: "2026-07-10T00:00:00.000Z",
  updatedAt: "2026-07-10T00:00:00.000Z",
};

function createMockZammadCore() {
  return {
    support: {
      list: vi.fn(async () => ({
        items: [TEST_ZAMMAD_TICKET],
        totalCount: 1,
        page: 1,
        perPage: 25,
        hasNextPage: false,
      })),
      get: vi.fn(async () => TEST_ZAMMAD_TICKET),
      create: vi.fn(async (_ctx: unknown, input: { title: string }) => ({
        ...TEST_ZAMMAD_TICKET,
        id: "sreq_zammad_99",
        title: input.title,
      })),
      update: vi.fn(async () => ({ ...TEST_ZAMMAD_TICKET, title: "Updated" })),
      close: vi.fn(async () => ({ ...TEST_ZAMMAD_TICKET, status: "closed" as const })),
      reopen: vi.fn(async () => ({ ...TEST_ZAMMAD_TICKET, status: "open" as const })),
      assignOwner: vi.fn(async () => TEST_ZAMMAD_TICKET),
      changePriority: vi.fn(async () => TEST_ZAMMAD_TICKET),
      changeState: vi.fn(async () => TEST_ZAMMAD_TICKET),
      searchByTitle: vi.fn(async () => ({
        items: [TEST_ZAMMAD_TICKET],
        totalCount: 1,
        page: 1,
        perPage: 25,
        hasNextPage: false,
      })),
      searchByTicketNumber: vi.fn(async () => ({
        items: [TEST_ZAMMAD_TICKET],
        totalCount: 1,
        page: 1,
        perPage: 25,
        hasNextPage: false,
      })),
    },
    organizations: {
      list: vi.fn(async () => ({
        items: [
          {
            id: "sorg_zammad_2",
            tenantId: TEST_SERVICE_CONTEXT.tenantId,
            name: "Acme",
            active: true,
            createdAt: "2026-07-10T00:00:00.000Z",
            updatedAt: "2026-07-10T00:00:00.000Z",
          },
        ],
        totalCount: 1,
        page: 1,
        perPage: 25,
        hasNextPage: false,
      })),
      get: vi.fn(async () => ({
        id: "sorg_zammad_2",
        tenantId: TEST_SERVICE_CONTEXT.tenantId,
        name: "Acme",
        active: true,
        createdAt: "2026-07-10T00:00:00.000Z",
        updatedAt: "2026-07-10T00:00:00.000Z",
      })),
      create: vi.fn(async (_ctx: unknown, input: { name: string }) => ({
        id: "sorg_zammad_88",
        tenantId: TEST_SERVICE_CONTEXT.tenantId,
        name: input.name,
        active: true,
        createdAt: "2026-07-10T00:00:00.000Z",
        updatedAt: "2026-07-10T00:00:00.000Z",
      })),
      update: vi.fn(async () => ({
        id: "sorg_zammad_2",
        tenantId: TEST_SERVICE_CONTEXT.tenantId,
        name: "Acme Updated",
        active: true,
        createdAt: "2026-07-10T00:00:00.000Z",
        updatedAt: "2026-07-10T00:00:00.000Z",
      })),
      archive: vi.fn(async () => ({
        id: "sorg_zammad_2",
        tenantId: TEST_SERVICE_CONTEXT.tenantId,
        name: "Acme",
        active: false,
        createdAt: "2026-07-10T00:00:00.000Z",
        updatedAt: "2026-07-10T00:00:00.000Z",
      })),
    },
    groups: {
      list: vi.fn(async () => ({
        items: [
          {
            id: "sgrp_zammad_7",
            tenantId: TEST_SERVICE_CONTEXT.tenantId,
            name: "Support",
            active: true,
            createdAt: "2026-07-10T00:00:00.000Z",
            updatedAt: "2026-07-10T00:00:00.000Z",
          },
        ],
        totalCount: 1,
        page: 1,
        perPage: 25,
        hasNextPage: false,
      })),
      get: vi.fn(async () => ({
        id: "sgrp_zammad_7",
        tenantId: TEST_SERVICE_CONTEXT.tenantId,
        name: "Support",
        active: true,
        createdAt: "2026-07-10T00:00:00.000Z",
        updatedAt: "2026-07-10T00:00:00.000Z",
      })),
      create: vi.fn(async (_ctx: unknown, input: { name: string }) => ({
        id: "sgrp_zammad_77",
        tenantId: TEST_SERVICE_CONTEXT.tenantId,
        name: input.name,
        active: true,
        createdAt: "2026-07-10T00:00:00.000Z",
        updatedAt: "2026-07-10T00:00:00.000Z",
      })),
      update: vi.fn(async () => ({
        id: "sgrp_zammad_7",
        tenantId: TEST_SERVICE_CONTEXT.tenantId,
        name: "Support Updated",
        active: true,
        createdAt: "2026-07-10T00:00:00.000Z",
        updatedAt: "2026-07-10T00:00:00.000Z",
      })),
    },
    users: {
      list: vi.fn(async () => ({
        items: [
          {
            id: "suser_zammad_3",
            tenantId: TEST_SERVICE_CONTEXT.tenantId,
            displayName: "Alice",
            active: true,
            role: "customer" as const,
            createdAt: "2026-07-10T00:00:00.000Z",
            updatedAt: "2026-07-10T00:00:00.000Z",
          },
        ],
        totalCount: 1,
        page: 1,
        perPage: 25,
        hasNextPage: false,
      })),
      get: vi.fn(async () => ({
        id: "suser_zammad_3",
        tenantId: TEST_SERVICE_CONTEXT.tenantId,
        displayName: "Alice",
        active: true,
        role: "customer" as const,
        createdAt: "2026-07-10T00:00:00.000Z",
        updatedAt: "2026-07-10T00:00:00.000Z",
      })),
      lookup: vi.fn(async () => ({
        id: "suser_zammad_3",
        tenantId: TEST_SERVICE_CONTEXT.tenantId,
        displayName: "Alice",
        email: "alice@example.com",
        active: true,
        role: "customer" as const,
        createdAt: "2026-07-10T00:00:00.000Z",
        updatedAt: "2026-07-10T00:00:00.000Z",
      })),
      search: vi.fn(async () => ({
        items: [
          {
            id: "suser_zammad_3",
            tenantId: TEST_SERVICE_CONTEXT.tenantId,
            displayName: "Alice",
            active: true,
            role: "customer" as const,
            createdAt: "2026-07-10T00:00:00.000Z",
            updatedAt: "2026-07-10T00:00:00.000Z",
          },
        ],
        totalCount: 1,
        page: 1,
        perPage: 25,
        hasNextPage: false,
      })),
    },
    articles: {
      list: vi.fn(async () => ({
        items: [
          {
            id: "sart_zammad_5",
            tenantId: TEST_SERVICE_CONTEXT.tenantId,
            supportTicketId: "sreq_zammad_42",
            body: "Hello",
            bodyFormat: "text/plain" as const,
            channel: "note" as const,
            visibility: "internal" as const,
            senderType: "agent" as const,
            author: { senderType: "agent" as const },
            deliveryStatus: "none" as const,
            attachments: [],
            createdAt: "2026-07-10T00:00:00.000Z",
            updatedAt: "2026-07-10T00:00:00.000Z",
          },
        ],
        totalCount: 1,
        page: 1,
        perPage: 25,
        hasNextPage: false,
      })),
      get: vi.fn(async () => ({
        id: "sart_zammad_5",
        tenantId: TEST_SERVICE_CONTEXT.tenantId,
        supportTicketId: "sreq_zammad_42",
        body: "Hello",
        bodyFormat: "text/plain" as const,
        channel: "note" as const,
        visibility: "internal" as const,
        senderType: "agent" as const,
        author: { senderType: "agent" as const },
        deliveryStatus: "none" as const,
        attachments: [],
        createdAt: "2026-07-10T00:00:00.000Z",
        updatedAt: "2026-07-10T00:00:00.000Z",
      })),
      createNote: vi.fn(async () => ({
        id: "sart_zammad_55",
        tenantId: TEST_SERVICE_CONTEXT.tenantId,
        supportTicketId: "sreq_zammad_42",
        body: "Note",
        bodyFormat: "text/plain" as const,
        channel: "note" as const,
        visibility: "internal" as const,
        senderType: "agent" as const,
        author: { senderType: "agent" as const },
        deliveryStatus: "none" as const,
        attachments: [],
        createdAt: "2026-07-10T00:00:00.000Z",
        updatedAt: "2026-07-10T00:00:00.000Z",
      })),
      createReply: vi.fn(async () => ({
        id: "sart_zammad_56",
        tenantId: TEST_SERVICE_CONTEXT.tenantId,
        supportTicketId: "sreq_zammad_42",
        body: "Reply",
        bodyFormat: "text/plain" as const,
        channel: "email" as const,
        visibility: "public" as const,
        senderType: "agent" as const,
        author: { senderType: "agent" as const },
        deliveryStatus: "none" as const,
        attachments: [],
        createdAt: "2026-07-10T00:00:00.000Z",
        updatedAt: "2026-07-10T00:00:00.000Z",
      })),
      create: vi.fn(async () => ({
        id: "sart_zammad_57",
        tenantId: TEST_SERVICE_CONTEXT.tenantId,
        supportTicketId: "sreq_zammad_42",
        body: "Article",
        bodyFormat: "text/plain" as const,
        channel: "note" as const,
        visibility: "internal" as const,
        senderType: "agent" as const,
        author: { senderType: "agent" as const },
        deliveryStatus: "none" as const,
        attachments: [],
        createdAt: "2026-07-10T00:00:00.000Z",
        updatedAt: "2026-07-10T00:00:00.000Z",
      })),
    },
    search: {
      search: vi.fn(async () => ({
        query: "login",
        hits: [
          {
            id: "shit_support_request_zammad_42",
            kind: "support_request" as const,
            title: "Login issue",
            supportTicketId: "sreq_zammad_42",
            score: 1,
          },
        ],
        totalCount: 1,
        page: 1,
        perPage: 25,
        hasNextPage: false,
      })),
    },
    history: {
      getTimeline: vi.fn(async () => ({
        items: [
          {
            id: "shist_zammad_1",
            supportTicketId: "sreq_zammad_42",
            action: "created" as const,
            summary: "Created",
            actor: { kind: "system" as const },
            occurredAt: "2026-07-10T00:00:00.000Z",
          },
        ],
        totalCount: 1,
        page: 1,
        perPage: 25,
        hasNextPage: false,
      })),
      list: vi.fn(async () => ({
        items: [
          {
            id: "shist_zammad_1",
            supportTicketId: "sreq_zammad_42",
            action: "created" as const,
            summary: "Created",
            actor: { kind: "system" as const },
            occurredAt: "2026-07-10T00:00:00.000Z",
          },
        ],
        totalCount: 1,
        page: 1,
        perPage: 25,
        hasNextPage: false,
      })),
      getSupportTimeline: vi.fn(async () => ({
        supportTicketId: "sreq_zammad_42",
        events: [
          {
            id: "shist_zammad_1",
            supportTicketId: "sreq_zammad_42",
            action: "created" as const,
            summary: "Created",
            actor: { kind: "system" as const },
            occurredAt: "2026-07-10T00:00:00.000Z",
          },
        ],
        totalCount: 1,
      })),
    },
    analytics: {
      getSupportIntelligence: vi.fn(async () => ({
        capturedAt: "2026-07-11T00:00:00.000Z",
        totalTickets: 1,
        openTickets: 1,
        closedTickets: 0,
        pendingTickets: 0,
        newTickets: 0,
        overdueTickets: 0,
        unassignedTickets: 0,
        byPriority: [],
        byState: [],
        byOrganization: [],
        byGroup: [],
        byOwner: [],
      })),
      getSnapshot: vi.fn(async () => ({
        capturedAt: "2026-07-11T00:00:00.000Z",
        totalTickets: 1,
        openTickets: 1,
        closedTickets: 0,
        pendingTickets: 0,
        newTickets: 0,
        overdueTickets: 0,
        unassignedTickets: 0,
        byPriority: [],
        byState: [],
        byOrganization: [],
        byGroup: [],
        byOwner: [],
      })),
    },
    synchronisation: {
      getSyncState: vi.fn(async () => ({
        mode: "none" as const,
        status: "idle" as const,
        recordsProcessed: 0,
        cursor: {},
        errors: [],
      })),
      getLastSyncTimestamp: vi.fn(),
      safeRestart: vi.fn(),
      runFullSync: vi.fn(),
      runIncrementalSync: vi.fn(),
    },
    webhooks: {
      validateConfiguration: vi.fn(() => ({ ok: true, issues: [] })),
      list: vi.fn(async () => []),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      supportedEventTypes: vi.fn(() => []),
      supportedOperations: vi.fn(() => []),
    },
    events: {},
  };
}

async function seedSupportMappings(store: InMemoryEntityMappingStore) {
  const groupId = generateGlobalId("support_group");
  const requesterId = generateGlobalId("support_user");
  const assigneeId = generateGlobalId("support_user");
  const organizationId = generateGlobalId("support_organization");
  const ticketId = generateGlobalId("support_request");

  await store.create({
    platformId: groupId,
    entityType: "support_group",
    providerId: "zammad-group",
    integrationId: "zammad",
    providerNativeId: "7",
    tenantId: TEST_SERVICE_CONTEXT.tenantId,
    status: "active",
  });
  await store.create({
    platformId: requesterId,
    entityType: "support_user",
    providerId: "zammad-user",
    integrationId: "zammad",
    providerNativeId: "3",
    tenantId: TEST_SERVICE_CONTEXT.tenantId,
    status: "active",
  });
  await store.create({
    platformId: assigneeId,
    entityType: "support_user",
    providerId: "zammad-user",
    integrationId: "zammad",
    providerNativeId: "9",
    tenantId: TEST_SERVICE_CONTEXT.tenantId,
    status: "active",
  });
  await store.create({
    platformId: organizationId,
    entityType: "support_organization",
    providerId: "zammad-organization",
    integrationId: "zammad",
    providerNativeId: "2",
    tenantId: TEST_SERVICE_CONTEXT.tenantId,
    status: "active",
  });
  await store.create({
    platformId: ticketId,
    entityType: "support_request",
    providerId: "zammad-support",
    integrationId: "zammad",
    providerNativeId: "42",
    tenantId: TEST_SERVICE_CONTEXT.tenantId,
    status: "active",
  });

  return { groupId, requesterId, assigneeId, organizationId, ticketId };
}

describe("OSS-110-10 package version", () => {
  it("bumps platform-services to 0.10.0", () => {
    expect(PLATFORM_SERVICES_VERSION).toBe("0.24.0");
  });
});

describe("Support mapping global IDs", () => {
  it("generates sreq_ global IDs without zammad marker", () => {
    const id = generateGlobalId("support_request");
    expect(id.startsWith("sreq_")).toBe(true);
    expect(isProvisionalProviderId(id)).toBe(false);
    expect(isValidGlobalId(id)).toBe(true);
  });

  it("strips sreq_zammad_ provisional IDs", () => {
    expect(extractProvisionalProviderNativeId("sreq_zammad_42", "support_request")).toBe("42");
    expect(extractProvisionalProviderNativeId("sgrp_zammad_7", "support_group")).toBe("7");
    expect(isProvisionalProviderId("sreq_zammad_42")).toBe(true);
  });
});

describe("Zammad support capability provider", () => {
  it("delegates list/get/create/update/close/reopen/assign to core.support", async () => {
    const support = {
      list: vi.fn(async () => ({
        items: [TEST_ZAMMAD_TICKET],
        totalCount: 1,
        page: 1,
        perPage: 25,
        hasNextPage: false,
      })),
      get: vi.fn(async () => TEST_ZAMMAD_TICKET),
      create: vi.fn(async () => TEST_ZAMMAD_TICKET),
      update: vi.fn(async () => TEST_ZAMMAD_TICKET),
      close: vi.fn(async () => TEST_ZAMMAD_TICKET),
      reopen: vi.fn(async () => TEST_ZAMMAD_TICKET),
      assignOwner: vi.fn(async () => TEST_ZAMMAD_TICKET),
      changePriority: vi.fn(async () => TEST_ZAMMAD_TICKET),
      changeState: vi.fn(async () => TEST_ZAMMAD_TICKET),
      searchByTitle: vi.fn(async () => ({
        items: [],
        totalCount: 0,
        page: 1,
        perPage: 25,
        hasNextPage: false,
      })),
      searchByTicketNumber: vi.fn(async () => ({
        items: [],
        totalCount: 0,
        page: 1,
        perPage: 25,
        hasNextPage: false,
      })),
    };

    const provider = createZammadSupportProvider({ support } as never);
    const ctx = TEST_SERVICE_CONTEXT;

    await provider.listSupportRequests(ctx);
    expect(support.list).toHaveBeenCalled();

    await provider.getSupportRequest(ctx, "42");
    expect(support.get).toHaveBeenCalled();

    await provider.createSupportRequest(ctx, {
      title: "New",
      groupId: "7",
      requesterId: "3",
    });
    expect(support.create).toHaveBeenCalled();

    await provider.closeSupportRequest(ctx, "42");
    expect(support.close).toHaveBeenCalled();

    await provider.assignSupportRequest(ctx, "42", { assigneeId: "9" });
    expect(support.assignOwner).toHaveBeenCalled();
  });
});

describe("Support provider resolution", () => {
  it("prefers mapped provider over lower-priority default", () => {
    const registry = new ProviderRegistry();
    const resolver = new ProviderResolver({ registry });

    const primary = { listSupportRequests: vi.fn() };
    const secondary = { listSupportRequests: vi.fn() };

    registry.register({
      providerId: "zammad-support",
      integrationId: "zammad",
      capability: "support_request",
      priority: 100,
      provider: primary,
    });
    registry.register({
      providerId: "alt-support",
      integrationId: "alt",
      capability: "support_request",
      priority: 50,
      provider: secondary,
    });

    const resolved = resolver.resolveSupportRequestProvider(TEST_SERVICE_CONTEXT, {
      mappedProviderId: "alt-support",
    });
    expect(resolved).toBe(secondary);
  });

  it("selects lowest priority number when no mapping hint", () => {
    const registry = new ProviderRegistry();
    const resolver = new ProviderResolver({ registry });

    const high = { listSupportRequests: vi.fn() };
    const low = { listSupportRequests: vi.fn() };

    registry.register({
      providerId: "zammad-support",
      integrationId: "zammad",
      capability: "support_request",
      priority: 100,
      provider: high,
    });
    registry.register({
      providerId: "preferred-support",
      integrationId: "preferred",
      capability: "support_request",
      priority: 10,
      provider: low,
    });

    const resolved = resolver.resolveSupportRequestProvider(TEST_SERVICE_CONTEXT);
    expect(resolved).toBe(low);
  });
});

describe("Support gateway exposure", () => {
  it("throws PROVIDER_CAPABILITY_UNSUPPORTED without support provider", () => {
    const bundle = createPlatformServices();
    expect(() => bundle.gateway.support).toThrow(PlatformServiceError);
    try {
      void bundle.gateway.support;
    } catch (error) {
      expect((error as PlatformServiceError).code).toBe("PROVIDER_CAPABILITY_UNSUPPORTED");
    }
  });

  it("exposes support getters when Zammad providers are registered", () => {
    const bundle = createPlatformServicesWithZammad(createMockZammadCore() as never);
    expect(bundle.gateway.support).toBeDefined();
    expect(bundle.gateway.supportOrganizations).toBeDefined();
    expect(bundle.gateway.supportGroups).toBeDefined();
    expect(bundle.gateway.supportUsers).toBeDefined();
    expect(bundle.gateway.supportArticles).toBeDefined();
    expect(bundle.gateway.supportSearch).toBeDefined();
    expect(bundle.gateway.supportHistory).toBeDefined();
    expect(bundle.gateway.supportAnalytics).toBeDefined();
  });
});

describe("SupportServiceImpl mapping", () => {
  it("normalizes provisional zammad IDs to APZHUB global IDs on list", async () => {
    const registry = new ProviderRegistry();
    registerZammadProviders({ registry, zammadCore: createMockZammadCore() as never });
    const bundle = createPlatformServices({ registry });

    const result = await bundle.support.listSupportRequests(TEST_SERVICE_CONTEXT);
    expect(result.items).toHaveLength(1);
    const ticket = result.items[0]!;
    expect(ticket.id.startsWith("sreq_")).toBe(true);
    expect(isProvisionalProviderId(ticket.id)).toBe(false);
    expect(ticket.groupId.startsWith("sgrp_")).toBe(true);
    expect(isProvisionalProviderId(ticket.groupId)).toBe(false);
    expect(ticket.requesterId.startsWith("suser_")).toBe(true);
    expect(ticket.assigneeId?.startsWith("suser_")).toBe(true);
    expect(ticket.organizationId?.startsWith("sorg_")).toBe(true);
  });

  it("resolves existing mappings for get and translates relationship IDs", async () => {
    const registry = new ProviderRegistry();
    registerZammadProviders({ registry, zammadCore: createMockZammadCore() as never });
    const mappingStore = new InMemoryEntityMappingStore();
    const ids = await seedSupportMappings(mappingStore);
    const bundle = createPlatformServices({ registry, mappingStore });

    const ticket = await bundle.support.getSupportRequest(TEST_SERVICE_CONTEXT, ids.ticketId);
    expect(ticket.id).toBe(ids.ticketId);
    expect(ticket.groupId).toBe(ids.groupId);
    expect(ticket.requesterId).toBe(ids.requesterId);
    expect(ticket.assigneeId).toBe(ids.assigneeId);
    expect(ticket.organizationId).toBe(ids.organizationId);
  });

  it("creates mapping after create and never returns provisional IDs", async () => {
    const registry = new ProviderRegistry();
    registerZammadProviders({ registry, zammadCore: createMockZammadCore() as never });
    const mappingStore = new InMemoryEntityMappingStore();
    const ids = await seedSupportMappings(mappingStore);
    const bundle = createPlatformServices({ registry, mappingStore });

    const created = await bundle.support.createSupportRequest(TEST_SERVICE_CONTEXT, {
      title: "New ticket",
      groupId: ids.groupId,
      requesterId: ids.requesterId,
    });

    expect(created.id.startsWith("sreq_")).toBe(true);
    expect(isProvisionalProviderId(created.id)).toBe(false);
    const stored = await mappingStore.getByPlatformId(created.id, TEST_SERVICE_CONTEXT.tenantId);
    expect(stored?.providerNativeId).toBe("99");
  });

  it("updates, closes, reopens, assigns, and changes priority/state via native IDs", async () => {
    const core = createMockZammadCore();
    const registry = new ProviderRegistry();
    registerZammadProviders({ registry, zammadCore: core as never });
    const mappingStore = new InMemoryEntityMappingStore();
    const ids = await seedSupportMappings(mappingStore);
    const bundle = createPlatformServices({ registry, mappingStore });

    const updated = await bundle.support.updateSupportRequest(TEST_SERVICE_CONTEXT, ids.ticketId, {
      title: "Updated",
    });
    expect(updated.title).toBe("Updated");
    expect(core.support.update).toHaveBeenCalledWith(
      expect.anything(),
      "42",
      expect.objectContaining({ title: "Updated" }),
    );

    const closed = await bundle.support.closeSupportRequest(TEST_SERVICE_CONTEXT, ids.ticketId);
    expect(closed.status).toBe("closed");
    expect(core.support.close).toHaveBeenCalledWith(expect.anything(), "42");

    const reopened = await bundle.support.reopenSupportRequest(TEST_SERVICE_CONTEXT, ids.ticketId);
    expect(reopened.status).toBe("open");

    await bundle.support.assignSupportRequest(TEST_SERVICE_CONTEXT, ids.ticketId, {
      assigneeId: ids.assigneeId,
    });
    expect(core.support.assignOwner).toHaveBeenCalledWith(
      expect.anything(),
      "42",
      expect.objectContaining({ assigneeId: "9" }),
    );

    await bundle.support.changeSupportRequestPriority(TEST_SERVICE_CONTEXT, ids.ticketId, {
      priority: "high",
    });
    expect(core.support.changePriority).toHaveBeenCalled();

    await bundle.support.changeSupportRequestState(TEST_SERVICE_CONTEXT, ids.ticketId, {
      status: "pending",
    });
    expect(core.support.changeState).toHaveBeenCalled();

    const search = await bundle.support.searchSupportRequests(TEST_SERVICE_CONTEXT, {
      filter: { title: "Login" },
    });
    expect(search.items[0]!.id.startsWith("sreq_")).toBe(true);
    expect(core.support.searchByTitle).toHaveBeenCalled();
  });
});

describe("Support related domain services", () => {
  it("maps organizations, groups, users, articles, search, history, analytics", async () => {
    const registry = new ProviderRegistry();
    registerZammadProviders({ registry, zammadCore: createMockZammadCore() as never });
    const mappingStore = new InMemoryEntityMappingStore();
    const ids = await seedSupportMappings(mappingStore);
    const bundle = createPlatformServices({ registry, mappingStore });

    const orgs = await bundle.supportOrganization.listOrganizations(TEST_SERVICE_CONTEXT);
    expect(orgs.items[0]!.id.startsWith("sorg_")).toBe(true);
    expect(isProvisionalProviderId(orgs.items[0]!.id)).toBe(false);

    const org = await bundle.supportOrganization.getOrganization(
      TEST_SERVICE_CONTEXT,
      ids.organizationId,
    );
    expect(org.id).toBe(ids.organizationId);

    const createdOrg = await bundle.supportOrganization.createOrganization(TEST_SERVICE_CONTEXT, {
      name: "New Org",
    });
    expect(createdOrg.id.startsWith("sorg_")).toBe(true);

    const groups = await bundle.supportGroup.listGroups(TEST_SERVICE_CONTEXT);
    expect(groups.items[0]!.id).toBe(ids.groupId);

    const users = await bundle.supportUser.listUsers(TEST_SERVICE_CONTEXT);
    expect(users.items[0]!.id.startsWith("suser_")).toBe(true);

    const lookedUp = await bundle.supportUser.lookup(TEST_SERVICE_CONTEXT, {
      email: "alice@example.com",
    });
    expect(lookedUp?.id.startsWith("suser_")).toBe(true);

    const articles = await bundle.supportArticle.list(TEST_SERVICE_CONTEXT, ids.ticketId);
    expect(articles.items[0]!.id.startsWith("sart_")).toBe(true);
    expect(articles.items[0]!.supportTicketId).toBe(ids.ticketId);

    const note = await bundle.supportArticle.createNote(TEST_SERVICE_CONTEXT, {
      supportTicketId: ids.ticketId,
      body: "Note",
    });
    expect(note.id.startsWith("sart_")).toBe(true);

    const search = await bundle.supportSearch.search(TEST_SERVICE_CONTEXT, "login");
    expect(search.hits[0]!.supportTicketId?.startsWith("sreq_")).toBe(true);

    const timeline = await bundle.supportHistory.getSupportTimeline(
      TEST_SERVICE_CONTEXT,
      ids.ticketId,
    );
    expect(timeline.supportTicketId).toBe(ids.ticketId);

    const analytics = await bundle.supportAnalytics.getSupportIntelligence(TEST_SERVICE_CONTEXT);
    expect(analytics.totalTickets).toBe(1);
  });
});

describe("Support request pipeline", () => {
  it("executes gateway support operations through the pipeline", async () => {
    const registry = new ProviderRegistry();
    registerZammadProviders({ registry, zammadCore: createMockZammadCore() as never });
    const mappingStore = new InMemoryEntityMappingStore();
    await seedSupportMappings(mappingStore);
    const metricsEvents: string[] = [];
    const bundle = createPlatformServices({
      registry,
      mappingStore,
      metrics: {
        record(event) {
          metricsEvents.push(`${event.kind}:${event.service}.${event.operation}`);
        },
      },
    });

    await bundle.gateway.support.listSupportRequests(TEST_SERVICE_CONTEXT);
    expect(metricsEvents.some((entry) => entry.includes("support.listSupportRequests"))).toBe(
      true,
    );
  });
});

describe("Support authorization", () => {
  it("catalogues support permissions", () => {
    expect(PLATFORM_SERVICE_PERMISSION_CATALOGUE).toContain("support.requests.list");
    expect(PLATFORM_SERVICE_PERMISSION_CATALOGUE).toContain("support.articles.create");
    expect(PLATFORM_SERVICE_PERMISSION_CATALOGUE).toContain("support.analytics.read");
  });

  it("maps closeSupportRequest to transition permission", () => {
    const mapping = resolveOperationAuthorization("support", "closeSupportRequest");
    expect(mapping?.requiredPermission).toBe("support.requests.transition");
  });

  it("maps changeSupportRequestPriority to update permission", () => {
    const mapping = resolveOperationAuthorization("support", "changeSupportRequestPriority");
    expect(mapping?.requiredPermission).toBe("support.requests.update");
  });

  it("maps assignSupportRequest to assign permission", () => {
    const mapping = resolveOperationAuthorization("support", "assignSupportRequest");
    expect(mapping?.requiredPermission).toBe("support.requests.assign");
  });

  it("denies support list without permission and allows with permission", async () => {
    const registry = new ProviderRegistry();
    registerZammadProviders({ registry, zammadCore: createMockZammadCore() as never });
    const accessResolver = createAuthzTestResolver();
    accessResolver.set(
      "user-support-agent",
      AUTH_TEST_TENANT_A,
      buildActiveSnapshot({
        userId: "user-support-agent",
        allowPermissions: ["support.requests.list"],
      }),
    );
    const bundle = createPlatformServices({
      registry,
      authorizationMode: "production",
      accessResolver,
      auditSink: new InMemoryAuthorizationAuditSink(),
      policies: createDefaultProductionPolicies({ accessResolver }),
    });

    const deniedCtx = buildServiceContext({
      userId: "user-standard",
      tenantId: AUTH_TEST_TENANT_A,
    });

    await expect(bundle.gateway.support.listSupportRequests(deniedCtx)).rejects.toMatchObject({
      code: "PERMISSION_DENIED",
    });

    const allowedCtx = buildServiceContext({
      userId: "user-support-agent",
      tenantId: AUTH_TEST_TENANT_A,
    });

    const result = await bundle.gateway.support.listSupportRequests(allowedCtx);
    expect(result.items.length).toBeGreaterThan(0);
  });
});

describe("Support provider failure translation", () => {
  it("maps connector failures to PlatformServiceError", async () => {
    const registry = new ProviderRegistry();
    const failingCore = createMockZammadCore();
    failingCore.support.list = vi.fn(async () => {
      throw Object.assign(new Error("upstream unavailable"), {
        category: "connector",
        code: "zammad.connector.unavailable",
        message: "upstream unavailable",
        retryable: true,
        correlationId: "zammad-test",
      });
    });
    registerZammadProviders({ registry, zammadCore: failingCore as never });
    const bundle = createPlatformServices({ registry });

    await expect(bundle.support.listSupportRequests(TEST_SERVICE_CONTEXT)).rejects.toBeInstanceOf(
      PlatformServiceError,
    );
  });
});
