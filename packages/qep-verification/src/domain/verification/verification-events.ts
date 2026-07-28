import { randomUUID } from "node:crypto";

import type { VerificationId } from "./verification-id";
import type { VerificationOutcome } from "./verification-outcome";
import type { VerificationStatus } from "./verification-status";
import type { VerificationSubjectKind } from "./verification-subject";

export type VerificationEventBase = {
  readonly eventId: string;
  readonly occurredAt: string;
  readonly correlationId: string;
  readonly tenantId: string;
  readonly verificationId: VerificationId;
};

export type VerificationCreated = VerificationEventBase & {
  readonly type: "qep.verification.created";
  readonly status: VerificationStatus;
  readonly subjectKind: VerificationSubjectKind;
};

export type VerificationRequested = VerificationEventBase & {
  readonly type: "qep.verification.requested";
};

export type VerificationAssigned = VerificationEventBase & {
  readonly type: "qep.verification.assigned";
  readonly assigneeId: string;
};

export type VerificationStarted = VerificationEventBase & {
  readonly type: "qep.verification.started";
};

export type VerificationCompleted = VerificationEventBase & {
  readonly type: "qep.verification.completed";
  readonly outcome: VerificationOutcome;
};

export type VerificationVerified = VerificationEventBase & {
  readonly type: "qep.verification.verified";
  readonly outcome: VerificationOutcome;
};

export type VerificationFailed = VerificationEventBase & {
  readonly type: "qep.verification.failed";
  readonly outcome: VerificationOutcome;
};

export type VerificationRejected = VerificationEventBase & {
  readonly type: "qep.verification.rejected";
  readonly outcome: VerificationOutcome;
};

export type VerificationExpired = VerificationEventBase & {
  readonly type: "qep.verification.expired";
};

export type VerificationWithdrawn = VerificationEventBase & {
  readonly type: "qep.verification.withdrawn";
};

export type VerificationSuperseded = VerificationEventBase & {
  readonly type: "qep.verification.superseded";
  readonly successorVerificationId: VerificationId;
};

export type VerificationCancelled = VerificationEventBase & {
  readonly type: "qep.verification.cancelled";
};

export type VerificationRetired = VerificationEventBase & {
  readonly type: "qep.verification.retired";
};

export type VerificationDomainEvent =
  | VerificationCreated
  | VerificationRequested
  | VerificationAssigned
  | VerificationStarted
  | VerificationCompleted
  | VerificationVerified
  | VerificationFailed
  | VerificationRejected
  | VerificationExpired
  | VerificationWithdrawn
  | VerificationSuperseded
  | VerificationCancelled
  | VerificationRetired;

export const VERIFICATION_DOMAIN_EVENT_TYPES = [
  "qep.verification.created",
  "qep.verification.requested",
  "qep.verification.assigned",
  "qep.verification.started",
  "qep.verification.completed",
  "qep.verification.verified",
  "qep.verification.failed",
  "qep.verification.rejected",
  "qep.verification.expired",
  "qep.verification.withdrawn",
  "qep.verification.superseded",
  "qep.verification.cancelled",
  "qep.verification.retired",
] as const;

type VerificationEventInput = {
  readonly tenantId: string;
  readonly verificationId: VerificationId;
  readonly correlationId: string;
  readonly eventId?: string;
  readonly occurredAt?: string;
};

function baseEvent(input: VerificationEventInput): VerificationEventBase {
  return {
    eventId: input.eventId ?? randomUUID(),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    correlationId: input.correlationId,
    tenantId: input.tenantId,
    verificationId: input.verificationId,
  };
}

export function buildVerificationCreatedEvent(
  input: VerificationEventInput & {
    readonly status: VerificationStatus;
    readonly subjectKind: VerificationSubjectKind;
  },
): VerificationCreated {
  return {
    ...baseEvent(input),
    type: "qep.verification.created",
    status: input.status,
    subjectKind: input.subjectKind,
  };
}

export function buildVerificationRequestedEvent(
  input: VerificationEventInput,
): VerificationRequested {
  return { ...baseEvent(input), type: "qep.verification.requested" };
}

export function buildVerificationAssignedEvent(
  input: VerificationEventInput & { readonly assigneeId: string },
): VerificationAssigned {
  return {
    ...baseEvent(input),
    type: "qep.verification.assigned",
    assigneeId: input.assigneeId,
  };
}

export function buildVerificationStartedEvent(
  input: VerificationEventInput,
): VerificationStarted {
  return { ...baseEvent(input), type: "qep.verification.started" };
}

export function buildVerificationCompletedEvent(
  input: VerificationEventInput & { readonly outcome: VerificationOutcome },
): VerificationCompleted {
  return {
    ...baseEvent(input),
    type: "qep.verification.completed",
    outcome: input.outcome,
  };
}

export function buildVerificationVerifiedEvent(
  input: VerificationEventInput & { readonly outcome: VerificationOutcome },
): VerificationVerified {
  return {
    ...baseEvent(input),
    type: "qep.verification.verified",
    outcome: input.outcome,
  };
}

export function buildVerificationFailedEvent(
  input: VerificationEventInput & { readonly outcome: VerificationOutcome },
): VerificationFailed {
  return {
    ...baseEvent(input),
    type: "qep.verification.failed",
    outcome: input.outcome,
  };
}

export function buildVerificationRejectedEvent(
  input: VerificationEventInput & { readonly outcome: VerificationOutcome },
): VerificationRejected {
  return {
    ...baseEvent(input),
    type: "qep.verification.rejected",
    outcome: input.outcome,
  };
}

export function buildVerificationExpiredEvent(
  input: VerificationEventInput,
): VerificationExpired {
  return { ...baseEvent(input), type: "qep.verification.expired" };
}

export function buildVerificationWithdrawnEvent(
  input: VerificationEventInput,
): VerificationWithdrawn {
  return { ...baseEvent(input), type: "qep.verification.withdrawn" };
}

export function buildVerificationSupersededEvent(
  input: VerificationEventInput & { readonly successorVerificationId: VerificationId },
): VerificationSuperseded {
  return {
    ...baseEvent(input),
    type: "qep.verification.superseded",
    successorVerificationId: input.successorVerificationId,
  };
}

export function buildVerificationCancelledEvent(
  input: VerificationEventInput,
): VerificationCancelled {
  return { ...baseEvent(input), type: "qep.verification.cancelled" };
}

export function buildVerificationRetiredEvent(
  input: VerificationEventInput,
): VerificationRetired {
  return { ...baseEvent(input), type: "qep.verification.retired" };
}
