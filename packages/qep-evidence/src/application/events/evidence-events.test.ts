import { describe, expect, it, beforeEach } from "vitest";

import {
  QEP_EVIDENCE_EVENT_DESCRIPTORS,
  QEP_EVIDENCE_PLATFORM_EVENTS,
  isRegisteredQepEvidenceEvent,
} from "./catalogue";
import {
  buildQepEvidenceEventEnvelope,
  resetQepEvidenceEnvelopeCounter,
  validateQepEvidenceEventEnvelope,
} from "./envelope";
import { mapDomainEventsToPlatformEnvelopes } from "./map-domain-events";
import {
  createInMemoryQepEvidenceEventPublisher,
  publishQepEvidenceEventFailSoft,
} from "./publisher";
import { publishLifecyclePlatformEvents } from "./publish-lifecycle";
import type { EvidenceDomainEvent } from "../../domain/evidence/events";

describe("APZQEP-120-S07 Evidence event platform", () => {
  beforeEach(() => {
    resetQepEvidenceEnvelopeCounter();
  });

  it("registers the Owner-required Evidence catalogue events", () => {
    const ids = QEP_EVIDENCE_EVENT_DESCRIPTORS.map((d) => d.eventId);
    expect(ids).toEqual([
      QEP_EVIDENCE_PLATFORM_EVENTS.created,
      QEP_EVIDENCE_PLATFORM_EVENTS.updated,
      QEP_EVIDENCE_PLATFORM_EVENTS.lifecycleChanged,
      QEP_EVIDENCE_PLATFORM_EVENTS.integrityEstablished,
      QEP_EVIDENCE_PLATFORM_EVENTS.integrityVerified,
      QEP_EVIDENCE_PLATFORM_EVENTS.archived,
      QEP_EVIDENCE_PLATFORM_EVENTS.superseded,
      QEP_EVIDENCE_PLATFORM_EVENTS.deleted,
    ]);
    for (const id of ids) {
      expect(isRegisteredQepEvidenceEvent(id)).toBe(true);
    }
  });

  it("builds and validates envelopes with version + idempotency", () => {
    const envelope = buildQepEvidenceEventEnvelope({
      eventId: QEP_EVIDENCE_PLATFORM_EVENTS.created,
      evidenceId: "ev-1",
      tenantId: "t1",
      timestamp: "2026-08-02T12:00:00.000Z",
      actorId: "u1",
      correlationId: "c1",
      revision: 1,
    });
    expect(envelope.eventVersion).toBe("1.0.0");
    expect(envelope.publisher).toBe("qep-evidence");
    expect(envelope.idempotencyKey).toContain("qep.evidence.created");
    expect(validateQepEvidenceEventEnvelope(envelope)).toEqual({ ok: true });
  });

  it("maps domain events to platform catalogue events", () => {
    const domain: EvidenceDomainEvent[] = [
      {
        eventId: "ev-1:evidence.captured:1",
        type: "evidence.captured",
        aggregateId: "ev-1",
        tenantId: "t1",
        occurredAt: "2026-08-02T12:00:00.000Z",
        actorId: "u1",
        correlationId: "c1",
        payload: {},
      },
      {
        eventId: "ev-1:evidence.integrity_established:2",
        type: "evidence.integrity_established",
        aggregateId: "ev-1",
        tenantId: "t1",
        occurredAt: "2026-08-02T12:01:00.000Z",
        actorId: "u1",
        payload: { contentHash: "abc" },
      },
      {
        eventId: "ev-1:evidence.disposed:3",
        type: "evidence.disposed",
        aggregateId: "ev-1",
        tenantId: "t1",
        occurredAt: "2026-08-02T12:02:00.000Z",
        actorId: "u1",
        payload: { reason: "logical" },
      },
    ];
    const mapped = mapDomainEventsToPlatformEnvelopes(domain);
    expect(mapped.map((e) => e.eventId)).toEqual([
      "qep.evidence.created",
      "qep.evidence.integrity_established",
      "qep.evidence.deleted",
    ]);
  });

  it("publishes fail-soft and is idempotent for the same key", () => {
    const bus = createInMemoryQepEvidenceEventPublisher();
    const envelope = buildQepEvidenceEventEnvelope({
      eventId: QEP_EVIDENCE_PLATFORM_EVENTS.updated,
      evidenceId: "ev-1",
      tenantId: "t1",
      timestamp: "2026-08-02T12:00:00.000Z",
      revision: 4,
    });
    expect(publishQepEvidenceEventFailSoft(undefined, envelope).errorCode).toBe(
      "NO_PUBLISHER",
    );
    expect(publishQepEvidenceEventFailSoft(bus, envelope).ok).toBe(true);
    const again = publishQepEvidenceEventFailSoft(bus, {
      ...envelope,
      envelopeId: "other",
    });
    expect(again.ok).toBe(true);
    expect(again.errorCode).toBe("DUPLICATE");
    expect(bus.published).toHaveLength(1);
  });

  it("publishes lifecycle_changed plus specialised events", () => {
    const bus = createInMemoryQepEvidenceEventPublisher();
    publishLifecyclePlatformEvents({
      publisher: bus,
      evidenceId: "ev-1",
      tenantId: "t1",
      actorId: "u1",
      timestamp: "2026-08-02T12:00:00.000Z",
      revision: 5,
      sourceState: "ACTIVE",
      targetState: "ARCHIVED",
      action: "markArchived",
    });
    expect(bus.published.map((e) => e.eventId)).toEqual([
      "qep.evidence.lifecycle_changed",
      "qep.evidence.archived",
    ]);
  });
});
