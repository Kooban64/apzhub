import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import { EvidenceLifecycleError } from "../../shared/lifecycle-errors";
import type { EvidenceRequestContext } from "../context";
import { createEvidenceApplicationServices } from "../services/create-application-services";
import {
  createInMemoryAuditPort,
  createInMemoryClockPort,
  createInMemoryIdPort,
  createInMemoryStoragePort,
  createInMemoryUnitOfWork,
} from "../testing/in-memory-ports";
import { createInMemoryLifecycleHistoryRepository } from "./in-memory-lifecycle-history";
import { evaluateLifecycleTransition } from "./transition-policy";
import { LIFECYCLE_TRANSITION_MATRIX } from "./transition-matrix";

const BYTES = new Uint8Array([1, 2, 3, 4]);
const HASH = createHash("sha256").update(BYTES).digest("hex");

function adminCtx(): EvidenceRequestContext {
  return {
    tenantId: "tenant-lc",
    userId: "actor-lc",
    correlationId: "corr-lc",
    permissions: ["qep.evidence.admin"],
  };
}

function createServices() {
  const history = createInMemoryLifecycleHistoryRepository();
  const services = createEvidenceApplicationServices({
    uow: createInMemoryUnitOfWork(),
    storage: createInMemoryStoragePort(),
    clock: createInMemoryClockPort(),
    ids: createInMemoryIdPort(),
    audit: createInMemoryAuditPort(),
    lifecycleHistory: history,
  });
  return { services, history };
}

async function capture(services: ReturnType<typeof createServices>["services"]) {
  return services.commands.captureEvidence(adminCtx(), {
    kind: "captureEvidence",
    projectId: "project-1",
    source: { kind: "manual_upload" },
    content: {
      mediaType: "text/plain",
      bytes: BYTES,
      contentHash: HASH,
    },
    metadata: { title: "Lifecycle item" },
  });
}

describe("APZQEP-120-S06 lifecycle transition matrix", () => {
  it("defines controlled edges without arbitrary patching", () => {
    expect(LIFECYCLE_TRANSITION_MATRIX.length).toBeGreaterThan(5);
    expect(LIFECYCLE_TRANSITION_MATRIX.every((e) => e.from.length > 0 && e.to)).toBe(
      true,
    );
  });

  it("denies disposal eligibility while held", () => {
    const decision = evaluateLifecycleTransition({
      evidence: {
        id: "e1",
        tenantId: "t",
        projectId: "p",
        status: "approved",
        retention: {
          retentionClass: "standard",
          legalHold: true,
          holdReason: "matter",
        },
        lifecycleGovernance: {
          state: "ACTIVE",
          retentionStatus: "NOT_CONFIGURED",
          holdStatus: "HELD",
        },
        integrity: {
          hashAlgorithm: "sha256",
          contentHash: HASH,
          verificationState: "verified",
          sealed: false,
        },
      } as never,
      action: "markDisposalEligible",
      actorPermissions: ["qep.evidence.admin"],
      reason: "eligible now",
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reasonCode).toBe("LIFECYCLE_HOLD_ACTIVE");
  });
});

describe("APZQEP-120-S06 EvidenceLifecyclePlatformService", () => {
  it("returns lifecycle state and performs restrict/restore", async () => {
    const { services } = createServices();
    const captured = await capture(services);
    const state = await services.lifecycle.getLifecycleState(
      adminCtx(),
      captured.data.id,
    );
    expect(state.lifecycleState).toBe("ACTIVE");
    expect(state.retentionStatus).toBe("NOT_CONFIGURED");
    expect(state.holdStatus).toBe("NOT_HELD");

    const restricted = await services.lifecycle.restrictEvidence(adminCtx(), {
      evidenceId: captured.data.id,
      expectedRevision: captured.data.revision,
      reason: "under review",
    });
    expect(restricted.lifecycleState).toBe("RESTRICTED");

    const restored = await services.lifecycle.restoreEvidence(adminCtx(), {
      evidenceId: captured.data.id,
      expectedRevision: restricted.revision,
    });
    expect(restored.lifecycleState).toBe("ACTIVE");
  });

  it("marks archive eligible / archived and records durable history", async () => {
    const { services, history } = createServices();
    const captured = await capture(services);
    const eligible = await services.lifecycle.markArchiveEligible(adminCtx(), {
      evidenceId: captured.data.id,
      expectedRevision: captured.data.revision,
    });
    expect(eligible.lifecycleState).toBe("ARCHIVE_ELIGIBLE");

    const archived = await services.lifecycle.markArchived(adminCtx(), {
      evidenceId: captured.data.id,
      expectedRevision: eligible.revision,
      reason: "release freeze",
    });
    expect(archived.lifecycleState).toBe("ARCHIVED");
    expect(history.records.length).toBeGreaterThanOrEqual(2);

    const hist = await services.lifecycle.getLifecycleHistory(
      adminCtx(),
      captured.data.id,
    );
    expect(hist.total).toBeGreaterThanOrEqual(2);
    expect(hist.items[0]).toHaveProperty("transitionId");
  });

  it("supports supersession without loops and disposal/logical delete without byte purge", async () => {
    const { services } = createServices();
    const a = await capture(services);
    const b = await services.commands.captureEvidence(adminCtx(), {
      kind: "captureEvidence",
      projectId: "project-1",
      source: { kind: "manual_upload" },
      content: {
        mediaType: "text/plain",
        bytes: BYTES,
        contentHash: HASH,
      },
      metadata: { title: "Successor" },
    });

    const superseded = await services.lifecycle.markSuperseded(adminCtx(), {
      evidenceId: a.data.id,
      expectedRevision: a.data.revision,
      reason: "replaced by successor",
      successorEvidenceId: b.data.id,
    });
    expect(superseded.lifecycleState).toBe("SUPERSEDED");
    expect(superseded.supersededByEvidenceId).toBe(b.data.id);

    await expect(
      services.lifecycle.markSuperseded(adminCtx(), {
        evidenceId: b.data.id,
        expectedRevision: b.data.revision + 1, // after reverse-link bump
        reason: "loop attempt",
        successorEvidenceId: a.data.id,
      }),
    ).rejects.toBeInstanceOf(EvidenceLifecycleError);

    // Reload b revision after reverse link
    const bState = await services.lifecycle.getLifecycleState(adminCtx(), b.data.id);
    const eligible = await services.lifecycle.markDisposalEligible(adminCtx(), {
      evidenceId: a.data.id,
      expectedRevision: superseded.revision,
      reason: "past usefulness",
    });
    expect(eligible.lifecycleState).toBe("DISPOSAL_ELIGIBLE");

    const deleted = await services.lifecycle.logicallyDeleteEvidence(adminCtx(), {
      evidenceId: a.data.id,
      expectedRevision: eligible.revision,
      reason: "logical delete authorised",
    });
    expect(deleted.lifecycleState).toBe("LOGICALLY_DELETED");

    // Content still retrievable via catalogue/storage reference (no purge).
    const loaded = await services.queries.getEvidence(adminCtx(), {
      kind: "getEvidence",
      evidenceId: a.data.id,
    });
    expect(loaded.status).toBe("disposed");
    expect(loaded.storageLocator).toBeTruthy();
    void bState;
  });

  it("rejects stale revision transitions", async () => {
    const { services } = createServices();
    const captured = await capture(services);
    await expect(
      services.lifecycle.restrictEvidence(adminCtx(), {
        evidenceId: captured.data.id,
        expectedRevision: 0,
        reason: "stale",
      }),
    ).rejects.toMatchObject({ lifecycleCode: "LIFECYCLE_STALE_REVISION" });
  });
});
