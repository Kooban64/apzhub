import { EvidenceValidationError } from "../../shared/errors";
import {
  buildEvidenceAssociatedEvent,
  type EvidenceDomainEvent,
  type EventBase,
} from "./events";
import {
  createActorId,
  createEvidenceId,
  createPlatformId,
  createRelationType,
  createTargetCapability,
  createTenantId,
} from "./value-objects";

export type EvidenceRelationship = {
  readonly id: string;
  readonly tenantId: string;
  readonly evidenceId: string;
  readonly targetCapability: string;
  readonly targetId: string;
  readonly relationType: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly revision: number;
  readonly uncommittedEvents: readonly EvidenceDomainEvent[];
};

export function createEvidenceRelationship(input: {
  readonly id: string;
  readonly tenantId: string;
  readonly evidenceId: string;
  readonly targetCapability: string;
  readonly targetId: string;
  readonly relationType: string;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly correlationId?: string;
}): EvidenceRelationship {
  const id = createEvidenceId(input.id);
  const tenantId = createTenantId(input.tenantId);
  const evidenceId = createEvidenceId(input.evidenceId);
  const targetCapability = createTargetCapability(input.targetCapability);
  const targetId = createPlatformId(input.targetId, "targetId");
  const relationType = createRelationType(input.relationType);
  const createdBy = createActorId(input.createdBy, "createdBy");
  if (evidenceId === targetId && targetCapability === "evidence") {
    throw new EvidenceValidationError(
      "Self-referential evidence relationship requires distinct ids or relation semantics",
    );
  }
  const base: EventBase = {
    aggregateId: evidenceId,
    tenantId,
    occurredAt: input.createdAt,
    actorId: createdBy,
    correlationId: input.correlationId,
    revision: 1,
  };
  return {
    id,
    tenantId,
    evidenceId,
    targetCapability,
    targetId,
    relationType,
    createdAt: input.createdAt,
    createdBy,
    revision: 1,
    uncommittedEvents: [
      buildEvidenceAssociatedEvent(base, {
        relationshipId: id,
        targetCapability,
        targetId,
        relationType,
      }),
    ],
  };
}
