import { describe, expect, it } from "vitest";

import {
  EvidenceConflictError,
  EvidenceIntegrityFailedError,
  EvidencePreconditionError,
  EvidenceValidationError,
} from "../../shared/errors";
import {
  addToCollection,
  applyLegalHold,
  approveEvidence,
  archiveEvidence,
  assertContentDeliveryAllowed,
  associateEvidence,
  captureEvidence,
  classifyEvidence,
  createCollection,
  createEvidenceRelationship,
  disposeEvidence,
  markRetained,
  quarantineEvidence,
  rejectEvidence,
  releaseLegalHold,
  replaceContent,
  requestReview,
  sealCollectionAsSet,
  sealEvidence,
  toEvidenceReference,
  validateEvidence,
  verifyIntegrity,
  type Evidence,
} from "./index";

const HASH_A = "a".repeat(64);
const HASH_B = "b".repeat(64);

function capture(overrides?: Partial<Parameters<typeof captureEvidence>[0]>): Evidence {
  return captureEvidence({
    id: "ev-1",
    tenantId: "tenant-1",
    projectId: "project-1",
    ownerId: "owner-1",
    createdBy: "actor-1",
    createdAt: "2026-07-30T00:00:00.000Z",
    source: { kind: "manual_upload" },
    content: {
      mediaType: "image/png",
      byteSize: 1024,
      contentHash: HASH_A,
      storageLocator: "locator://a",
    },
    ...overrides,
  });
}

function ctx(revision?: number) {
  return {
    actorId: "actor-2",
    changedAt: "2026-07-30T01:00:00.000Z",
    expectedRevision: revision,
  };
}

function clear<T extends { readonly uncommittedEvents: readonly unknown[] }>(
  aggregate: T,
): T {
  return { ...aggregate, uncommittedEvents: [] };
}

function toApproved(
  overrides?: Partial<Parameters<typeof captureEvidence>[0]>,
): Evidence {
  let current = capture(overrides);
  current = clear(validateEvidence(current, ctx(current.revision)));
  current = clear(
    classifyEvidence(current, ctx(current.revision), { category: "screenshot" }),
  );
  current = clear(requestReview(current, ctx(current.revision)));
  return clear(approveEvidence(current, ctx(current.revision)));
}

