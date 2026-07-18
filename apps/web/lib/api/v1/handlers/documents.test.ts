/**
 * Platform Document HTTP handler coverage (APZDOCS-004).
 */
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";

import {
  handleApplyDocumentRetention,
  handleArchiveDocument,
  handleAssignDocumentCollection,
  handleAssignDocumentFolder,
  handleClassifyDocument,
  handleCreateDocument,
  handleGetDocument,
  handleGetDocumentDiagnostics,
  handleGetDocumentStorageMetadata,
  handleGetDocumentTag,
  handleGetDocumentVersion,
  handleInspectDocumentReconciliation,
  handleListDocumentAudit,
  handleListDocuments,
  handleListDocumentTags,
  handleListDocumentVersions,
  handleRelateDocument,
  handleRestoreDocument,
  handleTagDocument,
  handleUpdateDocumentMetadata,
  handleVerifyDocumentIntegrity,
} from "./documents";
import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { resetPlatformApiGatewayBootstrap } from "../gateway/bootstrap";
import {
  buildMockSession,
  buildTestServiceContext,
  installMockGateway,
} from "../testing/fixtures";
import { loadPlatformOpenApiSpecObject } from "../openapi";

function makeRequest(url: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (!headers.has("content-type") && init?.body) {
    headers.set("content-type", "application/json");
  }
  return new NextRequest(new URL(url, "http://localhost"), {
    ...init,
    headers,
  } as ConstructorParameters<typeof NextRequest>[1]);
}

function makeContext(): PlatformApiRequestContext {
  return {
    tracing: {
      requestId: "req-test-documents",
      correlationId: "corr-test-documents",
      timestamp: "2026-07-13T16:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext(),
  };
}

describe("APZDOCS-004 document handlers", () => {
  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
  });

  it("lists and creates documents via gateway only", async () => {
    installMockGateway();
    const list = await handleListDocuments(
      makeRequest("http://localhost/api/v1/documents"),
      makeContext(),
    );
    expect(list.status).toBe(200);
    const listBody = await list.json();
    expect(listBody.data).toHaveLength(1);

    const created = await handleCreateDocument(
      makeRequest("http://localhost/api/v1/documents", {
        method: "POST",
        body: JSON.stringify({ title: "Spec" }),
      }),
      makeContext(),
    );
    expect(created.status).toBe(200);
    const createdBody = await created.json();
    expect(createdBody.data.title).toBe("Spec");
  });

  it("gets, updates, archives documents and redacts storage keys", async () => {
    installMockGateway();
    const ctx = makeContext();
    const route = {
      params: Promise.resolve({ documentId: "doc_1", versionId: "ver_1" }),
    };

    const got = await handleGetDocument(
      makeRequest("http://localhost/api/v1/documents/doc_1"),
      ctx,
      route,
    );
    expect((await got.json()).data.id).toBe("doc_1");

    const updated = await handleUpdateDocumentMetadata(
      makeRequest("http://localhost/api/v1/documents/doc_1", {
        method: "PATCH",
        body: JSON.stringify({ description: "updated" }),
      }),
      ctx,
      route,
    );
    expect(updated.status).toBe(200);

    const archived = await handleArchiveDocument(
      makeRequest("http://localhost/api/v1/documents/doc_1/archive", {
        method: "POST",
      }),
      ctx,
      route,
    );
    expect((await archived.json()).data.status).toBe("archived");

    const storage = await handleGetDocumentStorageMetadata(
      makeRequest("http://localhost/api/v1/documents/doc_1/versions/ver_1/storage"),
      ctx,
      route,
    );
    const storageBody = await storage.json();
    expect(storageBody.data.version.storageKey).toBeUndefined();
    expect(storageBody.data.version.storageKeyPresent).toBe(true);

    const diagnostics = await handleGetDocumentDiagnostics(
      makeRequest("http://localhost/api/v1/documents/diagnostics"),
      ctx,
    );
    const diagBody = await diagnostics.json();
    expect(diagBody.data.providerReady).toBe(true);
    expect(JSON.stringify(diagBody)).not.toMatch(/\/var\/lib|AKIA|secret/);
  });

  it("documents OpenAPI paths exist", () => {
    const spec = loadPlatformOpenApiSpecObject() as {
      paths: Record<string, unknown>;
    };
    expect(spec.paths["/documents"]).toBeTruthy();
    expect(spec.paths["/documents/{documentId}"]).toBeTruthy();
    expect(spec.paths["/documents/{documentId}/versions"]).toBeTruthy();
    expect(spec.paths["/documents/diagnostics"]).toBeTruthy();
  });

  it("covers versions, tags, classify, folder, collection, retention, relate, audit, restore, verify, reconciliation", async () => {
    installMockGateway();
    const ctx = makeContext();
    const route = {
      params: Promise.resolve({
        documentId: "doc_1",
        versionId: "ver_1",
        tagId: "tag_1",
      }),
    };

    expect(
      (
        await handleListDocumentVersions(
          makeRequest("http://localhost/api/v1/documents/doc_1/versions"),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleGetDocumentVersion(
          makeRequest("http://localhost/api/v1/documents/doc_1/versions/ver_1"),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleVerifyDocumentIntegrity(
          makeRequest("http://localhost/api/v1/documents/doc_1/versions/ver_1/verify", {
            method: "POST",
          }),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleListDocumentAudit(
          makeRequest("http://localhost/api/v1/documents/doc_1/audit"),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleClassifyDocument(
          makeRequest("http://localhost/api/v1/documents/doc_1/classify", {
            method: "POST",
            body: JSON.stringify({ classification: "confidential" }),
          }),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleTagDocument(
          makeRequest("http://localhost/api/v1/documents/doc_1/tags", {
            method: "POST",
            body: JSON.stringify({ tagNames: ["alpha"] }),
          }),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleAssignDocumentFolder(
          makeRequest("http://localhost/api/v1/documents/doc_1/folder", {
            method: "POST",
            body: JSON.stringify({ folderId: "folder_1" }),
          }),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleAssignDocumentCollection(
          makeRequest("http://localhost/api/v1/documents/doc_1/collection", {
            method: "POST",
            body: JSON.stringify({ collectionId: "collection_1" }),
          }),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleApplyDocumentRetention(
          makeRequest("http://localhost/api/v1/documents/doc_1/retention", {
            method: "POST",
            body: JSON.stringify({ retentionId: "ret_1" }),
          }),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleRelateDocument(
          makeRequest("http://localhost/api/v1/documents/doc_1/relationships", {
            method: "POST",
            body: JSON.stringify({
              kind: "related_to",
              targetDocumentId: "doc_2",
            }),
          }),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleRestoreDocument(
          makeRequest("http://localhost/api/v1/documents/doc_1/restore", {
            method: "POST",
          }),
          ctx,
          route,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handleListDocumentTags(
          makeRequest("http://localhost/api/v1/documents/tags"),
          ctx,
        )
      ).status,
    ).toBe(200);

    const tag = await handleGetDocumentTag(
      makeRequest("http://localhost/api/v1/documents/tags/tag_1"),
      ctx,
      route,
    );
    expect(tag.status).toBe(200);

    const recon = await handleInspectDocumentReconciliation(
      makeRequest("http://localhost/api/v1/documents/reconciliation"),
      ctx,
    );
    const reconBody = await recon.json();
    expect(recon.status).toBe(200);
    expect(JSON.stringify(reconBody)).not.toMatch(/storageKeyHint/);
  });
});
