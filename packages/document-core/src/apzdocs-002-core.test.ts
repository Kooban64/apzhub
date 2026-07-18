/**
 * APZDOCS-002 — storage coordinator, integrity, registry, foundation tests.
 */

import { describe, expect, it } from "vitest";

import type { DocumentRequestContext } from "@apzhub/document-contracts";
import { asDocumentId, asDocumentVersionId } from "@apzhub/document-contracts";
import {
  createDocumentPersistenceForTest,
  createEmptyDocumentInMemoryStores,
  createEmptyDocumentVersionInMemoryStores,
} from "@apzhub/document-persistence";
import {
  createDocumentStorageForProduction,
  createDocumentStorageForTest,
  createMemoryDocumentStorageProvider,
} from "@apzhub/document-storage";

import {
  createDocumentIntegrityService,
  createDocumentPlatformFoundation,
  createDocumentStorageCoordinator,
  createDocumentStorageProviderRegistry,
  DOCUMENT_CORE_VERSION,
  redactDocumentStorageConfig,
  sha256Hex,
  UNIMPLEMENTED_DOCUMENT_STORAGE_CAPABILITIES,
  validateDocumentStorageConfig,
} from "./index";

function ctx(overrides?: Partial<DocumentRequestContext>): DocumentRequestContext {
  return {
    tenantId: "tenant_1",
    userId: "user_1",
    organisationId: "org_1",
    correlationId: "corr_docs_002",
    permissions: ["document.*"],
    ...overrides,
  };
}

async function foundation() {
  let seq = 0;
  const persistence = createDocumentPersistenceForTest({
    allowInMemoryPersistence: true,
    stores: createEmptyDocumentInMemoryStores(),
    versionStores: createEmptyDocumentVersionInMemoryStores(),
  });
  const storage = await createDocumentStorageForTest({
    allowInMemoryStorage: true,
  });
  return createDocumentPlatformFoundation({
    ...persistence,
    provider: storage.provider,
    registry: storage.registry,
    maxObjectBytes: 1024 * 1024,
    allowBinaryDeletion: true,
    now: () => "2026-07-13T12:00:00.000Z",
    id: () => `id_${++seq}`,
  });
}

