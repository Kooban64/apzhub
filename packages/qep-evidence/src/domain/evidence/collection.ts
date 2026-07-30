import {
  EvidenceConcurrencyError,
  EvidenceConflictError,
  EvidencePreconditionError,
  EvidenceValidationError,
} from "../../shared/errors";
import { EvidenceSetSealService } from "./domain-services";
import {
  buildEvidenceCollectionChangedEvent,
  buildEvidenceSetSealedEvent,
  type EvidenceDomainEvent,
  type EventBase,
} from "./events";
import {
  appendEvidenceHistory,
  createEmptyEvidenceHistory,
  type EvidenceHistory,
} from "./history";
import {
  createActorId,
  createCollectionStatus,
  createEvidenceId,
  createPlatformId,
  createTenantId,
} from "./value-objects";
import type { EvidenceSet } from "./set";

export type CollectionStatus = "open" | "ready_to_seal" | "sealed_as_set";

export type EvidenceCollection = {
  readonly id: string;
  readonly tenantId: string;
  readonly projectId: string;
  readonly name: string;
  readonly purpose: string;
  readonly status: CollectionStatus;
  readonly memberEvidenceIds: readonly string[];
  readonly sealedSetId?: string;
  readonly revision: number;
  readonly history: EvidenceHistory;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly uncommittedEvents: readonly EvidenceDomainEvent[];
};

export type CollectionCommandContext = {
  readonly actorId: string;
  readonly changedAt: string;
  readonly expectedRevision?: number;
  readonly correlationId?: string;
};

function assertRevision(collection: EvidenceCollection, expected?: number): void {
  if (expected !== undefined && expected !== collection.revision) {
    throw new EvidenceConcurrencyError(collection.id, expected, collection.revision);
  }
}

function begin(
  collection: EvidenceCollection,
  ctx: CollectionCommandContext,
): EvidenceCollection {
  assertRevision(collection, ctx.expectedRevision);
  return { ...collection, uncommittedEvents: [] };
}

function eventBase(
  collection: EvidenceCollection,
  ctx: CollectionCommandContext,
): EventBase {
  return {
    aggregateId: collection.id,
    tenantId: collection.tenantId,
    occurredAt: ctx.changedAt,
    actorId: ctx.actorId,
    correlationId: ctx.correlationId,
    revision: collection.revision + 1,
  };
}

function mutate(
  collection: EvidenceCollection,
  ctx: CollectionCommandContext,
  patch: Partial<EvidenceCollection>,
  command: string,
  summary: string,
  events: readonly EvidenceDomainEvent[],
): EvidenceCollection {
  return {
    ...collection,
    ...patch,
    revision: collection.revision + 1,
    updatedAt: ctx.changedAt,
    updatedBy: ctx.actorId,
    history: appendEvidenceHistory(collection.history, {
      command,
      actorId: ctx.actorId,
      occurredAt: ctx.changedAt,
      summary,
    }),
    uncommittedEvents: [...collection.uncommittedEvents, ...events],
  };
}

export function createCollection(input: {
  readonly id: string;
  readonly tenantId: string;
  readonly projectId: string;
  readonly name: string;
  readonly purpose: string;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly correlationId?: string;
}): EvidenceCollection {
  const id = createEvidenceId(input.id);
  const name = input.name.trim();
  const purpose = input.purpose.trim();
  if (!name) {
    throw new EvidenceValidationError("collection name must be non-empty");
  }
  if (!purpose) {
    throw new EvidenceValidationError("collection purpose must be non-empty");
  }
  const tenantId = createTenantId(input.tenantId);
  const projectId = createPlatformId(input.projectId, "projectId");
  const createdBy = createActorId(input.createdBy, "createdBy");
  const base: EventBase = {
    aggregateId: id,
    tenantId,
    occurredAt: input.createdAt,
    actorId: createdBy,
    correlationId: input.correlationId,
    revision: 1,
  };
  return {
    id,
    tenantId,
    projectId,
    name,
    purpose,
    status: "open",
    memberEvidenceIds: [],
    revision: 1,
    history: appendEvidenceHistory(createEmptyEvidenceHistory(), {
      command: "createCollection",
      actorId: createdBy,
      occurredAt: input.createdAt,
      summary: "Collection created",
    }),
    createdAt: input.createdAt,
    createdBy,
    updatedAt: input.createdAt,
    updatedBy: createdBy,
    uncommittedEvents: [
      buildEvidenceCollectionChangedEvent(base, { action: "created", name }),
    ],
  };
}

