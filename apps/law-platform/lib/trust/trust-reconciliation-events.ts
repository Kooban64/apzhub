import type {
  TrustReconciliationDomainEvent,
  TrustReconciliationDomainEventId,
} from "./trust-reconciliation-types";

export type TrustReconciliationEventHandler = (
  event: TrustReconciliationDomainEvent,
) => void;

/** In-memory reconciliation domain event collector — no outbox (LAW-015-05). */
export class InMemoryTrustReconciliationEventBus {
  private readonly handlers = new Map<
    TrustReconciliationDomainEventId,
    TrustReconciliationEventHandler[]
  >();
  private readonly history: TrustReconciliationDomainEvent[] = [];

  subscribe(
    eventId: TrustReconciliationDomainEventId,
    handler: TrustReconciliationEventHandler,
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

  publish(event: TrustReconciliationDomainEvent): void {
    this.history.push(event);
    for (const handler of this.handlers.get(event.eventId) ?? []) {
      handler(event);
    }
  }

  listEvents(): readonly TrustReconciliationDomainEvent[] {
    return this.history;
  }

  clear(): void {
    this.history.length = 0;
    this.handlers.clear();
  }
}
