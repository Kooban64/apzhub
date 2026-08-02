/**
 * Application orchestration helpers — APZQEP-ENG-110D + APZQEP-120-S07.
 * Coordinates ports + domain. No business rules.
 * Platform catalogue events are published from Application Services only.
 */

import type { EvidenceDomainEvent } from "../domain/evidence/events";
import type { Evidence } from "../domain/evidence/evidence";
import type { EvidenceCollection } from "../domain/evidence/collection";
import type { EvidenceSet } from "../domain/evidence/set";
import type {
  EvidenceUnitOfWork,
  StoredEvidence,
  StoredEvidenceCollection,
  StoredEvidenceSet,
} from "../domain/ports/repositories";
import { EvidenceNotFoundError } from "../shared/errors";
import type { EvidenceRequestContext } from "./context";
import { mapDomainEventsToPlatformEnvelopes } from "./events/map-domain-events";
import {
  publishQepEvidenceEventFailSoft,
  type QepEvidenceEventPublisher,
} from "./events/publisher";
import type { ClockPort, IdPort, StoragePort } from "./ports";

export type DomainEventCollector = {
  readonly events: EvidenceDomainEvent[];
  collect(events: readonly EvidenceDomainEvent[]): void;
};

export function createEventCollector(): DomainEventCollector {
  const events: EvidenceDomainEvent[] = [];
  return {
    events,
    collect(incoming) {
      events.push(...incoming);
    },
  };
}

export type ApplicationOrchestrationDeps = {
  readonly uow: EvidenceUnitOfWork;
  readonly storage: StoragePort;
  readonly clock: ClockPort;
  readonly ids: IdPort;
  readonly collector?: DomainEventCollector;
  /** APZQEP-120-S07 — optional platform event publisher (fail-soft). */
  readonly platformEvents?: QepEvidenceEventPublisher;
};

function publishMappedDomainEvents(
  deps: ApplicationOrchestrationDeps,
  events: readonly EvidenceDomainEvent[],
): void {
  if (!deps.platformEvents || events.length === 0) return;
  for (const envelope of mapDomainEventsToPlatformEnvelopes(events)) {
    publishQepEvidenceEventFailSoft(deps.platformEvents, envelope);
  }
}

export function nowIso(deps: ApplicationOrchestrationDeps): string {
  return deps.clock.now();
}

export function commandContext(
  deps: ApplicationOrchestrationDeps,
  ctx: EvidenceRequestContext,
  expectedRevision?: number,
) {
  return {
    actorId: ctx.userId,
    changedAt: nowIso(deps),
    ...(expectedRevision !== undefined ? { expectedRevision } : {}),
    ...(ctx.correlationId ? { correlationId: ctx.correlationId } : {}),
  };
}

export async function requireEvidence(
  deps: ApplicationOrchestrationDeps,
  ctx: EvidenceRequestContext,
  id: string,
): Promise<StoredEvidence> {
  const found = await deps.uow.evidence.getById(ctx.tenantId, id);
  if (!found) {
    throw new EvidenceNotFoundError(`Evidence ${id} not found`, {
      evidenceId: id,
      tenantId: ctx.tenantId,
    });
  }
  return found;
}

export async function requireCollection(
  deps: ApplicationOrchestrationDeps,
  ctx: EvidenceRequestContext,
  id: string,
): Promise<StoredEvidenceCollection> {
  const found = await deps.uow.collections.getById(ctx.tenantId, id);
  if (!found) {
    throw new EvidenceNotFoundError(`EvidenceCollection ${id} not found`, {
      collectionId: id,
      tenantId: ctx.tenantId,
    });
  }
  return found;
}

function takeEvents(aggregate: {
  readonly uncommittedEvents: readonly EvidenceDomainEvent[];
}): readonly EvidenceDomainEvent[] {
  return [...aggregate.uncommittedEvents];
}

export async function persistEvidenceMutation(
  deps: ApplicationOrchestrationDeps,
  mutated: Evidence,
  expectedRevision: number,
): Promise<{
  readonly stored: StoredEvidence;
  readonly events: readonly EvidenceDomainEvent[];
}> {
  return deps.uow.execute(async (unit) => {
    const events = takeEvents(mutated);
    const stored = await unit.evidence.save(mutated, expectedRevision);
    deps.collector?.collect(events);
    publishMappedDomainEvents(deps, events);
    return { stored, events };
  });
}

export async function persistEvidenceCreate(
  deps: ApplicationOrchestrationDeps,
  evidence: Evidence,
): Promise<{
  readonly stored: StoredEvidence;
  readonly events: readonly EvidenceDomainEvent[];
}> {
  // Create uses save with expectedRevision 0 when absent; in-memory treats missing as create.
  return persistEvidenceMutation(deps, evidence, 0);
}

export async function persistCollectionMutation(
  deps: ApplicationOrchestrationDeps,
  mutated: EvidenceCollection,
  expectedRevision: number,
): Promise<{
  readonly stored: StoredEvidenceCollection;
  readonly events: readonly EvidenceDomainEvent[];
}> {
  return deps.uow.execute(async (unit) => {
    const events = takeEvents(mutated);
    const stored = await unit.collections.save(mutated, expectedRevision);
    deps.collector?.collect(events);
    publishMappedDomainEvents(deps, events);
    return { stored, events };
  });
}

export async function persistSetInsert(
  deps: ApplicationOrchestrationDeps,
  set: EvidenceSet,
  collection: EvidenceCollection,
  collectionExpectedRevision: number,
): Promise<{
  readonly set: StoredEvidenceSet;
  readonly collection: StoredEvidenceCollection;
  readonly events: readonly EvidenceDomainEvent[];
}> {
  return deps.uow.execute(async (unit) => {
    const events = [...takeEvents(collection), ...takeEvents(set)];
    const storedCollection = await unit.collections.save(
      collection,
      collectionExpectedRevision,
    );
    const storedSet = await unit.sets.insert(set);
    deps.collector?.collect(events);
    publishMappedDomainEvents(deps, events);
    return { set: storedSet, collection: storedCollection, events };
  });
}
