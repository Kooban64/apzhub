/**
 * Typed Search client coverage (APZSEARCH-007).
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { createHttpSearchClient } from "./search-client";
import {
  createMockSearchClient,
  executeSearchQuery,
  getSearchCapabilities,
  getSearchClient,
  getSearchHealth,
  getSearchManagementDiagnostics,
  listSearchAudit,
  listSearchCollections,
  listSearchConfigurations,
  listSearchProfiles,
  listSearchProviders,
  listSearchScopes,
  listSearchSources,
  resetSearchClient,
  setSearchClient,
  suggestSearch,
  validateSearchQuery,
} from "./search-api";
import { SearchClientError, toSearchUserMessage } from "./search-errors";
import { highlightToPlainText, sanitiseHighlightHtml } from "./highlight";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("APZSEARCH-007 search client", () => {
  afterEach(() => {
    resetSearchClient();
    vi.unstubAllGlobals();
  });

  it("mocks query and management facades", async () => {
    resetSearchClient();
    const result = await executeSearchQuery({ query: { keywords: "policy" } });
    expect(result.hits[0]?.title).toBe("Policy Handbook");
    expect(getSearchClient()).toBeTruthy();
    const providers = await getSearchClient().listProviders();
    expect(providers.items[0]?.id).toBe("prov_mock_1");
  });

  it("HTTP client only calls /api/v1/search and sanitises highlights", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      expect(String(url).startsWith("/api/v1/search")).toBe(true);
      const path = String(url);
      if (path.endsWith("/query")) {
        return jsonResponse({
          data: {
            page: {
              hits: [
                {
                  id: "h1",
                  metadata: {
                    title: "A",
                    entityType: "document",
                    entityId: "d1",
                    productId: "documents",
                  },
                  highlights: [{ field: "title", snippets: ["<em>A</em>"] }],
                },
              ],
              page: 1,
              pageSize: 20,
              hasMore: false,
            },
          },
          meta: {},
        });
      }
      if (
        path.includes("/management/") &&
        (path.endsWith("/providers") ||
          path.endsWith("/configurations") ||
          path.endsWith("/collections") ||
          path.endsWith("/sources") ||
          path.endsWith("/scopes") ||
          path.endsWith("/profiles") ||
          path.endsWith("/audit"))
      ) {
        return jsonResponse({
          data: [],
          page: { limit: 0, hasMore: false },
          meta: {},
        });
      }
      if (
        path.includes("/management/providers/") ||
        path.includes("/management/configurations/")
      ) {
        return jsonResponse({
          data: { id: "x", kind: "meilisearch", label: "X", enabled: true },
          meta: {},
        });
      }
      if (path.endsWith("/suggestions") || path.endsWith("/query/validate")) {
        return jsonResponse({
          data: path.endsWith("/suggestions")
            ? {
                hits: [],
                page: 1,
                pageSize: 10,
                hasMore: false,
                suggestions: [{ text: "a", kind: "query" }],
              }
            : { valid: true, issues: [] },
          meta: {},
        });
      }
      return jsonResponse({
        data: {
          keywords: true,
          phrases: false,
          filters: true,
          sorting: true,
          pagination: true,
          facets: false,
          highlighting: true,
          suggestions: true,
          semantic: false,
          vector: false,
          status: "available",
          checkedAt: "2026-07-14T12:00:00.000Z",
          executionEnabled: true,
          providerBound: true,
          healthy: true,
          declaredIndexCount: 1,
          declaredProviderCount: 1,
          declaredCollectionCount: 1,
          declaredSourceCount: 1,
          health: {
            status: "available",
            checkedAt: "2026-07-14T12:00:00.000Z",
          },
          capabilities: {
            keywords: true,
            phrases: false,
            filters: true,
            sorting: true,
            pagination: true,
            facets: false,
            highlighting: true,
            suggestions: true,
            semantic: false,
            vector: false,
          },
          statistics: {
            declaredIndexCount: 1,
            declaredProviderCount: 1,
            declaredCollectionCount: 1,
            declaredSourceCount: 1,
          },
        },
        meta: {},
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = createHttpSearchClient();
    const query = await client.executeQuery({ query: { keywords: "a" } });
    expect(query.hits[0]?.highlightSnippets[0]).toBe("A");
    expect(query.hits[0]?.highlightSnippets[0]).not.toContain("<");
    expect((await client.getCapabilities()).keywords).toBe(true);
    expect((await client.validateQuery({ keywords: "a" })).valid).toBe(true);
    expect((await client.suggest({ keywords: "a" })).page).toBe(1);
    expect((await client.getHealth()).status).toBe("available");
    expect((await client.getReadiness()).healthy).toBe(true);
    expect((await client.getDiagnostics()).health.status).toBe("available");
    expect((await client.getStatistics()).declaredProviderCount).toBe(1);
    expect((await client.listProviders()).items).toEqual([]);
    expect((await client.getProvider("p")).id).toBe("x");
    expect((await client.listConfigurations()).items).toEqual([]);
    expect((await client.getConfiguration("c")).id).toBe("x");
    expect((await client.listCollections()).items).toEqual([]);
    expect((await client.listSources()).items).toEqual([]);
    expect((await client.listScopes()).items).toEqual([]);
    expect((await client.listProfiles()).items).toEqual([]);
    expect((await client.getManagementHealth()).status).toBe("available");
    expect((await client.getManagementDiagnostics()).health.status).toBe(
      "available",
    );
    expect((await client.listAudit()).items).toEqual([]);
  });

  it("maps rich query envelopes including phrase filters sort facets pagination", async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      const path = String(url);
      if (path.endsWith("/query")) {
        const body = JSON.parse(String(init?.body ?? "{}")) as {
          query?: {
            phrase?: string;
            filters?: unknown[];
            sorts?: unknown[];
            page?: number;
            includeFacets?: boolean;
          };
          profileId?: string;
        };
        expect(body.query?.phrase).toBe("exact phrase");
        expect(body.query?.filters).toHaveLength(1);
        expect(body.query?.sorts).toHaveLength(1);
        expect(body.query?.page).toBe(2);
        expect(body.query?.includeFacets).toBe(true);
        expect(body.profileId).toBe("profile_1");
        return jsonResponse({
          data: {
            providerId: "prov_1",
            page: {
              hits: [
                {
                  id: "h-full",
                  score: 0.5,
                  title: "fallback-title",
                  metadata: {
                    title: "Policy",
                    entityType: "document",
                    entityId: "d1",
                    productId: "documents",
                    classification: "internal",
                    navigationTarget: "/workspace/documents",
                  },
                  highlights: [
                    { field: "body", snippets: ["safe <em>mark</em>"] },
                    { field: "tags", snippets: "not-an-array" },
                    "not-an-object",
                  ],
                },
                {
                  id: "h-sparse",
                  metadata: {},
                  highlights: null,
                },
                null,
              ],
              page: 2,
              pageSize: 10,
              totalEstimated: 3,
              hasMore: true,
              tookMs: 12,
              suggestions: [
                { text: "policy", kind: "query", productId: "documents" },
                { text: "handbook" },
                "bad",
              ],
            },
          },
          meta: {},
        });
      }
      if (path.endsWith("/query/validate")) {
        return jsonResponse({
          data: {
            valid: false,
            issues: [
              { code: "TOO_SHORT", message: "too short", field: "keywords" },
              { code: "BAD", message: "missing field" },
              "not-an-object",
            ],
          },
          meta: {},
        });
      }
      if (path.endsWith("/management/collections")) {
        return jsonResponse({
          data: [{ id: "c1", name: "Docs", scope: "tenant", enabled: true }],
          page: { limit: 1, hasMore: false },
          meta: {},
        });
      }
      if (path.endsWith("/management/sources")) {
        return jsonResponse({
          data: [
            {
              id: "s1",
              label: "Docs",
              productId: "documents",
              enabled: false,
            },
          ],
          meta: {},
        });
      }
      if (path.endsWith("/management/scopes")) {
        return jsonResponse({
          data: [{ id: "sc1", scope: "tenant", label: "Tenant", enabled: true }],
          meta: {},
        });
      }
      if (path.endsWith("/management/profiles")) {
        return jsonResponse({
          data: [{ id: "p1", name: "Default" }],
          meta: {},
        });
      }
      if (path.endsWith("/management/audit")) {
        return jsonResponse({
          data: [
            {
              id: "a1",
              action: "search.query.execute",
              actorUserId: "u1",
              createdAt: "2026-07-14T12:00:00.000Z",
            },
          ],
          meta: {},
        });
      }
      if (path.endsWith("/management/providers")) {
        return jsonResponse({
          data: [
            {
              id: "prov",
              kind: "meilisearch",
              label: "P",
              enabled: true,
              active: true,
              ownership: "tenant",
            },
          ],
          meta: {},
        });
      }
      if (path.endsWith("/management/configurations")) {
        return jsonResponse({
          data: [
            {
              id: "cfg",
              label: "Cfg",
              status: "active",
              active: true,
              currentVersion: 2,
              configuration: { defaultPageSize: 25, maxPageSize: 50 },
            },
          ],
          meta: {},
        });
      }
      if (path.endsWith("/readiness")) {
        return jsonResponse({
          data: {
            executionEnabled: false,
            providerBound: false,
            healthy: false,
            message: "degraded",
          },
          meta: {},
        });
      }
      if (path.endsWith("/diagnostics") || path.endsWith("/management/diagnostics")) {
        return jsonResponse({
          data: {
            health: { status: "degraded", checkedAt: "2026-07-14T12:00:00.000Z" },
            capabilities: {},
            statistics: {},
            notes: ["note-1", 2],
          },
          meta: {},
        });
      }
      return jsonResponse({ data: {}, meta: {} });
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = createHttpSearchClient();
    const result = await client.executeQuery({
      profileId: "profile_1",
      query: {
        phrase: "exact phrase",
        keywords: "policy",
        filters: [{ field: "productId", op: "eq", value: "documents" }],
        sorts: [{ field: "score", direction: "desc" }],
        page: 2,
        pageSize: 10,
        includeFacets: true,
        includeHighlights: true,
        includeSuggestions: true,
      },
    });
    expect(result.page).toBe(2);
    expect(result.hasMore).toBe(true);
    expect(result.tookMs).toBe(12);
    expect(result.providerId).toBe("prov_1");
    expect(result.hits[0]?.classification).toBe("internal");
    expect(result.hits[0]?.navigationTarget).toBe("/workspace/documents");
    expect(result.hits[0]?.highlightSnippets[0]).toBe("safe mark");
    expect(result.hits[1]?.title).toBe("");
    expect(result.suggestions).toHaveLength(3);
    expect(result.suggestions[0]?.productId).toBe("documents");

    const validation = await client.validateQuery({ keywords: "x" });
    expect(validation.valid).toBe(false);
    expect(validation.issues[0]?.field).toBe("keywords");
    expect(validation.issues[1]?.field).toBeUndefined();

    expect((await client.listCollections()).items[0]?.name).toBe("Docs");
    expect((await client.listSources()).items[0]?.enabled).toBe(false);
    expect((await client.listScopes()).items[0]?.label).toBe("Tenant");
    expect((await client.listProfiles()).items[0]?.name).toBe("Default");
    expect((await client.listAudit()).items[0]?.action).toContain("search");
    expect((await client.listProviders()).items[0]?.ownership).toBe("tenant");
    expect((await client.listConfigurations()).items[0]?.defaultPageSize).toBe(
      25,
    );
    expect((await client.getReadiness()).message).toBe("degraded");
    expect((await client.getDiagnostics()).notes?.[0]).toBe("note-1");
    expect((await client.getManagementDiagnostics()).health.status).toBe(
      "degraded",
    );
  });

  it("maps malformed envelopes empty root and non-json error bodies", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      const path = String(url);
      if (path.endsWith("/query")) {
        return jsonResponse({ data: null, meta: {} });
      }
      if (path.endsWith("/health")) {
        return new Response("not-json", { status: 500 });
      }
      if (path.endsWith("/capabilities")) {
        return jsonResponse({ data: null, meta: {} });
      }
      if (path.endsWith("/statistics")) {
        return jsonResponse({ data: "bad", meta: {} });
      }
      if (path.endsWith("/management/providers")) {
        return jsonResponse({ data: null, meta: {} });
      }
      return jsonResponse({ data: {}, meta: {} });
    });
    vi.stubGlobal("fetch", fetchMock);
    const client = createHttpSearchClient();
    const empty = await client.executeQuery({ query: { keywords: "x" } });
    expect(empty.hits).toEqual([]);
    expect(empty.suggestions).toEqual([]);
    await expect(client.getHealth()).rejects.toMatchObject({
      code: "SEARCH_HTTP_ERROR",
      status: 500,
    });
    expect((await client.getCapabilities()).semantic).toBe(false);
    expect((await client.getStatistics()).declaredIndexCount).toBe(0);
    expect((await client.listProviders()).items).toEqual([]);
  });

  it("maps HTTP errors and user messages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          jsonResponse(
            {
              error: { message: "Nope", code: "FORBIDDEN" },
              meta: { correlationId: "c1" },
            },
            403,
          ),
      ),
    );
    const client = createHttpSearchClient();
    await expect(client.getHealth()).rejects.toMatchObject({
      code: "FORBIDDEN",
      status: 403,
      correlationId: "c1",
    });
    expect(
      toSearchUserMessage(new SearchClientError({ status: 401, message: "x" })),
    ).toMatch(/not authorized/i);
    expect(
      toSearchUserMessage(
        new SearchClientError({ code: "UNAUTHORIZED", message: "x" }),
      ),
    ).toMatch(/not authorized/i);
    expect(
      toSearchUserMessage(new SearchClientError({ status: 403, message: "x" })),
    ).toMatch(/permission/i);
    expect(
      toSearchUserMessage(new SearchClientError({ status: 404, message: "x" })),
    ).toMatch(/not found/i);
    expect(
      toSearchUserMessage(new SearchClientError({ message: "" })),
    ).toMatch(/Unable/);
    expect(toSearchUserMessage(new Error("boom"))).toBe("boom");
    expect(toSearchUserMessage({})).toMatch(/Unable/);
  });

  it("covers mock methods and client setter", async () => {
    const client = createMockSearchClient();
    setSearchClient(client);
    expect(getSearchClient()).toBe(client);
    expect((await client.validateQuery({ keywords: "x" })).valid).toBe(true);
    expect((await client.suggest({ keywords: "hi" })).suggestions[0]?.text).toBe(
      "hi",
    );
    expect((await client.getHealth()).status).toBe("available");
    expect((await client.getReadiness()).healthy).toBe(true);
    expect((await client.getDiagnostics()).statistics.declaredIndexCount).toBe(1);
    expect((await client.getStatistics()).declaredSourceCount).toBe(1);
    expect((await client.getProvider("p")).id).toBe("p");
    expect((await client.listConfigurations()).items).toHaveLength(1);
    expect((await client.getConfiguration("c")).id).toBe("c");
    expect((await client.listCollections()).items[0]?.name).toBe("Documents");
    expect((await client.listSources()).items[0]?.productId).toBe("documents");
    expect((await client.listScopes()).items[0]?.scope).toBe("tenant");
    expect((await client.listProfiles()).items[0]?.name).toBe("Default");
    expect((await client.getManagementHealth()).status).toBe("available");
    expect((await client.getManagementDiagnostics()).notes?.[0]).toBe("mock");
    expect((await client.listAudit()).items[0]?.action).toContain("search");
    expect(
      (await client.executeQuery({ query: { keywords: "zzz-no-match" } })).hits,
    ).toHaveLength(0);
  });

  it("covers search-api facades including suggest capabilities and management", async () => {
    resetSearchClient();
    expect((await suggestSearch({ keywords: "facade" })).suggestions[0]?.text).toBe(
      "facade",
    );
    expect((await getSearchCapabilities()).phrases).toBe(true);
    expect((await getSearchHealth()).status).toBe("available");
    expect((await validateSearchQuery({ keywords: "ok" })).valid).toBe(true);
    expect((await listSearchProviders()).items[0]?.id).toBe("prov_mock_1");
    expect((await listSearchConfigurations()).items).toHaveLength(1);
    expect((await listSearchCollections()).items[0]?.name).toBe("Documents");
    expect((await listSearchSources()).items[0]?.productId).toBe("documents");
    expect((await listSearchScopes()).items[0]?.scope).toBe("tenant");
    expect((await listSearchProfiles()).items[0]?.name).toBe("Default");
    expect((await listSearchAudit()).items[0]?.action).toContain("search");
    expect(
      (await getSearchManagementDiagnostics()).health.status,
    ).toBe("available");
  });

  it("sanitises highlight HTML", () => {
    expect(sanitiseHighlightHtml("<b>x</b>")).toBe("&lt;b&gt;x&lt;/b&gt;");
    expect(sanitiseHighlightHtml(`a&b"c'd`)).toContain("&amp;");
    expect(highlightToPlainText("<em>Hello</em>")).toBe("Hello");
  });
});