describe("Evidence lifecycle (ENG-110B)", () => {
  it("captures evidence with content, integrity metadata, and captured event", () => {
    const evidence = capture();
    expect(evidence.status).toBe("captured");
    expect(evidence.version).toBe(1);
    expect(evidence.integrity?.contentHash).toBe(HASH_A);
    expect(evidence.integrity?.sealed).toBe(false);
    expect(evidence.uncommittedEvents[0]?.type).toBe("evidence.captured");
  });

  it("walks Capture → Validate → Classify → Review → Approve → Seal", () => {
    let evidence = capture();
    evidence = clear(validateEvidence(evidence, ctx(1)));
    expect(evidence.status).toBe("validated");
    evidence = clear(
      classifyEvidence(evidence, ctx(evidence.revision), { category: "log" }),
    );
    expect(evidence.status).toBe("classified");
    evidence = clear(requestReview(evidence, ctx(evidence.revision)));
    expect(evidence.status).toBe("in_review");
    evidence = clear(approveEvidence(evidence, ctx(evidence.revision)));
    expect(evidence.status).toBe("approved");
    evidence = clear(sealEvidence(evidence, ctx(evidence.revision)));
    expect(evidence.status).toBe("sealed");
    expect(evidence.integrity?.sealed).toBe(true);
    expect(evidence.sealedAt).toBeDefined();
  });

  it("rejects invalid transitions", () => {
    const evidence = capture();
    expect(() => approveEvidence(evidence, ctx(1))).toThrow(EvidencePreconditionError);
    expect(() => sealEvidence(evidence, ctx(1))).toThrow(EvidencePreconditionError);
  });

  it("associates from classified and moves to associated", () => {
    let evidence = clear(validateEvidence(capture(), ctx(1)));
    evidence = clear(
      classifyEvidence(evidence, ctx(evidence.revision), { category: "report" }),
    );
    evidence = associateEvidence(evidence, ctx(evidence.revision), {
      relationshipId: "rel-1",
      targetCapability: "test_execution",
      targetId: "exec-1",
      relationType: "produced_by",
    });
    expect(evidence.status).toBe("associated");
    expect(evidence.relationshipIds).toContain("rel-1");
  });

  it("rejects and quarantines with required reasons", () => {
    let evidence = clear(validateEvidence(capture(), ctx(1)));
    evidence = clear(
      classifyEvidence(evidence, ctx(evidence.revision), { category: "other" }),
    );
    evidence = clear(requestReview(evidence, ctx(evidence.revision)));
    expect(() =>
      rejectEvidence(evidence, ctx(evidence.revision), { reason: "no" }),
    ).toThrow(EvidenceValidationError);
    evidence = clear(
      rejectEvidence(evidence, ctx(evidence.revision), { reason: "not acceptable" }),
    );
    expect(evidence.status).toBe("rejected");

    let quarantined = capture({ id: "ev-q" });
    quarantined = clear(validateEvidence(quarantined, ctx(1)));
    quarantined = quarantineEvidence(quarantined, ctx(quarantined.revision), {
      reason: "malware suspected",
    });
    expect(quarantined.status).toBe("quarantined");
  });

  it("blocks content replace after seal", () => {
    let sealed = toApproved();
    sealed = sealEvidence(sealed, ctx(sealed.revision));
    expect(() =>
      replaceContent(sealed, ctx(sealed.revision), {
        mediaType: "image/png",
        byteSize: 10,
        contentHash: HASH_B,
        storageLocator: "locator://b",
      }),
    ).toThrow(EvidenceConflictError);
  });

  it("versions content on replace before seal", () => {
    let evidence = toApproved();
    evidence = replaceContent(evidence, ctx(evidence.revision), {
      mediaType: "image/png",
      byteSize: 2048,
      contentHash: HASH_B,
      storageLocator: "locator://b",
    });
    expect(evidence.version).toBe(2);
    expect(evidence.versions).toHaveLength(1);
    expect(evidence.versions[0]?.content.contentHash).toBe(HASH_A);
    expect(evidence.content?.contentHash).toBe(HASH_B);
  });

  it("legal hold blocks dispose; release then dispose succeeds when retention expired", () => {
    let evidence = toApproved({
      id: "ev-hold",
      retainUntil: "2026-01-01T00:00:00.000Z",
    });
    evidence = clear(
      applyLegalHold(evidence, ctx(evidence.revision), { reason: "litigation hold" }),
    );
    expect(evidence.retention.legalHold).toBe(true);
    expect(() =>
      disposeEvidence(evidence, ctx(evidence.revision), {
        reason: "retention expired",
        confirm: true,
      }),
    ).toThrow(EvidencePreconditionError);
    evidence = clear(releaseLegalHold(evidence, ctx(evidence.revision)));
    evidence = clear(archiveEvidence(evidence, ctx(evidence.revision)));
    evidence = disposeEvidence(evidence, ctx(evidence.revision), {
      reason: "retention expired",
      confirm: true,
    });
    expect(evidence.status).toBe("disposed");
    expect(evidence.disposition?.reason).toBe("retention expired");
  });

  it("markRetained and archive from approved/sealed", () => {
    let evidence = toApproved();
    evidence = clear(markRetained(evidence, ctx(evidence.revision)));
    expect(evidence.status).toBe("retained");
    evidence = archiveEvidence(evidence, ctx(evidence.revision));
    expect(evidence.status).toBe("archived");
  });

  it("verifyIntegrity updates state without performing crypto", () => {
    let evidence = capture();
    evidence = clear(verifyIntegrity(evidence, ctx(1), { providedActualHash: HASH_A }));
    expect(evidence.integrity?.verificationState).toBe("verified");
    evidence = verifyIntegrity(evidence, ctx(evidence.revision), {
      providedActualHash: HASH_B,
    });
    expect(evidence.integrity?.verificationState).toBe("failed");
    expect(
      evidence.uncommittedEvents.some((e) => e.type === "evidence.integrity_failed"),
    ).toBe(true);
    expect(() => assertContentDeliveryAllowed(evidence)).toThrow(
      EvidenceIntegrityFailedError,
    );
  });

  it("builds EvidenceReference for consumers", () => {
    const evidence = capture();
    const reference = toEvidenceReference(evidence, {
      capabilityLocalId: "exec-step-1",
    });
    expect(reference.evidenceId).toBe("ev-1");
    expect(reference.contentHash).toBe(HASH_A);
    expect(reference.capabilityLocalId).toBe("exec-step-1");
  });

  it("manages collection membership and seals EvidenceSet", () => {
    let collection = createCollection({
      id: "col-1",
      tenantId: "tenant-1",
      projectId: "project-1",
      name: "Pack",
      purpose: "certification",
      createdBy: "actor-1",
      createdAt: "2026-07-30T00:00:00.000Z",
    });
    collection = clear(addToCollection(collection, ctx(1), "ev-1"));
    collection = clear(addToCollection(collection, ctx(collection.revision), "ev-2"));
    expect(collection.status).toBe("ready_to_seal");
    const sealed = sealCollectionAsSet(collection, ctx(collection.revision), {
      setId: "set-1",
      sealHash: HASH_A,
    });
    expect(sealed.collection.status).toBe("sealed_as_set");
    expect(sealed.set.memberEvidenceIds).toEqual(["ev-1", "ev-2"]);
    expect(sealed.set.sealHash).toBe(HASH_A);
  });

  it("creates EvidenceRelationship aggregate", () => {
    const relationship = createEvidenceRelationship({
      id: "rel-9",
      tenantId: "tenant-1",
      evidenceId: "ev-1",
      targetCapability: "test_execution",
      targetId: "exec-9",
      relationType: "supports",
      createdBy: "actor-1",
      createdAt: "2026-07-30T00:00:00.000Z",
    });
    expect(relationship.targetCapability).toBe("test_execution");
    expect(relationship.uncommittedEvents[0]?.type).toBe("evidence.associated");
  });

  it("enforces optimistic concurrency", () => {
    const evidence = capture();
    expect(() => validateEvidence(evidence, ctx(99))).toThrow(/Revision conflict/);
  });
});
