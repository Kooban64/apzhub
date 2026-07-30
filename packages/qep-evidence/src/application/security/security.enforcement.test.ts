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

const HASH_A = "a".repeat(64);

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
          bytes: new Uint8Array([1]),
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
            bytes: new Uint8Array([1]),
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
        bytes: new Uint8Array([1]),
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
        bytes: new Uint8Array([1]),
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
        bytes: new Uint8Array([1]),
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
        bytes: new Uint8Array([1]),
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
