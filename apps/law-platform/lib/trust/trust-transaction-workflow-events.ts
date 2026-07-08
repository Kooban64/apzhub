import type {
  IdempotencyRecord,
  TrustWorkflowDomainEvent,
  TrustWorkflowDomainEventId,
} from "./trust-transaction-workflow-types";

export type TrustWorkflowEventHandler = (event: TrustWorkflowDomainEvent) => void;

/** In-memory workflow domain events (LAW-015-03). */
export class InMemoryTrustTransactionWorkflowEventBus {
  private readonly handlers = new Map<
    TrustWorkflowDomainEventId,
    TrustWorkflowEventHandler[]
  >();
  private readonly history: TrustWorkflowDomainEvent[] = [];

  subscribe(
    eventId: TrustWorkflowDomainEventId,
    handler: TrustWorkflowEventHandler,
  ): () => void {
    const list = this.handlers.get(eventId) ?? [];
    list.push(handler);
    this.handlers.set(eventId, list);
    return () => {
      this.handlers.set(
        eventId,
        (this.handlers.get(eventId) ?? []).filter((item) => item !== handler),
      );
    };
  }

  publish(event: TrustWorkflowDomainEvent): void {
    this.history.push(event);
    for (const handler of this.handlers.get(event.eventId) ?? []) {
      handler(event);
    }
  }

  listEvents(): readonly TrustWorkflowDomainEvent[] {
    return this.history;
  }

  clear(): void {
    this.history.length = 0;
    this.handlers.clear();
  }
}

/** In-memory idempotency index for post operations (LAW-015-03). */
export class InMemoryTrustIdempotencyStore {
  private readonly records = new Map<string, IdempotencyRecord>();

  clear(): void {
    this.records.clear();
  }

  get(tenantId: string, idempotencyKey: string): IdempotencyRecord | undefined {
    return this.records.get(this.key(tenantId, idempotencyKey));
  }

  save(record: IdempotencyRecord): void {
    this.records.set(this.key(record.tenantId, record.idempotencyKey), record);
  }

  private key(tenantId: string, idempotencyKey: string): string {
    return `${tenantId}::${idempotencyKey}`;
  }
}
