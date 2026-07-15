import type { FetchFn } from "../internal/meilisearch-fetch";
import type { MeilisearchConfigurationInput } from "../meilisearch-config";
import type {
  MeilisearchIndexRecord,
  MeilisearchSearchHit,
} from "../internal/meilisearch-api-types";

export const TEST_TENANT_ID = "tenant-meili-1";
export const TEST_CORRELATION_ID = "corr-meili-001";

export const DEFAULT_TEST_MEILISEARCH_CONFIG: MeilisearchConfigurationInput = {
  baseUrl: "http://meilisearch.test:7700",
  apiKeyRef: "meilisearch/api-key",
  defaultIndexUid: "documents",
};

export const MOCK_INDEX: MeilisearchIndexRecord = {
  uid: "documents",
  primaryKey: "id",
  createdAt: "2026-07-01T00:00:00Z",
  updatedAt: "2026-07-14T00:00:00Z",
};

export const MOCK_DOCUMENT: MeilisearchSearchHit = {
  id: "doc-1",
  title: "APZHUB Search Platform",
  description: "Keyword search reference",
  entityType: "document",
  productId: "documents",
  sourceId: "src_meili",
  tenantId: TEST_TENANT_ID,
};

export interface MockMeilisearchApiOptions {
  readonly requireApiKey?: boolean;
  readonly failAuth?: boolean;
  readonly authStatus?: number;
  readonly healthStatus?: string;
  readonly failHealth?: boolean;
  readonly failSearch?: boolean;
  readonly failIndexes?: boolean;
  readonly version?: string;
  readonly seedIndexes?: readonly MeilisearchIndexRecord[];
  readonly seedDocuments?: Readonly<Record<string, readonly MeilisearchSearchHit[]>>;
}

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) {
    const out: Record<string, string> = {};
    headers.forEach((value, key) => {
      out[key.toLowerCase()] = value;
    });
    return out;
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(
      headers.map(([k, v]) => [k.toLowerCase(), v]),
    );
  }
  return Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k.toLowerCase(), String(v)]),
  );
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function parseUrl(input: RequestInfo | URL): URL {
  if (typeof input === "string") return new URL(input);
  if (input instanceof URL) return input;
  return new URL(input.url);
}

