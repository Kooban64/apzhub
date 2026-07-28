/**
 * Minimal platform-owned domain event publish port (APZHUB-1.1-003).
 * Keeps platform-services free of ENF package coupling while remaining
 * adapter-compatible with `@apzhub/event-notification-framework` EventBus.
 */

export type DomainEventCategory =
  | "system"
  | "user"
  | "capability"
  | "integration"
  | "security"
  | "infrastructure"
  | "business"
  | "notification"
  | "ai";

export interface DomainEventEnvelope {
  readonly envelopeId: string;
  readonly eventId: string;
  readonly eventVersion: string;
  readonly category: DomainEventCategory;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly timestamp: string;
  readonly publisher: string;
  readonly actorId?: string;
  readonly sourceService?: string;
  readonly tenantId?: string;
  readonly payload: Readonly<Record<string, unknown>>;
}

export interface DomainEventPublishResult {
  readonly ok: boolean;
  readonly envelopeId?: string;
  readonly errorMessage?: string;
}

/** Platform-owned publish port — adapters may wrap ENF EventBus or platform-event-bus. */
export interface DomainEventPublisher {
  publish(envelope: DomainEventEnvelope): DomainEventPublishResult;
}

let envelopeCounter = 0;

export function createDomainEventEnvelopeId(): string {
  envelopeCounter += 1;
  return `a1111111-1111-4111-8111-${String(envelopeCounter).padStart(12, "0")}`;
}

/** Test helper — reset deterministic envelope ids. */
export function resetDomainEventEnvelopeCounter(): void {
  envelopeCounter = 0;
}

/**
 * Fail-soft publish — never throws into Platform Service mutation paths.
 * Release 1.0 mutation semantics remain authoritative.
 */
export function publishDomainEventFailSoft(
  publisher: DomainEventPublisher | undefined,
  envelope: DomainEventEnvelope,
): DomainEventPublishResult {
  if (!publisher) {
    return { ok: false, errorMessage: "NO_PUBLISHER" };
  }

  try {
    return publisher.publish(envelope);
  } catch (error) {
    return {
      ok: false,
      envelopeId: envelope.envelopeId,
      errorMessage: error instanceof Error ? error.message : "PUBLISH_FAILED",
    };
  }
}

export function createDomainEventPublisherFromBus(bus: {
  publish: (envelope: DomainEventEnvelope) => {
    ok: boolean;
    envelopeId?: string;
    errorMessage?: string;
  };
}): DomainEventPublisher {
  return {
    publish(envelope) {
      const result = bus.publish(envelope);
      return {
        ok: result.ok,
        envelopeId: result.envelopeId ?? envelope.envelopeId,
        errorMessage: result.errorMessage,
      };
    },
  };
}
