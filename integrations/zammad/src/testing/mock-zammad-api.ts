import type { FetchFn } from "../internal/zammad-fetch-client";
import type {
  ZammadArticleRecord,
  ZammadGroupRecord,
  ZammadHistoryRecord,
  ZammadOrganizationRecord,
  ZammadTicketRecord,
  ZammadUserRecord,
  ZammadWebhookRecord,
} from "../internal/zammad-api-types";
import type { ZammadConfigurationInput } from "../zammad-config";
import {
  MOCK_AGENT,
  MOCK_ARTICLE_EMAIL,
  MOCK_ARTICLE_NOTE,
  MOCK_ARTICLE_SYSTEM,
  MOCK_CUSTOMER,
  MOCK_GROUP,
  MOCK_HISTORY,
  MOCK_ORGANIZATION,
  MOCK_TICKET,
  MOCK_TICKET_CLOSED,
  MOCK_WEBHOOK,
} from "./mock-zammad-core-data";

export const TEST_TENANT_ID = "tenant-zammad-1";
export const TEST_CORRELATION_ID = "corr-zammad-001";

export const DEFAULT_TEST_ZAMMAD_CONFIG: ZammadConfigurationInput = {
  baseUrl: "https://zammad.example.com",
  apiBaseUrl: "https://zammad.example.com",
  apiTokenRef: "zammad/api-token",
};

export interface MockZammadApiOptions {
  readonly engineVersion?: string;
  readonly edition?: "community" | "enterprise" | "unknown";
  readonly userId?: number;
  readonly userLogin?: string;
  readonly userEmail?: string;
  readonly failMe?: boolean;
  readonly meStatus?: number;
  readonly requireToken?: boolean;
  readonly delayMs?: number;
  readonly failTickets?: boolean;
  readonly ticketsStatus?: number;
  readonly failOrganizations?: boolean;
  readonly failGroups?: boolean;
  readonly failUsers?: boolean;
  readonly failArticles?: boolean;
  readonly articlesStatus?: number;
  readonly failSearch?: boolean;
  readonly searchStatus?: number;
  readonly failHistory?: boolean;
  readonly historyStatus?: number;
  readonly failWebhooks?: boolean;
  readonly webhooksStatus?: number;
  readonly rateLimitWebhooks?: boolean;
  readonly failSync?: boolean;
  readonly syncInterruptAfterCalls?: number;
  readonly malformedArticle?: boolean;
  readonly forceCreatedArticleInternal?: boolean | null;
  readonly seedTickets?: readonly ZammadTicketRecord[];
  readonly seedOrganizations?: readonly ZammadOrganizationRecord[];
  readonly seedGroups?: readonly ZammadGroupRecord[];
  readonly seedUsers?: readonly ZammadUserRecord[];
  readonly seedArticles?: readonly ZammadArticleRecord[];
  readonly seedHistory?: readonly ZammadHistoryRecord[];
  readonly seedWebhooks?: readonly ZammadWebhookRecord[];
}

interface MutableStore {
  tickets: ZammadTicketRecord[];
  organizations: ZammadOrganizationRecord[];
  groups: ZammadGroupRecord[];
  users: ZammadUserRecord[];
  articles: ZammadArticleRecord[];
  history: ZammadHistoryRecord[];
  webhooks: ZammadWebhookRecord[];
  nextTicketId: number;
  nextOrgId: number;
  nextGroupId: number;
  nextArticleId: number;
  nextAttachmentId: number;
  nextWebhookId: number;
  ticketListCalls: number;
}

