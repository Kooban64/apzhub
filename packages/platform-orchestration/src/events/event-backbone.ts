/**
 * Enterprise Quality Event Backbone (QO-010).
 *
 * Publishes, routes, validates, and records immutable quality events.
 * Transport only — never evaluates, orchestrates, or invokes providers.
 */

import type {
  EventBackboneDiagnostics,
  EventHistoryRecord,
  EventQuery,
  EventRoutingMode,
  EventSubscription,
  EventSubscriberHandler,
  EventTypeDefinitionInput,
  PublishEventInput,
  QualityEventEnvelope,
  SubscribeEventInput,
} from "../contracts/event-backbone";
import { OrchestrationError } from "../contracts/errors";
import type {
  OrchestrationEventPublisher,
  OrchestrationKernelEvent,
} from "../contracts/events";
import { EventTypeRegistry } from "./registry";
import { assertValidPublish } from "./validation";

export interface QualityEventBackboneOptions {
  readonly registry?: EventTypeRegistry;
  readonly seedBuiltIns?: boolean;
  /** Optional side-channel for legacy OrchestrationKernelEvent listeners. */
  readonly legacyPublishEvent?: OrchestrationEventPublisher;
  readonly orchestrationId?: string;
}

interface ActiveSubscription extends EventSubscription {
  readonly handler: EventSubscriberHandler;
}

