import type { EvidenceDomainEvent } from "./events";

/**
 * Immutable EvidenceSet aggregate — created only via sealCollectionAsSet.
 * Membership mutation after creation is forbidden by construction (no mutators).
 */
export type EvidenceSet = {
  readonly id: string;
  readonly tenantId: string;
  readonly projectId: string;
  readonly sourceCollectionId: string;
  readonly memberEvidenceIds: readonly string[];
  readonly sealHash: string;
  readonly sealedAt: string;
  readonly sealedBy: string;
  readonly purpose: string;
  readonly revision: number;
  readonly uncommittedEvents: readonly EvidenceDomainEvent[];
};
