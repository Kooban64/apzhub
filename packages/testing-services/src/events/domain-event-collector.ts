import type { TestingEventEnvelope, TestingEventType } from "@apzhub/testing-contracts";
import { createTestingEventEnvelope } from "@apzhub/testing-contracts";

/** Append-only in-memory domain event collector — no Event Bus publish. */
export class DomainEventCollector {
  private readonly events: TestingEventEnvelope[] = [];

  record<TType extends TestingEventType, TPayload>(input: {
    readonly eventType: TType;
    readonly tenantId: string;
    readonly correlationId: string;
    readonly payload: TPayload;
    readonly occurredAt?: string;
    readonly causationId?: string;
    readonly actorUserId?: string;
  }): TestingEventEnvelope<TType, TPayload> {
    const envelope = createTestingEventEnvelope(input);
    this.events.push(envelope as TestingEventEnvelope);
    return envelope;
  }

  list(): readonly TestingEventEnvelope[] {
    return [...this.events];
  }

  listByType(eventType: TestingEventType): readonly TestingEventEnvelope[] {
    return this.events.filter((e) => e.eventType === eventType);
  }

  clear(): void {
    this.events.length = 0;
  }

  get size(): number {
    return this.events.length;
  }
}
