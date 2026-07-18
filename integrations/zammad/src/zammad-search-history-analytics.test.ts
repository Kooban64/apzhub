import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { createZammadAdapter } from "./zammad-factory";
import {
  mapZammadHistoryAction,
  mapZammadHistoryEvent,
  mapZammadHistoryTimeline,
} from "./mappers/history-mapper";
import { mapSupportIntelligenceSnapshot } from "./mappers/analytics-mapper";
import {
  buildSupportSearchResult,
  mapTicketToSearchHit,
} from "./mappers/search-mapper";
import { mapZammadTicket } from "./mappers/support-ticket-mapper";
import {
  createMockZammadFetch,
  DEFAULT_TEST_ZAMMAD_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
} from "./testing/mock-zammad-api";
import { MOCK_HISTORY, MOCK_TICKET } from "./testing/mock-zammad-core-data";
import type { ZammadHistoryRecord } from "./internal/zammad-api-types";

const ctx = { correlationId: TEST_CORRELATION_ID, tenantId: TEST_TENANT_ID };
const ticketId = `sreq_zammad_${MOCK_TICKET.id}`;

async function createAdapter(
  fetchOptions?: Parameters<typeof createMockZammadFetch>[0],
) {
  return createZammadAdapter({
    zammad: DEFAULT_TEST_ZAMMAD_CONFIG,
    tenantId: TEST_TENANT_ID,
    apiToken: "zammad-test-token",
    adapterOptions: { fetchFn: createMockZammadFetch(fetchOptions) },
  });
}

describe("Zammad search/history/analytics capability registration", () => {
  it("promotes search, history, and analytics to implemented core capabilities", async () => {
    const { adapter } = await createAdapter();
    const ids = adapter.core.discoverCapabilities().map((c) => c.serviceId);
    expect(ids).toEqual(
      expect.arrayContaining(["search", "history", "analytics", "articles"]),
    );
    expect(adapter.listPlaceholderCapabilities()).not.toContain("search");
    expect(adapter.listPlaceholderCapabilities()).not.toContain("analytics");
    expect(adapter.listPlaceholderCapabilities()).not.toContain("history");
    expect(adapter.core.search).toBeDefined();
    expect(adapter.core.history).toBeDefined();
    expect(adapter.core.analytics).toBeDefined();
  });

  it("exposes search/history/analytics diagnostics without secrets", async () => {
    const { adapter } = await createAdapter();
    await adapter.initialise();
    await adapter.connect(ctx);
    const extension = adapter.zammadDiagnosticsExtension;
    expect(extension.searchServiceAvailable).toBe(true);
    expect(extension.historyServiceAvailable).toBe(true);
    expect(extension.analyticsServiceAvailable).toBe(true);
    expect(extension.searchLimitations.length).toBeGreaterThan(0);
    expect(extension.historyLimitations.length).toBeGreaterThan(0);
    expect(extension.analyticsLimitations.length).toBeGreaterThan(0);
    expect(JSON.stringify(extension)).not.toMatch(/zammad-test-token|password/i);
  });
});

