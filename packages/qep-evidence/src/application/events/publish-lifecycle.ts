/**
 * Lifecycle platform → catalogue events (S07).
 * Lifecycle transitions often carry empty domain uncommittedEvents; publish here.
 */

import {
  QEP_EVIDENCE_PLATFORM_EVENTS,
  type QepEvidencePlatformEventId,
} from "./catalogue";
import { buildQepEvidenceEventEnvelope } from "./envelope";
import {
  publishQepEvidenceEventFailSoft,
  type QepEvidenceEventPublisher,
  type QepEvidencePublishResult,
} from "./publisher";

export type LifecyclePublishInput = {
  readonly publisher: QepEvidenceEventPublisher | undefined;
  readonly evidenceId: string;
  readonly tenantId: string;
  readonly actorId: string;
  readonly correlationId?: string;
  readonly timestamp: string;
  readonly revision: number;
  readonly sourceState: string;
  readonly targetState: string;
  readonly action: string;
  readonly reason?: string;
  readonly successorEvidenceId?: string;
};

function specialisedEvent(targetState: string): QepEvidencePlatformEventId | undefined {
  switch (targetState) {
    case "ARCHIVED":
      return QEP_EVIDENCE_PLATFORM_EVENTS.archived;
    case "SUPERSEDED":
      return QEP_EVIDENCE_PLATFORM_EVENTS.superseded;
    case "LOGICALLY_DELETED":
      return QEP_EVIDENCE_PLATFORM_EVENTS.deleted;
    default:
      return undefined;
  }
}

export function publishLifecyclePlatformEvents(
  input: LifecyclePublishInput,
): readonly QepEvidencePublishResult[] {
  const results: QepEvidencePublishResult[] = [];
  const basePayload = {
    sourceState: input.sourceState,
    targetState: input.targetState,
    action: input.action,
    ...(input.reason ? { reason: input.reason } : {}),
    ...(input.successorEvidenceId
      ? { successorEvidenceId: input.successorEvidenceId }
      : {}),
  };

  results.push(
    publishQepEvidenceEventFailSoft(
      input.publisher,
      buildQepEvidenceEventEnvelope({
        eventId: QEP_EVIDENCE_PLATFORM_EVENTS.lifecycleChanged,
        evidenceId: input.evidenceId,
        tenantId: input.tenantId,
        timestamp: input.timestamp,
        actorId: input.actorId,
        correlationId: input.correlationId,
        revision: input.revision,
        payload: basePayload,
      }),
    ),
  );

  const specialised = specialisedEvent(input.targetState);
  if (specialised) {
    results.push(
      publishQepEvidenceEventFailSoft(
        input.publisher,
        buildQepEvidenceEventEnvelope({
          eventId: specialised,
          evidenceId: input.evidenceId,
          tenantId: input.tenantId,
          timestamp: input.timestamp,
          actorId: input.actorId,
          correlationId: input.correlationId,
          revision: input.revision,
          payload: basePayload,
        }),
      ),
    );
  }

  return results;
}
