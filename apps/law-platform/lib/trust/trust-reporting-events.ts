import type {
  TrustReportingDomainEvent,
  TrustReportingDomainEventId,
} from "./trust-reporting-types";

export type TrustReportingEventHandler = (event: TrustReportingDomainEvent) => void;

/** In-memory reporting domain event collector — no outbox (LAW-015-08). */
export class InMemoryTrustReportingEventBus {
  private readonly handlers = new Map<
    TrustReportingDomainEventId,
    TrustReportingEventHandler[]
  >();
  private readonly history: TrustReportingDomainEvent[] = [];

  subscribe(
    eventId: TrustReportingDomainEventId,
    handler: TrustReportingEventHandler,
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

  publish(event: TrustReportingDomainEvent): void {
    this.history.push(event);
    for (const handler of this.handlers.get(event.eventId) ?? []) {
      handler(event);
    }
  }

  listEvents(): readonly TrustReportingDomainEvent[] {
    return this.history;
  }

  clear(): void {
    this.history.length = 0;
    this.handlers.clear();
  }
}
