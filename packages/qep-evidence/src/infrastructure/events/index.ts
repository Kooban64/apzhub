/**
 * Evidence event transport scaffolding — APZQEP-120-S08.
 * Application Services publish via outbox-backed publisher (application/events).
 * Infrastructure hosts DeliveryPort adapters only (null transport in S08).
 */

export type EventPublisherScaffoldId = "EvidenceEventOutboxAdapter";

export interface EventPublisherScaffold {
  readonly adapterId: EventPublisherScaffoldId;
}

/** Bus event family reserved — see events/qep-evidence/README.md */
export const EVIDENCE_BUS_EVENT_FAMILY = "evidence" as const;

export const EVIDENCE_OUTBOX_ADAPTER_ID = "EvidenceEventOutboxAdapter" as const;

/** Persistence event contracts live in `persistence/persistence-events.ts` (ENG-110C). */