function createId(prefix: string): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${stamp}_${rand}`;
}

function producerFromLegacyType(type: string): string {
  if (type.startsWith("orchestration.trigger.")) return "orchestration.trigger";
  if (type.startsWith("orchestration.quality_flow."))
    return "orchestration.quality_flow";
  if (type.startsWith("orchestration.impact_correlation."))
    return "orchestration.impact";
  if (type.startsWith("orchestration.policy_selection.")) return "orchestration.policy";
  if (type.startsWith("orchestration.governance.")) return "orchestration.governance";
  if (type.startsWith("orchestration.approval.")) return "orchestration.approval";
  if (type.startsWith("orchestration.decision.")) return "orchestration.decision";
  if (type.startsWith("automation.")) return "orchestration.automation_coordination";
  if (type.startsWith("source.")) return "orchestration.source_change";
  if (
    type.startsWith("quality.enrichment.") ||
    type.startsWith("advisory.") ||
    type.startsWith("enrichment.")
  )
    return "orchestration.enrichment";
  if (type.startsWith("evidence.") || type.startsWith("report."))
    return "orchestration.evidence_integration";
  if (type.startsWith("orchestration.capability.")) return "orchestration.kernel";
  if (type.startsWith("orchestration.contract.")) return "orchestration.kernel";
  return "orchestration.kernel";
}

export class QualityEventBackbone {
  readonly registry: EventTypeRegistry;

  private readonly legacyPublishEvent?: OrchestrationEventPublisher;
  private readonly orchestrationId: string;
  private readonly events = new Map<string, QualityEventEnvelope>();
  private readonly history: EventHistoryRecord[] = [];
  private readonly subscriptions = new Map<string, ActiveSubscription>();
  private readonly correlationSequences = new Map<string, number>();

  private publishedCount = 0;
  private rejectedCount = 0;
  private readonly publisherStatistics: Record<string, number> = {};
  private readonly subscriberStatistics: Record<string, number> = {};
  private readonly routingStatistics: Record<string, number> = {};
  private validationStatistics = {
    accepted: 0,
    rejected: 0,
    commandStyleRejected: 0,
    unregisteredRejected: 0,
    envelopeRejected: 0,
  };

  constructor(options: QualityEventBackboneOptions = {}) {
    this.registry = options.registry ?? new EventTypeRegistry();
    this.legacyPublishEvent = options.legacyPublishEvent;
    this.orchestrationId = options.orchestrationId ?? "orch_default";
    if (options.seedBuiltIns !== false) {
      this.registry.registerBuiltIns();
    }
  }

  registerEventType(input: EventTypeDefinitionInput) {
    return this.registry.register(input);
  }

  /**
   * Publish an immutable quality event fact.
   * Invalid / command-style / unregistered events are rejected.
   */
  publish(input: PublishEventInput): QualityEventEnvelope {
    try {
      const validated = assertValidPublish(input, this.registry);
      const def = this.registry.get(validated.eventType, validated.eventVersion);
      const correlationId = input.correlationId.trim();
      const sequence = (this.correlationSequences.get(correlationId) ?? 0) + 1;
      this.correlationSequences.set(correlationId, sequence);

      const routing: EventRoutingMode = input.routing ?? def.routingDefault;
      const now = new Date().toISOString();
      const metadata: Record<string, string> = {
        ...(input.metadata ?? {}),
        orchestrationId: this.orchestrationId,
      };
      if (input.actorId?.trim()) {
        metadata.actorId = input.actorId.trim();
      }
      if (input.auditContext) {
        for (const [k, v] of Object.entries(input.auditContext)) {
          metadata[`audit.${k}`] = v;
        }
      }

      const envelope: QualityEventEnvelope = Object.freeze({
        eventId: createId("evt"),
        eventType: validated.eventType,
        eventVersion: validated.eventVersion,
        correlationId,
        causationId: input.causationId?.trim() || undefined,
        tenantId: input.tenantId.trim(),
        projectId: input.projectId?.trim() || undefined,
        timestamp: now,
        producer: input.producer.trim(),
        subjectRef: input.subjectRef.trim(),
        payload: Object.freeze({ ...(input.payload ?? {}) }),
        metadata: Object.freeze(metadata),
        sequence,
        replay: Object.freeze({
          replayEligible: input.replay?.replayEligible ?? def.replayEligibleDefault,
          replayWindowHours: input.replay?.replayWindowHours,
          replayRef: input.replay?.replayRef,
          replayStatus: input.replay?.replayStatus ?? "not_requested",
        }),
        advisory: true as const,
      });

      this.events.set(envelope.eventId, envelope);
      this.history.push(
        Object.freeze({
          eventId: envelope.eventId,
          eventType: envelope.eventType,
          eventVersion: envelope.eventVersion,
          timestamp: envelope.timestamp,
          producer: envelope.producer,
          correlationId: envelope.correlationId,
          causationId: envelope.causationId,
          subjectRef: envelope.subjectRef,
          tenantId: envelope.tenantId,
          projectId: envelope.projectId,
          sequence: envelope.sequence,
        }),
      );

      this.publishedCount += 1;
      this.validationStatistics.accepted += 1;
      this.publisherStatistics[envelope.producer] =
        (this.publisherStatistics[envelope.producer] ?? 0) + 1;
      this.routingStatistics[routing] = (this.routingStatistics[routing] ?? 0) + 1;

      this.dispatch(envelope, routing, input.targetSubscriberIds);

      return envelope;
    } catch (error) {
      this.rejectedCount += 1;
      this.validationStatistics.rejected += 1;
      if (error instanceof OrchestrationError) {
        const reason = String(error.details?.reason ?? "");
        if (reason === "command_style") {
          this.validationStatistics.commandStyleRejected += 1;
        } else if (reason === "unregistered") {
          this.validationStatistics.unregisteredRejected += 1;
        } else if (reason === "envelope" || reason === "schema") {
          this.validationStatistics.envelopeRejected += 1;
        }
      }
      throw error;
    }
  }

  /**
   * Bridge for QO-001…QO-009 engines that still emit OrchestrationKernelEvent.
   * Converts to the uniform envelope and optionally forwards legacy listeners.
   */
  publishFromLegacy(event: OrchestrationKernelEvent): QualityEventEnvelope | undefined {
    const producer = producerFromLegacyType(event.type);
    const tenantId = event.tenantId?.trim() || "platform";
    const subjectRef =
      typeof event.payload?.subjectRef === "string"
        ? event.payload.subjectRef
        : event.orchestrationId;

    let envelope: QualityEventEnvelope | undefined;
    try {
      envelope = this.publish({
        eventType: event.type,
        correlationId: event.correlationId,
        causationId:
          typeof event.payload?.causationId === "string"
            ? event.payload.causationId
            : undefined,
        tenantId,
        projectId:
          typeof event.payload?.projectId === "string"
            ? event.payload.projectId
            : undefined,
        producer,
        subjectRef,
        payload: {
          ...(event.payload ?? {}),
          orchestrationId: event.orchestrationId,
          occurredAt: event.occurredAt,
          legacy: true,
        },
        metadata: { bridge: "orchestration.kernel.event" },
      });
    } catch {
      // Unregistered legacy types should not break engines during transition —
      // still forward legacy side-channel. Built-ins cover QO-001…009.
      this.rejectedCount += 1;
      this.validationStatistics.rejected += 1;
      this.validationStatistics.unregisteredRejected += 1;
    }

    void this.legacyPublishEvent?.(event);
    return envelope;
  }

  /** Adapter used as OrchestrationEventPublisher for engines. */
  createLegacyPublisher(): OrchestrationEventPublisher {
    return (event) => {
      this.publishFromLegacy(event);
    };
  }

  subscribe(input: SubscribeEventInput): EventSubscription {
    const subscriberId = input.subscriberId.trim();
    if (!subscriberId) {
      throw new OrchestrationError(
        "validation",
        "INVALID_SUBSCRIPTION",
        "subscriberId is required",
      );
    }
    const subscriptionId = createId("sub");
    const sub: ActiveSubscription = {
      subscriptionId,
      subscriberId,
      eventTypes: Object.freeze([...(input.eventTypes ?? [])]),
      routing: input.routing ?? "broadcast",
      tenantId: input.tenantId?.trim() || undefined,
      projectId: input.projectId?.trim() || undefined,
      createdAt: new Date().toISOString(),
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
      handler: input.handler,
    };
    this.subscriptions.set(subscriptionId, sub);
    return Object.freeze({
      subscriptionId: sub.subscriptionId,
      subscriberId: sub.subscriberId,
      eventTypes: sub.eventTypes,
      routing: sub.routing,
      tenantId: sub.tenantId,
      projectId: sub.projectId,
      createdAt: sub.createdAt,
      metadata: sub.metadata,
    });
  }

  unsubscribe(subscriptionId: string): void {
    if (!this.subscriptions.delete(subscriptionId)) {
      throw new OrchestrationError(
        "validation",
        "SUBSCRIPTION_NOT_FOUND",
        `Subscription not found: ${subscriptionId}`,
        { subscriptionId },
      );
    }
  }

  getEvent(eventId: string): QualityEventEnvelope {
    const event = this.events.get(eventId);
    if (!event) {
      throw new OrchestrationError(
        "validation",
        "EVENT_NOT_FOUND",
        `Event not found: ${eventId}`,
        { eventId },
      );
    }
    return event;
  }

  queryEvents(query: EventQuery = {}): readonly QualityEventEnvelope[] {
    const limit = query.limit ?? 100;
    let results = [...this.events.values()];
    if (query.eventType) {
      results = results.filter((e) => e.eventType === query.eventType);
    }
    if (query.correlationId) {
      results = results.filter((e) => e.correlationId === query.correlationId);
    }
    if (query.tenantId) {
      results = results.filter((e) => e.tenantId === query.tenantId);
    }
    if (query.projectId) {
      results = results.filter((e) => e.projectId === query.projectId);
    }
    if (query.producer) {
      results = results.filter((e) => e.producer === query.producer);
    }
    if (query.subjectRef) {
      results = results.filter((e) => e.subjectRef === query.subjectRef);
    }
    if (query.fromTimestamp) {
      results = results.filter((e) => e.timestamp >= query.fromTimestamp!);
    }
    if (query.toTimestamp) {
      results = results.filter((e) => e.timestamp <= query.toTimestamp!);
    }
    results.sort((a, b) => {
      if (a.correlationId === b.correlationId) {
        return a.sequence - b.sequence;
      }
      return a.timestamp.localeCompare(b.timestamp);
    });
    return results.slice(0, limit);
  }

  getHistory(query: EventQuery = {}): readonly EventHistoryRecord[] {
    const events = this.queryEvents(query);
    const ids = new Set(events.map((e) => e.eventId));
    return this.history.filter((h) => ids.has(h.eventId));
  }

  listEventTypes(): readonly string[] {
    return this.registry.listTypes();
  }

  listEventVersions(eventType: string) {
    return this.registry.listVersions(eventType);
  }

  getEventMetadata(eventType: string, version?: string) {
    return this.registry.get(eventType, version);
  }

  diagnostics(): EventBackboneDiagnostics {
    return {
      registeredTypeCount: this.registry.count(),
      publishedCount: this.publishedCount,
      rejectedCount: this.rejectedCount,
      subscriberCount: this.subscriptions.size,
      historyCount: this.history.length,
      publisherStatistics: { ...this.publisherStatistics },
      subscriberStatistics: { ...this.subscriberStatistics },
      routingStatistics: { ...this.routingStatistics },
      validationStatistics: { ...this.validationStatistics },
      health: "healthy",
      ready: this.registry.count() > 0,
      checkedAt: new Date().toISOString(),
    };
  }

  private dispatch(
    event: QualityEventEnvelope,
    routing: EventRoutingMode,
    targetSubscriberIds?: readonly string[],
  ): void {
    for (const sub of this.subscriptions.values()) {
      if (!this.matchesSubscription(event, sub, routing, targetSubscriberIds)) {
        continue;
      }
      this.subscriberStatistics[sub.subscriberId] =
        (this.subscriberStatistics[sub.subscriberId] ?? 0) + 1;
      void sub.handler(event);
    }
  }

  private matchesSubscription(
    event: QualityEventEnvelope,
    sub: ActiveSubscription,
    publishRouting: EventRoutingMode,
    targetSubscriberIds?: readonly string[],
  ): boolean {
    if (sub.eventTypes.length > 0 && !sub.eventTypes.includes(event.eventType)) {
      return false;
    }

    // Subscription-local scope filters
    if (sub.tenantId && sub.tenantId !== event.tenantId) {
      return false;
    }
    if (sub.projectId && sub.projectId !== event.projectId) {
      return false;
    }

    switch (publishRouting) {
      case "broadcast":
        return true;
      case "directed":
        return (
          !!targetSubscriberIds?.length &&
          targetSubscriberIds.includes(sub.subscriberId)
        );
      case "filtered":
        return sub.routing === "filtered" || sub.eventTypes.length > 0;
      case "tenant_scoped":
        return !!event.tenantId && (!sub.tenantId || sub.tenantId === event.tenantId);
      case "project_scoped":
        return (
          !!event.projectId && (!sub.projectId || sub.projectId === event.projectId)
        );
      case "provider_future":
        // Reserved — deliver only to subscribers explicitly marked for future providers
        return sub.routing === "provider_future";
      default:
        return false;
    }
  }
}
