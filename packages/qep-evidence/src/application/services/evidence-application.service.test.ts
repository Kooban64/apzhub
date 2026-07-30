import { describe, expect, it } from "vitest";

import { EvidenceApplicationValidationError } from "../../shared/errors";
import type { EvidenceRequestContext } from "../context";
import { createEventCollector } from "../orchestration";
import { createEvidenceApplicationServices } from "./create-application-services";
import {
  createInMemoryAuditPort,
  createInMemoryClockPort,
  createInMemoryIdPort,
  createInMemoryStoragePort,
  createInMemoryUnitOfWork,
} from "../testing/in-memory-ports";

const HASH_A = "a".repeat(64);
const HASH_B = "b".repeat(64);
const SEAL_HASH = "c".repeat(64);

function ctx(): EvidenceRequestContext {
  return {
    tenantId: "tenant-1",
    userId: "actor-1",
    correlationId: "corr-1",
    // ENG-110E — secured factory is default; admin exercises orchestration paths.
    permissions: ["qep.evidence.admin"],
  };
}

function createServices() {
  const collector = createEventCollector();
  const services = createEvidenceApplicationServices({
    uow: createInMemoryUnitOfWork(),
    storage: createInMemoryStoragePort(),
    clock: createInMemoryClockPort(),
    ids: createInMemoryIdPort(),
    audit: createInMemoryAuditPort(),
    collector,
  });
  return { services, collector };
}

async function captureReady() {
  const { services, collector } = createServices();
  const captured = await services.commands.captureEvidence(ctx(), {
    kind: "captureEvidence",
    projectId: "project-1",
    source: { kind: "manual_upload" },
    content: {
      mediaType: "image/png",
      bytes: new Uint8Array([1, 2, 3, 4]),
      contentHash: HASH_A,
    },
    metadata: { title: "Shot", tags: ["ui"] },
  });
  return { services, collector, captured };
}

