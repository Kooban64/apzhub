import { describe, expect, it } from "vitest";

import { captureEvidence, createEmptyEvidenceHistory } from "../../domain/evidence";

const HASH_A = "a".repeat(64);
import type {
  EvidenceAccessGrantRepository,
  EvidenceAuditRepository,
  EvidenceCollectionRepository,
  EvidenceRelationshipRepository,
  EvidenceRepository,
  EvidenceSetRepository,
  EvidenceUnitOfWork,
  EvidenceVersionRepository,
} from "../../domain/ports/repositories";
import type { StoragePort } from "../../application/ports/storage-port";
import { PersistenceNotImplementedError } from "../../shared/errors";
import {
  createEvidencePersistenceRegistry,
  EVIDENCE_PERSISTENCE_REGISTRY_PLACEHOLDER,
} from "../registration/index";
import { StoragePortAdapterSkeleton } from "../storage/storage-port-adapter";
import {
  fromEvidenceReferenceMapping,
  fromPersistenceCollection,
  fromPersistenceEvidence,
  fromPersistenceRelationship,
  fromPersistenceSet,
  toEvidenceReferenceMapping,
  toPersistenceCollection,
  toPersistenceEvidence,
  toPersistenceRelationship,
  toPersistenceSet,
} from "./mappers";
import { PERSISTENCE_EVENT_NAMES } from "./persistence-events";
import {
  EvidenceAccessGrantRepositorySkeleton,
  EvidenceAuditRepositorySkeleton,
  EvidenceCollectionRepositorySkeleton,
  EvidenceRelationshipRepositorySkeleton,
  EvidenceRepositorySkeleton,
  EvidenceSetRepositorySkeleton,
  EvidenceUnitOfWorkSkeleton,
  EvidenceVersionRepositorySkeleton,
} from "./repository-adapters";

function assertPortId<T extends { readonly portId: string }>(
  port: T,
  expected: string,
): void {
  expect(port.portId).toBe(expected);
}

describe("ENG-110C repository contracts", () => {
  it("repository skeletons satisfy port identities", () => {
    const repos: Array<{ port: { portId: string }; id: string }> = [
      { port: EvidenceRepositorySkeleton, id: "EvidenceRepository" },
      {
        port: EvidenceCollectionRepositorySkeleton,
        id: "EvidenceCollectionRepository",
      },
      { port: EvidenceSetRepositorySkeleton, id: "EvidenceSetRepository" },
      {
        port: EvidenceRelationshipRepositorySkeleton,
        id: "EvidenceRelationshipRepository",
      },
      {
        port: EvidenceVersionRepositorySkeleton,
        id: "EvidenceVersionRepository",
      },
      {
        port: EvidenceAccessGrantRepositorySkeleton,
        id: "EvidenceAccessGrantRepository",
      },
      { port: EvidenceAuditRepositorySkeleton, id: "EvidenceAuditRepository" },
      { port: EvidenceUnitOfWorkSkeleton, id: "EvidenceUnitOfWork" },
    ];
    for (const { port, id } of repos) {
      assertPortId(port, id);
    }
  });

  it("repository skeletons reject with PersistenceNotImplementedError", async () => {
    const cases: Array<[string, () => Promise<unknown>]> = [
      [
        "EvidenceRepository.save",
        () =>
          (EvidenceRepositorySkeleton as EvidenceRepository).save(
            captureEvidence({
              id: "ev-1",
              tenantId: "t1",
              projectId: "p1",
              ownerId: "u1",
              createdBy: "u1",
              createdAt: "2026-07-30T00:00:00.000Z",
              source: { kind: "manual_upload" },
              content: {
                mediaType: "application/octet-stream",
                byteSize: 3,
                contentHash: HASH_A,
                storageLocator: "locator://stub",
              },
            }),
            0,
          ),
      ],
      [
        "EvidenceRepository.getById",
        () => EvidenceRepositorySkeleton.getById("t1", "ev-1"),
      ],
      ["EvidenceRepository.list", () => EvidenceRepositorySkeleton.list("t1")],
      [
        "EvidenceCollectionRepository.getById",
        () =>
          (
            EvidenceCollectionRepositorySkeleton as EvidenceCollectionRepository
          ).getById("t1", "c1"),
      ],
      [
        "EvidenceSetRepository.getById",
        () =>
          (EvidenceSetRepositorySkeleton as EvidenceSetRepository).getById("t1", "s1"),
      ],
      [
        "EvidenceRelationshipRepository.delete",
        () =>
          (
            EvidenceRelationshipRepositorySkeleton as EvidenceRelationshipRepository
          ).delete("t1", "r1"),
      ],
      [
        "EvidenceVersionRepository.listByEvidence",
        () =>
          (
            EvidenceVersionRepositorySkeleton as EvidenceVersionRepository
          ).listByEvidence("t1", "ev-1"),
      ],
      [
        "EvidenceAccessGrantRepository.findGrants",
        () =>
          (
            EvidenceAccessGrantRepositorySkeleton as EvidenceAccessGrantRepository
          ).findGrants("t1", { principalId: "u1" }),
      ],
      [
        "EvidenceAuditRepository.append",
        () =>
          (EvidenceAuditRepositorySkeleton as EvidenceAuditRepository).append({
            id: "a1",
            tenantId: "t1",
            evidenceId: "ev-1",
            action: "read",
            actorId: "u1",
            outcome: "allowed",
            occurredAt: "2026-07-30T00:00:00.000Z",
          }),
      ],
      [
        "EvidenceUnitOfWork.execute",
        () => (EvidenceUnitOfWorkSkeleton as EvidenceUnitOfWork).execute(async () => 1),
      ],
    ];

    for (const [label, invoke] of cases) {
      await expect(invoke(), label).rejects.toBeInstanceOf(
        PersistenceNotImplementedError,
      );
    }
  });
});

