/**
 * APZSEARCH-012 — Documents Search Publication Adapter tests.
 */
import { describe, expect, it } from "vitest";
import {
  asDocumentCategoryId,
  asDocumentCollectionId,
  asDocumentFolderId,
  asDocumentId,
  asDocumentTagId,
  asDocumentVersionId,
  type Document,
  type DocumentCategory,
  type DocumentCollection,
  type DocumentFolder,
  type DocumentTag,
  type DocumentVersion,
} from "@apzhub/document-contracts";
import { createSearchIntegration } from "@apzhub/search-integration";

import {
  SEARCH_DOCUMENTS_VERSION,
  createDocumentsSearchAdapter,
  createDocumentsSearchAdapterForTest,
  createDocumentsSearchPublisher,
  createDocumentsSearchPublicationContext,
  isDocumentsSearchEntityType,
  looksLikeStorageLeak,
} from "./index";

function ctx(tenantId = "tenant-a", org = "org-a") {
  return createDocumentsSearchPublicationContext({
    serviceContext: {
      tenantId,
      userId: "user-1",
      correlationId: "corr-012",
      permissions: ["documents.read", "search.query.execute"],
      organisationId: org,
      workspaceId: "ws_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    },
  });
}

const document: Document = {
  id: asDocumentId("doc_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
  tenantId: "tenant-a",
  organisationId: "org-a",
  title: "Policy",
  description: "Internal policy",
  mimeType: "application/pdf",
  byteLength: 1024,
  documentType: "file",
  classification: { code: "internal" },
  status: "active",
  lifecycle: {
    state: "active",
    changedAt: "2026-01-01T00:00:00.000Z",
    changedBy: "user-1",
  },
  tagIds: [],
  creatorUserId: "user-1",
  permissions: [{ principalType: "user", principalId: "user-1", action: "read" }],
  currentVersionId: asDocumentVersionId("dver_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"),
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

const version: DocumentVersion = {
  id: asDocumentVersionId("dver_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"),
  documentId: asDocumentId("doc_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
  versionNumber: 3,
  label: "v3",
  createdAt: "2026-01-02T00:00:00.000Z",
  createdBy: "user-1",
  checksum: { algorithm: "sha256", hex: "deadbeef".repeat(8) },
};

const collection: DocumentCollection = {
  id: asDocumentCollectionId("dcol_cccccccccccccccccccccccccccccccc"),
  tenantId: "tenant-a",
  name: "Policies",
  description: "All policies",
  documentIds: [asDocumentId("doc_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const folder: DocumentFolder = {
  id: asDocumentFolderId("dfld_dddddddddddddddddddddddddddddddd"),
  tenantId: "tenant-a",
  name: "Legal",
  path: "legal/policies",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const category: DocumentCategory = {
  id: asDocumentCategoryId("dcat_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"),
  tenantId: "tenant-a",
  name: "Compliance",
  description: "Compliance docs",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const tag: DocumentTag = {
  id: asDocumentTagId("dtag_ffffffffffffffffffffffffffffffff"),
  tenantId: "tenant-a",
  name: "reviewed",
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("APZSEARCH-012 search-documents", () => {
  it("ships version and entity catalogue", () => {
    expect(SEARCH_DOCUMENTS_VERSION).toBe("0.1.0");
    expect(isDocumentsSearchEntityType("document")).toBe(true);
    expect(isDocumentsSearchEntityType("document_version")).toBe(true);
    expect(isDocumentsSearchEntityType("support_request")).toBe(false);
    expect(looksLikeStorageLeak("storageKey_abc")).toBe(true);
    expect(looksLikeStorageLeak("s3://bucket/key")).toBe(true);
    expect(looksLikeStorageLeak("doc_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")).toBe(false);
  });

  it("maps and publishes all Documents entity types without storage leakage", () => {
    const adapter = createDocumentsSearchAdapterForTest();
    const context = ctx();

    const inputs = [
      {
        entityType: "document" as const,
        entity: document,
        extras: { currentVersion: version },
      },
      {
        entityType: "document_version" as const,
        entity: version,
        extras: { parentDocument: document },
      },
      { entityType: "document_collection" as const, entity: collection },
      { entityType: "document_folder" as const, entity: folder },
      { entityType: "document_category" as const, entity: category },
      { entityType: "document_tag" as const, entity: tag },
    ];

    for (const input of inputs) {
      const preview = adapter.publisher.preview(context, input);
      expect(preview.ok, input.entityType).toBe(true);
      expect(preview.previewMetadata?.productId).toBe("documents");
      expect(JSON.stringify(preview.previewMetadata)).not.toMatch(
        /storageKey|s3:\/\/|deadbeef/i,
      );

      const published = adapter.publisher.publish(context, input);
      expect(published.ok, input.entityType).toBe(true);
      expect(published.lifecycleState).toBe("published");
    }

    expect(adapter.integration.sink.count()).toBe(6);
    const stats = adapter.publisher.statistics(context);
    expect(stats.published).toBe(6);

    const docDraft = adapter.mapper.mapDocument(context, document, {
      currentVersion: version,
    });
    expect(docDraft.metadata?.byteLength).toBe("1024");
    expect(docDraft.metadata?.versionNumber).toBe("3");
    expect(docDraft.metadata?.checksumPresent).toBe("true");
    expect(docDraft.metadata).not.toHaveProperty("storageRef");
    expect(JSON.stringify(docDraft.metadata)).not.toMatch(/deadbeef/i);
    expect(docDraft.permissions).toEqual(
      expect.arrayContaining([
        "documents.read",
        "user:user-1:read",
        "status:active",
        "classification:internal",
      ]),
    );

    const verDraft = adapter.mapper.mapDocumentVersion(context, version, {
      parentDocument: document,
    });
    expect(verDraft.entityType).toBe("document_version");
    expect(verDraft.metadata?.checksumPresent).toBe("true");
    expect(verDraft.metadata?.immutable).toBe("true");
    expect(verDraft.metadata).not.toHaveProperty("storageRef");
  });

  it("rejects storage key leakage and tenant mismatches", () => {
    const adapter = createDocumentsSearchAdapterForTest();
    const context = ctx();

    expect(() =>
      adapter.mapper.mapDocument(context, {
        ...document,
        id: "storageKey_leaky" as Document["id"],
      }),
    ).toThrow(/storage/);

    expect(() =>
      adapter.mapper.mapDocument(context, {
        ...document,
        tenantId: "other-tenant",
      }),
    ).toThrow(/tenant mismatch/);

    const storageReject = adapter.validator.validateDraft(context, {
      entityId: "doc_ok",
      entityType: "document",
      title: "X",
      classification: "internal",
      permissions: ["documents.read"],
      metadata: {
        documentType: "file",
        status: "active",
        storageKey: "secret/object",
      },
    });
    expect(storageReject.valid).toBe(false);
    expect(storageReject.issues.some((i) => i.code === "storage_leakage")).toBe(true);

    const published = adapter.publisher.publish(context, {
      entityType: "document",
      entity: document,
    });
    expect(published.ok).toBe(true);

    const crossTenantRemove = adapter.publisher.remove(
      ctx("other-tenant"),
      "document",
      document.id,
    );
    expect(crossTenantRemove.ok).toBe(false);
  });

  it("implements preferred document + optional version publication decision", () => {
    const adapter = createDocumentsSearchAdapterForTest();
    const context = ctx();

    // Preferred: document with version metadata via extras
    const primary = adapter.publisher.publish(context, {
      entityType: "document",
      entity: document,
      extras: { currentVersion: version },
    });
    expect(primary.ok).toBe(true);
    const storedDoc = adapter.integration.sink.get(document.id);
    expect(storedDoc?.metadata?.versionNumber).toBe("3");

    // Optional independent version entity
    const optional = adapter.publisher.publish(context, {
      entityType: "document_version",
      entity: version,
      extras: { parentDocument: document },
    });
    expect(optional.ok).toBe(true);
    expect(adapter.integration.sink.get(version.id)?.entityType).toBe(
      "document_version",
    );

    expect(() => adapter.mapper.mapDocumentVersion(context, version)).toThrow(
      /parentDocument/,
    );
  });

  it("supports production factory with explicit sink and rejects silent memory", () => {
    expect(() => createDocumentsSearchAdapter()).toThrow(/explicit sink/);
    expect(() => createDocumentsSearchPublisher()).toThrow(/explicit sink/);

    const integration = createSearchIntegration();
    const adapter = createDocumentsSearchAdapter({
      sink: integration.sink,
    });
    expect(
      adapter.publisher.publish(ctx(), {
        entityType: "document",
        entity: document,
      }).ok,
    ).toBe(true);

    const publisher = createDocumentsSearchPublisher({
      integrationPublisher: integration.publisher,
      integration,
    });
    expect(publisher).toBeDefined();
  });
});
