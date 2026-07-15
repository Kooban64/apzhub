/**
 * APZSEARCH-012 deep coverage — hooks, throwing sink, validator edges, folder paths.
 */
import { describe, expect, it } from "vitest";
import {
  asDocumentCategoryId,
  asDocumentCollectionId,
  asDocumentFolderId,
  asDocumentId,
  asDocumentOwnerId,
  asDocumentRelationshipId,
  asDocumentRetentionId,
  asDocumentTagId,
  asDocumentVersionId,
  type Document,
  type DocumentCategory,
  type DocumentCollection,
  type DocumentFolder,
  type DocumentRelationship,
  type DocumentRetention,
  type DocumentTag,
  type DocumentVersion,
} from "@apzhub/document-contracts";
import {
  createSearchIntegration,
  InMemorySearchPublicationSink,
} from "@apzhub/search-integration";

import {
  DocumentsSearchPublisher,
  createDocumentsSearchAdapter,
  createDocumentsSearchAdapterForTest,
  createDocumentsSearchPublisherForTest,
  createDocumentsSearchPublicationContext,
} from "./index";

function ctx(overrides?: { permissions?: readonly string[] }) {
  return createDocumentsSearchPublicationContext({
    serviceContext: {
      tenantId: "tenant-a",
      userId: "user-1",
      correlationId: "corr-deep",
      permissions: overrides?.permissions ?? ["documents.read"],
      organisationId: "org-a",
    },
  });
}