describe("ZammadSearchService", () => {
  it("searches support requests and returns canonical hits only", async () => {
    const { adapter } = await createAdapter();
    const result = await adapter.core.search.searchSupportRequests(ctx, "password");
    expect(result.query).toBe("password");
    expect(result.hits.length).toBeGreaterThan(0);
    expect(result.hits.every((hit) => hit.kind === "support_request")).toBe(true);
    expect(result.hits[0]?.id).toMatch(/^shit_support_request_zammad_/);
    expect(JSON.stringify(result)).not.toMatch(/history_type|owner_id|state_id/);
  });

  it("searches organizations, groups, users, and articles", async () => {
    const { adapter } = await createAdapter();

    const orgs = await adapter.core.search.searchOrganizations(ctx, "Acme");
    expect(orgs.hits.some((hit) => hit.kind === "organization")).toBe(true);

    const groups = await adapter.core.search.searchGroups(ctx, "Users");
    expect(groups.hits.some((hit) => hit.kind === "group")).toBe(true);

    const users = await adapter.core.search.searchUsers(ctx, "agent");
    expect(users.hits.some((hit) => hit.kind === "user")).toBe(true);

    const articles = await adapter.core.search.searchArticles(ctx, "password");
    expect(articles.hits.some((hit) => hit.kind === "article")).toBe(true);
  });

  it("supports unified search with kind filtering, pagination, and sorting", async () => {
    const { adapter } = await createAdapter();
    const filtered = await adapter.core.search.search(
      ctx,
      "a",
      { kinds: ["organization", "group"] },
      { page: 1, perPage: 1 },
      [{ field: "title", direction: "asc" }],
    );
    expect(filtered.hits).toHaveLength(1);
    expect(["organization", "group"]).toContain(filtered.hits[0]?.kind);
    expect(filtered.hasNextPage || filtered.totalCount >= 1).toBe(true);

    const empty = await adapter.core.search.search(ctx, "zzz-no-match-xyz");
    expect(empty.hits).toHaveLength(0);
    expect(empty.totalCount).toBe(0);
  });

  it("translates provider and permission failures", async () => {
    const unavailable = await createAdapter({ failSearch: true });
    await expect(
      unavailable.adapter.core.search.search(ctx, "password", {
        kinds: ["support_request"],
      }),
    ).rejects.toMatchObject({ category: expect.any(String) });

    const forbidden = await createAdapter({ searchStatus: 403 });
    await expect(
      forbidden.adapter.core.search.search(ctx, "password", {
        kinds: ["support_request"],
      }),
    ).rejects.toMatchObject({ category: "authorization" });
  });
});

describe("ZammadHistoryService", () => {
  it("returns chronological canonical timeline events", async () => {
    const { adapter } = await createAdapter();
    const timeline = await adapter.core.history.getSupportTimeline(ctx, ticketId);
    expect(timeline.supportTicketId).toBe(ticketId);
    expect(timeline.events.length).toBeGreaterThan(0);
    const times = timeline.events.map((event) => event.occurredAt);
    expect(times).toEqual([...times].sort());
    expect(timeline.events.some((event) => event.action === "created")).toBe(true);
    expect(timeline.events.some((event) => event.action === "state_changed")).toBe(
      true,
    );
    expect(timeline.events.some((event) => event.action === "owner_changed")).toBe(
      true,
    );
    expect(timeline.events.some((event) => event.action === "priority_changed")).toBe(
      true,
    );
    expect(timeline.events.some((event) => event.action === "article_created")).toBe(
      true,
    );
    expect(timeline.events.some((event) => event.action === "attachment_added")).toBe(
      true,
    );
    expect(JSON.stringify(timeline)).not.toMatch(/history_type|history_object/);
  });

  it("filters, paginates, and sorts history events", async () => {
    const { adapter } = await createAdapter();
    const states = await adapter.core.history.getTimeline(
      ctx,
      ticketId,
      { actions: ["state_changed"] },
      { page: 1, perPage: 10 },
    );
    expect(states.items.every((event) => event.action === "state_changed")).toBe(true);

    const paged = await adapter.core.history.list(
      ctx,
      ticketId,
      {},
      { page: 1, perPage: 2 },
    );
    expect(paged.items).toHaveLength(2);
    expect(paged.hasNextPage).toBe(true);
  });

  it("returns empty timeline when provider has no history", async () => {
    const { adapter } = await createAdapter({ seedHistory: [] });
    const timeline = await adapter.core.history.getSupportTimeline(ctx, ticketId);
    expect(timeline.events).toHaveLength(0);
    expect(timeline.totalCount).toBe(0);
  });

  it("translates history provider failures", async () => {
    const { adapter } = await createAdapter({ failHistory: true });
    await expect(
      adapter.core.history.getSupportTimeline(ctx, ticketId),
    ).rejects.toMatchObject({
      category: expect.any(String),
    });
  });
});

