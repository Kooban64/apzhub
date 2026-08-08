/**
 * Platform Support HTTP API v1 tests (OSS-110-11).
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import type { PlatformApiRequestContext } from "./auth/with-platform-api-auth";
import { mapPlatformErrorToHttpStatus } from "./errors";
import { resetPlatformApiGatewayBootstrap } from "./gateway/bootstrap";
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
  handleDownloadSupportAttachment,
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
} from "./handlers/support";
import { loadPlatformOpenApiSpecObject } from "./openapi";
import { parseQuery } from "./schemas/common";
import {
  supportRequestListQuerySchema,
  createSupportRequestBodySchema,
} from "./schemas/support";
import { parseJsonBody } from "./schemas/common";
import {
  API_TEST_TENANT_B,
  API_TEST_SREQ_ID,
  API_TEST_SORG_ID,
  API_TEST_SGRP_ID,
  API_TEST_SUSER_ID,
  API_TEST_SART_ID,
  API_TEST_SATT_ID,
  buildMockSession,
  buildTestServiceContext,
  installMockGateway,
} from "./testing/fixtures";

vi.mock("@apzhub/auth/server", () => ({
  getValidatedSession: vi.fn(),
}));

import { getValidatedSession } from "@apzhub/auth/server";

function makeRequest(
  url: string,
  init?: { method?: string; body?: string; headers?: Record<string, string> },
): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3300"), {
    method: init?.method ?? "GET",
    body: init?.body,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

function makeContext(
  overrides: Partial<PlatformApiRequestContext["serviceContext"]> = {},
): PlatformApiRequestContext {
  const session = buildMockSession() as unknown as PlatformApiRequestContext["session"];
  const tracing = {
    requestId: "req-test-0001",
    correlationId: "corr-test-0001",
    timestamp: "2026-07-10T00:00:00.000Z",
  };
  return {
    tracing,
    session,
    serviceContext: buildTestServiceContext({
      // SUP-PR-05 — handler gate requires session grants; gateway still mocked separately.
      permissions: ["support.*"],
      ...overrides,
    }),
  };
}

describe("OSS-110-11 Support HTTP API", () => {
  beforeEach(() => {
    resetPlatformApiGatewayBootstrap();
    vi.mocked(getValidatedSession).mockResolvedValue(buildMockSession() as never);
  });

  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Support Request CRUD
  // ---------------------------------------------------------------------------

  describe("Support Requests CRUD", () => {
    it("lists support requests with filters", async () => {
      const calls: string[] = [];
      installMockGateway({ onCall: (s, o) => calls.push(`${s}.${o}`) });

      const response = await handleListSupportRequests(
        makeRequest(
          `/api/v1/support-requests?status=open&priority=high&search=login&ownerId=${API_TEST_SUSER_ID}`,
        ),
        makeContext(),
      );
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data[0].id).toBe(API_TEST_SREQ_ID);
      expect(body.data[0].id.startsWith("sreq_")).toBe(true);
      expect(calls).toContain("support.listSupportRequests");
    });

    it("creates a support request (201)", async () => {
      installMockGateway();
      const response = await handleCreateSupportRequest(
        makeRequest("/api/v1/support-requests", {
          method: "POST",
          body: JSON.stringify({
            title: "Cannot access dashboard",
            groupId: API_TEST_SGRP_ID,
            requesterId: API_TEST_SUSER_ID,
          }),
        }),
        makeContext(),
      );
      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body.data.title).toBe("Cannot access dashboard");
    });

    it("gets a support request by id", async () => {
      installMockGateway();
      const response = await handleGetSupportRequest(
        makeRequest(`/api/v1/support-requests/${API_TEST_SREQ_ID}`),
        makeContext(),
        { params: Promise.resolve({ supportRequestId: API_TEST_SREQ_ID }) },
      );
      expect(response.status).toBe(200);
      expect((await response.json()).data.id).toBe(API_TEST_SREQ_ID);
    });

    it("updates a support request", async () => {
      installMockGateway();
      const response = await handleUpdateSupportRequest(
        makeRequest(`/api/v1/support-requests/${API_TEST_SREQ_ID}`, {
          method: "PATCH",
          body: JSON.stringify({ title: "Updated title" }),
        }),
        makeContext(),
        { params: Promise.resolve({ supportRequestId: API_TEST_SREQ_ID }) },
      );
      expect(response.status).toBe(200);
    });

    it("closes (soft) a support request via DELETE/close handler", async () => {
      installMockGateway();
      const response = await handleCloseSupportRequest(
        makeRequest(`/api/v1/support-requests/${API_TEST_SREQ_ID}`, {
          method: "DELETE",
        }),
        makeContext(),
        { params: Promise.resolve({ supportRequestId: API_TEST_SREQ_ID }) },
      );
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data.status).toBe("closed");
      expect(body.data.closedAt).toBeTruthy();
    });

    it("reopens a support request", async () => {
      installMockGateway();
      const response = await handleReopenSupportRequest(
        makeRequest(`/api/v1/support-requests/${API_TEST_SREQ_ID}/reopen`, {
          method: "POST",
        }),
        makeContext(),
        { params: Promise.resolve({ supportRequestId: API_TEST_SREQ_ID }) },
      );
      expect(response.status).toBe(200);
      expect((await response.json()).data.status).toBe("open");
    });
  });

  // ---------------------------------------------------------------------------
  // State / Priority / Assignment commands
  // ---------------------------------------------------------------------------

  describe("State, priority, assignment commands", () => {
    it("changes state via /state endpoint", async () => {
      const calls: string[] = [];
      installMockGateway({ onCall: (s, o) => calls.push(`${s}.${o}`) });
      const response = await handleChangeSupportState(
        makeRequest(`/api/v1/support-requests/${API_TEST_SREQ_ID}/state`, {
          method: "POST",
          body: JSON.stringify({ status: "pending" }),
        }),
        makeContext(),
        { params: Promise.resolve({ supportRequestId: API_TEST_SREQ_ID }) },
      );
      expect(response.status).toBe(200);
      expect((await response.json()).data.status).toBe("pending");
      expect(calls).toContain("support.changeSupportRequestState");
    });

    it("changes priority", async () => {
      installMockGateway();
      const response = await handleChangeSupportPriority(
        makeRequest(`/api/v1/support-requests/${API_TEST_SREQ_ID}/priority`, {
          method: "POST",
          body: JSON.stringify({ priority: "urgent" }),
        }),
        makeContext(),
        { params: Promise.resolve({ supportRequestId: API_TEST_SREQ_ID }) },
      );
      expect(response.status).toBe(200);
      expect((await response.json()).data.priority).toBe("urgent");
    });

    it("assigns owner (POST) and removes owner (DELETE)", async () => {
      installMockGateway();
      const assigned = await handleAssignSupportOwner(
        makeRequest(`/api/v1/support-requests/${API_TEST_SREQ_ID}/owner`, {
          method: "POST",
          body: JSON.stringify({ assigneeId: API_TEST_SUSER_ID }),
        }),
        makeContext(),
        { params: Promise.resolve({ supportRequestId: API_TEST_SREQ_ID }) },
      );
      expect(assigned.status).toBe(200);
      expect((await assigned.json()).data.assigneeId).toBe(API_TEST_SUSER_ID);

      const removed = await handleRemoveSupportOwner(
        makeRequest(`/api/v1/support-requests/${API_TEST_SREQ_ID}/owner`, {
          method: "DELETE",
        }),
        makeContext(),
        { params: Promise.resolve({ supportRequestId: API_TEST_SREQ_ID }) },
      );
      expect(removed.status).toBe(200);
      expect((await removed.json()).data.assigneeId).toBeUndefined();
    });

    it("assigns customer via requesterId (POST /customer)", async () => {
      const calls: string[] = [];
      installMockGateway({ onCall: (s, o) => calls.push(`${s}.${o}`) });
      const response = await handleAssignSupportCustomer(
        makeRequest(`/api/v1/support-requests/${API_TEST_SREQ_ID}/customer`, {
          method: "POST",
          body: JSON.stringify({ requesterId: API_TEST_SUSER_ID }),
        }),
        makeContext(),
        { params: Promise.resolve({ supportRequestId: API_TEST_SREQ_ID }) },
      );
      expect(response.status).toBe(200);
      // uses updateSupportRequest, not a dedicated assign method
      expect(calls).toContain("support.updateSupportRequest");
    });

    it("assigns customer via customerId alias", async () => {
      installMockGateway();
      const response = await handleAssignSupportCustomer(
        makeRequest(`/api/v1/support-requests/${API_TEST_SREQ_ID}/customer`, {
          method: "POST",
          body: JSON.stringify({ customerId: API_TEST_SUSER_ID }),
        }),
        makeContext(),
        { params: Promise.resolve({ supportRequestId: API_TEST_SREQ_ID }) },
      );
      expect(response.status).toBe(200);
    });
  });

  // ---------------------------------------------------------------------------
  // Articles: note vs reply visibility
  // ---------------------------------------------------------------------------

  describe("Articles — note and reply visibility", () => {
    it("creates internal note with visibility=internal (channel=note)", async () => {
      const calls: string[] = [];
      installMockGateway({ onCall: (s, o) => calls.push(`${s}.${o}`) });
      const response = await handleCreateInternalNote(
        makeRequest(`/api/v1/support-requests/${API_TEST_SREQ_ID}/articles/notes`, {
          method: "POST",
          body: JSON.stringify({ body: "Internal comment for agent eyes only." }),
        }),
        makeContext(),
        { params: Promise.resolve({ supportRequestId: API_TEST_SREQ_ID }) },
      );
      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body.data.channel).toBe("note");
      expect(body.data.visibility).toBe("internal");
      expect(calls).toContain("supportArticles.createNote");
    });

    it("note schema rejects unknown keys (visibility override attempt)", async () => {
      installMockGateway();
      await expect(
        parseJsonBody(
          makeRequest("/api/v1/support-requests/x/articles/notes", {
            method: "POST",
            body: JSON.stringify({ body: "Note", visibility: "public" }),
          }),
          (await import("./schemas/support")).createInternalNoteBodySchema,
          64_000,
        ),
      ).rejects.toMatchObject({ status: 400 });
    });

    it("creates customer reply with channel=email (public visibility)", async () => {
      const calls: string[] = [];
      installMockGateway({ onCall: (s, o) => calls.push(`${s}.${o}`) });
      const response = await handleCreateCustomerReply(
        makeRequest(`/api/v1/support-requests/${API_TEST_SREQ_ID}/articles/replies`, {
          method: "POST",
          body: JSON.stringify({ body: "Thank you!", channel: "email" }),
        }),
        makeContext(),
        { params: Promise.resolve({ supportRequestId: API_TEST_SREQ_ID }) },
      );
      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body.data.channel).toBe("email");
      expect(body.data.visibility).toBe("public");
      expect(calls).toContain("supportArticles.createReply");
    });

    it("reply schema rejects channel=note (note channel is internal-only)", async () => {
      installMockGateway();
      await expect(
        parseJsonBody(
          makeRequest("/api/v1/support-requests/x/articles/replies", {
            method: "POST",
            body: JSON.stringify({ body: "Reply", channel: "note" }),
          }),
          (await import("./schemas/support")).createCustomerReplyBodySchema,
          64_000,
        ),
      ).rejects.toMatchObject({ status: 400 });
    });

    it("lists articles for a support request", async () => {
      installMockGateway();
      const response = await handleListSupportArticles(
        makeRequest(`/api/v1/support-requests/${API_TEST_SREQ_ID}/articles`),
        makeContext(),
        { params: Promise.resolve({ supportRequestId: API_TEST_SREQ_ID }) },
      );
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data[0].supportTicketId).toBe(API_TEST_SREQ_ID);
    });

    it("gets a specific article", async () => {
      installMockGateway();
      const response = await handleGetSupportArticle(
        makeRequest(
          `/api/v1/support-requests/${API_TEST_SREQ_ID}/articles/${API_TEST_SART_ID}`,
        ),
        makeContext(),
        {
          params: Promise.resolve({
            supportRequestId: API_TEST_SREQ_ID,
            articleId: API_TEST_SART_ID,
          }),
        },
      );
      expect(response.status).toBe(200);
      expect((await response.json()).data.id).toBe(API_TEST_SART_ID);
    });

    it("downloads a binary attachment", async () => {
      const calls: string[] = [];
      installMockGateway({ onCall: (s, o) => calls.push(`${s}.${o}`) });
      const response = await handleDownloadSupportAttachment(
        makeRequest(
          `/api/v1/support-requests/${API_TEST_SREQ_ID}/articles/${API_TEST_SART_ID}/attachments/${API_TEST_SATT_ID}`,
        ),
        makeContext(),
        {
          params: Promise.resolve({
            supportRequestId: API_TEST_SREQ_ID,
            articleId: API_TEST_SART_ID,
            attachmentId: API_TEST_SATT_ID,
          }),
        },
      );
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data.id).toBe(API_TEST_SATT_ID);
      expect(body.data.dataBase64).toBe("aGVsbG8=");
      expect(calls).toContain("supportArticles.downloadAttachment");
    });
  });

  // ---------------------------------------------------------------------------
  // Organizations
  // ---------------------------------------------------------------------------

  describe("Organizations", () => {
    it("lists organizations", async () => {
      installMockGateway();
      const response = await handleListOrganizations(
        makeRequest("/api/v1/support-organizations"),
        makeContext(),
      );
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data[0].id.startsWith("sorg_")).toBe(true);
    });

    it("creates, gets, updates, archives organization", async () => {
      installMockGateway();

      const created = await handleCreateOrganization(
        makeRequest("/api/v1/support-organizations", {
          method: "POST",
          body: JSON.stringify({ name: "TechCorp" }),
        }),
        makeContext(),
      );
      expect(created.status).toBe(201);

      const got = await handleGetOrganization(
        makeRequest(`/api/v1/support-organizations/${API_TEST_SORG_ID}`),
        makeContext(),
        { params: Promise.resolve({ organizationId: API_TEST_SORG_ID }) },
      );
      expect(got.status).toBe(200);

      const updated = await handleUpdateOrganization(
        makeRequest(`/api/v1/support-organizations/${API_TEST_SORG_ID}`, {
          method: "PATCH",
          body: JSON.stringify({ name: "TechCorp Updated" }),
        }),
        makeContext(),
        { params: Promise.resolve({ organizationId: API_TEST_SORG_ID }) },
      );
      expect(updated.status).toBe(200);

      const archived = await handleArchiveOrganization(
        makeRequest(`/api/v1/support-organizations/${API_TEST_SORG_ID}`, {
          method: "DELETE",
        }),
        makeContext(),
        { params: Promise.resolve({ organizationId: API_TEST_SORG_ID }) },
      );
      expect(archived.status).toBe(200);
      expect((await archived.json()).data.active).toBe(false);
    });

    it("denies cross-tenant access for organization", async () => {
      installMockGateway();
      await expect(
        handleGetOrganization(
          makeRequest(`/api/v1/support-organizations/${API_TEST_SORG_ID}`),
          makeContext({ tenantId: API_TEST_TENANT_B }),
          { params: Promise.resolve({ organizationId: API_TEST_SORG_ID }) },
        ),
      ).rejects.toMatchObject({ code: "MAPPING_NOT_FOUND" });
    });
  });

  // ---------------------------------------------------------------------------
  // Groups
  // ---------------------------------------------------------------------------

  describe("Groups", () => {
    it("lists, creates, gets, and updates a group", async () => {
      installMockGateway();

      const list = await handleListGroups(
        makeRequest("/api/v1/support-groups"),
        makeContext(),
      );
      expect(list.status).toBe(200);
      expect((await list.json()).data[0].id.startsWith("sgrp_")).toBe(true);

      const created = await handleCreateGroup(
        makeRequest("/api/v1/support-groups", {
          method: "POST",
          body: JSON.stringify({ name: "Tier 2 Support" }),
        }),
        makeContext(),
      );
      expect(created.status).toBe(201);

      const got = await handleGetGroup(
        makeRequest(`/api/v1/support-groups/${API_TEST_SGRP_ID}`),
        makeContext(),
        { params: Promise.resolve({ groupId: API_TEST_SGRP_ID }) },
      );
      expect(got.status).toBe(200);

      const updated = await handleUpdateGroup(
        makeRequest(`/api/v1/support-groups/${API_TEST_SGRP_ID}`, {
          method: "PATCH",
          body: JSON.stringify({ active: false }),
        }),
        makeContext(),
        { params: Promise.resolve({ groupId: API_TEST_SGRP_ID }) },
      );
      expect(updated.status).toBe(200);
    });
  });

  // ---------------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------------

  describe("Users — list / lookup / search", () => {
    it("lists support users", async () => {
      installMockGateway();
      const response = await handleListSupportUsers(
        makeRequest("/api/v1/support-users"),
        makeContext(),
      );
      expect(response.status).toBe(200);
      expect((await response.json()).data[0].id.startsWith("suser_")).toBe(true);
    });

    it("lookups user by email", async () => {
      installMockGateway();
      const response = await handleListSupportUsers(
        makeRequest("/api/v1/support-users?email=agent@example.com"),
        makeContext(),
      );
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data.length).toBeGreaterThanOrEqual(1);
    });

    it("searches users by text", async () => {
      const calls: string[] = [];
      installMockGateway({ onCall: (s, o) => calls.push(`${s}.${o}`) });
      const response = await handleListSupportUsers(
        makeRequest("/api/v1/support-users?search=agent"),
        makeContext(),
      );
      expect(response.status).toBe(200);
      expect(calls).toContain("supportUsers.search");
    });

    it("gets user by id", async () => {
      installMockGateway();
      const response = await handleGetSupportUser(
        makeRequest(`/api/v1/support-users/${API_TEST_SUSER_ID}`),
        makeContext(),
        { params: Promise.resolve({ userId: API_TEST_SUSER_ID }) },
      );
      expect(response.status).toBe(200);
      expect((await response.json()).data.id).toBe(API_TEST_SUSER_ID);
    });

    it("denies cross-tenant access for support user", async () => {
      installMockGateway();
      await expect(
        handleGetSupportUser(
          makeRequest(`/api/v1/support-users/${API_TEST_SUSER_ID}`),
          makeContext({ tenantId: API_TEST_TENANT_B }),
          { params: Promise.resolve({ userId: API_TEST_SUSER_ID }) },
        ),
      ).rejects.toMatchObject({ code: "MAPPING_NOT_FOUND" });
    });
  });

  // ---------------------------------------------------------------------------
  // Search
  // ---------------------------------------------------------------------------

  describe("Support Search", () => {
    it("performs support search and returns hits", async () => {
      const calls: string[] = [];
      installMockGateway({ onCall: (s, o) => calls.push(`${s}.${o}`) });
      const response = await handleSupportSearch(
        makeRequest("/api/v1/support-search?q=login+issue"),
        makeContext(),
      );
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data.query).toBe("login issue");
      expect(calls).toContain("supportSearch.search");
    });

    it("search accepts query alias", async () => {
      installMockGateway();
      const response = await handleSupportSearch(
        makeRequest("/api/v1/support-search?query=network"),
        makeContext(),
      );
      expect(response.status).toBe(200);
    });

    it("search rejects missing q/query", async () => {
      const { supportSearchQuerySchema } = await import("./schemas/support");
      expect(() =>
        parseQuery(supportSearchQuerySchema, new URLSearchParams()),
      ).toThrow();
    });

    it("search rejects unknown kind", async () => {
      const { supportSearchQuerySchema } = await import("./schemas/support");
      expect(() =>
        parseQuery(
          supportSearchQuerySchema,
          new URLSearchParams("q=test&kinds=tickets"),
        ),
      ).toThrow();
    });

    it("search rejects unknown query keys", async () => {
      const { supportSearchQuerySchema } = await import("./schemas/support");
      expect(() =>
        parseQuery(
          supportSearchQuerySchema,
          new URLSearchParams("q=test&unknownKey=x"),
        ),
      ).toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // History
  // ---------------------------------------------------------------------------

  describe("Support History", () => {
    it("lists history events for a support request", async () => {
      installMockGateway();
      const response = await handleGetSupportHistory(
        makeRequest(`/api/v1/support-requests/${API_TEST_SREQ_ID}/history`),
        makeContext(),
        { params: Promise.resolve({ supportRequestId: API_TEST_SREQ_ID }) },
      );
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Analytics
  // ---------------------------------------------------------------------------

  describe("Support Analytics", () => {
    it("returns intelligence snapshot", async () => {
      const calls: string[] = [];
      installMockGateway({ onCall: (s, o) => calls.push(`${s}.${o}`) });
      const response = await handleSupportAnalytics(
        makeRequest("/api/v1/support-analytics"),
        makeContext(),
      );
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data.totalTickets).toBeDefined();
      expect(body.data.byPriority).toBeDefined();
      expect(calls).toContain("supportAnalytics.getSupportIntelligence");
    });
  });

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  describe("Validation", () => {
    it("rejects create body missing required fields", async () => {
      installMockGateway();
      await expect(
        parseJsonBody(
          makeRequest("/api/v1/support-requests", {
            method: "POST",
            body: JSON.stringify({ title: "Missing group and requester" }),
          }),
          createSupportRequestBodySchema,
          64_000,
        ),
      ).rejects.toMatchObject({ status: 400 });
    });

    it("rejects update body with no fields", async () => {
      installMockGateway();
      await expect(
        parseJsonBody(
          makeRequest(`/api/v1/support-requests/${API_TEST_SREQ_ID}`, {
            method: "PATCH",
            body: JSON.stringify({}),
          }),
          (await import("./schemas/support")).updateSupportRequestBodySchema,
          64_000,
        ),
      ).rejects.toMatchObject({ status: 400 });
    });

    it("rejects invalid supportRequestId path param", async () => {
      installMockGateway();
      await expect(
        handleGetSupportRequest(
          makeRequest("/api/v1/support-requests/not-a-sreq"),
          makeContext(),
          { params: Promise.resolve({ supportRequestId: "not-a-sreq" }) },
        ),
      ).rejects.toMatchObject({ status: 400 });
    });

    it("rejects unknown query params in list query (strict schema)", () => {
      expect(() =>
        parseQuery(
          supportRequestListQuerySchema,
          new URLSearchParams({ stateId: "sreq_aaa" }),
        ),
      ).toThrow();
    });

    it("rejects assignCustomer body without requesterId or customerId", async () => {
      installMockGateway();
      await expect(
        parseJsonBody(
          makeRequest("/api/v1/support-requests/x/customer", {
            method: "POST",
            body: JSON.stringify({}),
          }),
          (await import("./schemas/support")).assignSupportCustomerBodySchema,
          64_000,
        ),
      ).rejects.toMatchObject({ status: 400 });
    });
  });

  // ---------------------------------------------------------------------------
  // Authorization and tenancy
  // ---------------------------------------------------------------------------

  describe("Authorization and tenancy", () => {
    it("SUP-PR-05 denies at handler gate when session permissions empty", async () => {
      installMockGateway();
      await expect(
        handleListSupportRequests(
          makeRequest("/api/v1/support-requests"),
          makeContext({ permissions: [] }),
        ),
      ).rejects.toMatchObject({ status: 403, body: { code: "FORBIDDEN" } });
    });

    it("surfaces permission denial from gateway", async () => {
      installMockGateway({
        support: {
          getSupportRequest: async (ctx) => {
            throw new PlatformServiceError({
              category: "authorization",
              code: "PERMISSION_DENIED",
              message: "Missing support.requests.read",
              correlationId: ctx.correlationId,
              retryable: false,
            });
          },
        },
      });
      await expect(
        handleGetSupportRequest(
          makeRequest(`/api/v1/support-requests/${API_TEST_SREQ_ID}`),
          makeContext(),
          { params: Promise.resolve({ supportRequestId: API_TEST_SREQ_ID }) },
        ),
      ).rejects.toMatchObject({ code: "PERMISSION_DENIED" });
    });

    it("denies cross-tenant access via MAPPING_NOT_FOUND", async () => {
      installMockGateway();
      await expect(
        handleGetSupportRequest(
          makeRequest(`/api/v1/support-requests/${API_TEST_SREQ_ID}`),
          makeContext({ tenantId: API_TEST_TENANT_B }),
          { params: Promise.resolve({ supportRequestId: API_TEST_SREQ_ID }) },
        ),
      ).rejects.toMatchObject({ code: "MAPPING_NOT_FOUND" });
    });

    it("returns 404 for unknown support request id", async () => {
      installMockGateway();
      const unknown = "sreq_99999999999999999999999999999999";
      await expect(
        handleGetSupportRequest(
          makeRequest(`/api/v1/support-requests/${unknown}`),
          makeContext(),
          { params: Promise.resolve({ supportRequestId: unknown }) },
        ),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });
  });

  // ---------------------------------------------------------------------------
  // Provider / reconciliation / system errors
  // ---------------------------------------------------------------------------

  describe("Provider and system errors", () => {
    it("maps reconciliation required to 409", () => {
      expect(
        mapPlatformErrorToHttpStatus(
          new PlatformServiceError({
            category: "conflict",
            code: "RECONCILIATION_REQUIRED",
            message: "reconcile",
            correlationId: "c",
            retryable: false,
          }),
        ),
      ).toBe(409);
    });

    it("surfaces 503 for provider unavailable", async () => {
      installMockGateway({
        support: {
          listSupportRequests: async (ctx) => {
            throw new PlatformServiceError({
              category: "integration",
              code: "PROVIDER_UNAVAILABLE",
              message: "Zammad down",
              correlationId: ctx.correlationId,
              retryable: true,
            });
          },
        },
      });
      await expect(
        handleListSupportRequests(
          makeRequest("/api/v1/support-requests"),
          makeContext(),
        ),
      ).rejects.toMatchObject({ code: "PROVIDER_UNAVAILABLE" });
      expect(
        mapPlatformErrorToHttpStatus(
          new PlatformServiceError({
            category: "integration",
            code: "PROVIDER_UNAVAILABLE",
            message: "Zammad down",
            correlationId: "c",
            retryable: true,
          }),
        ),
      ).toBe(503);
    });

    it("surfaces 501 for capability unsupported", async () => {
      expect(
        mapPlatformErrorToHttpStatus(
          new PlatformServiceError({
            category: "integration",
            code: "PROVIDER_CAPABILITY_UNSUPPORTED",
            message: "feature not available",
            correlationId: "c",
            retryable: false,
          }),
        ),
      ).toBe(501);
    });
  });

  // ---------------------------------------------------------------------------
  // OpenAPI and architecture boundary
  // ---------------------------------------------------------------------------

  describe("OpenAPI and architecture boundary", () => {
    it("documents all support-request paths in OpenAPI spec", () => {
      const spec = loadPlatformOpenApiSpecObject() as {
        paths: Record<string, unknown>;
      };
      expect(spec.paths["/support-requests"]).toBeTruthy();
      expect(spec.paths["/support-requests/{supportRequestId}"]).toBeTruthy();
      expect(spec.paths["/support-requests/{supportRequestId}/close"]).toBeTruthy();
      expect(spec.paths["/support-requests/{supportRequestId}/reopen"]).toBeTruthy();
      expect(spec.paths["/support-requests/{supportRequestId}/state"]).toBeTruthy();
      expect(spec.paths["/support-requests/{supportRequestId}/priority"]).toBeTruthy();
      expect(spec.paths["/support-requests/{supportRequestId}/owner"]).toBeTruthy();
      expect(spec.paths["/support-requests/{supportRequestId}/customer"]).toBeTruthy();
      expect(spec.paths["/support-requests/{supportRequestId}/articles"]).toBeTruthy();
      expect(
        spec.paths["/support-requests/{supportRequestId}/articles/notes"],
      ).toBeTruthy();
      expect(
        spec.paths["/support-requests/{supportRequestId}/articles/replies"],
      ).toBeTruthy();
      expect(
        spec.paths["/support-requests/{supportRequestId}/articles/{articleId}"],
      ).toBeTruthy();
      expect(
        spec.paths[
          "/support-requests/{supportRequestId}/articles/{articleId}/attachments/{attachmentId}"
        ],
      ).toBeTruthy();
      expect(spec.paths["/support-requests/{supportRequestId}/history"]).toBeTruthy();
      expect(spec.paths["/support-organizations"]).toBeTruthy();
      expect(spec.paths["/support-organizations/{organizationId}"]).toBeTruthy();
      expect(spec.paths["/support-groups"]).toBeTruthy();
      expect(spec.paths["/support-groups/{groupId}"]).toBeTruthy();
      expect(spec.paths["/support-users"]).toBeTruthy();
      expect(spec.paths["/support-users/{userId}"]).toBeTruthy();
      expect(spec.paths["/support-search"]).toBeTruthy();
      expect(spec.paths["/support-analytics"]).toBeTruthy();
    });

    it("handlers do not import Zammad adapter or zammad- prefixed providers", () => {
      const handlerSource = readFileSync(
        path.resolve(process.cwd(), "apps/web/lib/api/v1/handlers/support.ts"),
        "utf8",
      );
      expect(handlerSource.includes("@apzhub/integration-zammad")).toBe(false);
      expect(handlerSource.includes("zammad-")).toBe(false);
      expect(handlerSource.includes("requireSupportPermission")).toBe(true);
    });

    it("route files do not import Zammad adapter and use withPlatformApiAuth", () => {
      const routeFiles = [
        "apps/web/app/api/v1/support-requests/route.ts",
        "apps/web/app/api/v1/support-organizations/route.ts",
        "apps/web/app/api/v1/support-groups/route.ts",
        "apps/web/app/api/v1/support-users/route.ts",
        "apps/web/app/api/v1/support-search/route.ts",
        "apps/web/app/api/v1/support-analytics/route.ts",
      ];
      for (const routeFile of routeFiles) {
        const source = readFileSync(path.resolve(process.cwd(), routeFile), "utf8");
        expect(source.includes("@apzhub/integration-zammad")).toBe(false);
        expect(source.includes("withPlatformApiAuth")).toBe(true);
      }
    });

    it("OpenAPI spec does not expose zammad or ticket IDs in support paths", () => {
      const yaml = readFileSync(
        path.resolve(process.cwd(), "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
        "utf8",
      );
      // Spec should use sreq_ not zammad ticket IDs in support examples
      expect(yaml.includes("sreq_")).toBe(true);
      // Spec should not expose zammad-specific field names
      expect(yaml.includes("zammad_id")).toBe(false);
    });
  });
});