const document: Document = {
  id: asDocumentId("doc_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
  tenantId: "tenant-a",
  organisationId: "org-a",
  title: "Policy",
  description: "Internal policy",
  documentType: "file",
  classification: { code: "internal" },
  status: "active",
  lifecycle: {
    state: "active",
    changedAt: "2026-01-01T00:00:00.000Z",
    changedBy: "user-1",
  },
  tagIds: [],
  folderId: asDocumentFolderId("dfld_dddddddddddddddddddddddddddddddd"),
  categoryId: asDocumentCategoryId("dcat_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"),
  creatorUserId: "user-1",
  owner: {
    id: asDocumentOwnerId("down_11111111111111111111111111111111"),
    userId: "user-1",
    displayName: "Owner",
  },
  permissions: [
    { principalType: "user", principalId: "user-1", action: "read" },
  ],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const version: DocumentVersion = {
  id: asDocumentVersionId("dver_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"),
  documentId: document.id,
  versionNumber: 1,
  label: "initial",
  createdAt: "2026-01-01T00:00:00.000Z",
  createdBy: "user-1",
};

const retention: DocumentRetention = {
  id: asDocumentRetentionId("dret_cccccccccccccccccccccccccccccccc"),
  documentId: document.id,
  tenantId: "tenant-a",
  policyKey: "legal-7y",
  legalHold: true,
  notes: "SECRET NOTES MUST NOT PUBLISH",
  retainUntil: "2033-01-01T00:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("APZSEARCH-012 deep coverage", () => {
  it("exercises validator edge codes and folder path rejection", () => {
    const adapter = createDocumentsSearchAdapterForTest();
    const context = ctx();

    expect(
      adapter.validator.validateDraft(context, {
        entityId: "",
        entityType: "document",
        title: "",
        classification: undefined,
        metadata: {
          documentType: "file",
          status: "active",
          meiliUid: "x",
          storageRef: "bad",
          retentionNotes: "nope",
          objectKey: "k",
        },
      }).issues.map((i) => i.code),
    ).toEqual(
      expect.arrayContaining([
        "required",
        "provider_leakage",
        "storage_leakage",
        "retention_notes_forbidden",
      ]),
    );

    expect(
      adapter.validator.validateDraft(context, {
        entityId: "s3://leaky",
        entityType: "unknown",
        title: "T",
        classification: "internal",
        permissions: ["x"],
        metadata: {},
      }).issues.some((i) => i.code === "unsupported" || i.code === "storage_leakage"),
    ).toBe(true);

    expect(
      adapter.validator.validateDraft(
        {
          ...context,
          tenantId: "",
          permissions: null as unknown as readonly string[],
        },
        {
          entityId: "x",
          entityType: "document_tag",
          title: "T",
          classification: "internal",
          metadata: {},
        },
      ).issues.map((i) => i.field),
    ).toEqual(expect.arrayContaining(["tenantId", "permissions"]));

    const s3Folder: DocumentFolder = {
      id: asDocumentFolderId("dfld_ffffffffffffffffffffffffffffffff"),
      tenantId: "tenant-a",
      name: "Bad",
      path: "s3://bucket/secret",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const s3Draft = adapter.mapper.mapDocumentFolder(context, s3Folder);
    expect(s3Draft.metadata).not.toHaveProperty("path");

    const absFolder: DocumentFolder = {
      ...s3Folder,
      id: asDocumentFolderId("dfld_11111111111111111111111111111111"),
      path: "/var/lib/storage/docs",
    };
    expect(
      adapter.mapper.mapDocumentFolder(context, absFolder).metadata,
    ).not.toHaveProperty("path");

    const winFolder: DocumentFolder = {
      ...s3Folder,
      id: asDocumentFolderId("dfld_22222222222222222222222222222222"),
      path: "C:\\Users\\secrets",
    };
    expect(
      adapter.mapper.mapDocumentFolder(context, winFolder).metadata,
    ).not.toHaveProperty("path");

    const retentionDraft = adapter.mapper.mapDocument(context, document, {
      retention,
    });
    expect(retentionDraft.metadata?.legalHold).toBe("true");
    expect(retentionDraft.metadata?.retentionPolicyKey).toBe("legal-7y");
    expect(JSON.stringify(retentionDraft.metadata)).not.toMatch(/SECRET NOTES/);
  });

  it("covers hooks, preview/diagnostics, and throwing publisher paths", () => {
    const adapter = createDocumentsSearchAdapterForTest();
    const context = ctx();

    expect(adapter.hooks.onDocumentCreated(context, document).operation).toBe(
      "publish",
    );
    expect(
      adapter.hooks.onDocumentMetadataUpdated(context, {
        ...document,
        title: "Policy Updated",
      }).operation,
    ).toBe("update");
    expect(adapter.hooks.onDocumentClassified(context, document).ok).toBe(true);
    expect(adapter.hooks.onDocumentTagged(context, document).ok).toBe(true);
    expect(adapter.hooks.onDocumentFolderAssigned(context, document).ok).toBe(
      true,
    );
    expect(
      adapter.hooks.onDocumentCollectionAssigned(context, document).ok,
    ).toBe(true);

    const versioned = adapter.hooks.onDocumentVersionCommitted(
      context,
      version,
      document,
    );
    expect(versioned.ok).toBe(true);

    expect(adapter.hooks.onDocumentArchived(context, {
      ...document,
      status: "archived",
    }).ok).toBe(true);
    expect(
      adapter.hooks.onDocumentRestored(context, {
        ...document,
        status: "restored",
      }).ok,
    ).toBe(true);
    expect(
      adapter.hooks.onDocumentRetentionChanged(context, document, retention).ok,
    ).toBe(true);
    expect(adapter.hooks.onGeneratedReportLinked(context, document).ok).toBe(
      true,
    );

    const relationship: DocumentRelationship = {
      id: asDocumentRelationshipId("drel_33333333333333333333333333333333"),
      tenantId: "tenant-a",
      sourceDocumentId: document.id,
      kind: "related_to",
      createdAt: "2026-01-01T00:00:00.000Z",
      createdBy: "user-1",
    };
    expect(
      adapter.hooks.onDocumentRelationshipChanged(
        context,
        document,
        relationship,
      ).ok,
    ).toBe(true);

    const collection: DocumentCollection = {
      id: asDocumentCollectionId("dcol_44444444444444444444444444444444"),
      tenantId: "tenant-a",
      name: "Bundle",
      documentIds: [document.id],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const folder: DocumentFolder = {
      id: asDocumentFolderId("dfld_55555555555555555555555555555555"),
      tenantId: "tenant-a",
      name: "Folder",
      path: "relative/ok",
      parentFolderId: asDocumentFolderId("dfld_dddddddddddddddddddddddddddddddd"),
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const category: DocumentCategory = {
      id: asDocumentCategoryId("dcat_66666666666666666666666666666666"),
      tenantId: "tenant-a",
      name: "Cat",
      parentCategoryId: asDocumentCategoryId(
        "dcat_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      ),
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const tag: DocumentTag = {
      id: asDocumentTagId("dtag_77777777777777777777777777777777"),
      tenantId: "tenant-a",
      name: "tag-a",
      createdAt: "2026-01-01T00:00:00.000Z",
    };

    expect(adapter.hooks.onDocumentCollectionUpserted(context, collection).ok).toBe(
      true,
    );
    expect(adapter.hooks.onDocumentFolderUpserted(context, folder).ok).toBe(
      true,
    );
    expect(adapter.mapper.mapDocumentFolder(context, folder).metadata?.path).toBe(
      "relative/ok",
    );
    expect(adapter.hooks.onDocumentCategoryUpserted(context, category).ok).toBe(
      true,
    );
    expect(adapter.hooks.onDocumentTagUpserted(context, tag).ok).toBe(true);

    expect(
      adapter.hooks.onDocumentCollectionRemoved(context, collection.id).ok,
    ).toBe(true);
    expect(adapter.hooks.onDocumentFolderRemoved(context, folder.id).ok).toBe(
      true,
    );
    expect(
      adapter.hooks.onDocumentCategoryRemoved(context, category.id).ok,
    ).toBe(true);
    expect(adapter.hooks.onDocumentTagRemoved(context, tag.id).ok).toBe(true);
    expect(adapter.hooks.onDocumentDeleted(context, document.id).ok).toBe(true);

    const preview = adapter.publisher.preview(context, {
      entityType: "document",
      entity: document,
      extras: { retention },
    });
    expect(preview.ok).toBe(true);

    const diag = adapter.publisher.diagnostics(context);
    expect(diag.adapterVersion).toBe("0.1.0");
    expect(diag.productId).toBe("documents");
    expect(diag.supportedEntityTypes).toContain("document_version");
    expect(adapter.publisher.getLogger().recent().length).toBeGreaterThan(0);
    expect(adapter.publisher.getMapper()).toBe(adapter.mapper);
    expect(adapter.publisher.getValidator()).toBe(adapter.validator);
    expect(adapter.publisher.getLifecycle()).toBe(adapter.lifecycle);
    expect(adapter.publisher.getMetrics()).toBe(adapter.metrics);

    const missingUpdate = adapter.publisher.update(context, {
      entityType: "document",
      entity: {
        ...document,
        id: asDocumentId("doc_99999999999999999999999999999999"),
      },
    });
    expect(missingUpdate.ok).toBe(false);

    expect(
      adapter.publisher.lifecycle(
        context,
        "doc_00000000000000000000000000000000",
        "archived",
      ).ok,
    ).toBe(false);

    expect(
      adapter.publisher.validate(context, {
        entityType: "document",
        entity: { ...document, tenantId: "other" },
      }).ok,
    ).toBe(false);

    const throwing = {
      publish: () => {
        throw new Error("boom publish");
      },
      update: () => {
        throw new Error("boom update");
      },
      preview: () => {
        throw new Error("boom preview");
      },
      remove: () => {
        throw new Error("boom remove");
      },
      lifecycle: () => {
        throw new Error("boom lifecycle");
      },
      validate: () => {
        throw new Error("boom validate");
      },
      getSink: () => adapter.integration.sink,
    } as never;

    const publisherThrow = new DocumentsSearchPublisher({
      integrationPublisher: throwing,
      mapper: adapter.mapper,
      validator: {
        validateDraft: () => ({
          valid: false,
          issues: [{ field: "title", code: "required", message: "forced" }],
        }),
      } as never,
    });
    expect(
      publisherThrow.publish(context, {
        entityType: "document",
        entity: document,
      }).ok,
    ).toBe(false);

    const publisherOkMap = new DocumentsSearchPublisher({
      integrationPublisher: throwing,
    });
    expect(
      publisherOkMap.publish(context, {
        entityType: "document",
        entity: document,
      }).ok,
    ).toBe(false);
    expect(
      publisherOkMap.remove(context, "document", document.id).ok,
    ).toBe(false);
    expect(
      publisherOkMap.lifecycle(context, document.id, "archived").ok,
    ).toBe(false);
    expect(
      publisherOkMap.validate(context, {
        entityType: "document",
        entity: document,
      }).ok,
    ).toBe(false);
    expect(
      publisherOkMap.preview(context, {
        entityType: "document",
        entity: document,
      }).ok,
    ).toBe(false);
    expect(
      publisherOkMap.update(context, {
        entityType: "document",
        entity: document,
      }).ok,
    ).toBe(false);

    void createDocumentsSearchAdapter({
      integrationPublisher: throwing,
      integration: adapter.integration,
    });

    expect(createDocumentsSearchPublisherForTest()).toBeDefined();

    const sink = new InMemorySearchPublicationSink();
    const viaSinkKind = createDocumentsSearchAdapter({
      searchIntegrationOptions: { sinkKind: "noop" },
    });
    expect(viaSinkKind.integration.sink.kind).toBe("noop");

    const viaExplicitSink = createDocumentsSearchAdapter({ sink });
    expect(viaExplicitSink.integration.sink).toBe(sink);

    const integration = createSearchIntegration();
    const viaIntegrationOnly = createDocumentsSearchAdapter({
      integration,
    });
    expect(viaIntegrationOnly.integration).toBe(integration);

    expect(() =>
      adapter.mapper.mapDocumentVersion(context, version, {
        parentDocument: {
          ...document,
          id: asDocumentId("doc_otheraaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
        },
      }),
    ).toThrow(/must match/);

    expect(
      adapter.validator.validateDraft(context, {
        entityId: "ok",
        entityType: "document",
        title: "T",
        classification: "internal",
        permissions: [],
        metadata: { documentType: "", status: "active" },
      }).valid,
    ).toBe(false);

    // empty permissions on draft and context
    expect(
      adapter.validator.validateDraft(
        { ...context, permissions: [] },
        {
          entityId: "ok",
          entityType: "document_folder",
          title: "T",
          classification: "internal",
          permissions: [],
          metadata: {},
        },
      ).issues.some((i) => i.field === "permissions"),
    ).toBe(true);
  });
});
