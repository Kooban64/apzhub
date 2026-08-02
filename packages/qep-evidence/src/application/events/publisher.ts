/**
 * APZQEP-120-S07 — Application-owned Evidence event publisher port.
 * S08: prefer createOutboxQepEvidenceEventPublisher for durable enqueue.
 * Repositories and storage MUST NOT call this.
 */

import {
  validateQepEvidenceEventEnvelope,
  type QepEvidenceEventEnvelope,
} from "./envelope";

export type QepEvidencePublishResult = {
  readonly ok: boolean;
  readonly envelopeId?: string;
  readonly errorCode?:
    | "NO_PUBLISHER"
    | "EVENT_NOT_REGISTERED"
    | "INVALID_ENVELOPE"
    | "PUBLISH_FAILED"
    | "DUPLICATE";
  readonly errorMessage?: string;
};

export type QepEvidenceEventPublisher = {
  publish(envelope: QepEvidenceEventEnvelope): QepEvidencePublishResult;
};

/**
 * Fail-soft publish — never throws into Evidence mutation paths.
 */
export function publishQepEvidenceEventFailSoft(
  publisher: QepEvidenceEventPublisher | undefined,
  envelope: QepEvidenceEventEnvelope,
): QepEvidencePublishResult {
  if (!publisher) {
    return { ok: false, errorCode: "NO_PUBLISHER", errorMessage: "NO_PUBLISHER" };
  }

  const validation = validateQepEvidenceEventEnvelope(envelope);
  if (!validation.ok) {
    return {
      ok: false,
      envelopeId: envelope.envelopeId,
      errorCode:
        validation.error === "EVENT_NOT_REGISTERED"
          ? "EVENT_NOT_REGISTERED"
          : "INVALID_ENVELOPE",
      errorMessage: validation.error,
    };
  }

  try {
    return publisher.publish(envelope);
  } catch (error) {
    return {
      ok: false,
      envelopeId: envelope.envelopeId,
      errorCode: "PUBLISH_FAILED",
      errorMessage: error instanceof Error ? error.message : "PUBLISH_FAILED",
    };
  }
}

/** In-memory publisher for tests and local composition — records envelopes. */
export function createInMemoryQepEvidenceEventPublisher(): QepEvidenceEventPublisher & {
  readonly published: QepEvidenceEventEnvelope[];
  reset(): void;
} {
  const published: QepEvidenceEventEnvelope[] = [];
  const seen = new Set<string>();
  return {
    published,
    reset() {
      published.length = 0;
      seen.clear();
    },
    publish(envelope) {
      if (seen.has(envelope.idempotencyKey)) {
        return {
          ok: true,
          envelopeId: envelope.envelopeId,
          errorCode: "DUPLICATE",
          errorMessage: "IDEMPOTENT_NOOP",
        };
      }
      seen.add(envelope.idempotencyKey);
      published.push(envelope);
      return { ok: true, envelopeId: envelope.envelopeId };
    },
  };
}
