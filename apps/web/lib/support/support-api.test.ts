import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SupportApiError } from "./errors";
import { clearSupportQueries, supportQueryKeys } from "./query-keys";
import {
  archiveSupportOrganization,
  assignSupportRequestOwner,
  changeSupportRequestCustomer,
  changeSupportRequestPriority,
  changeSupportRequestState,
  closeSupportRequest,
  createCustomerReply,
  createInternalNote,
  createSupportGroup,
  createSupportOrganization,
  createSupportRequest,
  getSupportAnalytics,
  getSupportArticle,
  getSupportGroup,
  getSupportOrganization,
  getSupportRequest,
  getSupportUser,
  listSupportArticles,
  listSupportGroups,
  listSupportHistory,
  listSupportOrganizations,
  listSupportRequests,
  listSupportUsers,
  removeSupportRequestOwner,
  reopenSupportRequest,
  searchSupport,
  supportApi,
  updateSupportGroup,
  updateSupportOrganization,
  updateSupportRequest,
} from "./support-api";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function emptyMeta() {
  return { requestId: "r1", correlationId: "c1" };
}

function sampleRequest(overrides: Record<string, unknown> = {}) {
  return {
    id: "sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    tenantId: "t1",
    title: "Help",
    groupId: "sgrp_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    requesterId: "suser_cccccccccccccccccccccccccccccccc",
    status: "open",
    priority: "normal",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    ...overrides,
  };
}

function sampleArticle(overrides: Record<string, unknown> = {}) {
  return {
    id: "sart_dddddddddddddddddddddddddddddddd",
    tenantId: "t1",
    supportTicketId: "sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    body: "note",
    bodyFormat: "text/plain",
    channel: "note",
    visibility: "internal",
    senderType: "agent",
    author: { senderType: "agent" },
    deliveryStatus: "none",
    attachments: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function sampleOrg(overrides: Record<string, unknown> = {}) {
  return {
    id: "sorg_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    tenantId: "t1",
    name: "Acme",
    domain: "acme.test",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    ...overrides,
  };
}

function sampleGroup(overrides: Record<string, unknown> = {}) {
  return {
    id: "sgrp_ffffffffffffffffffffffffffffffff",
    tenantId: "t1",
    name: "Tier 1",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    ...overrides,
  };
}

function sampleUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "suser_11111111111111111111111111111111",
    tenantId: "t1",
    displayName: "Pat Agent",
    email: "pat@example.com",
    login: "pat",
    role: "agent",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    ...overrides,
  };
}

function mockOk(data: unknown, page?: unknown) {
  globalThis.fetch = vi
    .fn()
    .mockImplementation(() =>
      Promise.resolve(
        jsonResponse(
          page ? { data, page, meta: emptyMeta() } : { data, meta: emptyMeta() },
        ),
      ),
    ) as typeof fetch;
  return globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
}

