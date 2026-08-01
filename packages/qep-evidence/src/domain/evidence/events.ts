import type { EvidenceStatus } from "./value-objects";

export type EvidenceDomainEventType =
  | "evidence.captured"
  | "evidence.validated"
  | "evidence.classified"
  | "evidence.associated"
  | "evidence.review_requested"
  | "evidence.approved"
  | "evidence.rejected"
  | "evidence.quarantined"
  | "evidence.sealed"
  | "evidence.content_replaced"
  | "evidence.legal_hold_applied"
  | "evidence.legal_hold_released"
  | "evidence.retained"
  | "evidence.archived"
  | "evidence.disposed"
  | "evidence.integrity_verified"
  | "evidence.integrity_failed"
  | "evidence.integrity_established"
  | "evidence.integrity_content_missing"
  | "evidence.collection_changed"
  | "evidence.set_sealed";

export type EvidenceDomainEvent = {
  readonly eventId: string;
  readonly type: EvidenceDomainEventType;
  readonly aggregateId: string;
  readonly tenantId: string;
  readonly occurredAt: string;
  readonly actorId: string;
  readonly correlationId?: string;
  readonly payload: Readonly<Record<string, unknown>>;
};

export type EventBase = {
  readonly aggregateId: string;
  readonly tenantId: string;
  readonly occurredAt: string;
  readonly actorId: string;
  readonly correlationId?: string;
  readonly revision: number;
};

function eventId(base: EventBase, type: EvidenceDomainEventType): string {
  return `${base.aggregateId}:${type}:${base.revision}`;
}

function build(
  type: EvidenceDomainEventType,
  base: EventBase,
  payload: Readonly<Record<string, unknown>>,
): EvidenceDomainEvent {
  return {
    eventId: eventId(base, type),
    type,
    aggregateId: base.aggregateId,
    tenantId: base.tenantId,
    occurredAt: base.occurredAt,
    actorId: base.actorId,
    correlationId: base.correlationId,
    payload,
  };
}

export function buildEvidenceCapturedEvent(
  base: EventBase,
  payload: Readonly<Record<string, unknown>>,
): EvidenceDomainEvent {
  return build("evidence.captured", base, payload);
}

export function buildEvidenceValidatedEvent(base: EventBase): EvidenceDomainEvent {
  return build("evidence.validated", base, {});
}

export function buildEvidenceClassifiedEvent(
  base: EventBase,
  classification: string,
): EvidenceDomainEvent {
  return build("evidence.classified", base, { classification });
}

export function buildEvidenceAssociatedEvent(
  base: EventBase,
  payload: Readonly<Record<string, unknown>>,
): EvidenceDomainEvent {
  return build("evidence.associated", base, payload);
}

export function buildEvidenceReviewRequestedEvent(
  base: EventBase,
): EvidenceDomainEvent {
  return build("evidence.review_requested", base, {});
}

export function buildEvidenceApprovedEvent(base: EventBase): EvidenceDomainEvent {
  return build("evidence.approved", base, {});
}

export function buildEvidenceRejectedEvent(
  base: EventBase,
  reason: string,
): EvidenceDomainEvent {
  return build("evidence.rejected", base, { reason });
}

export function buildEvidenceQuarantinedEvent(
  base: EventBase,
  reason: string,
): EvidenceDomainEvent {
  return build("evidence.quarantined", base, { reason });
}

export function buildEvidenceSealedEvent(base: EventBase): EvidenceDomainEvent {
  return build("evidence.sealed", base, {});
}

export function buildEvidenceContentReplacedEvent(
  base: EventBase,
  version: number,
): EvidenceDomainEvent {
  return build("evidence.content_replaced", base, { version });
}

export function buildEvidenceLegalHoldAppliedEvent(
  base: EventBase,
  reason: string,
): EvidenceDomainEvent {
  return build("evidence.legal_hold_applied", base, { reason });
}

export function buildEvidenceLegalHoldReleasedEvent(
  base: EventBase,
): EvidenceDomainEvent {
  return build("evidence.legal_hold_released", base, {});
}

export function buildEvidenceRetainedEvent(base: EventBase): EvidenceDomainEvent {
  return build("evidence.retained", base, {});
}

export function buildEvidenceArchivedEvent(base: EventBase): EvidenceDomainEvent {
  return build("evidence.archived", base, {});
}

export function buildEvidenceDisposedEvent(
  base: EventBase,
  reason: string,
): EvidenceDomainEvent {
  return build("evidence.disposed", base, { reason });
}

export function buildEvidenceIntegrityVerifiedEvent(
  base: EventBase,
): EvidenceDomainEvent {
  return build("evidence.integrity_verified", base, {});
}

export function buildEvidenceIntegrityFailedEvent(
  base: EventBase,
): EvidenceDomainEvent {
  return build("evidence.integrity_failed", base, {});
}

export function buildEvidenceIntegrityEstablishedEvent(
  base: EventBase,
  payload: Readonly<Record<string, unknown>> = {},
): EvidenceDomainEvent {
  return build("evidence.integrity_established", base, payload);
}

export function buildEvidenceIntegrityContentMissingEvent(
  base: EventBase,
): EvidenceDomainEvent {
  return build("evidence.integrity_content_missing", base, {});
}

export function buildEvidenceCollectionChangedEvent(
  base: EventBase,
  payload: Readonly<Record<string, unknown>>,
): EvidenceDomainEvent {
  return build("evidence.collection_changed", base, payload);
}

export function buildEvidenceSetSealedEvent(
  base: EventBase,
  payload: Readonly<Record<string, unknown>>,
): EvidenceDomainEvent {
  return build("evidence.set_sealed", base, payload);
}

export type StatusChange = {
  readonly from: EvidenceStatus;
  readonly to: EvidenceStatus;
};
