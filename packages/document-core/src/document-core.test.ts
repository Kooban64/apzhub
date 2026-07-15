import { describe, expect, it } from "vitest";

import {
  assertDocumentLifecycleTransition,
  buildDocumentClassification,
  canTransitionDocumentLifecycle,
  createDocumentPlatformService,
  createEmptyDocumentStorageProviderRegistry,
  DOCUMENT_CORE_VERSION,
  DOCUMENT_STORAGE_PROVIDER_KINDS,
  DocumentDomainError,
  isDocumentClassificationCode,
  isDocumentLifecycleState,
} from "./index";
import {
  createDocumentPlatformReposFromMemory,
  createEmptyDocumentInMemoryStores,
} from "@apzhub/document-persistence";
import type { DocumentRequestContext } from "@apzhub/document-contracts";
import { asDocumentTagId } from "@apzhub/document-contracts";

function ctx(
  overrides?: Partial<DocumentRequestContext>,
): DocumentRequestContext {
  return {
    tenantId: "tenant_1",
    userId: "user_1",
    organisationId: "org_1",
    correlationId: "corr_docs_001",
    permissions: ["document.*"],
    ...overrides,
  };
}

function createService() {
  let seq = 0;
  const stores = createEmptyDocumentInMemoryStores();
  const repos = createDocumentPlatformReposFromMemory(stores);
  const service = createDocumentPlatformService({
    ...repos,
    now: () => "2026-07-13T08:00:00.000Z",
    id: () => `id_${++seq}`,
  });
  return { service, stores };
}

