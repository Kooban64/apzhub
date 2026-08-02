/**
 * Map platform ProcessingContext → Evidence business view.
 */

import type { ProcessingContext } from "@apzhub/platform-processing";

import {
  isRegisteredQepEvidenceEvent,
  type QepEvidencePlatformEventId,
} from "../events/catalogue";
import type { QepEvidenceEventEnvelope } from "../events/envelope";

export type EvidenceProcessingBusinessContext = {
  readonly workItemId: string;
  readonly eventId: QepEvidencePlatformEventId;
  readonly evidenceId: string;
  readonly tenantId: string;
  readonly correlationId?: string;
  readonly idempotencyKey: string;
  readonly attemptCount: number;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly envelope?: QepEvidenceEventEnvelope;
};

export function mapProcessingContextToEvidence(
  context: ProcessingContext,
):
  | { readonly ok: true; readonly business: EvidenceProcessingBusinessContext }
  | { readonly ok: false; readonly error: string; readonly permanent: boolean } {
  if (!isRegisteredQepEvidenceEvent(context.eventType)) {
    return {
      ok: false,
      error: "EVENT_NOT_EVIDENCE_CATALOGUE",
      permanent: true,
    };
  }

  const envelopeCandidate = context.payload.envelope;
  const envelope =
    envelopeCandidate &&
    typeof envelopeCandidate === "object" &&
    envelopeCandidate !== null
      ? (envelopeCandidate as QepEvidenceEventEnvelope)
      : undefined;

  const evidenceIdRaw =
    envelope?.payload?.evidenceId ??
    context.payload.evidenceId ??
    (typeof context.payload.aggregateId === "string"
      ? context.payload.aggregateId
      : undefined);

  if (typeof evidenceIdRaw !== "string" || evidenceIdRaw.length === 0) {
    return { ok: false, error: "MISSING_EVIDENCE_ID", permanent: true };
  }

  const tenantId = envelope?.tenantId ?? context.tenantId;
  if (!tenantId) {
    return { ok: false, error: "MISSING_TENANT_ID", permanent: true };
  }

  return {
    ok: true,
    business: {
      workItemId: context.workItemId,
      eventId: context.eventType,
      evidenceId: evidenceIdRaw,
      tenantId,
      ...(context.correlationId || envelope?.correlationId
        ? {
            correlationId: context.correlationId ?? envelope?.correlationId,
          }
        : {}),
      idempotencyKey: context.idempotencyKey,
      attemptCount: context.attemptCount,
      payload: envelope?.payload ?? context.payload,
      ...(envelope ? { envelope } : {}),
    },
  };
}