describe("APZDOCS-002 document-core", () => {
  it("exports 0.3.0 and rejects unimplemented provider registration", () => {
    expect(DOCUMENT_CORE_VERSION).toBe("0.3.0");
    const registry = createDocumentStorageProviderRegistry();
    expect(() =>
      registry.register({
        id: "azure",
        kind: "azure_blob",
        capabilities: UNIMPLEMENTED_DOCUMENT_STORAGE_CAPABILITIES,
        async initialise() {},
        async validateConfiguration() {},
        async healthCheck() {
          return { healthy: false, message: "unimplemented" };
        },
        async putObject() {
          throw new Error("unimplemented");
        },
        async getObject() {
          throw new Error("unimplemented");
        },
        async headObject() {
          return null;
        },
        async deleteObject() {},
        async verifyObject() {
          return false;
        },
        listCapabilities() {
          return UNIMPLEMENTED_DOCUMENT_STORAGE_CAPABILITIES;
        },
        async dispose() {},
      }),
    ).toThrow(/unimplemented/i);
  });

  it("validates and redacts storage config without secrets", () => {
    const ok = validateDocumentStorageConfig({
      mode: "s3",
      providerId: "s3-prod",
      s3Bucket: "docs",
      s3Region: "eu-west-1",
      s3AccessKeyRef: "secret://ak",
      s3SecretKeyRef: "secret://sk",
      maxObjectBytes: 10,
      checksumAlgorithm: "sha256",
      allowBinaryDeletion: false,
    });
    expect(ok.ok).toBe(true);

    const badProdFs = validateDocumentStorageConfig(
      {
        mode: "filesystem",
        providerId: "fs",
        filesystemRoot: "/data/docs",
        maxObjectBytes: 10,
        checksumAlgorithm: "sha256",
        allowBinaryDeletion: false,
      },
      { production: true },
    );
    expect(badProdFs.ok).toBe(false);

    const redacted = redactDocumentStorageConfig({
      mode: "s3",
      providerId: "s3-prod",
      s3Bucket: "docs",
      s3Region: "eu-west-1",
      s3AccessKeyRef: "secret://ak",
      s3SecretKeyRef: "secret://sk",
      maxObjectBytes: 10,
      checksumAlgorithm: "sha256",
      allowBinaryDeletion: false,
      filesystemRoot: "/secret/path",
    });
    expect(redacted).not.toHaveProperty("s3AccessKeyRef");
    expect(JSON.stringify(redacted)).not.toContain("/secret/path");
    expect(redacted.hasFilesystemRoot).toBe(true);
  });

  it("hashes and verifies integrity; ETag is never canonical", async () => {
    const integrity = createDocumentIntegrityService();
    const bytes = new TextEncoder().encode("hello-docs");
    const hex = sha256Hex(bytes);
    expect(integrity.hash(bytes)).toBe(hex);
    expect(
      integrity.verify({
        bytes,
        expectedHex: hex,
        expectedByteLength: bytes.byteLength,
      }).ok,
    ).toBe(true);
    expect(
      integrity.verify({
        bytes,
        expectedHex: "deadbeef",
        expectedByteLength: bytes.byteLength,
      }).ok,
    ).toBe(false);

    const collected = await integrity.collect(
      {
        kind: "stream",
        stream: (async function* () {
          yield bytes.slice(0, 4);
          yield bytes.slice(4);
        })(),
      },
      { maxBytes: 100 },
    );
    expect(sha256Hex(collected)).toBe(hex);

    await expect(
      integrity.collect({ kind: "bytes", bytes: new Uint8Array(20) }, { maxBytes: 10 }),
    ).rejects.toThrow(/max/i);
  });

  it("stores immutable versions via coordinator and detects duplicates", async () => {
    const f = await foundation();
    const request = ctx();
    const doc = await f.documents.createDocument(request, {
      title: "Spec",
    });
    const bytes = new TextEncoder().encode("version-one-content");
    const stored = await f.content.storeContent(request, {
      documentId: doc.id,
      source: { kind: "bytes", bytes },
      mimeType: "text/plain",
      displayFilename: "spec.txt",
    });
    expect(stored.version.immutable).toBe(true);
    expect(stored.version.storageStatus).toBe("verified");
    expect(stored.version.checksumHex).toBe(sha256Hex(bytes));
    expect(stored.duplicateChecksumDetected).toBe(false);

    const read = await f.content.readContent(request, {
      documentId: doc.id,
      versionId: asDocumentVersionId(stored.version.id),
    });
    expect(read.kind).toBe("bytes");
    if (read.kind === "bytes") {
      expect(Buffer.from(read.bytes).toString()).toBe("version-one-content");
    }

    const again = await f.content.storeContent(request, {
      documentId: doc.id,
      source: { kind: "bytes", bytes },
      mimeType: "text/plain",
    });
    expect(again.duplicateChecksumDetected).toBe(true);
    expect(again.version.versionNumber).toBe(2);

    const versions = await f.content.listVersions(request, doc.id);
    expect(versions).toHaveLength(2);
    expect(versions[0]!.checksumHex).toBe(versions[1]!.checksumHex);
  });

  it("enforces tenant isolation and permission denial on content ops", async () => {
    const f = await foundation();
    const owner = ctx();
    const doc = await f.documents.createDocument(owner, { title: "Private" });
    await f.content.storeContent(owner, {
      documentId: doc.id,
      source: { kind: "bytes", bytes: new Uint8Array([1, 2, 3]) },
      mimeType: "application/octet-stream",
    });

    const other = ctx({
      tenantId: "tenant_other",
      permissions: ["document.*"],
    });
    await expect(f.content.listVersions(other, doc.id)).rejects.toMatchObject({
      code: "not_found",
    });

    const denied = ctx({ permissions: ["document.read"] });
    await expect(
      f.content.storeContent(denied, {
        documentId: doc.id,
        source: { kind: "bytes", bytes: new Uint8Array([9]) },
        mimeType: "application/octet-stream",
      }),
    ).rejects.toMatchObject({ code: "forbidden" });
  });

  it("blocks retained binary deletion and supports inspect reconciliation", async () => {
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
      id: () => `c_${++seq}`,
      maxObjectBytes: 1024,
      allowBinaryDeletion: false,
    });
    const request = ctx();
    const now = "2026-07-13T12:00:00.000Z";
    await persistence.documents.create(request, {
      id: asDocumentId("retained_doc"),
      tenantId: request.tenantId,
      organisationId: request.organisationId,
      documentType: "file",
      status: "retained",
      classification: { code: "internal" },
      title: "Retain",
      creatorUserId: request.userId,
      tagIds: [],
      permissions: [],
      lifecycle: {
        state: "retained",
        changedAt: now,
        changedBy: request.userId,
      },
      retentionId: "ret_1" as never,
      createdAt: now,
      updatedAt: now,
    });
    const stored = await content.storeContent(request, {
      documentId: asDocumentId("retained_doc"),
      source: { kind: "bytes", bytes: new Uint8Array([4, 5]) },
      mimeType: "application/octet-stream",
    });
    await expect(
      content.deleteContent(request, {
        documentId: asDocumentId("retained_doc"),
        versionId: asDocumentVersionId(stored.version.id),
      }),
    ).rejects.toMatchObject({ code: "retention_lock" });

    const inspection = await content.inspectReconciliation(request);
    expect(inspection.issues).toEqual([]);
  });

  it("production storage factory rejects memory_test", async () => {
    await expect(
      createDocumentStorageForProduction({
        config: {
          mode: "memory_test",
          providerId: "memory",
          maxObjectBytes: 10,
          checksumAlgorithm: "sha256",
          allowBinaryDeletion: true,
        },
      }),
    ).rejects.toThrow(/forbids memory_test/);
  });

  it("persistence test factory requires explicit in-memory opt-in", () => {
    expect(() => createDocumentPersistenceForTest()).toThrow(
      /allowInMemoryPersistence/,
    );
  });
});
