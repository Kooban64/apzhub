import type {
  TrustInterestDomainEvent,
  TrustInterestDomainEventId,
} from "./trust-interest-types";

export type TrustInterestEventHandler = (event: TrustInterestDomainEvent) => void;

/** In-memory interest domain event collector — no outbox (LAW-015-06). */
export class InMemoryTrustInterestEventBus {
  private readonly handlers = new Map<
    TrustInterestDomainEventId,
    TrustInterestEventHandler[]
  >();
  private readonly history: TrustInterestDomainEvent[] = [];

  subscribe(
    eventId: TrustInterestDomainEventId,
    handler: TrustInterestEventHandler,
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

  publish(event: TrustInterestDomainEvent): void {
    this.history.push(event);
    for (const handler of this.handlers.get(event.eventId) ?? []) {
      handler(event);
    }
  }

  listEvents(): readonly TrustInterestDomainEvent[] {
    return this.history;
  }

  clear(): void {
    this.history.length = 0;
    this.handlers.clear();
  }
}