describe("ENG-110C StoragePort contracts", () => {
  it("skeleton satisfies StoragePort identity and undecided technology", () => {
    const port: StoragePort = StoragePortAdapterSkeleton;
    expect(port.portId).toBe("StoragePort");
  });

  it("rejects every StoragePort operation as not implemented", async () => {
    const ops: Array<[string, () => Promise<unknown>]> = [
      [
        "put",
        () =>
          StoragePortAdapterSkeleton.put({
            tenantId: "t1",
            bytes: new Uint8Array([1, 2, 3]),
            mediaType: "application/octet-stream",
          }),
      ],
      ["get", () => StoragePortAdapterSkeleton.get("t1", "loc-1")],
      ["openStream", () => StoragePortAdapterSkeleton.openStream("t1", "loc-1")],
      [
        "update",
        () =>
          StoragePortAdapterSkeleton.update("t1", "loc-1", {
            bytes: new Uint8Array([9]),
            mediaType: "text/plain",
          }),
      ],
      ["archive", () => StoragePortAdapterSkeleton.archive("t1", "loc-1")],
      ["dispose", () => StoragePortAdapterSkeleton.dispose("t1", "loc-1")],
      ["delete", () => StoragePortAdapterSkeleton.delete("t1", "loc-1")],
      ["exists", () => StoragePortAdapterSkeleton.exists("t1", "loc-1")],
      ["getMetadata", () => StoragePortAdapterSkeleton.getMetadata("t1", "loc-1")],
    ];
    for (const [label, invoke] of ops) {
      await expect(invoke(), label).rejects.toBeInstanceOf(
        PersistenceNotImplementedError,
      );
    }
  });
});

