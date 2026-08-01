import { describe, expect, it } from "vitest";

import { EvidenceApplicationValidationError } from "../../shared/errors";
import type { EvidenceRequestContext } from "../context";
import { createEvidenceApplicationServices } from "../services/create-application-services";
import {
  createInMemoryAuditPort,
  createInMemoryClockPort,
  createInMemoryIdPort,
  createInMemoryStoragePort,
  createInMemoryUnitOfWork,
} from "../testing/in-memory-ports";

const HASH_A = "a".repeat(64);

function adminCtx(): EvidenceRequestContext {
  return {
    tenantId: "tenant-1",
    userId: "owner-1",
    permissions: ["qep.evidence.admin"],
    correlationId: "corr-s02",
  };
}

describe("APZQEP-120-S02 EvidenceEnumerationService", () => {
  function createSecured() {
    const uow = createInMemoryUnitOfWork();
    const audit = createInMemoryAuditPort();
    const services = createEvidenceApplicationServices({
      uow,
      storage: createInMemoryStoragePort(),
      clock: createInMemoryClockPort(),
      ids: createInMemoryIdPort(),
      audit,
      secure: true,
    });
    return { services, audit };
  }

  it("exposes permission engine, query builder, and enumeration service", () => {
    const { services } = createSecured();
    expect(services.permissionEngine.engineId).toBe("EvidencePermissionEngine");
    expect(services.queryBuilder.builderId).toBe("EvidenceQueryBuilder");
    expect(services.enumeration?.serviceId).toBe("EvidenceEnumerationService");
  });

  it("enumerates via central service with ACL, sort, and pagination", async () => {
    const { services } = createSecured();
    await services.commands.captureEvidence(adminCtx(), {
      kind: "captureEvidence",
      projectId: "p1",
      ownerId: "owner-1",
      source: { kind: "manual_upload" },
      content: {
        mediaType: "text/plain",
        bytes: new Uint8Array([1]),
        contentHash: HASH_A,
      },
      metadata: { title: "visible-item" },
    });
    await services.commands.captureEvidence(
      {
        tenantId: "tenant-1",
        userId: "owner-2",
        permissions: ["qep.evidence.admin"],
      },
      {
        kind: "captureEvidence",
        projectId: "p1",
        ownerId: "owner-2",
        source: { kind: "manual_upload" },
        content: {
          mediaType: "text/plain",
          bytes: new Uint8Array([2]),
          contentHash: "b".repeat(64),
        },
        metadata: { title: "hidden-item" },
      },
    );

    const page = await services.queries.listEvidence(
      {
        tenantId: "tenant-1",
        userId: "owner-1",
        permissions: ["qep.evidence.read"],
      },
      {
        kind: "listEvidence",
        sort: "title",
        order: "asc",
        page: { limit: 10, offset: 0 },
      },
    );
    expect(page.total).toBe(1);
    expect(page.items[0]?.title).toBe("visible-item");
  });

  it("rejects invalid query construction and audits the attempt", async () => {
    const { services, audit } = createSecured();
    await expect(
      services.queries.listEvidence(adminCtx(), {
        kind: "listEvidence",
        sort: "not-a-field",
      }),
    ).rejects.toBeInstanceOf(EvidenceApplicationValidationError);

    expect(
      audit.entries.some(
        (entry) =>
          entry.outcome === "denied" &&
          String(entry.details?.reason ?? "").includes("invalid_query"),
      ),
    ).toBe(true);
  });

  it("search never returns inaccessible metadata", async () => {
    const { services } = createSecured();
    await services.commands.captureEvidence(adminCtx(), {
      kind: "captureEvidence",
      projectId: "p1",
      ownerId: "owner-1",
      source: { kind: "manual_upload" },
      content: {
        mediaType: "text/plain",
        bytes: new Uint8Array([1]),
        contentHash: HASH_A,
      },
      metadata: { title: "shared-needle" },
    });
    await services.commands.captureEvidence(
      {
        tenantId: "tenant-1",
        userId: "owner-2",
        permissions: ["qep.evidence.admin"],
      },
      {
        kind: "captureEvidence",
        projectId: "p1",
        ownerId: "owner-2",
        source: { kind: "manual_upload" },
        content: {
          mediaType: "text/plain",
          bytes: new Uint8Array([2]),
          contentHash: "b".repeat(64),
        },
        metadata: { title: "secret-needle" },
      },
    );

    const search = await services.queries.searchEvidence(
      {
        tenantId: "tenant-1",
        userId: "owner-1",
        permissions: ["qep.evidence.read"],
      },
      { kind: "searchEvidence", text: "needle" },
    );
    expect(search.total).toBe(1);
    expect(search.items.some((item) => item.title === "secret-needle")).toBe(false);
  });
});
