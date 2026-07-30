/**
 * Event publisher adapter scaffold — non-functional.
 * Persistence event contracts: persistence/persistence-events.ts (ENG-110C).
 * Bus publication remains unauthorised under ENG-110C.
 */
export type EventPublisherScaffoldId = "EvidenceEventOutboxAdapter";

export interface EventPublisherScaffold {
  readonly adapterId: EventPublisherScaffoldId;
}

/** Bus event family reserved — see events/qep-evidence/README.md */
export const EVIDENCE_BUS_EVENT_FAMILY = "evidence" as const;

/** Persistence event contracts live in `persistence/persistence-events.ts` (ENG-110C). */
