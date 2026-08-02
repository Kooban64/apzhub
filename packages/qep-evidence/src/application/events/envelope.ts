/**
 * APZQEP-120-S07 — Evidence platform event envelope (Document 029-aligned shape).
 * Application-owned; no infrastructure transport coupling.
 */

import {
  requireQepEvidenceEventDescriptor,
  type QepEvidencePlatformEventId,
} from "./catalogue";

export type QepEvidenceEventCategory = "business";

export type QepEvidenceEventEnvelope = {
  readonly envelopeId: string;
  readonly eventId: QepEvidencePlatformEventId;
  readonly eventVersion: string;
  readonly category: QepEvidenceEventCategory;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly timestamp: string;
  readonly publisher: "qep-evidence";
  readonly actorId?: string;
  readonly sourceService: "qep-evidence";
  readonly tenantId: string;
  readonly idempotencyKey: string;
  readonly payload: Readonly<Record<string, unknown>>;
};

export type BuildQepEvidenceEnvelopeInput = {
  readonly eventId: QepEvidencePlatformEventId;
  readonly evidenceId: string;
  readonly tenantId: string;
  readonly timestamp: string;
  readonly actorId?: string;
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly revision?: number;
  readonly payload?: Readonly<Record<string, unknown>>;
  readonly envelopeId?: string;
};

let envelopeSeq = 0;

export function createQepEvidenceEnvelopeId(): string {
  envelopeSeq += 1;
  return `qepevt-${String(envelopeSeq).padStart(12, "0")}`;
}

/** Test helper */
export function resetQepEvidenceEnvelopeCounter(): void {
  envelopeSeq = 0;
}

export function buildQepEvidenceEventEnvelope(
  input: BuildQepEvidenceEnvelopeInput,
): QepEvidenceEventEnvelope {
  const descriptor = requireQepEvidenceEventDescriptor(input.eventId);
  const revision = input.revision ?? 0;
  const idempotencyKey = `${input.tenantId}:${input.evidenceId}:${input.eventId}:v${descriptor.version}:r${revision}`;
  const correlationId =
    input.correlationId?.trim() ||
    `corr-${input.evidenceId}-${revision}-${input.eventId}`;

  return {
    envelopeId: input.envelopeId ?? createQepEvidenceEnvelopeId(),
    eventId: input.eventId,
    eventVersion: descriptor.version,
    category: "business",
    correlationId,
    ...(input.causationId ? { causationId: input.causationId } : {}),
    timestamp: input.timestamp,
    publisher: "qep-evidence",
    ...(input.actorId ? { actorId: input.actorId } : {}),
    sourceService: "qep-evidence",
    tenantId: input.tenantId,
    idempotencyKey,
    payload: {
      evidenceId: input.evidenceId,
      tenantId: input.tenantId,
      ...(input.revision !== undefined ? { revision: input.revision } : {}),
      ...(input.payload ?? {}),
    },
  };
}

export function validateQepEvidenceEventEnvelope(
  envelope: QepEvidenceEventEnvelope,
): { readonly ok: true } | { readonly ok: false; readonly error: string } {
  if (!envelope.envelopeId) return { ok: false, error: "MISSING_ENVELOPE_ID" };
  if (!envelope.eventId) return { ok: false, error: "MISSING_EVENT_ID" };
  try {
    requireQepEvidenceEventDescriptor(envelope.eventId);
  } catch {
    return { ok: false, error: "EVENT_NOT_REGISTERED" };
  }
  if (!envelope.eventVersion) return { ok: false, error: "MISSING_EVENT_VERSION" };
  if (!envelope.correlationId) return { ok: false, error: "MISSING_CORRELATION_ID" };
  if (!envelope.timestamp) return { ok: false, error: "MISSING_TIMESTAMP" };
  if (!envelope.tenantId) return { ok: false, error: "MISSING_TENANT_ID" };
  if (!envelope.idempotencyKey) return { ok: false, error: "MISSING_IDEMPOTENCY_KEY" };
  if (envelope.publisher !== "qep-evidence") {
    return { ok: false, error: "INVALID_PUBLISHER" };
  }
  if (typeof envelope.payload !== "object" || envelope.payload === null) {
    return { ok: false, error: "INVALID_PAYLOAD" };
  }
  return { ok: true };
}
