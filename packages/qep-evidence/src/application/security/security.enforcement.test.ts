import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  EvidenceApplicationValidationError,
  EvidenceForbiddenError,
} from "../../shared/errors";
import type { EvidenceRequestContext } from "../context";
import { createEvidenceApplicationServices } from "../services/create-application-services";
import {
  createInMemoryAuditPort,
  createInMemoryClockPort,
  createInMemoryIdPort,
  createInMemoryStoragePort,
  createInMemoryUnitOfWork,
} from "../testing/in-memory-ports";
import {
  createEvidenceAccessPolicyService,
  normalizeExternalPolicyResult,
} from "./access-policy";
import { validateEvidenceReference } from "./evidence-reference";
import { createPermissionPort } from "./permission-port";

const BYTES_1 = new Uint8Array([1]);
const BYTES_2 = new Uint8Array([2]);
const HASH_A = createHash("sha256").update(BYTES_1).digest("hex");
const HASH_B = createHash("sha256").update(BYTES_2).digest("hex");

function adminCtx(overrides?: Partial<EvidenceRequestContext>): EvidenceRequestContext {
  return {
    tenantId: "tenant-1",
    userId: "owner-1",
    permissions: ["qep.evidence.admin"],
    correlationId: "corr-sec",
    ...overrides,
  };
}

function readerCtx(): EvidenceRequestContext {
  return {
    tenantId: "tenant-1",
    userId: "reader-1",
    permissions: ["qep.evidence.read"],
  };
}

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
  return { services, uow, audit };
}

