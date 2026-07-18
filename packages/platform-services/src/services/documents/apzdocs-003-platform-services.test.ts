/**
 * APZDOCS-003 — Document Platform Services, Gateway & Authorization.
 */

import { describe, expect, it } from "vitest";

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import { PLATFORM_DOCUMENT_PERMISSIONS } from "@apzhub/document-contracts";

import {
  createDocumentPlatformServicesForTest,
  createPlatformServices,
  PLATFORM_SERVICE_PERMISSION_CATALOGUE,
  resolveOperationAuthorization,
} from "../../index";

function ctx(overrides?: Partial<ServiceRequestContext>): ServiceRequestContext {
  return {
    tenantId: "tenant_docs",
    userId: "user_docs",
    organisationId: "org_docs",
    correlationId: "corr_apzdocs_003",
    permissions: ["document.*"],
    ...overrides,
  };
}

describe("APZDOCS-003 document platform services", () => {
  it("registers document permissions in the platform catalogue", () => {
    for (const permission of PLATFORM_DOCUMENT_PERMISSIONS) {
      expect(PLATFORM_SERVICE_PERMISSION_CATALOGUE).toContain(permission);
    }
  });

  it("maps gateway operations to document permissions (no allow-all)", () => {
    expect(
      resolveOperationAuthorization("documentService", "create")?.requiredPermission,
    ).toBe("document.create");
    expect(
      resolveOperationAuthorization("documentStorage", "inspectReconciliation")
        ?.requiredPermission,
    ).toBe("document.reconciliation.read");
    expect(
      resolveOperationAuthorization("documentFolder", "assign")?.requiredPermission,
    ).toBe("document.folder.write");
  });

  it("wires gateway facets through RequestPipeline without storage provider leakage", async () => {
    let seq = 0;
    const documents = await createDocumentPlatformServicesForTest({
      allowInMemoryPersistence: true,
      allowInMemoryStorage: true,
      now: () => "2026-07-13T14:00:00.000Z",
      id: () => `d003_${++seq}`,
    });
    const bundle = createPlatformServices({
      documents,
      authorizationMode: "allow-all",
    });

    const request = ctx();
    const created = await bundle.gateway.documents.create(request, {
      title: "Gateway Doc",
      tagNames: ["alpha"],
      classification: "internal",
    });
    expect(created.title).toBe("Gateway Doc");

    await bundle.gateway.documentMetadata.update(request, {
      documentId: created.id,
      description: "updated",
    });
    await bundle.gateway.documentClassification.classify(request, {
      documentId: created.id,
      classification: "confidential",
    });
    await bundle.gateway.documentTags.tag(request, {
      documentId: created.id,
      tagNames: ["beta"],
    });
    await bundle.gateway.documentFolders.assign(request, {
      documentId: created.id,
      folderId: "folder_1",
    });
    await bundle.gateway.documentCollections.assign(request, {
      documentId: created.id,
      collectionId: "collection_1",
    });

    const other = await bundle.gateway.documents.create(request, {
      title: "Related",
    });
    await bundle.gateway.documentRelationships.relate(request, {
      sourceDocumentId: created.id,
      targetDocumentId: other.id,
      kind: "related_to",
    });

    const found = await bundle.gateway.documentSearchMetadata.find(request, {
      query: "Gateway",
    });
    expect(found.some((row) => row.documentId === created.id)).toBe(true);

    const audits = await bundle.gateway.documentAudit.list(request, created.id);
    expect(audits.length).toBeGreaterThan(0);

    // Binary store stays behind Document Core — gateway exposes metadata only.
    await documents.foundation.content.storeContent(
      {
        tenantId: request.tenantId,
        userId: request.userId,
        correlationId: request.correlationId,
        permissions: request.permissions,
      },
      {
        documentId: created.id,
        source: { kind: "bytes", bytes: new TextEncoder().encode("payload") },
        mimeType: "text/plain",
      },
    );
    const versions = await bundle.gateway.documentVersions.list(request, created.id);
    expect(versions).toHaveLength(1);
    const meta = await bundle.gateway.documentStorage.getStorageMetadata(
      request,
      created.id,
      versions[0]!.id as never,
    );
    expect(meta.version.checksumHex).toBeTruthy();
    expect(meta).not.toHaveProperty("bytes");

    const diagnostics =
      await bundle.gateway.documentDiagnostics.getDiagnostics(request);
    expect(diagnostics.providerReady).toBe(true);
    expect(diagnostics.checksumReady).toBe(true);
    expect(JSON.stringify(diagnostics)).not.toMatch(/\/tmp|secret|AKIA/);

    const inspection =
      await bundle.gateway.documentStorage.inspectReconciliation(request);
    expect(inspection.issues).toEqual([]);

    await bundle.gateway.documents.archive(request, created.id);
    await bundle.gateway.documents.restore(request, created.id);
  });

  it("isolates tenants at the gateway boundary", async () => {
    let seq = 0;
    const documents = await createDocumentPlatformServicesForTest({
      allowInMemoryPersistence: true,
      now: () => "2026-07-13T14:00:00.000Z",
      id: () => `iso_${++seq}`,
    });
    const bundle = createPlatformServices({
      documents,
      authorizationMode: "allow-all",
    });
    const owner = ctx();
    const doc = await bundle.gateway.documents.create(owner, {
      title: "Private",
    });
    const other = ctx({ tenantId: "other_tenant" });
    await expect(bundle.gateway.documents.get(other, doc.id)).rejects.toBeTruthy();
  });

  it("production factory requires postgres and configured storage", async () => {
    const { createDocumentPlatformServicesForProduction } =
      await import("./create-document-platform-services");
    await expect(
      createDocumentPlatformServicesForProduction({
        postgresDb: undefined as never,
        storageConfig: {
          mode: "memory_test",
          providerId: "memory",
          maxObjectBytes: 1,
          checksumAlgorithm: "sha256",
          allowBinaryDeletion: false,
        },
      }),
    ).rejects.toThrow(/postgresDb|memory_test|forbids/);
  });

  it("does not import storage providers into service impls", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const root = join(__dirname, "../../..");
    const impl = readFileSync(
      join(root, "src/services/documents/document-service-impls.ts"),
      "utf8",
    );
    expect(impl).not.toMatch(/createFilesystem|createS3|@aws-sdk/);
    expect(impl).toMatch(/document-core|DocumentPlatformFoundation/);
  });
});
