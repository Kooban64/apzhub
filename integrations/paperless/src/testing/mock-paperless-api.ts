import type { FetchFn } from "../internal/paperless-fetch-client";

export const MOCK_PAPERLESS_DOCUMENT = {
  id: 42,
  title: "Supplier agreement",
  added: "2026-08-15T12:00:00Z",
  created: "2026-08-14",
  modified: "2026-08-15T12:30:00Z",
  archive_serial_number: 1001,
  original_file_name: "supplier-agreement.pdf",
  correspondent: 3,
  document_type: 5,
  tags: [7, 8],
};

export function createMockPaperlessFetch(
  options: {
    readonly failAuth?: boolean;
  } = {},
): FetchFn {
  return async (input, init) => {
    const url = new URL(input, "https://documents.example.test");
    const authorization = new Headers(init?.headers).get("Authorization");
    if (options.failAuth || authorization !== "Token test-token") {
      return new Response(JSON.stringify({ detail: "Invalid token." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.pathname === "/api/status/") {
      return new Response(JSON.stringify({ status: "OK" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.pathname === "/api/documents/") {
      return new Response(
        JSON.stringify({
          count: 1,
          next: null,
          previous: null,
          results: [MOCK_PAPERLESS_DOCUMENT],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response(JSON.stringify({ detail: "Not found." }), { status: 404 });
  };
}
