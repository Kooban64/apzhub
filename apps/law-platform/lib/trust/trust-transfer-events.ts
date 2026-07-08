import type {
  TrustTransferDomainEvent,
  TrustTransferDomainEventId,
} from "./trust-transfer-types";

export type TrustTransferEventHandler = (event: TrustTransferDomainEvent) => void;

/** In-memory transfer domain event collector — no outbox (LAW-015-07). */
export class InMemoryTrustTransferEventBus {
  private readonly handlers = new Map<
    TrustTransferDomainEventId,
    TrustTransferEventHandler[]
  >();
  private readonly history: TrustTransferDomainEvent[] = [];

  subscribe(
    eventId: TrustTransferDomainEventId,
    handler: TrustTransferEventHandler,
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

  publish(event: TrustTransferDomainEvent): void {
    this.history.push(event);
    for (const handler of this.handlers.get(event.eventId) ?? []) {
      handler(event);
    }
  }

  listEvents(): readonly TrustTransferDomainEvent[] {
    return this.history;
  }

  clear(): void {
    this.history.length = 0;
    this.handlers.clear();
  }
}