describe("document-core", () => {
  it("exports version and storage provider kinds without implementations", () => {
    expect(DOCUMENT_CORE_VERSION).toBe("0.3.0");
    expect(DOCUMENT_STORAGE_PROVIDER_KINDS).toContain("s3");
    expect(DOCUMENT_STORAGE_PROVIDER_KINDS).toContain("minio");
    const registry = createEmptyDocumentStorageProviderRegistry();
    expect(registry.list()).toEqual([]);
  });

  it("validates classification and lifecycle rules", () => {
    expect(isDocumentClassificationCode("confidential")).toBe(true);
    expect(isDocumentClassificationCode("unknown")).toBe(false);
    expect(
      buildDocumentClassification({ code: "legal", label: "Legal" }).code,
    ).toBe("legal");
    expect(() =>
      buildDocumentClassification({ code: "custom" }),
    ).toThrowError(DocumentDomainError);
    expect(isDocumentLifecycleState("draft")).toBe(true);
    expect(canTransitionDocumentLifecycle("draft", "active")).toBe(true);
    expect(canTransitionDocumentLifecycle("deleted", "active")).toBe(false);
    expect(() =>
      assertDocumentLifecycleTransition("deleted", "active"),
    ).toThrowError(DocumentDomainError);
  });

  it("creates, updates, classifies, tags, relates, finds, and archives documents", async () => {
    const { service } = createService();
    const request = ctx();

    const created = await service.createDocument(request, {
      title: "Policy Pack",
      description: "Foundation document",
      documentType: "policy",
      classification: "compliance",
      mimeType: "application/pdf",
      byteLength: 1024,
      checksumHex: "abc",
      tagNames: ["policy", "v1"],
      storageProviderId: "future-s3",
      storageKey: "tenants/tenant_1/docs/policy-1",
    });
    expect(created.status).toBe("draft");
    expect(created.storageRef?.storageKey).toContain("policy-1");
    expect(created.classification.code).toBe("compliance");

    const metadata = await service.updateMetadata(request, {
      documentId: created.id,
      title: "Policy Pack v2",
      custom: { ownerTeam: "platform" },
    });
    expect(metadata.title).toBe("Policy Pack v2");
    expect(metadata.custom.ownerTeam).toBe("platform");

    const classification = await service.classifyDocument(request, {
      documentId: created.id,
      classification: "restricted",
      label: "Restricted",
    });
    expect(classification.code).toBe("restricted");

    const tags = await service.tagDocument(request, {
      documentId: created.id,
      tagNames: ["audit"],
    });
    expect(tags.some((tag) => tag.name === "audit")).toBe(true);

    const related = await service.relateDocument(request, {
      sourceDocumentId: created.id,
      kind: "belongs_to_testing",
      reference: {
        product: "testing",
        externalId: "cert_1",
        label: "Certification",
      },
    });
    expect(related.kind).toBe("belongs_to_testing");

    const found = await service.findDocuments(request, {
      query: "policy",
      tagName: "audit",
    });
    expect(found.length).toBeGreaterThan(0);

    const summary = await service.summarizeDocument(request, created.id);
    expect(summary.title).toBe("Policy Pack v2");

    const archived = await service.archiveDocument(request, created.id);
    expect(archived.status).toBe("archived");

    const restored = await service.restoreDocument(request, created.id);
    expect(restored.status).toBe("restored");

    const audits = await service.listAudit(request, created.id);
    expect(audits.length).toBeGreaterThan(3);

    expect((await service.listTags(request)).length).toBeGreaterThan(0);
    expect(await service.getDocument(request, created.id)).toBeTruthy();
  });

  it("enforces permissions when provided", async () => {
    const { service } = createService();
    await expect(
      service.createDocument(ctx({ permissions: ["document.read"] }), {
        title: "Denied",
      }),
    ).rejects.toMatchObject({ code: "forbidden" });
  });

  it("rejects empty titles and invalid relate payloads", async () => {
    const { service } = createService();
    const request = ctx();
    await expect(
      service.createDocument(request, { title: "  " }),
    ).rejects.toMatchObject({ code: "validation_error" });

    const created = await service.createDocument(request, { title: "A" });
    await expect(
      service.relateDocument(request, {
        sourceDocumentId: created.id,
        kind: "related_to",
      }),
    ).rejects.toMatchObject({ code: "validation_error" });

    await expect(
      service.getDocument(request, asDocumentTagId("missing_doc") as never),
    ).rejects.toMatchObject({ code: "not_found" });
  });

  it("registers storage providers and covers remaining service edges", async () => {
    const registry = createEmptyDocumentStorageProviderRegistry();
    const provider = {
      id: "stub",
      kind: "custom" as const,
      capabilities: {
        put: false,
        get: false,
        head: false,
        delete: false,
        copy: false,
        multipart: false,
        implemented: true,
      },
      async initialise() {},
      async validateConfiguration() {},
      async healthCheck() {
        return { healthy: true, message: "stub" };
      },
      async putObject() {
        throw new Error("not implemented");
      },
      async getObject() {
        throw new Error("not implemented");
      },
      async headObject() {
        return null;
      },
      async deleteObject() {},
      async verifyObject() {
        return false;
      },
      listCapabilities() {
        return this.capabilities;
      },
      async dispose() {},
      async exists() {
        return false;
      },
      async describe() {
        return null;
      },
    };
    registry.register(provider);
    expect(registry.get("stub")).toBe(provider);
    expect(registry.list()).toHaveLength(1);

    const { service } = createService();
    const request = ctx();
    await expect(
      service.createDocument(request, {
        title: "X",
        documentType: "not-a-type" as never,
      }),
    ).rejects.toMatchObject({ code: "invalid_document_type" });

    expect(() =>
      buildDocumentClassification({ code: "not-real" as never }),
    ).toThrowError(DocumentDomainError);

    const created = await service.createDocument(request, {
      title: "Edge",
      classification: "custom",
      customClassification: "ops",
      tagNames: ["edge"],
    });
    expect(created.classification.customCode).toBe("ops");

    await service.classifyDocument(request, {
      documentId: created.id,
      classification: "public",
    });
    await expect(
      service.findDocuments(request, {
        status: "draft",
        classification: "public",
        documentType: "file",
        limit: 1,
      }),
    ).resolves.toHaveLength(1);

    const tag = (await service.listTags(request))[0];
    expect(tag).toBeTruthy();
    expect(await service.getTag(request, tag!.id)).toEqual(tag);
    expect(await service.getTag(request, asDocumentTagId("missing_tag"))).toBeNull();

    // force delete-like state via archive then relate filters
    await service.archiveDocument(request, created.id);
    const restored = await service.restoreDocument(request, created.id);
    expect(["restored", "active"]).toContain(restored.status);

    await expect(
      service.createDocument(ctx({ permissions: ["document.write"] }), {
        title: "Ok write",
      }),
    ).resolves.toBeTruthy();
  });
});
