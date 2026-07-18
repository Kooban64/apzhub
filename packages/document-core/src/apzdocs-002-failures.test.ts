/**
 * Additional coordinator failure / immutability / security coverage (APZDOCS-002).
 */

import { describe, expect, it, vi } from "vitest";

import type { DocumentRequestContext } from "@apzhub/document-contracts";
import { asDocumentId, asDocumentVersionId } from "@apzhub/document-contracts";
import { createDocumentPersistenceForTest } from "@apzhub/document-persistence";
import { createMemoryDocumentStorageProvider } from "@apzhub/document-storage";

import {
  createDocumentStorageCoordinator,
  createDocumentStorageProviderRegistry,
  DocumentDomainError,
} from "./index";

function ctx(overrides?: Partial<DocumentRequestContext>): DocumentRequestContext {
  return {
    tenantId: "tenant_x",
    userId: "user_x",
    permissions: ["document.*"],
    ...overrides,
  };
}

describe("APZDOCS-002 coordinator failure paths", () => {
  it("marks failed when object write fails", async () => {
    let seq = 0;
    const persistence = createDocumentPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const provider = createMemoryDocumentStorageProvider({ id: "mem" });
    await provider.initialise();
    vi.spyOn(provider, "putObject").mockRejectedValueOnce(
      new Error("provider unavailable"),
    );
    const content = createDocumentStorageCoordinator({
      documents: persistence.documents,
      versions: persistence.versions,
      storageObjects: persistence.storageObjects,
      provider,
      now: () => "2026-07-13T12:00:00.000Z",
      id: () => `f_${++seq}`,
      maxObjectBytes: 1024,
      allowBinaryDeletion: true,
    });
    const request = ctx();
    await persistence.documents.create(request, {
      id: asDocumentId("doc_fail"),
      tenantId: request.tenantId,
      documentType: "file",
      status: "active",
      classification: { code: "internal" },
      title: "Fail",
      creatorUserId: request.userId,
      tagIds: [],
      permissions: [],
      lifecycle: {
        state: "active",
        changedAt: "2026-07-13T12:00:00.000Z",
        changedBy: request.userId,
      },
      createdAt: "2026-07-13T12:00:00.000Z",
      updatedAt: "2026-07-13T12:00:00.000Z",
    });
    await expect(
      content.storeContent(request, {
        documentId: asDocumentId("doc_fail"),
        source: { kind: "bytes", bytes: new Uint8Array([1]) },
        mimeType: "application/octet-stream",
      }),
    ).rejects.toMatchObject({ code: "storage_write_failed" });

    const versions = await persistence.versions.listByDocument(
      request,
      asDocumentId("doc_fail"),
    );
    expect(versions[0]?.storageStatus).toBe("failed");
  });

  it("rejects object-key-only access patterns via canonical identity", async () => {
    const registry = createDocumentStorageProviderRegistry();
    const provider = createMemoryDocumentStorageProvider({ id: "mem" });
    registry.register(provider);
    // Content APIs require documentId + versionId — raw keys are not a public API.
    const persistence = createDocumentPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    let seq = 0;
    const content = createDocumentStorageCoordinator({
      documents: persistence.documents,
      versions: persistence.versions,
      storageObjects: persistence.storageObjects,
      provider,
      now: () => "2026-07-13T12:00:00.000Z",
      id: () => `s_${++seq}`,
      maxObjectBytes: 1024,
      allowBinaryDeletion: true,
    });
    await expect(
      content.readContent(ctx(), {
        documentId: asDocumentId("missing"),
        versionId: asDocumentVersionId("missing_ver"),
      }),
    ).rejects.toBeInstanceOf(DocumentDomainError);
  });

  it("records reconciliation_required when provider delete fails", async () => {
    let seq = 0;
    const persistence = createDocumentPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const provider = createMemoryDocumentStorageProvider({ id: "mem" });
    await provider.initialise();
    const content = createDocumentStorageCoordinator({
      documents: persistence.documents,
      versions: persistence.versions,
      storageObjects: persistence.storageObjects,
      provider,
      now: () => "2026-07-13T12:00:00.000Z",
      id: () => `d_${++seq}`,
      maxObjectBytes: 1024,
      allowBinaryDeletion: true,
    });
    const request = ctx();
    await persistence.documents.create(request, {
      id: asDocumentId("doc_del"),
      tenantId: request.tenantId,
      documentType: "file",
      status: "active",
      classification: { code: "internal" },
      title: "Del",
      creatorUserId: request.userId,
      tagIds: [],
      permissions: [],
      lifecycle: {
        state: "active",
        changedAt: "2026-07-13T12:00:00.000Z",
        changedBy: request.userId,
      },
      createdAt: "2026-07-13T12:00:00.000Z",
      updatedAt: "2026-07-13T12:00:00.000Z",
    });
    const stored = await content.storeContent(request, {
      documentId: asDocumentId("doc_del"),
      source: { kind: "bytes", bytes: new Uint8Array([7, 7]) },
      mimeType: "application/octet-stream",
    });
    vi.spyOn(provider, "deleteObject").mockRejectedValueOnce(
      new Error("delete denied"),
    );
    await expect(
      content.deleteContent(request, {
        documentId: asDocumentId("doc_del"),
        versionId: asDocumentVersionId(stored.version.id),
      }),
    ).rejects.toMatchObject({ code: "storage_delete_failed" });
    const version = await persistence.versions.get(
      request,
      asDocumentId("doc_del"),
      asDocumentVersionId(stored.version.id),
    );
    expect(version?.storageStatus).toBe("reconciliation_required");
  });

  it("registry prevents duplicate registration and silent fallback", async () => {
    const registry = createDocumentStorageProviderRegistry();
    const a = createMemoryDocumentStorageProvider({ id: "a" });
    const b = createMemoryDocumentStorageProvider({ id: "a" });
    registry.register(a);
    expect(() => registry.register(b)).toThrow(/Duplicate/);
    expect(() => registry.setActive("missing")).toThrow(/Unknown/);
    expect(() => createDocumentStorageProviderRegistry().getActive()).toThrow(
      /No active/,
    );
  });
});