describe("ENG-110E L-02 security enforcement", () => {
  it("allows capture for create permission and denies without permission", async () => {
    const { services } = createSecured();
    const allowed = await services.commands.captureEvidence(
      {
        tenantId: "tenant-1",
        userId: "creator-1",
        permissions: ["qep.evidence.create"],
      },
      {
        kind: "captureEvidence",
        projectId: "p1",
        source: { kind: "manual_upload" },
        content: {
          mediaType: "text/plain",
          bytes: BYTES_1,
          contentHash: HASH_A,
        },
      },
    );
    expect(allowed.data.status).toBe("captured");

    await expect(
      services.commands.captureEvidence(
        {
          tenantId: "tenant-1",
          userId: "reader-1",
          permissions: ["qep.evidence.read"],
        },
        {
          kind: "captureEvidence",
          projectId: "p1",
          source: { kind: "manual_upload" },
          content: {
            mediaType: "text/plain",
            bytes: BYTES_1,
            contentHash: HASH_A,
          },
        },
      ),
    ).rejects.toBeInstanceOf(EvidenceForbiddenError);
  });

  it("denies cross-tenant get and records security audit", async () => {
    const { services, audit } = createSecured();
    const captured = await services.commands.captureEvidence(adminCtx(), {
      kind: "captureEvidence",
      projectId: "p1",
      source: { kind: "manual_upload" },
      content: {
        mediaType: "text/plain",
        bytes: BYTES_1,
        contentHash: HASH_A,
      },
    });

    await expect(
      services.queries.getEvidence(
        {
          tenantId: "tenant-OTHER",
          userId: "owner-1",
          permissions: ["qep.evidence.admin"],
        },
        { kind: "getEvidence", evidenceId: captured.data.id },
      ),
    ).rejects.toBeInstanceOf(EvidenceForbiddenError);

    expect(
      audit.entries.some(
        (entry) =>
          entry.outcome === "denied" &&
          String(entry.details?.reason ?? "").includes("tenant"),
      ),
    ).toBe(true);
  });

  it("allows owner read and grant-based read; denies stranger", async () => {
    const { services } = createSecured();
    const captured = await services.commands.captureEvidence(adminCtx(), {
      kind: "captureEvidence",
      projectId: "p1",
      ownerId: "owner-1",
      source: { kind: "manual_upload" },
      content: {
        mediaType: "text/plain",
        bytes: BYTES_1,
        contentHash: HASH_A,
      },
    });

    const asOwner = await services.queries.getEvidence(
      {
        tenantId: "tenant-1",
        userId: "owner-1",
        permissions: ["qep.evidence.read"],
      },
      { kind: "getEvidence", evidenceId: captured.data.id },
    );
    expect(asOwner.id).toBe(captured.data.id);

    await expect(
      services.queries.getEvidence(readerCtx(), {
        kind: "getEvidence",
        evidenceId: captured.data.id,
      }),
    ).rejects.toBeInstanceOf(EvidenceForbiddenError);

    await services.commands.grantAccess(adminCtx(), {
      kind: "grantAccess",
      evidenceId: captured.data.id,
      principalId: "reader-1",
      action: "qep.evidence.read",
    });

    const asGrantee = await services.queries.getEvidence(readerCtx(), {
      kind: "getEvidence",
      evidenceId: captured.data.id,
    });
    expect(asGrantee.id).toBe(captured.data.id);
  });

  it("fail-closes on missing actor and unavailable policy dependency", async () => {
    const permissions = createPermissionPort();
    const uow = createInMemoryUnitOfWork();
    const policy = createEvidenceAccessPolicyService({ uow, permissions });

    const missingActor = await policy.evaluateAccess(
      { tenantId: "tenant-1", userId: "", permissions: ["qep.evidence.read"] },
      "getEvidence",
      { evidenceId: "ev-x" },
    );
    expect(missingActor.outcome).toBe("denied");

    const brokenUow = {
      ...uow,
      evidence: {
        ...uow.evidence,
        async getById() {
          throw new Error("db_down");
        },
      },
    };
    const failingPolicy = createEvidenceAccessPolicyService({
      uow: brokenUow,
      permissions,
    });
    const unavailable = await failingPolicy.evaluateAccess(adminCtx(), "getEvidence", {
      evidenceId: "ev-1",
    });
    expect(unavailable.outcome).toBe("unavailable");
    await expect(
      failingPolicy.assertAccessible(adminCtx(), "getEvidence", {
        evidenceId: "ev-1",
      }),
    ).rejects.toBeInstanceOf(EvidenceForbiddenError);
  });

  it("validates EvidenceReference and normalizes indeterminate external results to deny-class", () => {
    expect(
      validateEvidenceReference({
        evidenceId: "ev-1",
        uriOrHandle: "file:///etc/passwd",
      })?.outcome,
    ).toBe("denied");
    expect(
      validateEvidenceReference({
        evidenceId: "ev-1",
        uriOrHandle: "not a uri",
      })?.outcome,
    ).toBe("invalid_request");
    expect(validateEvidenceReference({ evidenceId: "ev-1" })).toBeUndefined();

    expect(normalizeExternalPolicyResult(undefined).outcome).toBe("indeterminate");
    expect(normalizeExternalPolicyResult(null).outcome).toBe("indeterminate");
    expect(normalizeExternalPolicyResult(true).outcome).toBe("allowed");
    expect(normalizeExternalPolicyResult(false).outcome).toBe("denied");
  });

  it("filters availableActions by policy and supports checkEvidenceAccess decisions", async () => {
    const { services } = createSecured();
    const captured = await services.commands.captureEvidence(adminCtx(), {
      kind: "captureEvidence",
      projectId: "p1",
      ownerId: "owner-1",
      source: { kind: "manual_upload" },
      content: {
        mediaType: "text/plain",
        bytes: BYTES_1,
        contentHash: HASH_A,
      },
    });

    const actions = await services.queries.getAvailableActions(
      {
        tenantId: "tenant-1",
        userId: "owner-1",
        permissions: ["qep.evidence.read", "qep.evidence.classify"],
      },
      { kind: "getAvailableActions", evidenceId: captured.data.id },
    );
    expect(actions).toContain("validateEvidence");
    expect(actions).not.toContain("disposeEvidence");

    await services.commands.grantAccess(adminCtx(), {
      kind: "grantAccess",
      evidenceId: captured.data.id,
      principalId: "reader-1",
      action: "qep.evidence.read",
    });
    const check = await services.queries.checkEvidenceAccess(adminCtx(), {
      kind: "checkEvidenceAccess",
      evidenceId: captured.data.id,
      principalId: "reader-1",
      action: "qep.evidence.read",
    });
    expect(check.evaluation).toBe("completed");
    expect(check.outcome).toBe("allowed");

    const denied = await services.queries.checkEvidenceAccess(adminCtx(), {
      kind: "checkEvidenceAccess",
      evidenceId: captured.data.id,
      principalId: "stranger",
      action: "qep.evidence.read",
    });
    expect(denied.outcome).toBe("denied");
  });

  it("rejects privilege escalation for dispose without dispose permission", async () => {
    const { services } = createSecured();
    const captured = await services.commands.captureEvidence(adminCtx(), {
      kind: "captureEvidence",
      projectId: "p1",
      source: { kind: "manual_upload" },
      content: {
        mediaType: "text/plain",
        bytes: BYTES_1,
        contentHash: HASH_A,
      },
    });
    await expect(
      services.commands.disposeEvidence(
        {
          tenantId: "tenant-1",
          userId: "owner-1",
          permissions: ["qep.evidence.read"],
        },
        {
          kind: "disposeEvidence",
          evidenceId: captured.data.id,
          expectedRevision: captured.data.revision,
          reason: "gone",
          confirm: true,
        },
      ),
    ).rejects.toBeInstanceOf(EvidenceForbiddenError);
  });

  it("APZQEP-120-S01: listEvidence hides unauthorized items (L-EM-01)", async () => {
    const { services } = createSecured();
    const owned = await services.commands.captureEvidence(adminCtx(), {
      kind: "captureEvidence",
      projectId: "p1",
      ownerId: "owner-1",
      source: { kind: "manual_upload" },
      content: {
        mediaType: "text/plain",
        bytes: BYTES_1,
        contentHash: HASH_A,
      },
      metadata: { title: "owned-alpha" },
    });
    const secret = await services.commands.captureEvidence(
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
          bytes: BYTES_2,
          contentHash: HASH_B,
        },
        metadata: { title: "secret-bravo" },
      },
    );

    const asOwner = await services.queries.listEvidence(
      {
        tenantId: "tenant-1",
        userId: "owner-1",
        permissions: ["qep.evidence.read"],
      },
      { kind: "listEvidence" },
    );
    expect(asOwner.items.map((item) => item.id)).toEqual([owned.data.id]);
    expect(asOwner.total).toBe(1);
    expect(asOwner.items.some((item) => item.id === secret.data.id)).toBe(false);

    await services.commands.grantAccess(adminCtx(), {
      kind: "grantAccess",
      evidenceId: secret.data.id,
      principalId: "reader-1",
      action: "qep.evidence.read",
    });

    const asGrantee = await services.queries.listEvidence(readerCtx(), {
      kind: "listEvidence",
      sort: "title",
      order: "asc",
    });
    expect(asGrantee.items.map((item) => item.id)).toEqual([secret.data.id]);
    expect(asGrantee.total).toBe(1);

    const stranger = await services.queries.listEvidence(
      {
        tenantId: "tenant-1",
        userId: "stranger-1",
        permissions: ["qep.evidence.read"],
      },
      { kind: "listEvidence" },
    );
    expect(stranger.items).toEqual([]);
    expect(stranger.total).toBe(0);
  });

  it("APZQEP-120-S01: searchEvidence enforces ACL, pagination, and sort", async () => {
    const { services } = createSecured();
    await services.commands.captureEvidence(adminCtx(), {
      kind: "captureEvidence",
      projectId: "p1",
      ownerId: "owner-1",
      source: { kind: "manual_upload" },
      content: {
        mediaType: "text/plain",
        bytes: BYTES_1,
        contentHash: HASH_A,
      },
      metadata: { title: "needle-owned" },
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
          bytes: BYTES_2,
          contentHash: HASH_B,
        },
        metadata: { title: "needle-secret" },
      },
    );

    const search = await services.queries.searchEvidence(
      {
        tenantId: "tenant-1",
        userId: "owner-1",
        permissions: ["qep.evidence.read"],
      },
      {
        kind: "searchEvidence",
        text: "needle",
        sort: "title",
        order: "asc",
        page: { limit: 10, offset: 0 },
      },
    );
    expect(search.total).toBe(1);
    expect(search.items).toHaveLength(1);
    expect(search.items[0]?.title).toBe("needle-owned");
    expect(search.items.some((item) => item.title === "needle-secret")).toBe(false);

    const adminSearch = await services.queries.searchEvidence(adminCtx(), {
      kind: "searchEvidence",
      text: "needle",
      sort: "title",
      order: "asc",
      page: { limit: 1, offset: 0 },
    });
    expect(adminSearch.total).toBe(2);
    expect(adminSearch.items).toHaveLength(1);
    expect(adminSearch.items[0]?.title).toBe("needle-owned");

    const page2 = await services.queries.searchEvidence(adminCtx(), {
      kind: "searchEvidence",
      text: "needle",
      sort: "title",
      order: "asc",
      page: { limit: 1, offset: 1 },
    });
    expect(page2.items[0]?.title).toBe("needle-secret");
  });

  it("APZQEP-120-S01: listEvidence never leaks across tenants", async () => {
    const { services } = createSecured();
    await services.commands.captureEvidence(adminCtx(), {
      kind: "captureEvidence",
      projectId: "p1",
      ownerId: "owner-1",
      source: { kind: "manual_upload" },
      content: {
        mediaType: "text/plain",
        bytes: BYTES_1,
        contentHash: HASH_A,
      },
      metadata: { title: "tenant-1-item" },
    });

    const otherTenant = await services.queries.listEvidence(
      {
        tenantId: "tenant-OTHER",
        userId: "owner-1",
        permissions: ["qep.evidence.admin"],
      },
      { kind: "listEvidence" },
    );
    expect(otherTenant.items).toEqual([]);
    expect(otherTenant.total).toBe(0);
  });

  it("APZQEP-120-S01: listEvidence denies callers without read permission", async () => {
    const { services, audit } = createSecured();
    await expect(
      services.queries.listEvidence(
        {
          tenantId: "tenant-1",
          userId: "nobody",
          permissions: [],
        },
        { kind: "listEvidence" },
      ),
    ).rejects.toBeInstanceOf(EvidenceForbiddenError);

    expect(
      audit.entries.some(
        (entry) =>
          entry.outcome === "denied" && String(entry.action).includes("listEvidence"),
      ),
    ).toBe(true);
  });

  it("maps invalid EvidenceReference on associate path to validation failure class", async () => {
    const permissions = createPermissionPort();
    const policy = createEvidenceAccessPolicyService({
      uow: createInMemoryUnitOfWork(),
      permissions,
    });
    const decision = await policy.evaluateAccess(adminCtx(), "associateEvidence", {
      evidenceReference: {
        evidenceId: "",
        uriOrHandle: "https://example.com/e",
      },
    });
    expect(decision.outcome).toBe("invalid_request");
    await expect(
      policy.assertAccessible(adminCtx(), "associateEvidence", {
        evidenceReference: { evidenceId: "" },
      }),
    ).rejects.toBeInstanceOf(EvidenceApplicationValidationError);
  });
});