describe("History timeline mapping", () => {
  it("maps provider history actions including unknown", () => {
    expect(
      mapZammadHistoryAction({
        id: 1,
        created_at: "2026-01-01T00:00:00.000Z",
        history_type: "created",
      }),
    ).toBe("created");
    expect(
      mapZammadHistoryAction({
        id: 2,
        created_at: "2026-01-01T00:00:00.000Z",
        attribute: "state",
        history_type: "updated",
      }),
    ).toBe("state_changed");
    expect(
      mapZammadHistoryAction({
        id: 3,
        created_at: "2026-01-01T00:00:00.000Z",
        history_type: "weird-custom-event",
      }),
    ).toBe("unknown");
  });

  it("builds chronological SupportTimeline from records", () => {
    const timeline = mapZammadHistoryTimeline(
      MOCK_HISTORY,
      { tenantId: TEST_TENANT_ID },
      ticketId,
    );
    expect(timeline.totalCount).toBe(MOCK_HISTORY.length);
    const first = timeline.events[0];
    const last = timeline.events[timeline.events.length - 1];
    expect(first && last && first.occurredAt <= last.occurredAt).toBe(true);
    const event = mapZammadHistoryEvent(
      MOCK_HISTORY[1] as ZammadHistoryRecord,
      { tenantId: TEST_TENANT_ID },
      ticketId,
    );
    expect(event.id).toMatch(/^shist_zammad_/);
    expect(event.actor.userId).toMatch(/^suser_zammad_/);
  });
});

describe("ZammadAnalyticsService", () => {
  it("returns read-only support intelligence snapshot", async () => {
    const { adapter } = await createAdapter();
    const snapshot = await adapter.core.analytics.getSupportIntelligence(ctx);
    expect(snapshot.totalTickets).toBeGreaterThan(0);
    expect(
      snapshot.openTickets + snapshot.closedTickets + snapshot.pendingTickets,
    ).toBeGreaterThan(0);
    expect(snapshot.byPriority.length).toBeGreaterThan(0);
    expect(snapshot.byState.length).toBeGreaterThan(0);
    expect(snapshot.byGroup.length).toBeGreaterThan(0);
    expect(snapshot.averageFirstResponseMinutes).toBeUndefined();
    expect(JSON.stringify(snapshot)).not.toMatch(/state_id|owner_id|priority_id/);

    const alias = await adapter.core.analytics.getSnapshot(ctx);
    expect(alias.totalTickets).toBe(snapshot.totalTickets);
  });

  it("handles empty ticket inventory", async () => {
    const { adapter } = await createAdapter({ seedTickets: [], seedArticles: [] });
    const snapshot = await adapter.core.analytics.getSupportIntelligence(ctx);
    expect(snapshot.totalTickets).toBe(0);
    expect(snapshot.openTickets).toBe(0);
    expect(snapshot.articleCount).toBe(0);
  });

  it("maps overdue and unassigned buckets from inventory", () => {
    const ticket = mapZammadTicket(MOCK_TICKET, { tenantId: TEST_TENANT_ID });
    const snapshot = mapSupportIntelligenceSnapshot({
      tickets: [
        ticket,
        {
          ...ticket,
          id: "sreq_zammad_999",
          status: "new",
          assigneeId: undefined,
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      articleCount: 3,
      capturedAt: "2026-07-10T12:00:00.000Z",
    });
    expect(snapshot.unassignedTickets).toBeGreaterThan(0);
    expect(snapshot.overdueTickets).toBeGreaterThan(0);
    expect(snapshot.articleCount).toBe(3);
  });
});

describe("Search mapping helpers", () => {
  it("paginates canonical search hits", () => {
    const ticket = mapZammadTicket(MOCK_TICKET, { tenantId: TEST_TENANT_ID });
    const hits = [mapTicketToSearchHit(ticket), mapTicketToSearchHit(ticket)];
    const page = buildSupportSearchResult({
      query: "password",
      hits,
      page: 1,
      perPage: 1,
    });
    expect(page.hits).toHaveLength(1);
    expect(page.hasNextPage).toBe(true);
    expect(page.totalCount).toBe(2);
  });
});

describe("OSS-102-05 architecture boundaries", () => {
  it("does not introduce PlatformService, HTTP routes, UI, or Platform Event Bus wiring", () => {
    const root = join(process.cwd(), "integrations/zammad/src");
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (full.endsWith(".ts") && !full.endsWith(".test.ts")) files.push(full);
      }
    };
    walk(root);
    const joined = files.map((file) => readFileSync(file, "utf8")).join("\n");
    expect(joined).not.toMatch(/@apzhub\/platform-services/);
    expect(joined).not.toMatch(/PlatformServiceGateway/);
    expect(joined).not.toMatch(/app\/api\/|NextResponse/);
    expect(joined).not.toMatch(
      /\bregisterWebhookIngress\b|\bstartSynchronisationWorker\b/,
    );
    expect(joined).not.toMatch(/from ["']@apzhub\/platform-event/);
  });
});
