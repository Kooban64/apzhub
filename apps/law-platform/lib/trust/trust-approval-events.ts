import type {
  TrustApprovalDomainEvent,
  TrustApprovalDomainEventId,
} from "./trust-approval-types";

export type TrustApprovalEventHandler = (event: TrustApprovalDomainEvent) => void;

/** In-memory approval domain event collector — no outbox (LAW-015-10). */
export class InMemoryTrustApprovalEventBus {
  private readonly handlers = new Map<
    TrustApprovalDomainEventId,
    TrustApprovalEventHandler[]
  >();
  private readonly history: TrustApprovalDomainEvent[] = [];

  subscribe(
    eventId: TrustApprovalDomainEventId,
    handler: TrustApprovalEventHandler,
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

  publish(event: TrustApprovalDomainEvent): void {
    this.history.push(event);
    for (const handler of this.handlers.get(event.eventId) ?? []) {
      handler(event);
    }
  }

  listEvents(): readonly TrustApprovalDomainEvent[] {
    return this.history;
  }

  clear(): void {
    this.history.length = 0;
    this.handlers.clear();
  }
}