describe("ENG-110D application orchestration", () => {
  it("captures evidence via StoragePort + repository and collects domain events", async () => {
    const { services, collector, captured } = await captureReady();
    expect(captured.data.status).toBe("captured");
    expect(captured.data.title).toBe("Shot");
    expect(captured.collectedEvents.some((e) => e.type === "evidence.captured")).toBe(
      true,
    );
    expect(collector.events.length).toBeGreaterThan(0);

    const loaded = await services.queries.getEvidence(ctx(), {
      kind: "getEvidence",
      evidenceId: captured.data.id,
    });
    expect(loaded.revision).toBe(captured.data.revision);
    expect(loaded.availableActions).toContain("validateEvidence");
  });

  it("orchestrates lifecycle through approve and legal hold", async () => {
    const { services, captured } = await captureReady();
    let current = captured.data;

    current = (
      await services.commands.validateEvidence(ctx(), {
        kind: "validateEvidence",
        evidenceId: current.id,
        expectedRevision: current.revision,
      })
    ).data;
    current = (
      await services.commands.classifyEvidence(ctx(), {
        kind: "classifyEvidence",
        evidenceId: current.id,
        expectedRevision: current.revision,
        category: "screenshot",
      })
    ).data;
    current = (
      await services.commands.updateEvidenceMetadata(ctx(), {
        kind: "updateEvidenceMetadata",
        evidenceId: current.id,
        expectedRevision: current.revision,
        description: "Updated",
        tags: ["ui", "reg"],
      })
    ).data;
    expect(current.description).toBe("Updated");

    current = (
      await services.commands.requestReview(ctx(), {
        kind: "requestReview",
        evidenceId: current.id,
        expectedRevision: current.revision,
      })
    ).data;
    current = (
      await services.commands.approveEvidence(ctx(), {
        kind: "approveEvidence",
        evidenceId: current.id,
        expectedRevision: current.revision,
      })
    ).data;
    expect(current.status).toBe("approved");

    current = (
      await services.commands.applyLegalHold(ctx(), {
        kind: "applyLegalHold",
        evidenceId: current.id,
        expectedRevision: current.revision,
        reason: "Litigation hold",
      })
    ).data;
    expect(current.legalHold).toBe(true);

    current = (
      await services.commands.releaseLegalHold(ctx(), {
        kind: "releaseLegalHold",
        evidenceId: current.id,
        expectedRevision: current.revision,
      })
    ).data;
    expect(current.legalHold).toBe(false);
  });

  it("versions content through StoragePort update and lists versions", async () => {
    const { services, captured } = await captureReady();
    let current = captured.data;
    current = (
      await services.commands.validateEvidence(ctx(), {
        kind: "validateEvidence",
        evidenceId: current.id,
        expectedRevision: current.revision,
      })
    ).data;

    current = (
      await services.commands.versionEvidence(ctx(), {
        kind: "versionEvidence",
        evidenceId: current.id,
        expectedRevision: current.revision,
        content: {
          mediaType: "image/png",
          bytes: new Uint8Array([9, 9]),
          contentHash: HASH_B,
        },
      })
    ).data;
    expect(current.version).toBe(2);
    expect(current.contentHash).toBe(HASH_B);

    const versions = await services.queries.getVersions(ctx(), {
      kind: "getVersions",
      evidenceId: current.id,
    });
    expect(versions).toHaveLength(1);
    expect(versions[0]?.content.contentHash).toBe(HASH_A);
  });

  it("associates relationships and retrieves them by evidence and target", async () => {
    const { services, captured } = await captureReady();
    let current = captured.data;
    current = (
      await services.commands.validateEvidence(ctx(), {
        kind: "validateEvidence",
        evidenceId: current.id,
        expectedRevision: current.revision,
      })
    ).data;
    current = (
      await services.commands.classifyEvidence(ctx(), {
        kind: "classifyEvidence",
        evidenceId: current.id,
        expectedRevision: current.revision,
        category: "screenshot",
      })
    ).data;

    const associated = await services.commands.associateEvidence(ctx(), {
      kind: "associateEvidence",
      evidenceId: current.id,
      expectedRevision: current.revision,
      targetCapability: "test-execution",
      targetId: "ex-1",
      relationType: "supports",
    });
    expect(associated.data.status).toBe("associated");

    const byEvidence = await services.queries.getRelationships(ctx(), {
      kind: "getRelationships",
      evidenceId: current.id,
    });
    expect(byEvidence).toHaveLength(1);
    expect(byEvidence[0]?.targetId).toBe("ex-1");

    const byTarget = await services.queries.getRelationships(ctx(), {
      kind: "getRelationships",
      targetCapability: "test-execution",
      targetId: "ex-1",
    });
    expect(byTarget).toHaveLength(1);
  });

  it("creates collections and seals them as evidence sets", async () => {
    const { services, captured } = await captureReady();
    const collection = await services.commands.createCollection(ctx(), {
      kind: "createCollection",
      projectId: "project-1",
      name: "Pack",
      purpose: "Release pack",
    });
    const withMember = await services.commands.addToCollection(ctx(), {
      kind: "addToCollection",
      collectionId: collection.data.id,
      evidenceId: captured.data.id,
      expectedRevision: collection.data.revision,
    });
    const sealed = await services.commands.createEvidenceSet(ctx(), {
      kind: "createEvidenceSet",
      collectionId: withMember.data.id,
      expectedRevision: withMember.data.revision,
      sealHash: SEAL_HASH,
    });
    expect(sealed.data.collection.status).toBe("sealed_as_set");
    expect(sealed.data.set.memberEvidenceIds).toEqual([captured.data.id]);
    expect(sealed.collectedEvents.length).toBeGreaterThan(0);

    const loadedSet = await services.queries.getEvidenceSet(ctx(), {
      kind: "getEvidenceSet",
      setId: sealed.data.set.id,
    });
    expect(loadedSet.sealHash).toBe(SEAL_HASH);
  });

  it("searches evidence, downloads bytes, verifies integrity, and returns audit history", async () => {
    const { services, captured } = await captureReady();
    const search = await services.queries.searchEvidence(ctx(), {
      kind: "searchEvidence",
      text: "shot",
    });
    expect(search.total).toBe(1);

    const download = await services.queries.downloadEvidence(ctx(), {
      kind: "downloadEvidence",
      evidenceId: captured.data.id,
    });
    expect(download.byteSize).toBe(4);
    expect(download.bytes).toEqual(new Uint8Array([1, 2, 3, 4]));

    const verified = await services.commands.verifyIntegrity(ctx(), {
      kind: "verifyIntegrity",
      evidenceId: captured.data.id,
      expectedRevision: captured.data.revision,
      providedActualHash: HASH_A,
    });
    expect(verified.data.verificationState).toBe("verified");

    const audit = await services.queries.getAudit(ctx(), {
      kind: "getAudit",
      evidenceId: captured.data.id,
    });
    expect(audit.total).toBeGreaterThan(0);
    expect(audit.items.some((item) => item.action === "captureEvidence")).toBe(true);

    const provenance = await services.queries.getProvenance(ctx(), {
      kind: "getProvenance",
      evidenceId: captured.data.id,
    });
    expect(provenance.history.length).toBeGreaterThan(0);
  });

  it("archives and disposes with StoragePort coordination", async () => {
    const { services, captured } = await captureReady();
    let current = captured.data;
    for (const step of [
      () =>
        services.commands.validateEvidence(ctx(), {
          kind: "validateEvidence",
          evidenceId: current.id,
          expectedRevision: current.revision,
        }),
      () =>
        services.commands.classifyEvidence(ctx(), {
          kind: "classifyEvidence",
          evidenceId: current.id,
          expectedRevision: current.revision,
          category: "screenshot",
        }),
      () =>
        services.commands.requestReview(ctx(), {
          kind: "requestReview",
          evidenceId: current.id,
          expectedRevision: current.revision,
        }),
      () =>
        services.commands.approveEvidence(ctx(), {
          kind: "approveEvidence",
          evidenceId: current.id,
          expectedRevision: current.revision,
        }),
    ] as const) {
      current = (await step()).data;
    }

    current = (
      await services.commands.archiveEvidence(ctx(), {
        kind: "archiveEvidence",
        evidenceId: current.id,
        expectedRevision: current.revision,
      })
    ).data;
    expect(current.status).toBe("archived");

    current = (
      await services.commands.disposeEvidence(ctx(), {
        kind: "disposeEvidence",
        evidenceId: current.id,
        expectedRevision: current.revision,
        reason: "Retention expired",
        method: "delete",
        confirm: true,
      })
    ).data;
    expect(current.status).toBe("disposed");
  });

  it("grants access without evaluating ACL and rejects incomplete capture commands", async () => {
    const { services, captured } = await captureReady();
    const grant = await services.commands.grantAccess(ctx(), {
      kind: "grantAccess",
      evidenceId: captured.data.id,
      principalId: "user-2",
      action: "qep.evidence.read",
    });
    const check = await services.queries.checkEvidenceAccess(ctx(), {
      kind: "checkEvidenceAccess",
      evidenceId: captured.data.id,
      principalId: "user-2",
      action: "qep.evidence.read",
    });
    expect(check.evaluation).toBe("completed");
    expect(check.outcome).toBe("allowed");
    expect(check.matchingGrantCount).toBe(1);

    await services.commands.revokeAccess(ctx(), {
      kind: "revokeAccess",
      grantId: grant.data.grantId,
    });

    await expect(
      services.commands.captureEvidence(ctx(), {
        kind: "captureEvidence",
        projectId: "project-1",
        source: { kind: "manual_upload" },
        content: {
          mediaType: "image/png",
          bytes: new Uint8Array([]),
          contentHash: HASH_A,
        },
      }),
    ).rejects.toBeInstanceOf(EvidenceApplicationValidationError);
  });

  it("registers application factory without activating infrastructure", async () => {
    const { EVIDENCE_APPLICATION_REGISTRY_PLACEHOLDER } =
      await import("../../infrastructure/registration/index");
    expect(EVIDENCE_APPLICATION_REGISTRY_PLACEHOLDER.activated).toBe(false);
    expect(EVIDENCE_APPLICATION_REGISTRY_PLACEHOLDER.programme).toBe("APZQEP-ENG-110E");
    expect(EVIDENCE_APPLICATION_REGISTRY_PLACEHOLDER.securityEnforcedByDefault).toBe(
      true,
    );
  });
});
