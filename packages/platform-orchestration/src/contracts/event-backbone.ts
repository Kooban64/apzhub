/**
 * Enterprise Quality Event Backbone contracts (QO-010).
 *
 * Transport-only: immutable past-tense facts.
 * Never evaluates, orchestrates, invokes providers, or executes work.
 * Events are never updated — only superseded by later events.
 */

/** Routing modes — transport only. */
export const EVENT_ROUTING_MODES = [
  "broadcast",
  "directed",
  "filtered",
  "tenant_scoped",
  "project_scoped",
  "provider_future",
] as const;

export type EventRoutingMode = (typeof EVENT_ROUTING_MODES)[number];

export const REPLAY_STATUSES = [
  "not_requested",
  "eligible",
  "ineligible",
  "window_expired",
  "superseded",
] as const;

export type ReplayStatus = (typeof REPLAY_STATUSES)[number];

/** Uniform envelope for every platform quality event. */
export interface QualityEventEnvelope {
  readonly eventId: string;
  readonly eventType: string;
  readonly eventVersion: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly timestamp: string;
  readonly producer: string;
  readonly subjectRef: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly metadata: Readonly<Record<string, string>>;
  /** Append-only sequence within correlation (ordering metadata). */
  readonly sequence: number;
  readonly replay: EventReplayMetadata;
  readonly advisory: true;
}

export interface EventReplayMetadata {
  readonly replayEligible: boolean;
  readonly replayWindowHours?: number;
  readonly replayRef?: string;
  readonly replayStatus: ReplayStatus;
}

export interface PublishEventInput {
  readonly eventType: string;
  readonly eventVersion?: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly producer: string;
  readonly subjectRef: string;
  readonly payload?: Readonly<Record<string, unknown>>;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly actorId?: string;
  readonly auditContext?: Readonly<Record<string, string>>;
  /** Override routing for this publish (default broadcast). */
  readonly routing?: EventRoutingMode;
  /** For directed routing: target subscriber ids. */
  readonly targetSubscriberIds?: readonly string[];
  readonly replay?: Partial<EventReplayMetadata>;
}

/** Immutable event type definition. */
export interface EventTypeDefinition {
  readonly eventType: string;
  readonly version: string;
  readonly description: string;
  readonly producer: string;
  readonly consumers: readonly string[];
  readonly schemaRef: string;
  readonly documentationRef: string;
  readonly routingDefault: EventRoutingMode;
  readonly replayEligibleDefault: boolean;
  readonly metadata: Readonly<Record<string, string>>;
  readonly createdAt: string;
}

export interface EventTypeDefinitionInput {
  readonly eventType: string;
  readonly version: string;
  readonly description: string;
  readonly producer: string;
  readonly consumers?: readonly string[];
  readonly schemaRef: string;
  readonly documentationRef: string;
  readonly routingDefault?: EventRoutingMode;
  readonly replayEligibleDefault?: boolean;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface EventHistoryRecord {
  readonly eventId: string;
  readonly eventType: string;
  readonly eventVersion: string;
  readonly timestamp: string;
  readonly producer: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly subjectRef: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly sequence: number;
}

export interface EventQuery {
  readonly eventType?: string;
  readonly correlationId?: string;
  readonly tenantId?: string;
  readonly projectId?: string;
  readonly producer?: string;
  readonly subjectRef?: string;
  readonly fromTimestamp?: string;
  readonly toTimestamp?: string;
  readonly limit?: number;
}

export type EventSubscriberHandler = (
  event: QualityEventEnvelope,
) => void | Promise<void>;

export interface EventSubscription {
  readonly subscriptionId: string;
  readonly subscriberId: string;
  readonly eventTypes: readonly string[];
  readonly routing: EventRoutingMode;
  readonly tenantId?: string;
  readonly projectId?: string;
  readonly createdAt: string;
  readonly metadata: Readonly<Record<string, string>>;
}

export interface SubscribeEventInput {
  readonly subscriberId: string;
  readonly eventTypes?: readonly string[];
  readonly routing?: EventRoutingMode;
  readonly tenantId?: string;
  readonly projectId?: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly handler: EventSubscriberHandler;
}

export interface EventBackboneDiagnostics {
  readonly registeredTypeCount: number;
  readonly publishedCount: number;
  readonly rejectedCount: number;
  readonly subscriberCount: number;
  readonly historyCount: number;
  readonly publisherStatistics: Readonly<Record<string, number>>;
  readonly subscriberStatistics: Readonly<Record<string, number>>;
  readonly routingStatistics: Readonly<Record<string, number>>;
  readonly validationStatistics: Readonly<{
    accepted: number;
    rejected: number;
    commandStyleRejected: number;
    unregisteredRejected: number;
    envelopeRejected: number;
  }>;
  readonly health: "healthy" | "degraded" | "unhealthy";
  readonly ready: boolean;
  readonly checkedAt: string;
}
