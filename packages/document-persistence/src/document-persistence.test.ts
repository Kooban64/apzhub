import { describe, expect, it } from "vitest";

import { createDocumentPlatformService } from "@apzhub/document-core";
import type { DocumentRequestContext } from "@apzhub/document-contracts";

import {
  createDocumentPlatformReposFromMemory,
  createEmptyDocumentInMemoryStores,
  DOCUMENT_PERSISTENCE_VERSION,
} from "./index";

function ctx(): DocumentRequestContext {
  return {
    tenantId: "tenant_a",
    userId: "user_a",
    permissions: ["document.*"],
  };
}

describe("document-persistence", () => {
  it("exports version and isolates tenants in memory", async () => {
    expect(DOCUMENT_PERSISTENCE_VERSION).toBe("0.2.0");
    const stores = createEmptyDocumentInMemoryStores();
    const repos = createDocumentPlatformReposFromMemory(stores);
    let seq = 0;
    const service = createDocumentPlatformService({
      ...repos,
      now: () => "2026-07-13T09:00:00.000Z",
      id: () => `mem_${++seq}`,
    });

    const doc = await service.createDocument(ctx(), {
      title: "Tenant A Doc",
      tagNames: ["alpha"],
    });
    expect(doc.tenantId).toBe("tenant_a");

    const otherCtx: DocumentRequestContext = {
      tenantId: "tenant_b",
      userId: "user_b",
      permissions: ["document.*"],
    };
    expect(await service.findDocuments(otherCtx)).toEqual([]);
    expect(await repos.documents.get(otherCtx, doc.id)).toBeNull();

    const tags = await repos.tags.list(ctx());
    expect(tags[0]?.name).toBe("alpha");
    expect(await repos.tags.ensure(ctx(), "alpha")).toEqual(tags[0]);
  });

  it("persists relationships and audits without binary payloads", async () => {
    const repos = createDocumentPlatformReposFromMemory();
    let seq = 0;
    const service = createDocumentPlatformService({
      ...repos,
      now: () => "2026-07-13T09:00:00.000Z",
      id: () => `rel_${++seq}`,
    });
    const request = ctx();
    const a = await service.createDocument(request, { title: "A" });
    const b = await service.createDocument(request, { title: "B" });
    await service.relateDocument(request, {
      sourceDocumentId: a.id,
      targetDocumentId: b.id,
      kind: "related_to",
    });
    const relationships = await repos.relationships.listByDocument(request, a.id);
    expect(relationships).toHaveLength(1);
    expect(JSON.stringify(relationships[0])).not.toMatch(/Uint8Array|Buffer|base64/);
    const audits = await repos.audits.listByDocument(request, a.id);
    expect(audits.some((row) => row.action === "document.related")).toBe(true);
  });

  it("rejects empty tags and tenant mismatches", async () => {
    const stores = createEmptyDocumentInMemoryStores();
    const repos = createDocumentPlatformReposFromMemory(stores);
    await expect(repos.tags.ensure(ctx(), "  ")).rejects.toThrow(/tag name/);

    const foreign = {
      ...ctx(),
      tenantId: "other",
    };
    await expect(
      repos.documents.create(foreign, {
        id: "doc_x" as never,
        tenantId: "tenant_a",
        documentType: "file",
        status: "draft",
        classification: { code: "internal" },
        title: "x",
        creatorUserId: "u",
        tagIds: [],
        permissions: [],
        lifecycle: {
          state: "draft",
          changedAt: "2026-07-13T00:00:00.000Z",
          changedBy: "u",
        },
        createdAt: "2026-07-13T00:00:00.000Z",
        updatedAt: "2026-07-13T00:00:00.000Z",
      }),
    ).rejects.toThrow(/tenant_mismatch/);
  });
});
