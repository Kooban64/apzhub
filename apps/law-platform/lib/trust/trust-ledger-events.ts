import type {
  TrustLedgerDomainEvent,
  TrustLedgerDomainEventId,
} from "./trust-ledger-types";

export type TrustLedgerEventHandler = (event: TrustLedgerDomainEvent) => void;

/** In-memory domain event collector — no outbox, no persistence (LAW-015-02). */
export class InMemoryTrustLedgerEventBus {
  private readonly handlers = new Map<
    TrustLedgerDomainEventId,
    TrustLedgerEventHandler[]
  >();
  private readonly history: TrustLedgerDomainEvent[] = [];

  subscribe(
    eventId: TrustLedgerDomainEventId,
    handler: TrustLedgerEventHandler,
  ): () => void {
    const list = this.handlers.get(eventId) ?? [];
    list.push(handler);
    this.handlers.set(eventId, list);

    return () => {
      const current = this.handlers.get(eventId) ?? [];
      this.handlers.set(
        eventId,
        current.filter((item) => item !== handler),
      );
    };
  }

  publish(event: TrustLedgerDomainEvent): void {
    this.history.push(event);
    for (const handler of this.handlers.get(event.eventId) ?? []) {
      handler(event);
    }
  }

  listEvents(): readonly TrustLedgerDomainEvent[] {
    return this.history;
  }

  clear(): void {
    this.history.length = 0;
    this.handlers.clear();
  }
}
