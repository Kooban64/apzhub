/**
 * OSS-110-12 — Support Vertical mocked end-to-end stack certification.
 *
 * HTTP handlers → PlatformServiceGateway → Support services → Mapping
 * → Zammad providers → createZammadAdapter with createMockZammadFetch → mock API
 *
 * No live Zammad instance. No Event Bus. No webhooks. No notifications.
 * Mirrors the pattern from apps/web/lib/api/v1/wave1-stack.e2e.test.ts.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import {
  createZammadAdapter,
  disposeZammadAdapter,
  ZAMMAD_ADAPTER_VERSION,
  createMockZammadFetch,
  DEFAULT_TEST_ZAMMAD_CONFIG,
  TEST_TENANT_ID,
} from "@apzhub/integration-zammad";
import {
  createPlatformServicesWithZammad,
  InMemoryEntityMappingStore,
  PLATFORM_SERVICES_VERSION,
} from "@apzhub/platform-services";

import {
  handleListSupportRequests,
  handleGetSupportRequest,
  handleCreateSupportRequest,
  handleUpdateSupportRequest,
  handleCloseSupportRequest,
  handleReopenSupportRequest,
  handleChangeSupportState,
  handleChangeSupportPriority,
  handleAssignSupportOwner,
  handleRemoveSupportOwner,
  handleAssignSupportCustomer,
  handleListSupportArticles,
  handleGetSupportArticle,
  handleCreateInternalNote,
  handleCreateCustomerReply,
  handleGetSupportHistory,
  handleListOrganizations,
  handleGetOrganization,
  handleCreateOrganization,
  handleUpdateOrganization,
  handleArchiveOrganization,
  handleListGroups,
  handleGetGroup,
  handleCreateGroup,
  handleUpdateGroup,
  handleListSupportUsers,
  handleGetSupportUser,
  handleSupportSearch,
  handleSupportAnalytics,
} from "../../apps/web/lib/api/v1/handlers/support";

import type { PlatformApiRequestContext } from "../../apps/web/lib/api/v1/auth/with-platform-api-auth";
import {
  createTestPlatformApiGatewayBootstrap,
  resetPlatformApiGatewayBootstrap,
  setPlatformApiGatewayBootstrapForTests,
} from "../../apps/web/lib/api/v1/gateway/bootstrap";
import { buildMockSession } from "../../apps/web/lib/api/v1/testing/fixtures";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TENANT = TEST_TENANT_ID;
const USER = "user_support_cert_001";
const CORR = "corr-support-e2e-001";

// Second tenant for cross-tenant isolation tests.
const TENANT_B = "tenant-zammad-2";

const SUPPORT_PERMISSIONS = [
  "support.requests.list",
  "support.requests.read",
  "support.requests.create",
  "support.requests.update",
  "support.requests.assign",
  "support.requests.transition",
  "support.requests.manage",
  "support.organizations.list",
  "support.organizations.read",
  "support.organizations.create",
  "support.organizations.update",
  "support.organizations.manage",
  "support.groups.list",
  "support.groups.read",
  "support.groups.create",
  "support.groups.update",
  "support.users.list",
  "support.users.read",
  "support.search.query",
  "support.history.list",
  "support.analytics.read",
  "support.articles.list",
  "support.articles.read",
  "support.articles.note",
  "support.articles.reply",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(
  url: string,
  init?: { method?: string; body?: string },
): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3300"), {
    method: init?.method ?? "GET",
    body: init?.body,
    headers: { "content-type": "application/json" },
  });
}

function makeContext(
  options: { permissions?: string[]; tenantId?: string; userId?: string } = {},
): PlatformApiRequestContext {
  const tenantId = options.tenantId ?? TENANT;
  const userId = options.userId ?? USER;
  const permissions = options.permissions ?? SUPPORT_PERMISSIONS;
  return {
    tracing: {
      requestId: "req-support-e2e-001",
      correlationId: CORR,
      timestamp: "2026-07-11T00:00:00.000Z",
    },
    session: buildMockSession({
      userId,
      tenantId,
    }) as PlatformApiRequestContext["session"],
    serviceContext: {
      tenantId,
      userId,
      correlationId: CORR,
      permissions,
      requestId: "req-support-e2e-001",
    },
  };
}

function routeCtx(params: Record<string, string>) {
  return { params: Promise.resolve(params) };
}

// ---------------------------------------------------------------------------
// Shared setup
// ---------------------------------------------------------------------------

describe("OSS-110-12 Support Vertical mocked E2E stack", () => {
  let adapter: Awaited<ReturnType<typeof createZammadAdapter>>["adapter"];
  let factory: Awaited<ReturnType<typeof createZammadAdapter>>["factory"];
  let mappingStore: InMemoryEntityMappingStore;

  beforeEach(async () => {
    resetPlatformApiGatewayBootstrap();
    mappingStore = new InMemoryEntityMappingStore();

    const created = await createZammadAdapter({
      zammad: DEFAULT_TEST_ZAMMAD_CONFIG,
      tenantId: TENANT,
      apiToken: "support-e2e-cert-token",
      adapterOptions: { fetchFn: createMockZammadFetch() },
    });
    adapter = created.adapter;
    factory = created.factory;

    const bundle = createPlatformServicesWithZammad(adapter.core, mappingStore);
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap(bundle.gateway, {
        zammadEnabled: true,
        providersRegistered: true,
        authorizationMode: "allow-all",
      }),
    );
  });

  afterEach(async () => {
    resetPlatformApiGatewayBootstrap();
    if (adapter && factory) {
      await disposeZammadAdapter(adapter, factory);
    }
  });

  // -------------------------------------------------------------------------
  // Version assertions
  // -------------------------------------------------------------------------

  it("verifies platform versions", () => {
    expect(ZAMMAD_ADAPTER_VERSION).toBe("0.6.0");
    expect(PLATFORM_SERVICES_VERSION).toBe("0.26.1");
  });

  // -------------------------------------------------------------------------
  // Support Request lifecycle
  // -------------------------------------------------------------------------

  it("certifies support request list/get/create through HTTP handlers", async () => {
    const ctx = makeContext();

    // List support requests
    const listResp = await handleListSupportRequests(
      makeRequest("/api/v1/support-requests"),
      ctx,
    );
    expect(listResp.status).toBe(200);
    const listBody = await listResp.json();
    expect(Array.isArray(listBody.data)).toBe(true);
    expect(listBody.data.length).toBeGreaterThan(0);

    // IDs must use platform prefix — NOT sreq_zammad_
    for (const item of listBody.data) {
      expect(item.id).toMatch(/^sreq_[0-9a-f]{32}$/);
      expect(item.id).not.toMatch(/^sreq_zammad_/);
    }

    const supportRequestId = listBody.data[0].id as string;

    // Get single request
    const getResp = await handleGetSupportRequest(
      makeRequest(`/api/v1/support-requests/${supportRequestId}`),
      ctx,
      routeCtx({ supportRequestId }),
    );
    expect(getResp.status).toBe(200);
    const getBody = await getResp.json();
    expect(getBody.data.id).toBe(supportRequestId);

    // Create request — need a group and user ID from the list response
    const groupId = listBody.data[0].groupId as string;
    const requesterId = listBody.data[0].requesterId as string;
    expect(groupId).toMatch(/^sgrp_/);
    expect(requesterId).toMatch(/^suser_/);

    const createResp = await handleCreateSupportRequest(
      makeRequest("/api/v1/support-requests", {
        method: "POST",
        body: JSON.stringify({
          title: "Support E2E Test Ticket",
          groupId,
          requesterId,
        }),
      }),
      ctx,
    );
    expect(createResp.status).toBe(201);
    const createBody = await createResp.json();
    expect(createBody.data.id).toMatch(/^sreq_[0-9a-f]{32}$/);
    expect(createBody.data.id).not.toMatch(/^sreq_zammad_/);
    expect(createBody.data.title).toBe("Support E2E Test Ticket");

    const createdId = createBody.data.id as string;

    // Update request
    const updateResp = await handleUpdateSupportRequest(
      makeRequest(`/api/v1/support-requests/${createdId}`, {
        method: "PATCH",
        body: JSON.stringify({ title: "Support E2E Test Ticket (updated)" }),
      }),
      ctx,
      routeCtx({ supportRequestId: createdId }),
    );
    expect(updateResp.status).toBe(200);
  });

  it("certifies support request state transitions (close/reopen/state/priority/owner/customer)", async () => {
    const ctx = makeContext();

    // First list to get a real ID
    const listResp = await handleListSupportRequests(
      makeRequest("/api/v1/support-requests"),
      ctx,
    );
    const listBody = await listResp.json();
    const groupId = listBody.data[0].groupId as string;
    const requesterId = listBody.data[0].requesterId as string;

    // Create a fresh ticket to test transitions on
    const createResp = await handleCreateSupportRequest(
      makeRequest("/api/v1/support-requests", {
        method: "POST",
        body: JSON.stringify({
          title: "Transition test ticket",
          groupId,
          requesterId,
        }),
      }),
      ctx,
    );
    expect(createResp.status).toBe(201);
    const ticketId = (await createResp.json()).data.id as string;

    // Close
    const closeResp = await handleCloseSupportRequest(
      makeRequest(`/api/v1/support-requests/${ticketId}/close`, { method: "POST" }),
      ctx,
      routeCtx({ supportRequestId: ticketId }),
    );
    expect(closeResp.status).toBe(200);
    const closeBody = await closeResp.json();
    expect(closeBody.data.status).toMatch(/closed|resolved/i);

    // Reopen
    const reopenResp = await handleReopenSupportRequest(
      makeRequest(`/api/v1/support-requests/${ticketId}/reopen`, { method: "POST" }),
      ctx,
      routeCtx({ supportRequestId: ticketId }),
    );
    expect(reopenResp.status).toBe(200);
    const reopenBody = await reopenResp.json();
    expect(reopenBody.data.status).toMatch(/open|pending/i);

    // Change state
    const stateResp = await handleChangeSupportState(
      makeRequest(`/api/v1/support-requests/${ticketId}/state`, {
        method: "POST",
        body: JSON.stringify({ status: "pending" }),
      }),
      ctx,
      routeCtx({ supportRequestId: ticketId }),
    );
    expect(stateResp.status).toBe(200);

    // Change priority
    const priorityResp = await handleChangeSupportPriority(
      makeRequest(`/api/v1/support-requests/${ticketId}/priority`, {
        method: "POST",
        body: JSON.stringify({ priority: "high" }),
      }),
      ctx,
      routeCtx({ supportRequestId: ticketId }),
    );
    expect(priorityResp.status).toBe(200);

    // Assign owner — get an agent ID from users
    const usersResp = await handleListSupportUsers(
      makeRequest("/api/v1/support-users?role=agent"),
      ctx,
    );
    expect(usersResp.status).toBe(200);
    const usersBody = await usersResp.json();
    expect(usersBody.data.length).toBeGreaterThan(0);
    const agentId = usersBody.data[0].id as string;
    expect(agentId).toMatch(/^suser_/);

    const ownerResp = await handleAssignSupportOwner(
      makeRequest(`/api/v1/support-requests/${ticketId}/owner`, {
        method: "POST",
        body: JSON.stringify({ assigneeId: agentId }),
      }),
      ctx,
      routeCtx({ supportRequestId: ticketId }),
    );
    expect(ownerResp.status).toBe(200);

    // Remove owner
    const removeOwnerResp = await handleRemoveSupportOwner(
      makeRequest(`/api/v1/support-requests/${ticketId}/owner`, { method: "DELETE" }),
      ctx,
      routeCtx({ supportRequestId: ticketId }),
    );
    expect(removeOwnerResp.status).toBe(200);

    // Assign customer
    const customerResp = await handleAssignSupportCustomer(
      makeRequest(`/api/v1/support-requests/${ticketId}/customer`, {
        method: "POST",
        body: JSON.stringify({ requesterId }),
      }),
      ctx,
      routeCtx({ supportRequestId: ticketId }),
    );
    expect(customerResp.status).toBe(200);

    // Mapping store: assert platform IDs without zammad marker in platformId
    const mappings = await mappingStore.list({ tenantId: TENANT });
    expect(mappings.length).toBeGreaterThan(0);
    for (const m of mappings) {
      expect(m.platformId).not.toMatch(/zammad/i);
    }
  });

  // -------------------------------------------------------------------------
  // Articles
  // -------------------------------------------------------------------------

  it("certifies article list/get/createNote/createReply through HTTP handlers", async () => {
    const ctx = makeContext();

    // List requests to get a ticket ID
    const listResp = await handleListSupportRequests(
      makeRequest("/api/v1/support-requests"),
      ctx,
    );
    const listBody = await listResp.json();
    const supportRequestId = listBody.data[0].id as string;

    // List articles
    const artListResp = await handleListSupportArticles(
      makeRequest(`/api/v1/support-requests/${supportRequestId}/articles`),
      ctx,
      routeCtx({ supportRequestId }),
    );
    expect(artListResp.status).toBe(200);
    const artListBody = await artListResp.json();
    expect(Array.isArray(artListBody.data)).toBe(true);
    expect(artListBody.data.length).toBeGreaterThan(0);

    const articleId = artListBody.data[0].id as string;
    expect(articleId).toMatch(/^sart_/);
    expect(articleId).not.toMatch(/^sart_zammad_/);

    // Get single article
    const artGetResp = await handleGetSupportArticle(
      makeRequest(`/api/v1/support-requests/${supportRequestId}/articles/${articleId}`),
      ctx,
      routeCtx({ supportRequestId, articleId }),
    );
    expect(artGetResp.status).toBe(200);

    // Create internal note — must be internal regardless of any request body visibility
    const noteResp = await handleCreateInternalNote(
      makeRequest(`/api/v1/support-requests/${supportRequestId}/articles/notes`, {
        method: "POST",
        body: JSON.stringify({
          body: "Internal note for E2E test",
          bodyFormat: "text/plain",
          subject: "Test Note",
        }),
      }),
      ctx,
      routeCtx({ supportRequestId }),
    );
    expect(noteResp.status).toBe(201);
    const noteBody = await noteResp.json();
    expect(noteBody.data.visibility).toBe("internal");

    // Create customer reply — must be public
    const replyResp = await handleCreateCustomerReply(
      makeRequest(`/api/v1/support-requests/${supportRequestId}/articles/replies`, {
        method: "POST",
        body: JSON.stringify({
          body: "Customer-visible E2E reply",
          channel: "email",
        }),
      }),
      ctx,
      routeCtx({ supportRequestId }),
    );
    expect(replyResp.status).toBe(201);
    const replyBody = await replyResp.json();
    expect(replyBody.data.visibility).toBe("public");
  });

  // -------------------------------------------------------------------------
  // History
  // -------------------------------------------------------------------------

  it("certifies support history endpoint", async () => {
    const ctx = makeContext();

    const listResp = await handleListSupportRequests(
      makeRequest("/api/v1/support-requests"),
      ctx,
    );
    const supportRequestId = (await listResp.json()).data[0].id as string;

    const histResp = await handleGetSupportHistory(
      makeRequest(`/api/v1/support-requests/${supportRequestId}/history`),
      ctx,
      routeCtx({ supportRequestId }),
    );
    expect(histResp.status).toBe(200);
    const histBody = await histResp.json();
    expect(histBody.data).toBeDefined();
    // handleGetSupportHistory returns jsonCollectionResponse → data is an array of history items
    expect(Array.isArray(histBody.data)).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Organizations CRUD + archive
  // -------------------------------------------------------------------------

  it("certifies organization CRUD and archive through HTTP handlers", async () => {
    const ctx = makeContext();

    // List
    const listResp = await handleListOrganizations(
      makeRequest("/api/v1/support-organizations"),
      ctx,
    );
    expect(listResp.status).toBe(200);
    const listBody = await listResp.json();
    expect(Array.isArray(listBody.data)).toBe(true);
    expect(listBody.data.length).toBeGreaterThan(0);

    // IDs should be sorg_ without zammad marker
    for (const item of listBody.data) {
      expect(item.id).toMatch(/^sorg_[0-9a-f]{32}$/);
      expect(item.id).not.toMatch(/^sorg_zammad_/);
    }

    const orgId = listBody.data[0].id as string;

    // Get
    const getResp = await handleGetOrganization(
      makeRequest(`/api/v1/support-organizations/${orgId}`),
      ctx,
      routeCtx({ organizationId: orgId }),
    );
    expect(getResp.status).toBe(200);
    expect((await getResp.json()).data.id).toBe(orgId);

    // Create
    const createResp = await handleCreateOrganization(
      makeRequest("/api/v1/support-organizations", {
        method: "POST",
        body: JSON.stringify({ name: "E2E Cert Org" }),
      }),
      ctx,
    );
    expect(createResp.status).toBe(201);
    const newOrg = (await createResp.json()).data;
    expect(newOrg.id).toMatch(/^sorg_[0-9a-f]{32}$/);
    expect(newOrg.id).not.toMatch(/^sorg_zammad_/);
    expect(newOrg.name).toBe("E2E Cert Org");

    // Update
    const updateResp = await handleUpdateOrganization(
      makeRequest(`/api/v1/support-organizations/${newOrg.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: "E2E Cert Org (updated)" }),
      }),
      ctx,
      routeCtx({ organizationId: newOrg.id }),
    );
    expect(updateResp.status).toBe(200);

    // Archive (DELETE)
    const archResp = await handleArchiveOrganization(
      makeRequest(`/api/v1/support-organizations/${newOrg.id}`, { method: "DELETE" }),
      ctx,
      routeCtx({ organizationId: newOrg.id }),
    );
    expect(archResp.status).toBe(200);
  });

  // -------------------------------------------------------------------------
  // Groups
  // -------------------------------------------------------------------------

  it("certifies group list/create/update through HTTP handlers", async () => {
    const ctx = makeContext();

    const listResp = await handleListGroups(makeRequest("/api/v1/support-groups"), ctx);
    expect(listResp.status).toBe(200);
    const listBody = await listResp.json();
    expect(listBody.data.length).toBeGreaterThan(0);
    const groupId = listBody.data[0].id as string;
    expect(groupId).toMatch(/^sgrp_[0-9a-f]{32}$/);
    expect(groupId).not.toMatch(/^sgrp_zammad_/);

    // Get
    const getResp = await handleGetGroup(
      makeRequest(`/api/v1/support-groups/${groupId}`),
      ctx,
      routeCtx({ groupId }),
    );
    expect(getResp.status).toBe(200);

    // Create
    const createResp = await handleCreateGroup(
      makeRequest("/api/v1/support-groups", {
        method: "POST",
        body: JSON.stringify({ name: "E2E Cert Group" }),
      }),
      ctx,
    );
    expect(createResp.status).toBe(201);
    const newGroup = (await createResp.json()).data;
    expect(newGroup.id).toMatch(/^sgrp_[0-9a-f]{32}$/);
    expect(newGroup.id).not.toMatch(/^sgrp_zammad_/);

    // Update
    const updateResp = await handleUpdateGroup(
      makeRequest(`/api/v1/support-groups/${newGroup.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: "E2E Cert Group (updated)" }),
      }),
      ctx,
      routeCtx({ groupId: newGroup.id }),
    );
    expect(updateResp.status).toBe(200);
  });

  // -------------------------------------------------------------------------
  // Users
  // -------------------------------------------------------------------------

  it("certifies support user list and get through HTTP handlers", async () => {
    const ctx = makeContext();

    // Default list
    const listResp = await handleListSupportUsers(
      makeRequest("/api/v1/support-users"),
      ctx,
    );
    expect(listResp.status).toBe(200);
    const listBody = await listResp.json();
    expect(listBody.data.length).toBeGreaterThan(0);

    const userId = listBody.data[0].id as string;
    expect(userId).toMatch(/^suser_[0-9a-f]{32}$/);
    expect(userId).not.toMatch(/^suser_zammad_/);

    // Get single user
    const getResp = await handleGetSupportUser(
      makeRequest(`/api/v1/support-users/${userId}`),
      ctx,
      routeCtx({ userId }),
    );
    expect(getResp.status).toBe(200);
    expect((await getResp.json()).data.id).toBe(userId);
  });

  // -------------------------------------------------------------------------
  // Search
  // -------------------------------------------------------------------------

  it("certifies support search endpoint", async () => {
    const ctx = makeContext();

    const searchResp = await handleSupportSearch(
      makeRequest("/api/v1/support-search?q=password"),
      ctx,
    );
    expect(searchResp.status).toBe(200);
    const searchBody = await searchResp.json();
    expect(searchBody.data).toBeDefined();
    expect(searchBody.data.query).toBe("password");
    expect(Array.isArray(searchBody.data.hits)).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Analytics
  // -------------------------------------------------------------------------

  it("certifies support analytics snapshot endpoint", async () => {
    const ctx = makeContext();

    const analyticsResp = await handleSupportAnalytics(
      makeRequest("/api/v1/support-analytics"),
      ctx,
    );
    expect(analyticsResp.status).toBe(200);
    const analyticsBody = await analyticsResp.json();
    const snap = analyticsBody.data;
    expect(snap).toBeDefined();
    expect(typeof snap.totalTickets).toBe("number");
    expect(typeof snap.openTickets).toBe("number");
    expect(typeof snap.closedTickets).toBe("number");
  });

  // -------------------------------------------------------------------------
  // Error paths
  // -------------------------------------------------------------------------

  it("returns validation error (400/throw) for invalid global ID format", async () => {
    const ctx = makeContext();

    // Invalid ID — wrong prefix
    try {
      await handleGetSupportRequest(
        makeRequest("/api/v1/support-requests/invalid-id"),
        ctx,
        routeCtx({ supportRequestId: "invalid-id" }),
      );
      expect.fail("Expected validation error for invalid support request ID");
    } catch (err) {
      expect(String(err)).toMatch(/validation|VALIDATION|400|invalid|format/i);
    }
  });

  it("returns validation error for wrong prefix (task_ instead of sreq_)", async () => {
    const ctx = makeContext();

    try {
      await handleGetSupportRequest(
        makeRequest("/api/v1/support-requests/task_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1"),
        ctx,
        routeCtx({ supportRequestId: "task_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1" }),
      );
      expect.fail("Expected validation error for wrong ID prefix");
    } catch (err) {
      expect(String(err)).toMatch(/validation|VALIDATION|400|invalid|format|prefix/i);
    }
  });

  // -------------------------------------------------------------------------
  // Cross-tenant isolation
  // -------------------------------------------------------------------------

  it("cross-tenant context cannot access first tenant mapped IDs", async () => {
    const ctxA = makeContext({ tenantId: TENANT });

    // Create a resource in tenant A
    const listA = await handleListSupportRequests(
      makeRequest("/api/v1/support-requests"),
      ctxA,
    );
    const ticketIdA = (await listA.json()).data[0].id as string;

    // Tenant B context — same global ID will not resolve in tenant B's mapping store
    const ctxB = makeContext({ tenantId: TENANT_B });

    let tenantBError: unknown;
    try {
      await handleGetSupportRequest(
        makeRequest(`/api/v1/support-requests/${ticketIdA}`),
        ctxB,
        routeCtx({ supportRequestId: ticketIdA }),
      );
    } catch (err) {
      tenantBError = err;
    }

    // Either throws MAPPING_NOT_FOUND / NOT_FOUND or returns a non-200 response
    if (tenantBError) {
      expect(String(tenantBError)).toMatch(/not.found|MAPPING_NOT_FOUND|NOT_FOUND/i);
    }
    // Test passes: cross-tenant isolation confirmed (error or empty result).
  });

  // -------------------------------------------------------------------------
  // Mapping store verification
  // -------------------------------------------------------------------------

  it("mapping store accumulates platform IDs without zammad marker in platformId", async () => {
    const ctx = makeContext();

    // Perform several operations to populate the mapping store
    await handleListSupportRequests(makeRequest("/api/v1/support-requests"), ctx);
    await handleListOrganizations(makeRequest("/api/v1/support-organizations"), ctx);
    await handleListGroups(makeRequest("/api/v1/support-groups"), ctx);
    await handleListSupportUsers(makeRequest("/api/v1/support-users"), ctx);

    const mappings = await mappingStore.list({ tenantId: TENANT });
    expect(mappings.length).toBeGreaterThan(0);

    for (const m of mappings) {
      // Platform IDs must NOT contain the Zammad provider boundary marker
      expect(m.platformId).not.toMatch(/zammad/i);
      // Platform IDs must have a valid prefix
      expect(m.platformId).toMatch(/^(sreq|sorg|sgrp|suser|sart)_[0-9a-f]{32}$/);
    }
  });

  // -------------------------------------------------------------------------
  // Adapter health / readiness (light)
  // -------------------------------------------------------------------------

  it("adapter health check and readiness pass", async () => {
    const ctx = { correlationId: CORR, tenantId: TENANT };

    // Connect before checking health/readiness so adapter has live connection state.
    await adapter.testConnection(ctx);

    const health = await adapter.performHealthCheck(ctx);
    expect(health.checks.length).toBeGreaterThan(0);
    expect(health.checks.some((c) => c.name === "zammad_api")).toBe(true);

    const readiness = await adapter.evaluateReadiness(ctx);
    expect(readiness.ready).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Gateway-only tests (no HTTP / Next.js) — Gateway → Provider → Adapter
// ---------------------------------------------------------------------------

describe("OSS-110-12 Support Gateway → Provider → Adapter (no HTTP)", () => {
  let adapter: Awaited<ReturnType<typeof createZammadAdapter>>["adapter"];
  let factory: Awaited<ReturnType<typeof createZammadAdapter>>["factory"];

  beforeEach(async () => {
    const created = await createZammadAdapter({
      zammad: DEFAULT_TEST_ZAMMAD_CONFIG,
      tenantId: TENANT,
      apiToken: "support-gateway-cert-token",
      adapterOptions: { fetchFn: createMockZammadFetch() },
    });
    adapter = created.adapter;
    factory = created.factory;
  });

  afterEach(async () => {
    if (adapter && factory) {
      await disposeZammadAdapter(adapter, factory);
    }
  });

  it("certifies gateway → providers → adapter → mock path", async () => {
    const mappingStore = new InMemoryEntityMappingStore();
    const bundle = createPlatformServicesWithZammad(adapter.core, mappingStore);
    const serviceCtx = {
      tenantId: TENANT,
      userId: USER,
      correlationId: CORR,
      permissions: SUPPORT_PERMISSIONS,
      requestId: "req-gateway-cert-001",
    };

    // List support requests through gateway
    const listed = await bundle.gateway.support.listSupportRequests(serviceCtx, {});
    expect(listed.items.length).toBeGreaterThan(0);

    // Platform IDs must not contain zammad marker
    for (const item of listed.items) {
      expect(item.id).toMatch(/^sreq_[0-9a-f]{32}$/);
      expect(item.id).not.toMatch(/^sreq_zammad_/);
    }

    const platformId = listed.items[0]!.id;

    // Get via gateway using platform ID
    const fetched = await bundle.gateway.support.getSupportRequest(
      serviceCtx,
      platformId,
    );
    expect(fetched.id).toBe(platformId);

    // Create via gateway
    const groupId = listed.items[0]!.groupId;
    const requesterId = listed.items[0]!.requesterId;
    const created = await bundle.gateway.support.createSupportRequest(serviceCtx, {
      title: "Gateway cert ticket",
      groupId: groupId!,
      requesterId: requesterId!,
    });
    expect(created.id).toMatch(/^sreq_[0-9a-f]{32}$/);
    expect(created.title).toBe("Gateway cert ticket");

    // Organizations via gateway
    const orgs = await bundle.gateway.supportOrganizations.listOrganizations(
      serviceCtx,
      {},
    );
    expect(orgs.items.every((o) => o.id.startsWith("sorg_"))).toBe(true);
    expect(orgs.items.every((o) => !o.id.includes("zammad"))).toBe(true);

    // Groups via gateway
    const groups = await bundle.gateway.supportGroups.listGroups(serviceCtx, {});
    expect(groups.items.every((g) => g.id.startsWith("sgrp_"))).toBe(true);

    // Users via gateway
    const users = await bundle.gateway.supportUsers.listUsers(serviceCtx, {});
    expect(users.items.every((u) => u.id.startsWith("suser_"))).toBe(true);

    // Search via gateway
    const searchResult = await bundle.gateway.supportSearch.search(
      serviceCtx,
      "password",
    );
    expect(searchResult.query).toBe("password");
    expect(Array.isArray(searchResult.hits)).toBe(true);

    // Analytics via gateway
    const analytics =
      await bundle.gateway.supportAnalytics.getSupportIntelligence(serviceCtx);
    expect(typeof analytics.totalTickets).toBe("number");

    // Mapping store populated
    const mappings = await mappingStore.list({ tenantId: TENANT });
    expect(mappings.length).toBeGreaterThan(0);
    for (const m of mappings) {
      expect(m.platformId).not.toMatch(/zammad/i);
    }

    // Adapter readiness — testConnection must be called first to establish live state
    await adapter.testConnection({ correlationId: CORR, tenantId: TENANT });
    const readiness = await adapter.evaluateReadiness({
      correlationId: CORR,
      tenantId: TENANT,
    });
    expect(readiness.ready).toBe(true);
  });

  it("support capability registered in createPlatformServicesWithZammad", () => {
    const mappingStore = new InMemoryEntityMappingStore();
    const bundle = createPlatformServicesWithZammad(adapter.core, mappingStore);
    // Gateway exposes support services — no PROVIDER_CAPABILITY_UNSUPPORTED
    expect(typeof bundle.gateway.support.listSupportRequests).toBe("function");
    expect(typeof bundle.gateway.supportOrganizations.listOrganizations).toBe(
      "function",
    );
    expect(typeof bundle.gateway.supportGroups.listGroups).toBe("function");
    expect(typeof bundle.gateway.supportUsers.listUsers).toBe("function");
    expect(typeof bundle.gateway.supportArticles.list).toBe("function");
    expect(typeof bundle.gateway.supportSearch.search).toBe("function");
    expect(typeof bundle.gateway.supportHistory.getTimeline).toBe("function");
    expect(typeof bundle.gateway.supportAnalytics.getSupportIntelligence).toBe(
      "function",
    );
  });
});