export function addToCollection(
  collection: EvidenceCollection,
  ctx: CollectionCommandContext,
  evidenceId: string,
): EvidenceCollection {
  const current = begin(collection, ctx);
  if (current.status !== "open" && current.status !== "ready_to_seal") {
    throw new EvidenceConflictError(
      "Cannot add members after collection is sealed as set",
    );
  }
  const id = createEvidenceId(evidenceId);
  if (current.memberEvidenceIds.includes(id)) {
    return current;
  }
  const memberEvidenceIds = [...current.memberEvidenceIds, id];
  const status = createCollectionStatus(
    memberEvidenceIds.length > 0 ? "ready_to_seal" : "open",
  );
  return mutate(
    current,
    ctx,
    { memberEvidenceIds, status },
    "addToCollection",
    "Member added",
    [
      buildEvidenceCollectionChangedEvent(eventBase(current, ctx), {
        action: "member_added",
        evidenceId: id,
      }),
    ],
  );
}

export function removeFromCollection(
  collection: EvidenceCollection,
  ctx: CollectionCommandContext,
  evidenceId: string,
): EvidenceCollection {
  const current = begin(collection, ctx);
  if (current.status === "sealed_as_set") {
    throw new EvidenceConflictError(
      "Cannot remove members after collection is sealed as set",
    );
  }
  const id = createEvidenceId(evidenceId);
  const memberEvidenceIds = current.memberEvidenceIds.filter((item) => item !== id);
  const status = createCollectionStatus(
    memberEvidenceIds.length > 0 ? "ready_to_seal" : "open",
  );
  return mutate(
    current,
    ctx,
    { memberEvidenceIds, status },
    "removeFromCollection",
    "Member removed",
    [
      buildEvidenceCollectionChangedEvent(eventBase(current, ctx), {
        action: "member_removed",
        evidenceId: id,
      }),
    ],
  );
}

export function sealCollectionAsSet(
  collection: EvidenceCollection,
  ctx: CollectionCommandContext,
  input: {
    readonly setId: string;
    readonly sealHash: string;
    readonly purpose?: string;
  },
): { readonly collection: EvidenceCollection; readonly set: EvidenceSet } {
  const current = begin(collection, ctx);
  if (current.status === "sealed_as_set") {
    throw new EvidenceConflictError("Collection is already sealed as set");
  }
  if (current.memberEvidenceIds.length === 0) {
    throw new EvidencePreconditionError("Cannot seal an empty collection");
  }
  const sealHash = EvidenceSetSealService.assertSealHash(input.sealHash);
  const setId = createEvidenceId(input.setId);

  const set: EvidenceSet = {
    id: setId,
    tenantId: current.tenantId,
    projectId: current.projectId,
    sourceCollectionId: current.id,
    memberEvidenceIds: [...current.memberEvidenceIds],
    sealHash,
    sealedAt: ctx.changedAt,
    sealedBy: ctx.actorId,
    purpose: input.purpose?.trim() || current.purpose,
    revision: 1,
    uncommittedEvents: [
      buildEvidenceSetSealedEvent(
        {
          aggregateId: setId,
          tenantId: current.tenantId,
          occurredAt: ctx.changedAt,
          actorId: ctx.actorId,
          correlationId: ctx.correlationId,
          revision: 1,
        },
        {
          collectionId: current.id,
          memberEvidenceIds: current.memberEvidenceIds,
          sealHash,
        },
      ),
    ],
  };

  const nextCollection = mutate(
    current,
    ctx,
    {
      status: "sealed_as_set",
      sealedSetId: setId,
    },
    "sealCollectionAsSet",
    "Collection sealed as EvidenceSet",
    [
      buildEvidenceSetSealedEvent(eventBase(current, ctx), {
        setId,
        sealHash,
        memberCount: current.memberEvidenceIds.length,
      }),
    ],
  );

  return { collection: nextCollection, set };
}
