/**
 * Transport adapter scaffold for platform-event-bus / outbox (S08+).
 * Application catalogue publish lives in application/events (APZQEP-120-S07).
 * Persistence event contracts: persistence/persistence-events.ts (ENG-110C).
 */
export type EventPublisherScaffoldId = "EvidenceEventOutboxAdapter";

export interface EventPublisherScaffold {
  readonly adapterId: EventPublisherScaffoldId;
}

/** Bus event family reserved — see events/qep-evidence/README.md */
export const EVIDENCE_BUS_EVENT_FAMILY = "evidence" as const;

/** Persistence event contracts live in `persistence/persistence-events.ts` (ENG-110C). */