/** Mock Zammad REST — Support core + search/history/analytics + sync/webhooks (OSS-102-06). */
export function createMockZammadFetch(options: MockZammadApiOptions = {}): FetchFn {
  const {
    engineVersion = "6.3.1",
    edition = "community",
    userId = 3,
    userLogin = "agent@example.com",
    userEmail = "agent@example.com",
    failMe = false,
    meStatus = failMe ? 503 : 200,
    requireToken = true,
    delayMs = 0,
    failTickets = false,
    ticketsStatus = failTickets ? 503 : 200,
    failOrganizations = false,
    failGroups = false,
    failUsers = false,
    failArticles = false,
    articlesStatus = failArticles ? 503 : 200,
    failSearch = false,
    searchStatus = failSearch ? 503 : 200,
    failHistory = false,
    historyStatus = failHistory ? 503 : 200,
    failWebhooks = false,
    webhooksStatus = failWebhooks ? 503 : 200,
    rateLimitWebhooks = false,
    failSync = false,
    syncInterruptAfterCalls,
    malformedArticle = false,
    forceCreatedArticleInternal = null,
  } = options;

  const store: MutableStore = {
    tickets: [
      ...(options.seedTickets ?? [MOCK_TICKET, MOCK_TICKET_CLOSED]).map((t) => ({ ...t })),
    ],
    organizations: [
      ...(options.seedOrganizations ?? [MOCK_ORGANIZATION]).map((o) => ({ ...o })),
    ],
    groups: [...(options.seedGroups ?? [MOCK_GROUP]).map((g) => ({ ...g }))],
    users: [
      ...(options.seedUsers ?? [MOCK_AGENT, MOCK_CUSTOMER]).map((u) => ({ ...u })),
    ],
    articles: [
      ...(
        options.seedArticles ?? [
          MOCK_ARTICLE_SYSTEM,
          MOCK_ARTICLE_EMAIL,
          MOCK_ARTICLE_NOTE,
        ]
      ).map((a) => ({
        ...a,
        attachments: a.attachments?.map((att) => ({ ...att })),
      })),
    ],
    history: [...(options.seedHistory ?? MOCK_HISTORY).map((h) => ({ ...h }))],
    webhooks: [...(options.seedWebhooks ?? [MOCK_WEBHOOK]).map((w) => ({ ...w }))],
    nextTicketId: 200,
    nextOrgId: 50,
    nextGroupId: 20,
    nextArticleId: 2000,
    nextAttachmentId: 6000,
    nextWebhookId: 100,
    ticketListCalls: 0,
  };

  return async (input: string, init?: RequestInit) => {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    const headers = normalizeHeaders(init?.headers);
    const authorization = headers.authorization ?? headers.Authorization;
    const tokenMatch = authorization?.match(/^Token\s+token=(.+)$/i);

    if (requireToken && !tokenMatch?.[1]) {
      return jsonError(401, "UNAUTHORIZED", "Missing API token");
    }

    const url = new URL(input);
    const path = url.pathname.replace(/\/+$/, "");
    const method = (init?.method ?? "GET").toUpperCase();
    const commonHeaders = {
      "Content-Type": "application/json",
      "X-Zammad-Version": engineVersion,
      "X-Zammad-Edition": edition,
    };

    if (path.endsWith("/api/v1/users/me")) {
      if (meStatus >= 400) {
        return new Response(
          JSON.stringify({
            error: meStatus === 401 ? "UNAUTHORIZED" : "VENDOR_UNAVAILABLE",
            message: "Zammad users/me unavailable",
          }),
          { status: meStatus, headers: commonHeaders },
        );
      }

      return new Response(
        JSON.stringify({
          id: userId,
          login: userLogin,
          email: userEmail,
          firstname: "Agent",
          lastname: "Example",
          active: true,
        }),
        { status: 200, headers: commonHeaders },
      );
    }

    // --- Tickets ---
    if (path.endsWith("/api/v1/tickets/search") && method === "GET") {
      if (searchStatus >= 400 || ticketsStatus >= 400) {
        return jsonError(
          searchStatus >= 400 ? searchStatus : ticketsStatus,
          searchStatus === 403 || ticketsStatus === 403
            ? "FORBIDDEN"
            : searchStatus === 401 || ticketsStatus === 401
              ? "UNAUTHORIZED"
              : "VENDOR_UNAVAILABLE",
          "Ticket search unavailable",
          commonHeaders,
        );
      }
      const query = (url.searchParams.get("query") ?? "").toLowerCase();
      const matched = store.tickets.filter((ticket) => {
        if (query.startsWith("number:")) {
          return String(ticket.number) === query.slice("number:".length);
        }
        return (
          ticket.title.toLowerCase().includes(query) ||
          String(ticket.number).includes(query)
        );
      });
      return paginatedJson(matched, url, commonHeaders);
    }

    if (path.endsWith("/api/v1/tickets") && method === "GET") {
      store.ticketListCalls += 1;
      if (
        failSync ||
        (typeof syncInterruptAfterCalls === "number" &&
          store.ticketListCalls > syncInterruptAfterCalls)
      ) {
        return jsonError(503, "SYNC_FAILED", "Sync interrupted", commonHeaders);
      }
      if (ticketsStatus >= 400) {
        return jsonError(
          ticketsStatus,
          ticketsStatus === 401 ? "UNAUTHORIZED" : "VENDOR_UNAVAILABLE",
          "Tickets unavailable",
          commonHeaders,
        );
      }
      return paginatedJson(store.tickets, url, commonHeaders);
    }

    if (path.endsWith("/api/v1/tickets") && method === "POST") {
      if (ticketsStatus >= 400) {
        return jsonError(ticketsStatus, "VENDOR_UNAVAILABLE", "Tickets unavailable", commonHeaders);
      }
      const body = parseBody(init?.body);
      if (!body.title || !body.group_id || !body.customer_id) {
        return jsonError(422, "VALIDATION_ERROR", "title, group_id, and customer_id are required");
      }
      const created: ZammadTicketRecord = {
        id: store.nextTicketId++,
        number: String(10_000 + store.nextTicketId),
        title: String(body.title),
        group_id: Number(body.group_id),
        customer_id: Number(body.customer_id),
        owner_id: body.owner_id !== undefined ? Number(body.owner_id) : 1,
        organization_id:
          body.organization_id !== undefined && body.organization_id !== null
            ? Number(body.organization_id)
            : null,
        state: typeof body.state === "string" ? body.state : "new",
        priority: typeof body.priority === "string" ? body.priority : "2 normal",
        state_id: 1,
        priority_id: 2,
        tags: Array.isArray(body.tags) ? (body.tags as string[]) : undefined,
        created_at: "2026-07-10T12:00:00.000Z",
        updated_at: "2026-07-10T12:00:00.000Z",
      };
      store.tickets.push(created);
      return new Response(JSON.stringify(created), { status: 201, headers: commonHeaders });
    }

    const ticketMatch = path.match(/\/api\/v1\/tickets\/(\d+)$/);
    if (ticketMatch) {
      if (ticketsStatus >= 400) {
        return jsonError(ticketsStatus, "VENDOR_UNAVAILABLE", "Tickets unavailable", commonHeaders);
      }
      const id = Number(ticketMatch[1]);
      const index = store.tickets.findIndex((ticket) => ticket.id === id);
      if (index < 0) {
        return jsonError(404, "NOT_FOUND", "Ticket not found");
      }
      if (method === "GET") {
        return new Response(JSON.stringify(store.tickets[index]), {
          status: 200,
          headers: commonHeaders,
        });
      }
      if (method === "PUT") {
        const body = parseBody(init?.body);
        const current = store.tickets[index]!;
        const updated: ZammadTicketRecord = {
          ...current,
          title: body.title !== undefined ? String(body.title) : current.title,
          group_id: body.group_id !== undefined ? Number(body.group_id) : current.group_id,
          customer_id:
            body.customer_id !== undefined ? Number(body.customer_id) : current.customer_id,
          owner_id:
            body.owner_id !== undefined
              ? body.owner_id === null
                ? 1
                : Number(body.owner_id)
              : current.owner_id,
          organization_id:
            body.organization_id !== undefined
              ? body.organization_id === null
                ? null
                : Number(body.organization_id)
              : current.organization_id,
          state: typeof body.state === "string" ? body.state : current.state,
          priority: typeof body.priority === "string" ? body.priority : current.priority,
          state_id:
            typeof body.state === "string"
              ? stateIdFromName(body.state)
              : current.state_id,
          priority_id:
            typeof body.priority === "string"
              ? priorityIdFromName(body.priority)
              : current.priority_id,
          tags: Array.isArray(body.tags) ? (body.tags as string[]) : current.tags,
          updated_at: "2026-07-10T13:00:00.000Z",
        };
        store.tickets[index] = updated;
        return new Response(JSON.stringify(updated), { status: 200, headers: commonHeaders });
      }
    }

    // --- Ticket history ---
    const historyMatch = path.match(/\/api\/v1\/ticket_history\/(\d+)$/);
    if (historyMatch && method === "GET") {
      if (historyStatus >= 400) {
        return jsonError(
          historyStatus,
          historyStatus === 403
            ? "FORBIDDEN"
            : historyStatus === 401
              ? "UNAUTHORIZED"
              : "VENDOR_UNAVAILABLE",
          "Ticket history unavailable",
          commonHeaders,
        );
      }
      const ticketId = Number(historyMatch[1]);
      if (!store.tickets.some((ticket) => ticket.id === ticketId)) {
        return jsonError(404, "NOT_FOUND", "Ticket not found");
      }
      const matched = store.history.filter(
        (entry) => entry.ticket_id === ticketId || entry.o_id === ticketId,
      );
      return paginatedJson(matched, url, commonHeaders);
    }

    // --- Organizations ---
    if (path.endsWith("/api/v1/organizations/search") && method === "GET") {
      if (failOrganizations || searchStatus >= 400) {
        return jsonError(
          searchStatus >= 400 ? searchStatus : 503,
          searchStatus === 403 ? "FORBIDDEN" : "VENDOR_UNAVAILABLE",
          "Organization search unavailable",
          commonHeaders,
        );
      }
      const query = (url.searchParams.get("query") ?? "").toLowerCase();
      const matched = store.organizations.filter((org) => {
        const haystack = `${org.name} ${org.domain ?? ""} ${org.note ?? ""}`.toLowerCase();
        return haystack.includes(query);
      });
      return paginatedJson(matched, url, commonHeaders);
    }
    if (path.endsWith("/api/v1/organizations") && method === "GET") {
      if (failOrganizations) {
        return jsonError(503, "VENDOR_UNAVAILABLE", "Organizations unavailable", commonHeaders);
      }
      return paginatedJson(store.organizations, url, commonHeaders);
    }
    if (path.endsWith("/api/v1/organizations") && method === "POST") {
      if (failOrganizations) {
        return jsonError(503, "VENDOR_UNAVAILABLE", "Organizations unavailable", commonHeaders);
      }
      const body = parseBody(init?.body);
      if (!body.name) {
        return jsonError(422, "VALIDATION_ERROR", "name is required");
      }
      const created: ZammadOrganizationRecord = {
        id: store.nextOrgId++,
        name: String(body.name),
        note: body.note !== undefined ? String(body.note) : undefined,
        domain: body.domain !== undefined ? String(body.domain) : undefined,
        shared: body.shared === true,
        active: body.active !== false,
        created_at: "2026-07-10T12:00:00.000Z",
        updated_at: "2026-07-10T12:00:00.000Z",
      };
      store.organizations.push(created);
      return new Response(JSON.stringify(created), { status: 201, headers: commonHeaders });
    }
    const orgMatch = path.match(/\/api\/v1\/organizations\/(\d+)$/);
    if (orgMatch) {
      if (failOrganizations) {
        return jsonError(503, "VENDOR_UNAVAILABLE", "Organizations unavailable", commonHeaders);
      }
      const id = Number(orgMatch[1]);
      const index = store.organizations.findIndex((org) => org.id === id);
      if (index < 0) return jsonError(404, "NOT_FOUND", "Organization not found");
      if (method === "GET") {
        return new Response(JSON.stringify(store.organizations[index]), {
          status: 200,
          headers: commonHeaders,
        });
      }
      if (method === "PUT") {
        const body = parseBody(init?.body);
        const current = store.organizations[index]!;
        const updated: ZammadOrganizationRecord = {
          ...current,
          name: body.name !== undefined ? String(body.name) : current.name,
          note: body.note !== undefined ? String(body.note) : current.note,
          domain: body.domain !== undefined ? String(body.domain) : current.domain,
          shared: body.shared !== undefined ? Boolean(body.shared) : current.shared,
          active: body.active !== undefined ? Boolean(body.active) : current.active,
          updated_at: "2026-07-10T13:00:00.000Z",
        };
        store.organizations[index] = updated;
        return new Response(JSON.stringify(updated), { status: 200, headers: commonHeaders });
      }
    }

    // --- Groups ---
    if (path.endsWith("/api/v1/groups") && method === "GET") {
      if (failGroups || (searchStatus >= 400 && url.searchParams.has("query"))) {
        return jsonError(
          failGroups ? 503 : searchStatus,
          searchStatus === 403 ? "FORBIDDEN" : "VENDOR_UNAVAILABLE",
          "Groups unavailable",
          commonHeaders,
        );
      }
      return paginatedJson(store.groups, url, commonHeaders);
    }
    if (path.endsWith("/api/v1/groups") && method === "POST") {
      if (failGroups) {
        return jsonError(503, "VENDOR_UNAVAILABLE", "Groups unavailable", commonHeaders);
      }
      const body = parseBody(init?.body);
      if (!body.name) {
        return jsonError(422, "VALIDATION_ERROR", "name is required");
      }
      const created: ZammadGroupRecord = {
        id: store.nextGroupId++,
        name: String(body.name),
        note: body.note !== undefined ? String(body.note) : undefined,
        active: body.active !== false,
        created_at: "2026-07-10T12:00:00.000Z",
        updated_at: "2026-07-10T12:00:00.000Z",
      };
      store.groups.push(created);
      return new Response(JSON.stringify(created), { status: 201, headers: commonHeaders });
    }
    const groupMatch = path.match(/\/api\/v1\/groups\/(\d+)$/);
    if (groupMatch) {
      if (failGroups) {
        return jsonError(503, "VENDOR_UNAVAILABLE", "Groups unavailable", commonHeaders);
      }
      const id = Number(groupMatch[1]);
      const index = store.groups.findIndex((group) => group.id === id);
      if (index < 0) return jsonError(404, "NOT_FOUND", "Group not found");
      if (method === "GET") {
        return new Response(JSON.stringify(store.groups[index]), {
          status: 200,
          headers: commonHeaders,
        });
      }
      if (method === "PUT") {
        const body = parseBody(init?.body);
        const current = store.groups[index]!;
        const updated: ZammadGroupRecord = {
          ...current,
          name: body.name !== undefined ? String(body.name) : current.name,
          note: body.note !== undefined ? String(body.note) : current.note,
          active: body.active !== undefined ? Boolean(body.active) : current.active,
          updated_at: "2026-07-10T13:00:00.000Z",
        };
        store.groups[index] = updated;
        return new Response(JSON.stringify(updated), { status: 200, headers: commonHeaders });
      }
    }

    // --- Users ---
    if (path.endsWith("/api/v1/users/search") && method === "GET") {
      if (failUsers || searchStatus >= 400) {
        return jsonError(
          searchStatus >= 400 ? searchStatus : 503,
          searchStatus === 403 ? "FORBIDDEN" : "VENDOR_UNAVAILABLE",
          "Users unavailable",
          commonHeaders,
        );
      }
      const query = (url.searchParams.get("query") ?? "").toLowerCase();
      const matched = store.users.filter((user) => {
        const haystack = `${user.email ?? ""} ${user.login ?? ""} ${user.firstname ?? ""} ${user.lastname ?? ""}`.toLowerCase();
        return haystack.includes(query);
      });
      return paginatedJson(matched, url, commonHeaders);
    }
    if (path.endsWith("/api/v1/users") && method === "GET") {
      if (failUsers) {
        return jsonError(503, "VENDOR_UNAVAILABLE", "Users unavailable", commonHeaders);
      }
      return paginatedJson(store.users, url, commonHeaders);
    }
    const userMatch = path.match(/\/api\/v1\/users\/(\d+)$/);
    if (userMatch && method === "GET") {
      if (failUsers) {
        return jsonError(503, "VENDOR_UNAVAILABLE", "Users unavailable", commonHeaders);
      }
      const id = Number(userMatch[1]);
      const user = store.users.find((entry) => entry.id === id);
      if (!user) return jsonError(404, "NOT_FOUND", "User not found");
      return new Response(JSON.stringify(user), { status: 200, headers: commonHeaders });
    }

    // --- Articles ---
    const byTicketMatch = path.match(/\/api\/v1\/ticket_articles\/by_ticket\/(\d+)$/);
    if (byTicketMatch && method === "GET") {
      if (articlesStatus >= 400) {
        return jsonError(
          articlesStatus,
          articlesStatus === 401
            ? "UNAUTHORIZED"
            : articlesStatus === 403
              ? "FORBIDDEN"
              : "VENDOR_UNAVAILABLE",
          "Articles unavailable",
          commonHeaders,
        );
      }
      const ticketId = Number(byTicketMatch[1]);
      if (!store.tickets.some((ticket) => ticket.id === ticketId)) {
        return jsonError(404, "TICKET_NOT_FOUND", "Ticket not found");
      }
      const matched = store.articles.filter((article) => article.ticket_id === ticketId);
      return paginatedJson(matched, url, commonHeaders);
    }

    if (path.endsWith("/api/v1/ticket_articles") && method === "POST") {
      if (articlesStatus >= 400) {
        return jsonError(
          articlesStatus,
          articlesStatus === 403 ? "FORBIDDEN" : "VENDOR_UNAVAILABLE",
          "Articles unavailable",
          commonHeaders,
        );
      }
      const body = parseBody(init?.body);
      if (!body.ticket_id || !body.body) {
        return jsonError(422, "VALIDATION_ERROR", "ticket_id and body are required");
      }
      if (typeof body.body === "string" && body.body.trim().length === 0) {
        return jsonError(422, "INVALID_BODY", "body must not be empty");
      }
      const ticketId = Number(body.ticket_id);
      if (!store.tickets.some((ticket) => ticket.id === ticketId)) {
        return jsonError(404, "TICKET_NOT_FOUND", "Ticket not found");
      }

      const attachments = Array.isArray(body.attachments)
        ? (body.attachments as Record<string, unknown>[]).map((attachment) => ({
            id: store.nextAttachmentId++,
            filename: String(attachment.filename ?? "file.bin"),
            size:
              typeof attachment.data === "string"
                ? Math.ceil((attachment.data as string).length * 0.75)
                : 0,
            preferences: {
              "Mime-Type": String(attachment["mime-type"] ?? "application/octet-stream"),
            },
            created_at: "2026-07-11T12:00:00.000Z",
          }))
        : [];

      const created: ZammadArticleRecord = {
        id: store.nextArticleId++,
        ticket_id: ticketId,
        type: typeof body.type === "string" ? body.type : "note",
        sender: typeof body.sender === "string" ? body.sender : "Agent",
        from: "agent@example.com",
        to: typeof body.to === "string" ? body.to : undefined,
        cc: typeof body.cc === "string" ? body.cc : undefined,
        subject: typeof body.subject === "string" ? body.subject : undefined,
        body: String(body.body),
        content_type:
          typeof body.content_type === "string" ? body.content_type : "text/plain",
        internal:
          forceCreatedArticleInternal === null
            ? body.internal === true
            : forceCreatedArticleInternal,
        created_by_id: 3,
        created_at: "2026-07-11T12:00:00.000Z",
        updated_at: "2026-07-11T12:00:00.000Z",
        attachments,
        preferences:
          body.internal === false ? { delivery_status: "pending" } : undefined,
      };
      store.articles.push(created);
      return new Response(JSON.stringify(created), { status: 201, headers: commonHeaders });
    }

    const articleMatch = path.match(/\/api\/v1\/ticket_articles\/(\d+)$/);
    if (articleMatch) {
      if (articlesStatus >= 400) {
        return jsonError(
          articlesStatus,
          "VENDOR_UNAVAILABLE",
          "Articles unavailable",
          commonHeaders,
        );
      }
      const id = Number(articleMatch[1]);
      const article = store.articles.find((entry) => entry.id === id);
      if (!article) return jsonError(404, "ARTICLE_NOT_FOUND", "Article not found");
      if (method === "GET") {
        if (malformedArticle) {
          return new Response(JSON.stringify({ id, body: "missing ticket_id" }), {
            status: 200,
            headers: commonHeaders,
          });
        }
        return new Response(JSON.stringify(article), {
          status: 200,
          headers: commonHeaders,
        });
      }
      if (method === "PUT" || method === "DELETE") {
        return jsonError(501, "UNSUPPORTED_ARTICLE_MUTATION", "Article mutation unsupported");
      }
    }

    // --- Webhooks ---
    if (path.endsWith("/api/v1/webhooks") && method === "GET") {
      if (rateLimitWebhooks) {
        return jsonError(429, "RATE_LIMITED", "Webhook rate limited", commonHeaders);
      }
      if (webhooksStatus >= 400) {
        return jsonError(
          webhooksStatus,
          webhooksStatus === 403 ? "FORBIDDEN" : "WEBHOOK_FAILED",
          "Webhooks unavailable",
          commonHeaders,
        );
      }
      return paginatedJson(store.webhooks, url, commonHeaders);
    }
    if (path.endsWith("/api/v1/webhooks") && method === "POST") {
      if (rateLimitWebhooks) {
        return jsonError(429, "RATE_LIMITED", "Webhook rate limited", commonHeaders);
      }
      if (webhooksStatus >= 400) {
        return jsonError(webhooksStatus, "WEBHOOK_FAILED", "Webhooks unavailable", commonHeaders);
      }
      const body = parseBody(init?.body);
      if (!body.endpoint) {
        return jsonError(422, "WEBHOOK_INVALID", "endpoint is required");
      }
      const created: ZammadWebhookRecord = {
        id: store.nextWebhookId++,
        name: typeof body.name === "string" ? body.name : "Webhook",
        endpoint: String(body.endpoint),
        active: body.active !== false,
        signature_token: "generated-secret",
        subscriptions: Array.isArray(body.subscriptions)
          ? (body.subscriptions as string[])
          : ["ticket"],
        created_at: "2026-07-11T14:00:00.000Z",
        updated_at: "2026-07-11T14:00:00.000Z",
      };
      store.webhooks.push(created);
      return new Response(JSON.stringify(created), { status: 201, headers: commonHeaders });
    }
    const webhookMatch = path.match(/\/api\/v1\/webhooks\/(\d+)$/);
    if (webhookMatch) {
      if (rateLimitWebhooks) {
        return jsonError(429, "RATE_LIMITED", "Webhook rate limited", commonHeaders);
      }
      if (webhooksStatus >= 400) {
        return jsonError(webhooksStatus, "WEBHOOK_FAILED", "Webhooks unavailable", commonHeaders);
      }
      const id = Number(webhookMatch[1]);
      const index = store.webhooks.findIndex((entry) => entry.id === id);
      if (index < 0) return jsonError(404, "WEBHOOK_NOT_FOUND", "Webhook not found");
      if (method === "GET") {
        return new Response(JSON.stringify(store.webhooks[index]), {
          status: 200,
          headers: commonHeaders,
        });
      }
      if (method === "PUT") {
        const body = parseBody(init?.body);
        const current = store.webhooks[index]!;
        const updated: ZammadWebhookRecord = {
          ...current,
          endpoint:
            body.endpoint !== undefined ? String(body.endpoint) : current.endpoint,
          active: body.active !== undefined ? Boolean(body.active) : current.active,
          subscriptions: Array.isArray(body.subscriptions)
            ? (body.subscriptions as string[])
            : current.subscriptions,
          updated_at: "2026-07-11T15:00:00.000Z",
        };
        store.webhooks[index] = updated;
        return new Response(JSON.stringify(updated), { status: 200, headers: commonHeaders });
      }
      if (method === "DELETE") {
        store.webhooks.splice(index, 1);
        return new Response(null, { status: 204, headers: commonHeaders });
      }
    }

    return jsonError(404, "NOT_FOUND", "Not found");
  };
}