/** Mock Meilisearch REST API — no live engine. */
export function createMockMeilisearchFetch(
  options: MockMeilisearchApiOptions = {},
): FetchFn {
  const {
    requireApiKey = true,
    failAuth = false,
    authStatus = failAuth ? 401 : 200,
    healthStatus = "available",
    failHealth = false,
    failSearch = false,
    failIndexes = false,
    version = "1.11.0",
  } = options;

  const indexes = new Map<string, MeilisearchIndexRecord>(
    (options.seedIndexes ?? [MOCK_INDEX]).map((i) => [i.uid, { ...i }]),
  );
  const documents = new Map<string, Map<string, MeilisearchSearchHit>>();
  const seeded =
    options.seedDocuments ??
    ({ documents: [MOCK_DOCUMENT] } as Readonly<
      Record<string, readonly MeilisearchSearchHit[]>
    >);
  for (const [uid, docs] of Object.entries(seeded)) {
    documents.set(
      uid,
      new Map(docs.map((d) => [String(d.id ?? ""), { ...d }])),
    );
  }

  let taskUid = 1;

  return async (input, init) => {
    const url = parseUrl(input);
    const method = (init?.method ?? "GET").toUpperCase();
    const headers = normalizeHeaders(init?.headers);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (requireApiKey || failAuth) {
      const auth = headers.authorization ?? "";
      if (failAuth || (requireApiKey && !auth.startsWith("Bearer "))) {
        return jsonResponse(
          {
            message: "The Authorization header is missing",
            code: "missing_authorization_header",
            type: "auth",
          },
          authStatus,
        );
      }
    }

    if (path === "/health") {
      if (failHealth) {
        return jsonResponse(
          { message: "Meilisearch is unavailable", code: "not_found" },
          503,
        );
      }
      return jsonResponse({ status: healthStatus });
    }

    if (path === "/version") {
      return jsonResponse({
        commitSha: "abc123",
        commitDate: "2026-07-01",
        pkgVersion: version,
      });
    }

    if (path === "/stats") {
      const indexStats: Record<string, { numberOfDocuments: number; isIndexing: boolean }> =
        {};
      for (const [uid, docs] of documents.entries()) {
        indexStats[uid] = { numberOfDocuments: docs.size, isIndexing: false };
      }
      return jsonResponse({
        databaseSize: 1024,
        lastUpdate: "2026-07-14T12:00:00Z",
        indexes: indexStats,
      });
    }

    if (path === "/indexes" && method === "GET") {
      if (failIndexes) {
        return jsonResponse({ message: "indexes failed", code: "invalid_request" }, 400);
      }
      return jsonResponse({
        results: [...indexes.values()],
        offset: 0,
        limit: 20,
        total: indexes.size,
      });
    }

    if (path === "/indexes" && method === "POST") {
      const body = init?.body ? (JSON.parse(String(init.body)) as {
        uid?: string;
        primaryKey?: string;
      }) : {};
      if (!body.uid) {
        return jsonResponse({ message: "uid required", code: "invalid_index_uid" }, 400);
      }
      if (indexes.has(body.uid)) {
        return jsonResponse(
          { message: "index already exists", code: "index_already_exists" },
          409,
        );
      }
      indexes.set(body.uid, {
        uid: body.uid,
        primaryKey: body.primaryKey ?? null,
        createdAt: "2026-07-14T00:00:00Z",
        updatedAt: "2026-07-14T00:00:00Z",
      });
      documents.set(body.uid, new Map());
      return jsonResponse({
        taskUid: taskUid++,
        indexUid: body.uid,
        status: "enqueued",
        type: "indexCreation",
      }, 202);
    }

    const indexMatch = path.match(/^\/indexes\/([^/]+)$/);
    if (indexMatch) {
      const uid = decodeURIComponent(indexMatch[1]!);
      if (method === "GET") {
        const index = indexes.get(uid);
        if (!index) {
          return jsonResponse({ message: "index not found", code: "index_not_found" }, 404);
        }
        return jsonResponse(index);
      }
      if (method === "DELETE") {
        indexes.delete(uid);
        documents.delete(uid);
        return jsonResponse({
          taskUid: taskUid++,
          indexUid: uid,
          status: "enqueued",
          type: "indexDeletion",
        }, 202);
      }
      if (method === "PATCH") {
        const body = init?.body
          ? (JSON.parse(String(init.body)) as { primaryKey?: string })
          : {};
        const existing = indexes.get(uid);
        if (!existing) {
          return jsonResponse({ message: "index not found", code: "index_not_found" }, 404);
        }
        indexes.set(uid, { ...existing, primaryKey: body.primaryKey ?? existing.primaryKey });
        return jsonResponse({
          taskUid: taskUid++,
          indexUid: uid,
          status: "enqueued",
          type: "indexUpdate",
        }, 202);
      }
    }

    const docsMatch = path.match(/^\/indexes\/([^/]+)\/documents$/);
    if (docsMatch && method === "POST") {
      const uid = decodeURIComponent(docsMatch[1]!);
      const body = init?.body
        ? (JSON.parse(String(init.body)) as MeilisearchSearchHit[])
        : [];
      if (!indexes.has(uid)) {
        return jsonResponse({ message: "index not found", code: "index_not_found" }, 404);
      }
      const bag = documents.get(uid) ?? new Map();
      for (const doc of body) {
        bag.set(String(doc.id), doc);
      }
      documents.set(uid, bag);
      return jsonResponse({
        taskUid: taskUid++,
        indexUid: uid,
        status: "enqueued",
        type: "documentAdditionOrUpdate",
      }, 202);
    }

    const docMatch = path.match(/^\/indexes\/([^/]+)\/documents\/([^/]+)$/);
    if (docMatch) {
      const uid = decodeURIComponent(docMatch[1]!);
      const docId = decodeURIComponent(docMatch[2]!);
      const bag = documents.get(uid);
      if (method === "GET") {
        const doc = bag?.get(docId);
        if (!doc) {
          return jsonResponse(
            { message: "document not found", code: "document_not_found" },
            404,
          );
        }
        return jsonResponse(doc);
      }
      if (method === "DELETE") {
        bag?.delete(docId);
        return jsonResponse({
          taskUid: taskUid++,
          indexUid: uid,
          status: "enqueued",
          type: "documentDeletion",
        }, 202);
      }
    }

    const searchMatch = path.match(/^\/indexes\/([^/]+)\/search$/);
    if (searchMatch && method === "POST") {
      if (failSearch) {
        return jsonResponse({ message: "search failed", code: "invalid_search_q" }, 400);
      }
      const uid = decodeURIComponent(searchMatch[1]!);
      const body = init?.body
        ? (JSON.parse(String(init.body)) as {
            q?: string;
            offset?: number;
            limit?: number;
            filter?: string;
            sort?: string[];
            facets?: string[];
            attributesToHighlight?: string[];
          })
        : {};
      const bag = documents.get(uid) ?? new Map();
      let hits = [...bag.values()];
      const q = (body.q ?? "").replace(/^"|"$/g, "").toLowerCase();
      if (q) {
        hits = hits.filter((h) =>
          JSON.stringify(h).toLowerCase().includes(q.toLowerCase()),
        );
      }
      if (body.filter && body.filter.includes("tenantId")) {
        const m = body.filter.match(/tenantId\s*=\s*"([^"]+)"/);
        if (m) {
          hits = hits.filter((h) => String(h.tenantId) === m[1]);
        }
      }
      const offset = body.offset ?? 0;
      const limit = body.limit ?? 20;
      const page = hits.slice(offset, offset + limit);
      const withHighlight = body.attributesToHighlight
        ? page.map((h) => ({
            ...h,
            _formatted: {
              title: `<em>${String(h.title ?? "")}</em>`,
            },
          }))
        : page;

      return jsonResponse({
        hits: withHighlight,
        query: body.q ?? "",
        processingTimeMs: 3,
        limit,
        offset,
        estimatedTotalHits: hits.length,
        facetDistribution: body.facets
          ? {
              entityType: { document: hits.length },
            }
          : undefined,
      });
    }

    return jsonResponse(
      { message: `Unhandled mock path ${method} ${path}`, code: "not_found" },
      404,
    );
  };
}
