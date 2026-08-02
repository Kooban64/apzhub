/**
 * Maps in-process Evidence domain events → platform catalogue events (S07).
 */

import type { EvidenceDomainEvent } from "../../domain/evidence/events";
import {
  QEP_EVIDENCE_PLATFORM_EVENTS,
  type QepEvidencePlatformEventId,
} from "./catalogue";
import {
  buildQepEvidenceEventEnvelope,
  type QepEvidenceEventEnvelope,
} from "./envelope";

function mapType(
  domainType: EvidenceDomainEvent["type"],
): QepEvidencePlatformEventId | undefined {
  switch (domainType) {
    case "evidence.captured":
      return QEP_EVIDENCE_PLATFORM_EVENTS.created;
    case "evidence.content_replaced":
    case "evidence.validated":
    case "evidence.classified":
    case "evidence.associated":
    case "evidence.approved":
    case "evidence.rejected":
    case "evidence.quarantined":
    case "evidence.sealed":
    case "evidence.legal_hold_applied":
    case "evidence.legal_hold_released":
    case "evidence.retained":
    case "evidence.collection_changed":
    case "evidence.set_sealed":
    case "evidence.review_requested":
      return QEP_EVIDENCE_PLATFORM_EVENTS.updated;
    case "evidence.integrity_established":
      return QEP_EVIDENCE_PLATFORM_EVENTS.integrityEstablished;
    case "evidence.integrity_verified":
      return QEP_EVIDENCE_PLATFORM_EVENTS.integrityVerified;
    case "evidence.archived":
      return QEP_EVIDENCE_PLATFORM_EVENTS.archived;
    case "evidence.disposed":
      return QEP_EVIDENCE_PLATFORM_EVENTS.deleted;
    default:
      return undefined;
  }
}

function revisionFromEvent(event: EvidenceDomainEvent): number {
  const raw = event.payload.revision;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  const parts = event.eventId.split(":");
  const last = parts[parts.length - 1];
  const parsed = Number.parseInt(last ?? "", 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapDomainEventsToPlatformEnvelopes(
  events: readonly EvidenceDomainEvent[],
): readonly QepEvidenceEventEnvelope[] {
  const out: QepEvidenceEventEnvelope[] = [];
  for (const event of events) {
    const platformId = mapType(event.type);
    if (!platformId) continue;
    out.push(
      buildQepEvidenceEventEnvelope({
        eventId: platformId,
        evidenceId: event.aggregateId,
        tenantId: event.tenantId,
        timestamp: event.occurredAt,
        actorId: event.actorId,
        correlationId: event.correlationId,
        causationId: event.eventId,
        revision: revisionFromEvent(event),
        payload: {
          domainEventType: event.type,
          domainEventId: event.eventId,
          ...event.payload,
        },
      }),
    );
  }
  return out;
}
