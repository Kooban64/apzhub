import { type Page, type Route } from "@playwright/test";

import { DEV_EMAIL, DEV_PASSWORD, signInDevUser } from "./auth-helpers";

export { DEV_EMAIL, DEV_PASSWORD };

export const REQUEST_ID = "sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
export const ARTICLE_ID = "sart_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
export const NOTE_ID = "sart_cccccccccccccccccccccccccccccccc";
export const REPLY_ID = "sart_dddddddddddddddddddddddddddddddd";
export const GROUP_ID = "sgrp_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
export const USER_ID = "suser_ffffffffffffffffffffffffffffffff";
export const ORG_ID = "sorg_11111111111111111111111111111111";
export const CREATED_REQUEST_ID = "sreq_22222222222222222222222222222222";

export function meta() {
  return { requestId: "req_e2e", correlationId: "corr_e2e" };
}

export function pageEnvelope() {
  return { cursor: null, nextCursor: null, limit: 20, hasMore: false };
}

export function supportRequest(overrides: Record<string, unknown> = {}) {
  return {
    id: REQUEST_ID,
    tenantId: "tenant_e2e",
    displayId: "10042",
    title: "VPN cannot connect",
    groupId: GROUP_ID,
    organizationId: ORG_ID,
    requesterId: USER_ID,
    assigneeId: USER_ID,
    status: "open",
    priority: "high",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    ...overrides,
  };
}

