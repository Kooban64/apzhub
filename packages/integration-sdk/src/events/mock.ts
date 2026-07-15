import { buildIntegrationSourceEvent } from "./source-event";
import type { IntegrationSourceEvent } from "./source-event";
import { createSdkEventId, deriveSourceEventId } from "./event-identity";
import { createInMemoryEventDeduplicationStore } from "./deduplication";
import { createEventMetrics } from "./metrics";
import { createEventDiagnosticsCollector } from "./diagnostics";
import { createInMemoryReplayStore, createReplayProtection } from "./webhook/replay";
import {
  computeMockHmacSignature,
  createMockHmacWebhookVerifier,
} from "./webhook/verification";
import {
  createWebhookProcessingPipeline,
  type WebhookDecoder,
  type WebhookTranslator,
} from "./webhook/pipeline";
import { createInMemoryPollingCheckpointStore } from "./polling/checkpoint";
import { createOpaqueCursor } from "./polling/cursor";
import { createPollingExecutionPipeline } from "./polling/pipeline";
import type {
  PollingPageRequest,
  PollingPageResult,
  PollingSource,
  PollingSourceDefinition,
} from "./polling/types";
import type { IntegrationRequestContext } from "../types/context";

export interface MockSourceEventOptions {
  readonly providerId?: string;
  readonly integrationId?: string;
  readonly eventType?: string;
  readonly action?: string;
  readonly resourceType?: string;
  readonly correlationId?: string;
  readonly providerEventId?: string;
  readonly resourceId?: string;
}

export function createMockSourceEvent(
  options: MockSourceEventOptions = {},
): IntegrationSourceEvent {
  const providerId = options.providerId ?? "mock-provider";
  const integrationId = options.integrationId ?? "mock-integration";
  const action = options.action ?? "created";
  const resourceType = options.resourceType ?? "task";
  const identity = deriveSourceEventId({
    providerEventId: options.providerEventId,
    resourceId: options.resourceId ?? "res-1",
    action,
    providerTimestamp: new Date().toISOString(),
    providerId,
    integrationId,
  });

  return buildIntegrationSourceEvent({
    eventId: createSdkEventId(),
    sourceEventId: identity.sourceEventId,
    eventType: options.eventType ?? `${resourceType}.${action}`,
    action,
    resourceType,
    providerId,
    integrationId,
    correlationId: options.correlationId ?? "corr-mock",
    deliveryMechanism: "webhook",
    safeSourceMetadata: {
      resourceId: options.resourceId ?? "res-1",
    },
  });
}

export function createMockJsonWebhookDecoder(
  options: {
    readonly deliveryId?: string;
    readonly fail?: boolean;
  } = {},
): WebhookDecoder {
  return {
    decode(input) {
      if (options.fail) {
        return { ok: false, reason: "mock_decode_failure" };
      }
      const text =
        typeof input.rawBody === "string"
          ? input.rawBody
          : Buffer.from(input.rawBody).toString("utf8");
      try {
        return {
          ok: true,
          payload: JSON.parse(text) as unknown,
          rawBody: input.rawBody,
          headers: input.headers,
          deliveryId: options.deliveryId ?? input.headers["x-delivery-id"],
          timestamp: input.headers["x-webhook-timestamp"],
        };
      } catch {
        return { ok: false, reason: "invalid_json" };
      }
    },
  };
}

export function createMockWebhookTranslator(
  options: {
    readonly ignore?: boolean;
    readonly fail?: boolean;
    readonly eventFactory?: (payload: unknown) => IntegrationSourceEvent;
  } = {},
): WebhookTranslator {
  return {
    translate(payload, context) {
      if (options.fail) {
        return { ok: false, reason: "mock_translate_failure" };
      }
      if (options.ignore) {
        return { ok: true, ignored: true, reason: "mock_ignored" };
      }
      const event =
        options.eventFactory?.(payload) ??
        createMockSourceEvent({
          providerId: context.providerId,
          integrationId: context.integrationId,
          correlationId: context.correlationId,
        });
      return { ok: true, event, events: [event] };
    },
  };
}

export interface MockPollingSourceOptions {
  readonly definition?: Partial<PollingSourceDefinition>;
  readonly pages?: readonly PollingPageResult[];
  readonly failOnPage?: number;
}

export function createMockPollingSource(
  options: MockPollingSourceOptions = {},
): PollingSource {
  const pages = [...(options.pages ?? [])];
  let pageIndex = 0;

  const definition: PollingSourceDefinition = {
    id: options.definition?.id ?? "mock-polling-source",
    integrationId: options.definition?.integrationId ?? "mock-integration",
    providerId: options.definition?.providerId ?? "mock-provider",
    resourceTypes: options.definition?.resourceTypes ?? ["task"],
    supportedModes: options.definition?.supportedModes ?? [
      "full",
      "incremental",
      "resume",
      "validation",
    ],
    defaultPageSize: options.definition?.defaultPageSize ?? 10,
  };

  if (pages.length === 0) {
    pages.push({
      records: [{ id: "1" }, { id: "2" }],
      nextCursor: createOpaqueCursor("page-2"),
      exhausted: false,
      pageToken: "page-1",
      recordsProcessed: 2,
    });
    pages.push({
      records: [{ id: "3" }],
      exhausted: true,
      pageToken: "page-2",
      recordsProcessed: 1,
    });
  }

  return {
    definition,
    async poll(
      _context: IntegrationRequestContext,
      _request: PollingPageRequest,
    ): Promise<PollingPageResult> {
      if (options.failOnPage !== undefined && pageIndex === options.failOnPage) {
        throw new Error("mock_polling_failure");
      }
      const page = pages[Math.min(pageIndex, pages.length - 1)];
      pageIndex += 1;
      if (!page) {
        return {
          records: [],
          exhausted: true,
          recordsProcessed: 0,
        };
      }
      return page;
    },
  };
}

/** Bundle of in-memory stores and pipelines for adapter unit tests. */
export function createMockEventTestHarness(
  options: {
    readonly secret?: string;
    readonly credentialRef?: string;
  } = {},
) {
  const secret = options.secret ?? "test-webhook-secret";
  const credentialRef = options.credentialRef ?? "secret://test/webhook";
  const dedup = createInMemoryEventDeduplicationStore();
  const replayStore = createInMemoryReplayStore();
  const replay = createReplayProtection({ store: replayStore });
  const checkpoints = createInMemoryPollingCheckpointStore();
  const metrics = createEventMetrics();
  const diagnostics = createEventDiagnosticsCollector();
  const verifier = createMockHmacWebhookVerifier({
    resolveSecret: async () => secret,
  });

  return {
    secret,
    credentialRef,
    dedup,
    replayStore,
    replay,
    checkpoints,
    metrics,
    diagnostics,
    verifier,
    computeSignature: (body: string) => computeMockHmacSignature(secret, body),
    createWebhookPipeline: (translator?: WebhookTranslator, decoder?: WebhookDecoder) =>
      createWebhookProcessingPipeline({
        decoder: decoder ?? createMockJsonWebhookDecoder(),
        translator: translator ?? createMockWebhookTranslator(),
        verifier,
        replayProtection: replay,
        deduplicationStore: dedup,
        metrics,
      }),
    createPollingPipeline: (source?: PollingSource) =>
      createPollingExecutionPipeline({
        source: source ?? createMockPollingSource(),
        checkpointStore: checkpoints,
        metrics,
      }),
  };
}

export { computeMockHmacSignature, createMockHmacWebhookVerifier };
