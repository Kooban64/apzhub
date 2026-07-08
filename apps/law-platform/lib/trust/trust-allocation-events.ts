import type {
  TrustAllocationDomainEvent,
  TrustAllocationDomainEventId,
} from "./trust-allocation-types";

export type TrustAllocationEventHandler = (event: TrustAllocationDomainEvent) => void;

/** In-memory allocation domain event collector — no outbox (LAW-015-04). */
export class InMemoryTrustAllocationEventBus {
  private readonly handlers = new Map<
    TrustAllocationDomainEventId,
    TrustAllocationEventHandler[]
  >();
  private readonly history: TrustAllocationDomainEvent[] = [];

  subscribe(
    eventId: TrustAllocationDomainEventId,
    handler: TrustAllocationEventHandler,
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

  publish(event: TrustAllocationDomainEvent): void {
    this.history.push(event);
    for (const handler of this.handlers.get(event.eventId) ?? []) {
      handler(event);
    }
  }

  listEvents(): readonly TrustAllocationDomainEvent[] {
    return this.history;
  }

  clear(): void {
    this.history.length = 0;
    this.handlers.clear();
  }
}