export function supportOrganization(overrides: Record<string, unknown> = {}) {
  return {
    id: ORG_ID,
    tenantId: "tenant_e2e",
    name: "Acme Corp",
    domain: "acme.example",
    active: true,
    note: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export function supportGroup(overrides: Record<string, unknown> = {}) {
  return {
    id: GROUP_ID,
    tenantId: "tenant_e2e",
    name: "Support Desk",
    active: true,
    note: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export function supportUser(overrides: Record<string, unknown> = {}) {
  return {
    id: USER_ID,
    tenantId: "tenant_e2e",
    displayName: "Pat Customer",
    email: "pat@example.com",
    login: "pat",
    active: true,
    role: "customer",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export async function signIn(page: Page) {
  // RG-AUTH-SHELL-RESIDUAL: shared API-first DEV session (no per-suite UI register races).
  await signInDevUser(page);
}

export type MockSupportApiOptions = {
  /** Extra request IDs that should return a protected 404 (cross-tenant denial). */
  readonly protectedNotFoundIds?: readonly string[];
};

/**
 * Mock all Support UI API routes used by OSS-110-13/14 certification.
 * Does not require a live Zammad provider.
 */
export async function mockSupportApi(page: Page, options: MockSupportApiOptions = {}) {
  const protectedIds = new Set(options.protectedNotFoundIds ?? []);
  let current = supportRequest();
  const byId = new Map<string, Record<string, unknown>>([[REQUEST_ID, current]]);
  const articlesByRequest = new Map<string, Record<string, unknown>[]>([
    [
      REQUEST_ID,
      [
        {
          id: ARTICLE_ID,
          tenantId: "tenant_e2e",
          supportTicketId: REQUEST_ID,
          body: "Initial customer message",
          bodyFormat: "text/plain",
          channel: "email",
          visibility: "public",
          senderType: "customer",
          author: { senderType: "customer", displayName: "Pat" },
          deliveryStatus: "sent",
          attachments: [],
          createdAt: "2026-01-01T01:00:00.000Z",
          updatedAt: "2026-01-01T01:00:00.000Z",
        },
      ],
    ],
  ]);

  function articlesFor(id: string) {
    let list = articlesByRequest.get(id);
    if (!list) {
      list = [];
      articlesByRequest.set(id, list);
    }
    return list;
  }

  await page.route("**/api/v1/support-**", async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    if (path === "/api/v1/support-requests" && method === "GET") {
      const status = url.searchParams.get("status");
      const search = (url.searchParams.get("search") ?? "").toLowerCase();
      const items = [...byId.values()].filter((item) => {
        const itemStatus = String(item.status ?? "");
        const itemTitle = String(item.title ?? "").toLowerCase();
        if (status && status !== itemStatus) return false;
        if (search && !itemTitle.includes(search)) return false;
        return true;
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: items, page: pageEnvelope(), meta: meta() }),
      });
      return;
    }

    if (path === "/api/v1/support-requests" && method === "POST") {
      const body = (request.postDataJSON() ?? {}) as Record<string, unknown>;
      const created = supportRequest({
        id: CREATED_REQUEST_ID,
        displayId: "10099",
        title: String(body.title ?? "Created request"),
        groupId: String(body.groupId ?? GROUP_ID),
        requesterId: String(body.requesterId ?? USER_ID),
        organizationId: body.organizationId ? String(body.organizationId) : ORG_ID,
        assigneeId: body.assigneeId ? String(body.assigneeId) : null,
        status: String(body.status ?? "new"),
        priority: String(body.priority ?? "normal"),
        createdAt: "2026-01-03T00:00:00.000Z",
        updatedAt: "2026-01-03T00:00:00.000Z",
      });
      byId.set(CREATED_REQUEST_ID, created);
      articlesFor(CREATED_REQUEST_ID);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: created, meta: meta() }),
      });
      return;
    }

    const requestMatch = path.match(/^\/api\/v1\/support-requests\/([^/]+)(.*)$/);
    if (requestMatch) {
      const id = requestMatch[1]!;
      const rest = requestMatch[2] ?? "";

      if (protectedIds.has(id) && method === "GET" && rest === "") {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({
            error: {
              code: "NOT_FOUND",
              message: "Cross-tenant ticket lookup blocked by zammad provider",
            },
            meta: meta(),
          }),
        });
        return;
      }

      if (rest === "" && method === "GET") {
        const item = byId.get(id) ?? (id === REQUEST_ID ? current : undefined);
        if (!item) {
          await route.fulfill({
            status: 404,
            contentType: "application/json",
            body: JSON.stringify({
              error: { code: "NOT_FOUND", message: "Support request not found." },
              meta: meta(),
            }),
          });
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: item, meta: meta() }),
        });
        return;
      }

      if (rest === "/articles" && method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: articlesFor(id),
            page: pageEnvelope(),
            meta: meta(),
          }),
        });
        return;
      }

      if (rest === "/history" && method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: [
              {
                id: "shist_11111111111111111111111111111111",
                supportTicketId: id,
                action: "created",
                summary: "Request created",
                actor: { kind: "system" },
                occurredAt: "2026-01-01T00:00:00.000Z",
              },
            ],
            page: pageEnvelope(),
            meta: meta(),
          }),
        });
        return;
      }

      if (rest === "/articles/notes" && method === "POST") {
        const body = request.postDataJSON() as { body: string };
        const note = {
          id: NOTE_ID,
          tenantId: "tenant_e2e",
          supportTicketId: id,
          body: body.body,
          bodyFormat: "text/plain",
          channel: "note",
          visibility: "internal",
          senderType: "agent",
          author: { senderType: "agent", displayName: "Agent" },
          deliveryStatus: "none",
          attachments: [],
          createdAt: "2026-01-02T03:00:00.000Z",
          updatedAt: "2026-01-02T03:00:00.000Z",
        };
        articlesFor(id).push(note);
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: note, meta: meta() }),
        });
        return;
      }

      if (rest === "/articles/replies" && method === "POST") {
        const body = request.postDataJSON() as { body: string; channel?: string };
        const reply = {
          id: REPLY_ID,
          tenantId: "tenant_e2e",
          supportTicketId: id,
          body: body.body,
          bodyFormat: "text/plain",
          channel: body.channel ?? "email",
          visibility: "public",
          senderType: "agent",
          author: { senderType: "agent", displayName: "Agent" },
          deliveryStatus: "pending",
          attachments: [],
          createdAt: "2026-01-02T04:00:00.000Z",
          updatedAt: "2026-01-02T04:00:00.000Z",
        };
        articlesFor(id).push(reply);
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: reply, meta: meta() }),
        });
        return;
      }

      if (rest === "/state" && method === "POST") {
        const body = request.postDataJSON() as { status: string };
        const existing = byId.get(id) ?? current;
        const next = supportRequest({ ...existing, status: body.status });
        byId.set(id, next);
        if (id === REQUEST_ID) current = next;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: next, meta: meta() }),
        });
        return;
      }

      if (rest === "/priority" && method === "POST") {
        const body = request.postDataJSON() as { priority: string };
        const existing = byId.get(id) ?? current;
        const next = supportRequest({ ...existing, priority: body.priority });
        byId.set(id, next);
        if (id === REQUEST_ID) current = next;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: next, meta: meta() }),
        });
        return;
      }

      if (rest === "/owner" && method === "POST") {
        const body = request.postDataJSON() as { assigneeId: string };
        const existing = byId.get(id) ?? current;
        const next = supportRequest({ ...existing, assigneeId: body.assigneeId });
        byId.set(id, next);
        if (id === REQUEST_ID) current = next;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: next, meta: meta() }),
        });
        return;
      }

      if (rest === "/close" && method === "POST") {
        const existing = byId.get(id) ?? current;
        const next = supportRequest({ ...existing, status: "closed" });
        byId.set(id, next);
        if (id === REQUEST_ID) current = next;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: next, meta: meta() }),
        });
        return;
      }

      if (rest === "/reopen" && method === "POST") {
        const existing = byId.get(id) ?? current;
        const next = supportRequest({ ...existing, status: "open" });
        byId.set(id, next);
        if (id === REQUEST_ID) current = next;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: next, meta: meta() }),
        });
        return;
      }
    }

    if (path === "/api/v1/support-search" && method === "GET") {
      const query = url.searchParams.get("q") ?? url.searchParams.get("query") ?? "";
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            query,
            hits: [
              {
                id: REQUEST_ID,
                kind: "support_request",
                title: current.title,
                snippet: "VPN",
              },
            ],
            totalCount: 1,
            page: 1,
            perPage: 30,
            hasNextPage: false,
          },
          meta: meta(),
        }),
      });
      return;
    }

    if (path === "/api/v1/support-analytics" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            capturedAt: "2026-01-02T00:00:00.000Z",
            totalTickets: 12,
            openTickets: 4,
            closedTickets: 6,
            pendingTickets: 2,
            newTickets: 1,
            overdueTickets: 3,
            unassignedTickets: 1,
            byPriority: [{ key: "high", label: "High", count: 4 }],
            byState: [{ key: "open", label: "Open", count: 4 }],
            byOrganization: [{ key: ORG_ID, label: "Acme Corp", count: 5 }],
            byGroup: [{ key: GROUP_ID, label: "Support Desk", count: 8 }],
            byOwner: [{ key: USER_ID, label: "Pat Customer", count: 2 }],
          },
          meta: meta(),
        }),
      });
      return;
    }

    if (path.startsWith("/api/v1/support-users") && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [supportUser()],
          page: pageEnvelope(),
          meta: meta(),
        }),
      });
      return;
    }

    if (path.startsWith("/api/v1/support-groups") && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [supportGroup()],
          page: pageEnvelope(),
          meta: meta(),
        }),
      });
      return;
    }

    if (path.startsWith("/api/v1/support-organizations") && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [supportOrganization()],
          page: pageEnvelope(),
          meta: meta(),
        }),
      });
      return;
    }

    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({
        error: { code: "NOT_FOUND", message: `Unhandled mock ${method} ${path}` },
        meta: meta(),
      }),
    });
  });
}
