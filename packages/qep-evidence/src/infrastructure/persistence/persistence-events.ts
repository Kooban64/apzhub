/**
 * Persistence-related event contracts — APZQEP-ENG-110C.
 * Contracts only. Do not publish. Do not integrate with an event bus.
 */

export type PersistenceEventName =
  | "evidence.persistence.saved"
  | "evidence.persistence.conflicted"
  | "evidence.storage.put_requested"
  | "evidence.storage.disposed";

export type PersistenceEventContract = {
  readonly name: PersistenceEventName;
  readonly tenantId: string;
  readonly aggregateType: "Evidence" | "EvidenceCollection" | "EvidenceSet";
  readonly aggregateId: string;
  readonly occurredAt: string;
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly payload: Readonly<Record<string, unknown>>;
};

/** Catalogue of reserved persistence event names (not published under ENG-110C). */
export const PERSISTENCE_EVENT_NAMES = [
  "evidence.persistence.saved",
  "evidence.persistence.conflicted",
  "evidence.storage.put_requested",
  "evidence.storage.disposed",
] as const satisfies readonly PersistenceEventName[];
