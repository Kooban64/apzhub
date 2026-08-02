import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import type { EvidenceRequestContext } from "../context";
import type { EvidenceDto } from "../dto/evidence-dto";
import { createEvidenceApplicationServices } from "../services/create-application-services";
import {
  createInMemoryAuditPort,
  createInMemoryClockPort,
  createInMemoryIdPort,
  createInMemoryStoragePort,
  createInMemoryUnitOfWork,
} from "../testing/in-memory-ports";
import { toCatalogueRecordView } from "./evidence-catalogue-service";

function toCatalogue(dto: EvidenceDto) {
  return toCatalogueRecordView(dto);
}

const BYTES = new Uint8Array([1, 2, 3, 4]);
const HASH = createHash("sha256").update(BYTES).digest("hex");

function adminCtx(): EvidenceRequestContext {
  return {
    tenantId: "tenant-cat",
    userId: "actor-cat",
    correlationId: "corr-cat",
    permissions: ["qep.evidence.admin"],
  };
}

function createServices() {
  return createEvidenceApplicationServices({
    uow: createInMemoryUnitOfWork(),
    storage: createInMemoryStoragePort(),
    clock: createInMemoryClockPort(),
    ids: createInMemoryIdPort(),
    audit: createInMemoryAuditPort(),
  });
}

describe("APZQEP-120-S05 EvidenceCatalogueService", () => {
  it("creates and retrieves catalogue records via secured application path", async () => {
    const services = createServices();
    const created = await services.catalogue.createCatalogueRecord(adminCtx(), {
      kind: "captureEvidence",
      projectId: "project-1",
      source: { kind: "manual_upload" },
      content: {
        mediaType: "application/pdf",
        bytes: BYTES,
        contentHash: HASH,
      },
      metadata: { title: "Catalogue PDF", tags: ["s05"] },
    });

    expect(created.catalogueState).toBe("ACTIVE");
    expect(created.title).toBe("Catalogue PDF");
    expect(created.storageLocator).toBeTruthy();
    expect(created.storageProviderKind).toBe("memory");

    const loaded = await services.catalogue.getCatalogueRecord(adminCtx(), {
      kind: "getEvidence",
      evidenceId: created.id,
    });
    expect(loaded.id).toBe(created.id);
    expect(loaded.revision).toBe(created.revision);
  });

  it("lists and searches through S02 ACL-aware query path", async () => {
    const services = createServices();
    await services.catalogue.createCatalogueRecord(adminCtx(), {
      kind: "captureEvidence",
      projectId: "project-1",
      source: { kind: "manual_upload" },
      content: {
        mediaType: "text/plain",
        bytes: BYTES,
        contentHash: HASH,
      },
      metadata: { title: "Findable Evidence", tags: ["search-me"] },
    });

    const listed = await services.catalogue.listCatalogueRecords(adminCtx(), {
      kind: "listEvidence",
    });
    expect(listed.total).toBeGreaterThanOrEqual(1);
    expect(listed.items[0]?.catalogueState).toBe("ACTIVE");

    const searched = await services.catalogue.searchCatalogueRecords(adminCtx(), {
      kind: "searchEvidence",
      text: "Findable",
    });
    expect(searched.items.some((item) => item.title === "Findable Evidence")).toBe(
      true,
    );
  });

  it("updates mutable metadata and links relationships", async () => {
    const services = createServices();
    const created = await services.catalogue.createCatalogueRecord(adminCtx(), {
      kind: "captureEvidence",
      projectId: "project-1",
      source: { kind: "manual_upload" },
      content: {
        mediaType: "text/plain",
        bytes: BYTES,
        contentHash: HASH,
      },
      metadata: { title: "Before" },
    });

    const updated = await services.catalogue.updateCatalogueMetadata(adminCtx(), {
      kind: "updateEvidenceMetadata",
      evidenceId: created.id,
      expectedRevision: created.revision,
      title: "After",
      description: "Updated description",
    });
    expect(updated.title).toBe("After");
    expect(updated.revision).toBeGreaterThan(created.revision);

    let current = updated;
    current = toCatalogue(
      (
        await services.commands.validateEvidence(adminCtx(), {
          kind: "validateEvidence",
          evidenceId: current.id,
          expectedRevision: current.revision,
        })
      ).data,
    );
    current = toCatalogue(
      (
        await services.commands.classifyEvidence(adminCtx(), {
          kind: "classifyEvidence",
          evidenceId: current.id,
          expectedRevision: current.revision,
          category: "screenshot",
        })
      ).data,
    );

    const linked = await services.catalogue.linkEvidence(adminCtx(), {
      kind: "associateEvidence",
      evidenceId: current.id,
      expectedRevision: current.revision,
      targetCapability: "requirement",
      targetId: "req-1",
      relationType: "supports",
    });
    expect(linked.evidence.id).toBe(current.id);

    const relationships = await services.catalogue.getEvidenceRelationships(
      adminCtx(),
      { kind: "getRelationships", evidenceId: current.id },
    );
    expect(relationships.some((r) => r.targetId === "req-1")).toBe(true);
  });

  it("denies cross-tenant catalogue list", async () => {
    const services = createServices();
    await services.catalogue.createCatalogueRecord(adminCtx(), {
      kind: "captureEvidence",
      projectId: "project-1",
      source: { kind: "manual_upload" },
      content: {
        mediaType: "text/plain",
        bytes: BYTES,
        contentHash: HASH,
      },
      metadata: { title: "Tenant A" },
    });

    const other = await services.catalogue.listCatalogueRecords(
      {
        tenantId: "tenant-other",
        userId: "actor-other",
        correlationId: "corr-other",
        permissions: ["qep.evidence.admin"],
      },
      { kind: "listEvidence" },
    );
    expect(other.total).toBe(0);
  });
});