describe("ENG-110C persistence mapping", () => {
  it("round-trips Evidence aggregate through persistence records", () => {
    const evidence = captureEvidence({
      id: "ev-map-1",
      tenantId: "tenant-a",
      projectId: "proj-a",
      workspaceId: "ws-a",
      ownerId: "actor-1",
      createdBy: "actor-1",
      createdAt: "2026-07-30T00:00:00.000Z",
      source: { kind: "manual_upload", sourceSystemId: "sys" },
      content: {
        mediaType: "image/png",
        byteSize: 1024,
        contentHash: HASH_A,
        storageLocator: "locator://mapped",
      },
      metadata: {
        title: "Sample",
        description: "Mapped",
        tags: ["a", "b"],
      },
    });

    const record = toPersistenceEvidence(evidence);
    expect(record.id).toBe("ev-map-1");
    expect(record.storageLocator).toBe("locator://mapped");
    expect(record.legalHold).toBe(false);

    const restored = fromPersistenceEvidence(record);
    expect(restored.id).toBe(evidence.id);
    expect(restored.tenantId).toBe(evidence.tenantId);
    expect(restored.status).toBe(evidence.status);
    expect(restored.uncommittedEvents).toEqual([]);
    expect(restored.ownership.ownerId).toBe("actor-1");
    expect(restored.metadata.tags).toEqual(["a", "b"]);
    expect(restored.content?.storageLocator).toBe("locator://mapped");
  });

  it("maps collection, set, relationship, and EvidenceReference", () => {
    const collectionRecord = toPersistenceCollection({
      id: "col-1",
      tenantId: "t1",
      projectId: "p1",
      name: "C",
      purpose: "P",
      status: "open",
      memberEvidenceIds: ["ev-1"],
      revision: 1,
      history: createEmptyEvidenceHistory(),
      createdAt: "2026-07-30T00:00:00.000Z",
      createdBy: "u1",
      updatedAt: "2026-07-30T00:00:00.000Z",
      updatedBy: "u1",
      uncommittedEvents: [],
    });
    const collection = fromPersistenceCollection(collectionRecord);
    expect(collection.memberEvidenceIds).toEqual(["ev-1"]);
    expect(collection.uncommittedEvents).toEqual([]);

    const setRecord = toPersistenceSet({
      id: "set-1",
      tenantId: "t1",
      projectId: "p1",
      sourceCollectionId: "col-1",
      memberEvidenceIds: ["ev-1"],
      sealHash: "abc",
      sealedAt: "2026-07-30T00:00:00.000Z",
      sealedBy: "u1",
      purpose: "P",
      revision: 1,
      uncommittedEvents: [],
    });
    expect(fromPersistenceSet(setRecord).sealHash).toBe("abc");

    const relRecord = toPersistenceRelationship({
      id: "rel-1",
      tenantId: "t1",
      evidenceId: "ev-1",
      targetCapability: "test-execution",
      targetId: "ex-1",
      relationType: "supports",
      createdAt: "2026-07-30T00:00:00.000Z",
      createdBy: "u1",
      revision: 1,
      uncommittedEvents: [],
    });
    expect(fromPersistenceRelationship(relRecord).targetId).toBe("ex-1");

    const mapping = toEvidenceReferenceMapping(
      {
        evidenceId: "ev-1",
        contentHash: HASH_A,
        capabilityLocalId: "local",
      },
      "t1",
      "opaque-locator",
    );
    expect(mapping.storageLocator).toBe("opaque-locator");
    expect(fromEvidenceReferenceMapping(mapping).evidenceId).toBe("ev-1");
  });
});

describe("ENG-110C dependency registration", () => {
  it("registers skeleton ports without activating runtime persistence", () => {
    const registry = createEvidencePersistenceRegistry();
    expect(registry.activated).toBe(false);
    expect(registry.programme).toBe("APZQEP-ENG-110C");
    expect(registry.evidenceRepository.portId).toBe("EvidenceRepository");
    expect(registry.storagePort.portId).toBe("StoragePort");
    expect(registry.unitOfWork.portId).toBe("EvidenceUnitOfWork");
    expect(EVIDENCE_PERSISTENCE_REGISTRY_PLACEHOLDER.activated).toBe(false);
  });

  it("reserves persistence event contracts without publishing", () => {
    expect(PERSISTENCE_EVENT_NAMES).toContain("evidence.persistence.saved");
    expect(PERSISTENCE_EVENT_NAMES).toContain("evidence.storage.disposed");
  });
});