describe("support-api", () => {
  it("parses collection envelopes and builds pagination query", async () => {
    const fetchMock = mockOk([sampleRequest()], {
      cursor: null,
      nextCursor: null,
      limit: 20,
      hasMore: false,
    });

    const result = await listSupportRequests({
      page: 2,
      perPage: 10,
      status: "open",
      search: "vpn",
      priority: "high",
      customerId: "c1",
      requesterId: "r1",
      ownerId: "o1",
      assigneeId: "a1",
      organizationId: "org1",
      groupId: "g1",
      limit: 10,
      cursor: "cur",
      sort: "updatedAt",
      order: "desc",
    });

    expect(result.data).toHaveLength(1);
    expect(result.page.hasMore).toBe(false);
    expect(result.meta.correlationId).toBe("c1");
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("/api/v1/support-requests?");
    expect(String(url)).toContain("page=2");
    expect(String(url)).toContain("perPage=10");
    expect(String(url)).toContain("status=open");
    expect(String(url)).toContain("search=vpn");
    expect(String(url)).toContain("priority=high");
    expect(String(url)).toContain("order=desc");
    expect(init?.credentials).toBe("include");
  });

  it("skips empty/null query params and serializes booleans and arrays", async () => {
    const fetchMock = mockOk([], {
      cursor: null,
      nextCursor: null,
      limit: 20,
      hasMore: false,
    });

    await listSupportOrganizations({
      search: "",
      active: true,
      cursor: undefined,
    });
    await searchSupport({
      q: "x",
      kinds: ["support_request", "user"],
      organizationId: "org",
      groupId: "g",
      supportRequestId: "sreq",
      query: "alt",
    });

    expect(String(fetchMock.mock.calls[0]![0])).toContain("active=true");
    expect(String(fetchMock.mock.calls[0]![0])).not.toContain("search=");
    expect(String(fetchMock.mock.calls[1]![0])).toContain(
      "kinds=support_request%2Cuser",
    );
  });

  it("parses single-resource envelopes", async () => {
    mockOk(sampleRequest({ priority: "high" }));
    const result = await getSupportRequest("sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    expect(result.data.title).toBe("Help");
    expect(result.meta.requestId).toBe("r1");
  });

  it("covers request create/update/close/reopen/state/priority/owner/customer", async () => {
    const fetchMock = mockOk(sampleRequest());

    await createSupportRequest({
      title: "New",
      groupId: "sgrp_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      requesterId: "suser_cccccccccccccccccccccccccccccccc",
    });
    await updateSupportRequest("sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", {
      title: "Updated",
    });
    await closeSupportRequest("sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    await reopenSupportRequest("sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    await changeSupportRequestState("sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "pending");
    await changeSupportRequestPriority(
      "sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "urgent",
    );
    await assignSupportRequestOwner(
      "sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "suser_11111111111111111111111111111111",
    );
    await removeSupportRequestOwner("sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    await changeSupportRequestCustomer(
      "sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "suser_22222222222222222222222222222222",
    );

    const urls = fetchMock.mock.calls.map((call) => String(call[0]));
    expect(urls[0]).toBe("/api/v1/support-requests");
    expect(fetchMock.mock.calls[0]![1]?.method).toBe("POST");
    expect(urls[1]).toContain("/support-requests/sreq_");
    expect(fetchMock.mock.calls[1]![1]?.method).toBe("PATCH");
    expect(urls[2]).toContain("/close");
    expect(urls[3]).toContain("/reopen");
    expect(urls[4]).toContain("/state");
    expect(JSON.parse(String(fetchMock.mock.calls[4]![1]?.body))).toEqual({
      status: "pending",
    });
    expect(urls[5]).toContain("/priority");
    expect(urls[6]).toContain("/owner");
    expect(fetchMock.mock.calls[6]![1]?.method).toBe("POST");
    expect(urls[7]).toContain("/owner");
    expect(fetchMock.mock.calls[7]![1]?.method).toBe("DELETE");
    expect(urls[8]).toContain("/customer");
  });

  it("covers articles, notes, replies, and history", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          data: [sampleArticle()],
          page: { cursor: null, nextCursor: null, limit: 50, hasMore: false },
          meta: emptyMeta(),
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ data: sampleArticle(), meta: emptyMeta() }))
      .mockResolvedValueOnce(jsonResponse({ data: sampleArticle(), meta: emptyMeta() }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: sampleArticle({ channel: "email", visibility: "public" }),
          meta: emptyMeta(),
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: [
            {
              id: "shist_1",
              supportTicketId: "sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
              action: "updated",
              summary: "Priority changed",
              actor: { kind: "agent", displayName: "Pat" },
              occurredAt: "2026-01-01T00:00:00.000Z",
            },
          ],
          page: { cursor: null, nextCursor: null, limit: 50, hasMore: false },
          meta: emptyMeta(),
        }),
      );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const id = "sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    await listSupportArticles(id, { limit: 10, page: 1 });
    await getSupportArticle(id, "sart_dddddddddddddddddddddddddddddddd");
    await createInternalNote(id, { body: "secret" });
    await createCustomerReply(id, { body: "hello", channel: "email" });
    await listSupportHistory(id, {
      occurredAfter: "2026-01-01",
      occurredBefore: "2026-02-01",
    });

    expect(String(fetchMock.mock.calls[0]![0])).toContain("/articles?");
    expect(String(fetchMock.mock.calls[1]![0])).toContain("/articles/sart_");
    expect(String(fetchMock.mock.calls[2]![0])).toContain("/articles/notes");
    expect(String(fetchMock.mock.calls[3]![0])).toContain("/articles/replies");
    expect(String(fetchMock.mock.calls[4]![0])).toContain("/history?");
    expect(String(fetchMock.mock.calls[4]![0])).toContain("occurredAfter=2026-01-01");
  });

  it("covers organizations, groups, users, analytics", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          data: [sampleOrg()],
          page: { cursor: null, nextCursor: null, limit: 20, hasMore: false },
          meta: emptyMeta(),
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ data: sampleOrg(), meta: emptyMeta() }))
      .mockResolvedValueOnce(jsonResponse({ data: sampleOrg(), meta: emptyMeta() }))
      .mockResolvedValueOnce(
        jsonResponse({ data: sampleOrg({ name: "Renamed" }), meta: emptyMeta() }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ data: sampleOrg({ active: false }), meta: emptyMeta() }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: [sampleGroup()],
          page: { cursor: null, nextCursor: null, limit: 20, hasMore: false },
          meta: emptyMeta(),
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ data: sampleGroup(), meta: emptyMeta() }))
      .mockResolvedValueOnce(jsonResponse({ data: sampleGroup(), meta: emptyMeta() }))
      .mockResolvedValueOnce(
        jsonResponse({ data: sampleGroup({ name: "Tier 2" }), meta: emptyMeta() }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: [sampleUser()],
          page: { cursor: null, nextCursor: null, limit: 20, hasMore: false },
          meta: emptyMeta(),
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ data: sampleUser(), meta: emptyMeta() }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            capturedAt: "2026-01-01T00:00:00.000Z",
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
          },
          meta: emptyMeta(),
        }),
      );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await listSupportOrganizations({ search: "acme", active: false });
    await getSupportOrganization("sorg_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
    await createSupportOrganization({ name: "Acme", domain: "acme.test" });
    await updateSupportOrganization("sorg_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", {
      name: "Renamed",
    });
    await archiveSupportOrganization("sorg_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
    await listSupportGroups({ search: "tier", active: true });
    await getSupportGroup("sgrp_ffffffffffffffffffffffffffffffff");
    await createSupportGroup({ name: "Tier 1", note: "queue" });
    await updateSupportGroup("sgrp_ffffffffffffffffffffffffffffffff", {
      name: "Tier 2",
    });
    await listSupportUsers({
      search: "pat",
      email: "pat@example.com",
      login: "pat",
      active: true,
      role: "agent",
    });
    await getSupportUser("suser_11111111111111111111111111111111");
    await getSupportAnalytics();

    const urls = fetchMock.mock.calls.map((call) => String(call[0]));
    expect(urls[0]).toContain("/support-organizations?");
    expect(urls[0]).toContain("active=false");
    expect(urls[4]).toContain("/support-organizations/sorg_");
    expect(fetchMock.mock.calls[4]![1]?.method).toBe("DELETE");
    expect(urls[5]).toContain("/support-groups?");
    expect(urls[9]).toContain("/support-users?");
    expect(urls[9]).toContain("email=pat");
    expect(urls[11]).toBe("/api/v1/support-analytics");
    expect(Object.keys(supportApi)).not.toContain("createSupportUser");
    expect(Object.keys(supportApi)).not.toContain("deleteSupportUser");
  });

  it("maps controlled HTTP errors without provider leakage", async () => {
    const cases: Array<{ status: number; code: string; message: string }> = [
      { status: 401, code: "UNAUTHORIZED", message: "zammad auth failed" },
      { status: 403, code: "FORBIDDEN", message: "zammad upstream denied" },
      { status: 404, code: "NOT_FOUND", message: "ticket missing in provider" },
      { status: 409, code: "CONFLICT", message: "adapter conflict" },
      { status: 503, code: "UNAVAILABLE", message: "provider timeout" },
    ];

    for (const testCase of cases) {
      globalThis.fetch = vi.fn().mockResolvedValue(
        jsonResponse(
          {
            error: { code: testCase.code, message: testCase.message },
            meta: { requestId: "r-err", correlationId: "c-err" },
          },
          testCase.status,
        ),
      ) as typeof fetch;

      try {
        await listSupportRequests();
        expect.unreachable("should throw");
      } catch (error) {
        expect(error).toBeInstanceOf(SupportApiError);
        const apiError = error as SupportApiError;
        expect(apiError.code).toBe(testCase.code);
        expect(apiError.status).toBe(testCase.status);
        expect(apiError.message.toLowerCase()).not.toContain("zammad");
        expect(apiError.message.toLowerCase()).not.toContain("provider");
        expect(apiError.message.toLowerCase()).not.toContain("adapter");
      }
    }
  });

  it("handles non-JSON error bodies and abort signals", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response("not-json", {
        status: 500,
        headers: { "content-type": "text/plain" },
      }),
    ) as typeof fetch;

    await expect(
      getSupportRequest("sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
    ).rejects.toMatchObject({
      name: "SupportApiError",
      status: 500,
      code: "UNKNOWN",
    });

    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ data: sampleArticle(), meta: emptyMeta() }));
    globalThis.fetch = fetchMock as typeof fetch;
    const controller = new AbortController();

    await createInternalNote(
      "sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      { body: "secret note" },
      { signal: controller.signal, correlationId: "corr-1" },
    );

    const [, init] = fetchMock.mock.calls[0]!;
    expect(init?.signal).toBe(controller.signal);
    expect(new Headers(init?.headers).get("x-correlation-id")).toBe("corr-1");
  });

  it("forwards active=false boolean query for users list", async () => {
    const fetchMock = mockOk([], {
      cursor: null,
      nextCursor: null,
      limit: 20,
      hasMore: false,
    });
    await listSupportUsers({ active: false });
    expect(String(fetchMock.mock.calls[0]![0])).toContain("active=false");
  });

  it("exposes only /api/v1 paths — no provider IDs in client surface", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const source = readFileSync(
      join(process.cwd(), "apps/web/lib/support/support-api.ts"),
      "utf8",
    );
    expect(source).toContain("/api/v1");
    expect(source.toLowerCase()).not.toContain("zammad");
    expect(source).not.toContain("EntityMappingStore");
    expect(source).not.toContain("@apzhub/integration-zammad");
    expect(source).not.toMatch(/\bproviderId\b/);
    expect(source).not.toMatch(/\bnativeId\b/);
  });

  it("clearSupportQueries removes support root keys", () => {
    const client = new QueryClient();
    client.setQueryData(supportQueryKeys.analytics(), { ok: true });
    clearSupportQueries(client);
    expect(client.getQueryData(supportQueryKeys.analytics())).toBeUndefined();
  });
});
