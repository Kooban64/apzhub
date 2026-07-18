export type EventBusAuditAction =
  | "ingress.accepted"
  | "ingress.rejected"
  | "ingress.ignored"
  | "dispatch.ok"
  | "dispatch.failed"
  | "outbox.enqueued"
  | "outbox.relay.ok"
  | "outbox.relay.failed"
  | "replay.requested";

export type EventBusAuditRecord = {
  readonly at: string;
  readonly action: EventBusAuditAction;
  readonly correlationId?: string;
  readonly tenantId?: string;
  readonly providerId?: string;
  readonly integrationId?: string;
  readonly eventType?: string;
  readonly envelopeId?: string;
  readonly outboxEventId?: string;
  readonly detail?: string;
};

export type EventBusAuditSink = {
  readonly record: (entry: EventBusAuditRecord) => void;
  readonly list: () => readonly EventBusAuditRecord[];
  readonly clear: () => void;
};

/** In-memory audit sink for diagnostics / tests (platform audit integration later). */
export function createInMemoryEventBusAuditSink(maxEntries = 500): EventBusAuditSink {
  const entries: EventBusAuditRecord[] = [];
  return {
    record(entry) {
      entries.push(entry);
      if (entries.length > maxEntries) {
        entries.splice(0, entries.length - maxEntries);
      }
    },
    list() {
      return [...entries];
    },
    clear() {
      entries.length = 0;
    },
  };
}
