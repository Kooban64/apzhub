/**
 * APZDOCS-002 — persistence factories, version immutability, tenant isolation.
 */

import { describe, expect, it } from "vitest";

import type {
  DocumentContentVersionRecord,
  DocumentRequestContext,
} from "@apzhub/document-contracts";
import { asDocumentId, asDocumentVersionId } from "@apzhub/document-contracts";
import { createDocumentPlatformFoundation } from "@apzhub/document-core";
import { createDocumentStorageForTest } from "@apzhub/document-storage";

import {
  createDocumentPersistenceForProduction,
  createDocumentPersistenceForTest,
  createEmptyDocumentVersionInMemoryStores,
  createInMemoryDocumentVersionRepositories,
  DOCUMENT_PERSISTENCE_VERSION,
} from "./index";

function ctx(
  overrides?: Partial<DocumentRequestContext>,
): DocumentRequestContext {
  return {
    tenantId: "tenant_p",
    userId: "user_p",
    organisationId: "org_p",
    permissions: ["document.*"],
    ...overrides,
  };
}

function versionFixture(
  overrides?: Partial<DocumentContentVersionRecord>,
): DocumentContentVersionRecord {
  return {
    id: "ver_1",
    documentId: "doc_1",
    tenantId: "tenant_p",
    organisationId: "org_p",
    versionNumber: 1,
    mimeType: "text/plain",
    byteLength: 4,
    checksumAlgorithm: "sha256",
    checksumHex: "abcd",
    storageProviderId: "memory",
    storageKey: "tenants/tenant_p/documents/doc_1/versions/ver_1/content.bin",
    storageStatus: "verified",
    immutable: true,
    createdAt: "2026-07-13T12:00:00.000Z",
    createdBy: "user_p",
    revision: 1,
    ...overrides,
  };
}

describe("APZDOCS-002 document-persistence", () => {
  it("exports 0.2.0 and requires production postgres", () => {
    expect(DOCUMENT_PERSISTENCE_VERSION).toBe("0.2.0");
    expect(() =>
      createDocumentPersistenceForProduction({
        postgresDb: undefined as never,
      }),
    ).toThrow(/postgresDb/);
    expect(() => createDocumentPersistenceForTest()).toThrow(
      /allowInMemoryPersistence/,
    );
  });

  it("enforces version immutability (status-only updates)", async () => {
    const stores = createEmptyDocumentVersionInMemoryStores();
    const repos = createInMemoryDocumentVersionRepositories(stores);
    const request = ctx();
    const created = await repos.versions.create(request, versionFixture());
    expect(created.immutable).toBe(true);

    await expect(
      repos.versions.create(request, versionFixture({ immutable: true })),
    ).rejects.toThrow(/already exists/);

    const updated = await repos.versions.updateStatus(
      request,
      asDocumentId("doc_1"),
      asDocumentVersionId("ver_1"),
      "deletion_pending",
      { expectedRevision: 1 },
    );
    expect(updated.checksumHex).toBe("abcd");
    expect(updated.storageKey).toBe(created.storageKey);
    expect(updated.byteLength).toBe(4);
    expect(updated.storageStatus).toBe("deletion_pending");
    expect(updated.revision).toBe(2);

    await expect(
      repos.versions.updateStatus(
        request,
        asDocumentId("doc_1"),
        asDocumentVersionId("ver_1"),
        "deleted",
        { expectedRevision: 1 },
      ),
    ).rejects.toThrow(/revision_conflict/);
  });

  it("isolates tenants for versions and storage objects", async () => {
    const repos = createInMemoryDocumentVersionRepositories();
    await repos.versions.create(ctx(), versionFixture());
    expect(
      await repos.versions.get(
        ctx({ tenantId: "other" }),
        asDocumentId("doc_1"),
        asDocumentVersionId("ver_1"),
      ),
    ).toBeNull();

    await repos.storageObjects.create(ctx(), {
      id: "obj_1",
      tenantId: "tenant_p",
      documentId: "doc_1",
      versionId: "ver_1",
      providerId: "memory",
      storageKey: "k",
      byteLength: 1,
      mimeType: "text/plain",
      checksumHex: "aa",
      checksumAlgorithm: "sha256",
      status: "reconciliation_required",
      createdAt: "2026-07-13T12:00:00.000Z",
      updatedAt: "2026-07-13T12:00:00.000Z",
      revision: 1,
    });
    const candidates = await repos.storageObjects.listReconciliationCandidates(
      ctx(),
    );
    expect(candidates).toHaveLength(1);
    expect(
      await repos.storageObjects.listReconciliationCandidates(
        ctx({ tenantId: "other" }),
      ),
    ).toEqual([]);
  });

  it("wires foundation with persistence + storage factories", async () => {
    let seq = 0;
    const persistence = createDocumentPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const storage = await createDocumentStorageForTest();
    const foundation = createDocumentPlatformFoundation({
      ...persistence,
      provider: storage.provider,
      registry: storage.registry,
      maxObjectBytes: 4096,
      allowBinaryDeletion: true,
      now: () => "2026-07-13T12:00:00.000Z",
      id: () => `pf_${++seq}`,
    });
    const request = ctx();
    const doc = await foundation.documents.createDocument(request, {
      title: "Foundation",
    });
    const stored = await foundation.content.storeContent(request, {
      documentId: doc.id,
      source: { kind: "bytes", bytes: new TextEncoder().encode("ok") },
      mimeType: "text/plain",
    });
    expect(stored.version.versionNumber).toBe(1);
    expect(stored.integrity.ok).toBe(true);
  });
});