function paginatedJson<T>(
  items: readonly T[],
  url: URL,
  headers: Record<string, string>,
): Response {
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const perPage = Math.max(1, Number(url.searchParams.get("per_page") ?? "25"));
  const start = (page - 1) * perPage;
  const slice = items.slice(start, start + perPage);
  return new Response(JSON.stringify(slice), {
    status: 200,
    headers: {
      ...headers,
      "X-Total-Count": String(items.length),
    },
  });
}

function parseBody(body: BodyInit | null | undefined): Record<string, unknown> {
  if (!body || typeof body !== "string") return {};
  try {
    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function jsonError(
  status: number,
  error: string,
  message: string,
  headers: Record<string, string> = { "Content-Type": "application/json" },
): Response {
  return new Response(JSON.stringify({ error, message }), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function stateIdFromName(state: string): number {
  const normalized = state.toLowerCase();
  if (normalized === "new") return 1;
  if (normalized === "open") return 2;
  if (normalized.includes("pending")) return 3;
  if (normalized === "closed") return 4;
  if (normalized === "merged") return 5;
  return 2;
}

function priorityIdFromName(priority: string): number {
  const normalized = priority.toLowerCase();
  if (normalized.includes("low")) return 1;
  if (normalized.includes("high")) return 3;
  if (normalized.includes("urgent")) return 4;
  return 2;
}

function normalizeHeaders(headers: HeadersInit | undefined): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return headers as Record<string, string>;
}
