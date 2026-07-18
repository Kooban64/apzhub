/**
 * APZSEARCH-012 residual coverage — classification, lifecycle, safe fields, errors.
 */
import { describe, expect, it } from "vitest";
import {
  asDocumentId,
  type Document,
  type DocumentClassificationCode,
} from "@apzhub/document-contracts";

import {
  DiagnosticsStore,
  DocumentsSearchErrorTranslator,
  DocumentsSearchLifecycle,
  assertPlatformEntityId,
  createDocumentsSearchAdapterForTest,
  createDocumentsSearchPublicationContext,
  filterSafeCustomMetadata,
  isForbiddenMetadataKey,
  isForbiddenMetadataValue,
  isSafeMetadataKey,
  mapDocumentClassification,
  scanMetadataForStorageLeakage,
  toSearchIntegrationContext,
} from "./index";

function ctx() {
  return createDocumentsSearchPublicationContext({
    serviceContext: {
      tenantId: "tenant-a",
      userId: "user-1",
      correlationId: "corr-cov",
      permissions: ["documents.read"],
      organisationId: "org-a",
      requestId: "req-1",
      locale: "en",
    },
    publicationReason: "coverage",
    lifecycleOperation: "validated",
  });
}

const baseDoc: Document = {
  id: asDocumentId("doc_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
  tenantId: "tenant-a",
  title: "Policy",
  documentType: "policy",
  classification: { code: "internal" },
  status: "active",
  lifecycle: {
    state: "active",
    changedAt: "2026-01-01T00:00:00.000Z",
    changedBy: "user-1",
  },
  tagIds: [],
  creatorUserId: "user-1",
  permissions: [{ principalType: "role", principalId: "reader", action: "read" }],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("APZSEARCH-012 residual coverage", () => {
  it("covers context helpers, assert ids, lifecycle suggest, errors", () => {
    const context = ctx();
    expect(toSearchIntegrationContext(context).productId).toBe("documents");
    expect(context.publicationReason).toBe("coverage");
    expect(context.lifecycleOperation).toBe("validated");
    expect(() => assertPlatformEntityId("")).toThrow(/required/);
    expect(() => assertPlatformEntityId("s3://bucket/x")).toThrow(/storage/);

    const life = new DocumentsSearchLifecycle();
    expect(life.suggestFromDocumentStatus("draft")).toBe("draft");
    expect(life.suggestFromDocumentStatus("active")).toBe("validated");
    expect(life.suggestFromDocumentStatus("restored")).toBe("validated");
    expect(life.suggestFromDocumentStatus("archived")).toBe("archived");
    expect(life.suggestFromDocumentStatus("retained")).toBe("archived");
    expect(life.suggestFromDocumentStatus("deleted")).toBe("removed");
    expect(life.suggestFromDocumentStatus("expired")).toBe("removed");
    expect(life.suggestFromDocumentStatus(undefined)).toBe("validated");
    expect(life.suggestFromDomainStatus("document_version", "active")).toBe(
      "validated",
    );
    expect(life.suggestFromDomainStatus("document_version", "deleted")).toBe("removed");
    expect(life.suggestFromDomainStatus("document", "draft")).toBe("draft");
    expect(life.canTransition("published", "removed")).toBe(true);
    expect(() => life.assertTransition("archived", "published")).toThrow();

    const errors = new DocumentsSearchErrorTranslator();
    expect(errors.translate(new Error("storageKey forbidden")).classification).toBe(
      "validation_failed",
    );
    expect(errors.translate(new Error("classification required")).classification).toBe(
      "validation_failed",
    );
    expect(errors.translate(new Error("tenant mismatch")).classification).toBe(
      "tenant_mismatch",
    );
    expect(errors.translate(new Error("boom")).message).toContain("boom");

    const store = new DiagnosticsStore();
    store.touch("validate", "corr");
    expect(
      store.build(
        {
          byEntityType: {},
          published: 0,
          updated: 0,
          removed: 0,
          validated: 0,
          previewed: 0,
          validationFailures: 0,
          publicationFailures: 0,
        },
        ["document"],
      ).productId,
    ).toBe("documents");
  });

  it("covers classification mapping matrix", () => {
    const matrix: Array<[DocumentClassificationCode, string]> = [
      ["public", "public"],
      ["internal", "internal"],
      ["template", "internal"],
      ["attachment", "internal"],
      ["confidential", "confidential"],
      ["legal", "confidential"],
      ["financial", "confidential"],
      ["compliance", "confidential"],
      ["generated_report", "confidential"],
      ["restricted", "restricted"],
      ["evidence", "restricted"],
      ["custom", "confidential"],
    ];
    for (const [code, expected] of matrix) {
      expect(mapDocumentClassification(code)).toBe(expected);
    }
    expect(() => mapDocumentClassification(undefined)).toThrow(/fail-closed/);

    const adapter = createDocumentsSearchAdapterForTest();
    const context = ctx();
    expect(() =>
      adapter.mapper.mapDocument(context, {
        ...baseDoc,
        classification: undefined as unknown as Document["classification"],
      }),
    ).toThrow(/fail-closed/);

    const confidential = adapter.mapper.mapDocument(context, {
      ...baseDoc,
      classification: { code: "legal" },
    });
    expect(confidential.classification).toBe("confidential");
  });

  it("covers safe fields allowlist and rejection", () => {
    expect(isSafeMetadataKey("byteLength")).toBe(true);
    expect(isSafeMetadataKey("storageKey")).toBe(false);
    expect(isForbiddenMetadataKey("storageKey")).toBe(true);
    expect(isForbiddenMetadataKey("signedUrl")).toBe(true);
    expect(isForbiddenMetadataKey("byteLength")).toBe(false);
    expect(isForbiddenMetadataValue("s3://bucket/obj")).toBe(true);
    expect(isForbiddenMetadataValue("deadbeefdeadbeefdeadbeefdeadbeef")).toBe(true);
    expect(isForbiddenMetadataValue("application/pdf")).toBe(false);

    const leaks = scanMetadataForStorageLeakage({
      storageKey: "x",
      mimeType: "s3://bucket/x",
      ok: "yes",
    });
    expect(leaks.some((i) => i.code === "storage_leakage")).toBe(true);

    expect(
      filterSafeCustomMetadata({
        byteLength: "10",
        storageKey: "bad",
        notes: "secret",
        mystery: "value",
      }),
    ).toEqual({ byteLength: "10" });

    const adapter = createDocumentsSearchAdapterForTest();
    const draft = adapter.mapper.mapDocument(ctx(), {
      ...baseDoc,
      status: "draft",
      generationRef: {
        generationId: "gen-1",
        reportType: "monthly",
        generatedAt: "2026-01-01T00:00:00.000Z",
        product: "reports",
      },
      templateRef: {
        templateId: "tpl-1",
        templateVersion: "2",
        product: "documents",
      },
      checksum: { algorithm: "sha256", hex: "aa".repeat(32) },
    });
    expect(draft.metadata?.generationId).toBe("gen-1");
    expect(draft.metadata?.templateId).toBe("tpl-1");
    expect(draft.metadata?.checksumPresent).toBe("true");
    expect(JSON.stringify(draft.metadata)).not.toMatch(/aa{16}/);

    const validated = adapter.publisher.validate(ctx(), {
      entityType: "document",
      entity: { ...baseDoc, status: "draft" },
    });
    expect(validated.ok).toBe(true);
  });
});
