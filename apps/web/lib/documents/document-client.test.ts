/**
 * Typed Document client tests (APZDOCS-004).
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { createHttpDocumentClient } from "./document-client";
import { createMockDocumentClient } from "./mock-document-client";
import { DocumentClientError } from "./document-errors";

describe("createHttpDocumentClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls only /api/v1/documents endpoints", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      expect(url.startsWith("/api/v1/documents")).toBe(true);
      return new Response(
        JSON.stringify({
          data: [
            {
              documentId: "doc_1",
              title: "A",
              status: "draft",
              classification: "internal",
              documentType: "file",
              updatedAt: "2026-07-13T16:00:00.000Z",
              tagNames: [],
            },
          ],
          page: { limit: 1, hasMore: false },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = createHttpDocumentClient();
    const result = await client.listDocuments({ query: "A" });
    expect(result.items[0]?.documentId).toBe("doc_1");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("maps HTTP errors to DocumentClientError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            error: { message: "forbidden", code: "FORBIDDEN" },
            meta: { correlationId: "c1" },
          }),
          { status: 403, headers: { "content-type": "application/json" } },
        ),
      ),
    );
    const client = createHttpDocumentClient();
    await expect(client.getDocument("doc_1")).rejects.toBeInstanceOf(
      DocumentClientError,
    );
  });

  it("mock client supports create/list without network", async () => {
    const client = createMockDocumentClient();
    const created = await client.createDocumentMetadata({ title: "Mock" });
    const listed = await client.listDocuments();
    expect(listed.items.some((row) => row.documentId === created.id)).toBe(true);
  });

  it("covers typed mutations and metadata helpers", async () => {
    const calls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        calls.push(`${init?.method ?? "GET"} ${url}`);
        const path = url.split("?")[0] ?? url;
        if (path.endsWith("/versions") || path.endsWith("/audit") || path.endsWith("/documents")) {
          if ((init?.method ?? "GET") === "GET") {
            return new Response(
              JSON.stringify({ data: [], page: { limit: 0, hasMore: false } }),
              { status: 200, headers: { "content-type": "application/json" } },
            );
          }
        }
        if (path.includes("/versions/") && path.endsWith("/storage")) {
          return new Response(
            JSON.stringify({
              data: {
                version: {
                  id: "ver_1",
                  documentId: "doc_1",
                  versionNumber: 1,
                  mimeType: "text/plain",
                  byteLength: 1,
                  checksumHex: "ab",
                  storageStatus: "verified",
                  createdAt: "2026-07-13T16:00:00.000Z",
                  storageKeyPresent: true,
                },
                storageObject: null,
              },
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }
        if (path.endsWith("/diagnostics")) {
          return new Response(
            JSON.stringify({
              data: {
                providerReady: true,
                providerId: "memory",
                providerKind: "memory",
                repositoryReady: true,
                storageReady: true,
                checksumReady: true,
                reconciliationIssueCount: 0,
              },
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }
        if (path.endsWith("/tags") && init?.method === "POST") {
          return new Response(
            JSON.stringify({ data: [{ id: "tag_1", name: "alpha" }] }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }
        if (path.endsWith("/relationships")) {
          return new Response(
            JSON.stringify({ data: { id: "rel_1", kind: "related_to" } }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }
        if (path.endsWith("/classify")) {
          return new Response(JSON.stringify({ data: { code: "confidential" } }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }
        return new Response(
          JSON.stringify({
            data: {
              id: "doc_1",
              title: "Doc",
              status: "draft",
              classification: { code: "internal" },
              documentType: "file",
              createdAt: "2026-07-13T16:00:00.000Z",
              updatedAt: "2026-07-13T16:00:00.000Z",
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }),
    );

    const client = createHttpDocumentClient();
    await client.createDocumentMetadata({ title: "A" });
    await client.updateDocumentMetadata("doc_1", { title: "B" });
    await client.archiveDocument("doc_1");
    await client.restoreDocument("doc_1");
    await client.assignFolder("doc_1", "folder_1");
    await client.assignCollection("doc_1", "collection_1");
    await client.applyRetention("doc_1", "ret_1");
    await client.classify("doc_1", { classification: "confidential" });
    await client.tag("doc_1", { tagNames: ["alpha"] });
    await client.relate("doc_1", { kind: "related_to", targetDocumentId: "doc_2" });
    await client.listVersions("doc_1");
    await client.getVersion("doc_1", "ver_1");
    await client.getStorageMetadata("doc_1", "ver_1");
    await client.listAudit("doc_1");
    await client.listMetadata();
    await client.getDiagnostics();

    expect(calls.every((c) => c.includes("/api/v1/documents"))).toBe(true);
    expect(calls.some((c) => c.includes("/storage"))).toBe(true);
    expect(calls.some((c) => c.includes("/diagnostics"))).toBe(true);
  });
});
