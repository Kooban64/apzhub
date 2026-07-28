import type { FetchFn } from "../internal/metabase-api-types";
import type { MetabaseConfigurationInput } from "../metabase-config";

export const TEST_TENANT_ID = "tenant_metabase_test";
export const TEST_CORRELATION_ID = "corr_metabase_test";

export const DEFAULT_TEST_METABASE_CONFIG: MetabaseConfigurationInput = {
  baseUrl: "https://metabase.example.test",
  apiBaseUrl: "https://metabase.example.test/api",
  authMode: "api_key",
  apiKeyRef: "secret://metabase/api-key",
};

export const MOCK_HEALTH = { status: "ok" };

export const MOCK_SESSION = { id: "session-mock-001" };

export const MOCK_SESSION_PROPERTIES = {
  version: { tag: "v0.49.10", date: "2024-05-01" },
  "application-name": "Metabase",
  "enable-embedding": true,
  "embedding-app-origin": "https://apzhub.example.test",
};

export const MOCK_COLLECTION = {
  id: 1,
  name: "Our analytics",
  slug: "our_analytics",
  location: "/",
  archived: false,
};

export interface MockMetabaseApiOptions {
  readonly failAuth?: boolean;
  readonly failHealth?: boolean;
  readonly embeddingDisabled?: boolean;
  readonly missCollections?: boolean;
  readonly missProperties?: boolean;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function createMockMetabaseFetch(options: MockMetabaseApiOptions = {}): FetchFn {
  return async (input: string, init?: RequestInit) => {
    const url = input;
    const method = (init?.method ?? "GET").toUpperCase();
    const headers = new Headers(init?.headers);
    const apiKey = headers.get("X-Api-Key");
    const session = headers.get("X-Metabase-Session");

    const path = new URL(url, "https://metabase.example.test").pathname.replace(
      /^\/api/,
      "",
    );

    if (path === "/health" || path === "/health/") {
      if (options.failHealth) {
        return jsonResponse({ status: "error" }, 503);
      }
      return jsonResponse(MOCK_HEALTH);
    }

    if (path === "/session" && method === "POST") {
      if (options.failAuth) {
        return jsonResponse({ message: "Password did not match" }, 401);
      }
      return jsonResponse(MOCK_SESSION);
    }

    if (options.failAuth || (!apiKey && !session && path !== "/health")) {
      return jsonResponse({ message: "Unauthenticated" }, 401);
    }

    if (path === "/session/properties") {
      if (options.missProperties) {
        return jsonResponse({ message: "Not found" }, 404);
      }
      return jsonResponse({
        ...MOCK_SESSION_PROPERTIES,
        "enable-embedding": options.embeddingDisabled ? false : true,
      });
    }

    if (path === "/collection" || path.startsWith("/collection?")) {
      if (options.missCollections) {
        return jsonResponse({ message: "Not found" }, 404);
      }
      return jsonResponse([MOCK_COLLECTION]);
    }

    return jsonResponse({ message: `Unhandled mock path ${path}` }, 404);
  };
}
