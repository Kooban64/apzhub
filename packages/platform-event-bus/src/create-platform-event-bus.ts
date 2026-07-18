import {
  createInProcessEventBus,
  type EventBus,
  type EventRegistry,
} from "@apzhub/event-notification-framework";
import {
  createEventMetrics,
  createInMemoryEventDeduplicationStore,
  createInMemoryReplayStore,
  createMockHmacWebhookVerifier,
  createReplayProtection,
  type WebhookProcessingPipeline,
} from "@apzhub/integration-sdk/events";
import type { OutboxHandler, OutboxStore, ReplayFilter } from "@apzhub/platform-outbox";
import { createOutboxWorker, type OutboxWorker } from "@apzhub/platform-outbox";

import { createInMemoryEventBusAuditSink, type EventBusAuditSink } from "./audit";
import {
  buildDiagnostics,
  type PlatformEventBusDiagnostics,
  type PlatformEventBusDiagnosticsState,
} from "./diagnostics";
import { toHealth, type PlatformEventBusHealth } from "./health";
import { createPlatformIngressPipeline } from "./ingress/pipeline";
import {
  createPlatformWebhookIngressService,
  type IngressDispatchMode,
  type PlatformWebhookIngressService,
} from "./ingress/service";
import { createStructuredLogger, type StructuredLogger } from "./logging";
import { createEventBusMetrics, type EventBusMetrics } from "./metrics";
import { ensurePlatformEventBusRegistry } from "./registry";
import { createEventBusOutboxHandler } from "./relay/outbox-handler";
import { PLATFORM_EVENT_BUS_VERSION } from "./version";
import { PLATFORM_WEBHOOK_SIGNATURE_HEADER } from "./constants";

export type CreatePlatformEventBusOptions = {
  readonly registry?: EventRegistry;
  readonly bus?: EventBus;
  readonly outboxStore?: OutboxStore;
  readonly webhookSecret?: string;
  readonly defaultDispatchMode?: IngressDispatchMode;
  readonly logger?: StructuredLogger;
  readonly audit?: EventBusAuditSink;
  readonly metrics?: EventBusMetrics;
  /** Skip HMAC when no secret configured (tests only). */
  readonly allowUnsignedIngress?: boolean;
};

export type PlatformEventBusRuntime = {
  readonly version: string;
  readonly registry: EventRegistry;
  readonly bus: EventBus;
  readonly metrics: EventBusMetrics;
  readonly audit: EventBusAuditSink;
  readonly ingress: PlatformWebhookIngressService;
  readonly pipeline: WebhookProcessingPipeline;
  readonly outboxStore?: OutboxStore;
  readonly allowUnsignedIngress: boolean;
  diagnostics(): PlatformEventBusDiagnostics;
  health(): PlatformEventBusHealth;
  createOutboxHandler(name?: string): OutboxHandler;
  createRelayWorker(extraHandlers?: readonly OutboxHandler[]): OutboxWorker | undefined;
  replay(filter?: ReplayFilter): Promise<number>;
};

/**
 * Compose Platform Event Bus runtime: registry, in-process bus, SDK webhook pipeline,
 * ingress service, outbox relay handler, diagnostics/health.
 */
export function createPlatformEventBus(
  options: CreatePlatformEventBusOptions = {},
): PlatformEventBusRuntime {
  const registry = ensurePlatformEventBusRegistry(options.registry);
  const bus = options.bus ?? createInProcessEventBus({ registry });
  const metrics = options.metrics ?? createEventBusMetrics();
  const audit = options.audit ?? createInMemoryEventBusAuditSink();
  const logger = options.logger ?? createStructuredLogger();
  const state: PlatformEventBusDiagnosticsState = {};

  const sdkMetrics = createEventMetrics();
  const dedupe = createInMemoryEventDeduplicationStore();
  const replayStore = createInMemoryReplayStore();
  const replayProtection = createReplayProtection({ store: replayStore });

  const verifier = options.webhookSecret
    ? createMockHmacWebhookVerifier({
        signatureHeaderName: PLATFORM_WEBHOOK_SIGNATURE_HEADER,
        resolveSecret: async () => options.webhookSecret,
      })
    : undefined;

  const allowUnsignedIngress = options.allowUnsignedIngress ?? !options.webhookSecret;

  const pipeline = createPlatformIngressPipeline({
    verifier,
    replayProtection,
    deduplicationStore: dedupe,
    metrics: sdkMetrics,
  });

  const ingress = createPlatformWebhookIngressService({
    pipeline,
    bus,
    metrics,
    audit,
    logger,
    state,
    outboxStore: options.outboxStore,
    defaultDispatchMode: options.defaultDispatchMode,
  });

  function createOutboxHandler(name?: string): OutboxHandler {
    return createEventBusOutboxHandler({
      bus,
      metrics,
      audit,
      logger,
      state,
      name,
    });
  }

  return {
    version: PLATFORM_EVENT_BUS_VERSION,
    registry,
    bus,
    metrics,
    audit,
    ingress,
    pipeline,
    outboxStore: options.outboxStore,
    allowUnsignedIngress,

    diagnostics() {
      const recent = audit.list().slice(-20);
      return buildDiagnostics({
        metrics: metrics.snapshot(),
        bus: bus.getDiagnostics(),
        recentAudit: recent,
        state,
      });
    },

    health() {
      return toHealth(this.diagnostics());
    },

    createOutboxHandler,

    createRelayWorker(extraHandlers = []) {
      if (!options.outboxStore) {
        return undefined;
      }
      return createOutboxWorker({
        store: options.outboxStore,
        handlers: [createOutboxHandler("event-bus-relay"), ...extraHandlers],
      });
    },

    async replay(filter = {}) {
      if (!options.outboxStore) {
        throw new Error("replay requires outboxStore");
      }
      const worker = createOutboxWorker({
        store: options.outboxStore,
        handlers: [createOutboxHandler("event-bus-relay")],
      });
      audit.record({
        at: new Date().toISOString(),
        action: "replay.requested",
        detail: JSON.stringify(filter),
      });
      return worker.replay(filter);
    },
  };
}
