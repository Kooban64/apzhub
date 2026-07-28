import { randomUUID } from "node:crypto";

import type { SpecificationId } from "./specification-id";
import type { SpecificationStatus } from "./specification-status";
import type { SpecificationReferenceKind, SpecificationVersion } from "./value-objects";

export type SpecificationEventBase = {
  readonly eventId: string;
  readonly occurredAt: string;
  readonly correlationId: string;
  readonly tenantId: string;
  readonly specificationId: SpecificationId;
};

export type SpecificationCreated = SpecificationEventBase & {
  readonly type: "qep.specification.created";
  readonly status: SpecificationStatus;
  readonly version: string;
};

export type SpecificationUpdated = SpecificationEventBase & {
  readonly type: "qep.specification.updated";
};

export type SpecificationReviewStarted = SpecificationEventBase & {
  readonly type: "qep.specification.review.started";
  readonly reviewerId?: string;
};

export type SpecificationReviewCompleted = SpecificationEventBase & {
  readonly type: "qep.specification.review.completed";
  readonly decision: "approved" | "rejected" | "returned";
};

export type SpecificationApproved = SpecificationEventBase & {
  readonly type: "qep.specification.approved";
  readonly version: string;
};

export type SpecificationRejected = SpecificationEventBase & {
  readonly type: "qep.specification.rejected";
};

export type SpecificationWithdrawn = SpecificationEventBase & {
  readonly type: "qep.specification.withdrawn";
};

export type SpecificationSuperseded = SpecificationEventBase & {
  readonly type: "qep.specification.superseded";
  readonly successorSpecificationId: SpecificationId;
};

export type SpecificationCancelled = SpecificationEventBase & {
  readonly type: "qep.specification.cancelled";
};

export type SpecificationRetired = SpecificationEventBase & {
  readonly type: "qep.specification.retired";
};

export type SpecificationRelationshipAdded = SpecificationEventBase & {
  readonly type: "qep.specification.relationship.added";
  readonly referenceKind: SpecificationReferenceKind;
  readonly artefactId: string;
};

export type SpecificationRelationshipRemoved = SpecificationEventBase & {
  readonly type: "qep.specification.relationship.removed";
  readonly referenceKind: SpecificationReferenceKind;
  readonly artefactId: string;
};

export type SpecificationDomainEvent =
  | SpecificationCreated
  | SpecificationUpdated
  | SpecificationReviewStarted
  | SpecificationReviewCompleted
  | SpecificationApproved
  | SpecificationRejected
  | SpecificationWithdrawn
  | SpecificationSuperseded
  | SpecificationCancelled
  | SpecificationRetired
  | SpecificationRelationshipAdded
  | SpecificationRelationshipRemoved;

export const SPECIFICATION_DOMAIN_EVENT_TYPES = [
  "qep.specification.created",
  "qep.specification.updated",
  "qep.specification.review.started",
  "qep.specification.review.completed",
  "qep.specification.approved",
  "qep.specification.rejected",
  "qep.specification.withdrawn",
  "qep.specification.superseded",
  "qep.specification.cancelled",
  "qep.specification.retired",
  "qep.specification.relationship.added",
  "qep.specification.relationship.removed",
] as const;

type SpecificationEventInput = {
  readonly tenantId: string;
  readonly specificationId: SpecificationId;
  readonly correlationId: string;
  readonly eventId?: string;
  readonly occurredAt?: string;
};

function baseEvent(input: SpecificationEventInput): SpecificationEventBase {
  return {
    eventId: input.eventId ?? randomUUID(),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    correlationId: input.correlationId,
    tenantId: input.tenantId,
    specificationId: input.specificationId,
  };
}

export function buildSpecificationCreatedEvent(
  input: SpecificationEventInput & {
    readonly status: SpecificationStatus;
    readonly version: SpecificationVersion;
  },
): SpecificationCreated {
  return {
    ...baseEvent(input),
    type: "qep.specification.created",
    status: input.status,
    version: input.version.label,
  };
}

export function buildSpecificationUpdatedEvent(
  input: SpecificationEventInput,
): SpecificationUpdated {
  return { ...baseEvent(input), type: "qep.specification.updated" };
}

export function buildSpecificationReviewStartedEvent(
  input: SpecificationEventInput & { readonly reviewerId?: string },
): SpecificationReviewStarted {
  return {
    ...baseEvent(input),
    type: "qep.specification.review.started",
    ...(input.reviewerId ? { reviewerId: input.reviewerId } : {}),
  };
}

export function buildSpecificationReviewCompletedEvent(
  input: SpecificationEventInput & {
    readonly decision: "approved" | "rejected" | "returned";
  },
): SpecificationReviewCompleted {
  return {
    ...baseEvent(input),
    type: "qep.specification.review.completed",
    decision: input.decision,
  };
}

export function buildSpecificationApprovedEvent(
  input: SpecificationEventInput & { readonly version: SpecificationVersion },
): SpecificationApproved {
  return {
    ...baseEvent(input),
    type: "qep.specification.approved",
    version: input.version.label,
  };
}

export function buildSpecificationRejectedEvent(
  input: SpecificationEventInput,
): SpecificationRejected {
  return { ...baseEvent(input), type: "qep.specification.rejected" };
}

export function buildSpecificationWithdrawnEvent(
  input: SpecificationEventInput,
): SpecificationWithdrawn {
  return { ...baseEvent(input), type: "qep.specification.withdrawn" };
}

export function buildSpecificationSupersededEvent(
  input: SpecificationEventInput & {
    readonly successorSpecificationId: SpecificationId;
  },
): SpecificationSuperseded {
  return {
    ...baseEvent(input),
    type: "qep.specification.superseded",
    successorSpecificationId: input.successorSpecificationId,
  };
}

export function buildSpecificationCancelledEvent(
  input: SpecificationEventInput,
): SpecificationCancelled {
  return { ...baseEvent(input), type: "qep.specification.cancelled" };
}

export function buildSpecificationRetiredEvent(
  input: SpecificationEventInput,
): SpecificationRetired {
  return { ...baseEvent(input), type: "qep.specification.retired" };
}

export function buildSpecificationRelationshipAddedEvent(
  input: SpecificationEventInput & {
    readonly referenceKind: SpecificationReferenceKind;
    readonly artefactId: string;
  },
): SpecificationRelationshipAdded {
  return {
    ...baseEvent(input),
    type: "qep.specification.relationship.added",
    referenceKind: input.referenceKind,
    artefactId: input.artefactId,
  };
}

export function buildSpecificationRelationshipRemovedEvent(
  input: SpecificationEventInput & {
    readonly referenceKind: SpecificationReferenceKind;
    readonly artefactId: string;
  },
): SpecificationRelationshipRemoved {
  return {
    ...baseEvent(input),
    type: "qep.specification.relationship.removed",
    referenceKind: input.referenceKind,
    artefactId: input.artefactId,
  };
}
