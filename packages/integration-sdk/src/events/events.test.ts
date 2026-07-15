import { describe, expect, it } from "vitest";

import type { IntegrationRequestContext } from "../types/context";
import {
  SOURCE_EVENT_ENVELOPE_SCHEMA_VERSION,
  assertEnvelopeSchemaCompatible,
  assertPayloadSchemaCompatible,
  assertWebhookOperationSupported,
  buildIntegrationSourceEvent,
  buildSafeEventLogFields,
  compareSchemaVersions,
  createCompositeCursor,
  createEventDiagnosticsCollector,
  createEventMetrics,
  createInMemoryEventDeduplicationStore,
  createInMemoryPollingCheckpointStore,
  createInMemoryReplayStore,
  createMockEventTestHarness,
  createMockHmacWebhookVerifier,
  createMockJsonWebhookDecoder,
  createMockPollingSource,
  createMockSourceEvent,
  createMockWebhookTranslator,
  createOffsetCursor,
  createOpaqueCursor,
  createPageCursor,
  createPollingExecutionPipeline,
  createPollingSourceFromSync,
  createProviderCursor,
  createReplayProtection,
  createSdkEventId,
  createTimestampCursor,
  createWebhookEndpoint,
  createWebhookProcessingPipeline,
  cursorsEqual,
  declareEventCapabilities,
  declarePollingCapability,
  declareWebhookCapability,
  deriveDeduplicationKey,
  deriveSourceEventId,
  eventErrorToIntegrationError,
  fingerprintPayload,
  fromIntegrationEventEnvelope,
  fromSyncCursor,
  isDeliveryMechanism,
  isEventError,
  isHttpsCallbackUrl,
  isPollingCheckpointError,
  isPollingMode,
  listKnownEventCapabilityIds,
  mapEventErrorCategory,
  parseSchemaVersion,
  resolveRegisteredEventCapabilityIds,
  schemaIncompatibleError,
  toIntegrationEventEnvelope,
  toSyncCursor,
  unsupportedWebhookOperationError,
  unwrapPollingCursorAsSyncCursor,
  validateWebhookEndpoint,
  asWebhookManager,
  wrapSyncCursorAsPollingCursor,
  type LegacyWebhookServiceLike,
  type PollingPageResult,
  type WebhookManager,
} from "./index";

const ctx: IntegrationRequestContext = {
  correlationId: "corr-events-1",
  tenantId: "tenant-1",
};

describe("IntegrationSourceEvent envelope", () => {
  it("builds canonical source events with defaults", () => {
    const event = buildIntegrationSourceEvent({
      eventId: "e1",
      sourceEventId: "s1",
      eventType: "task.created",
      action: "created",
      resourceType: "task",
      providerId: "mock",
      integrationId: "mock-int",
      correlationId: "c1",
      deliveryMechanism: "webhook",
    });
    expect(event.envelopeSchemaVersion).toBe(SOURCE_EVENT_ENVELOPE_SCHEMA_VERSION);
    expect(event.receivedTimestamp).toBeTruthy();
    expect(isDeliveryMechanism(event.deliveryMechanism)).toBe(true);
  });
});

describe("event identity precedence", () => {
  it("prefers trusted provider event id", () => {
    const id = deriveSourceEventId({
      providerEventId: "prov-1",
      resourceId: "r1",
      action: "created",
      providerTimestamp: "2024-01-01T00:00:00.000Z",
      payload: { a: 1 },
    });
    expect(id.source).toBe("provider_event_id");
    expect(id.sourceEventId).toBe("prov-1");
    expect(id.deduplicatable).toBe(true);
  });

  it("falls back to resource + action + timestamp", () => {
    const id = deriveSourceEventId({
      resourceId: "r1",
      action: "updated",
      providerTimestamp: "2024-01-01T00:00:00.000Z",
    });
    expect(id.source).toBe("resource_action_timestamp");
    expect(id.sourceEventId).toContain("r1:updated:");
  });

  it("falls back to payload fingerprint", () => {
    const id = deriveSourceEventId({
      payload: { z: 1, a: 2 },
      providerId: "p",
      integrationId: "i",
    });
    expect(id.source).toBe("payload_fingerprint");
    expect(fingerprintPayload({ a: 2, z: 1 })).toBe(fingerprintPayload({ z: 1, a: 2 }));
  });

  it("uses SDK UUID last and excludes from dedup", () => {
    const id = deriveSourceEventId({});
    expect(id.source).toBe("sdk_generated");
    expect(id.deduplicatable).toBe(false);
    expect(deriveDeduplicationKey({})).toBeUndefined();
    expect(createSdkEventId()).toMatch(/^ievt_/);
  });
});

describe("event versioning", () => {
  it("parses and compares schema versions", () => {
    expect(parseSchemaVersion("1.0.0")?.major).toBe(1);
    expect(compareSchemaVersions("1.0.0", "1.1.0").status).toBe("minor_upgrade");
    expect(compareSchemaVersions("1.0.0", "2.0.0").status).toBe("major_incompatible");
    expect(compareSchemaVersions("1.0.0", "bad").status).toBe("invalid");
    expect(assertEnvelopeSchemaCompatible("1.0.0").status).toBe("compatible");
    expect(assertPayloadSchemaCompatible("1.0.0").status).toBe("compatible");
  });
});

describe("errors", () => {
  it("maps event errors to integration errors", () => {
    const err = unsupportedWebhookOperationError({ correlationId: "c" }, "enable");
    expect(isEventError(err)).toBe(true);
    expect(mapEventErrorCategory(err.category)).toBe("not_implemented");
    const mapped = eventErrorToIntegrationError(err);
    expect(mapped.code).toBe(err.code);
    const schema = schemaIncompatibleError({ correlationId: "c" }, "1.0.0", "2.0.0");
    expect(schema.category).toBe("validation");
  });
});

describe("webhook management", () => {
  it("wraps legacy webhook services via asWebhookManager", async () => {
    const registrations = [
      {
        id: "wh_1",
        url: "https://example.com/hook",
        isActive: true,
        eventTypes: ["issue"],
        secretPresent: true,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ];

    const service: LegacyWebhookServiceLike = {
      async list() {
        return registrations;
      },
      async get(_c, id) {
        return { ...registrations[0]!, id };
      },
      async create(_c, input) {
        return {
          id: "wh_new",
          url: input.url,
          isActive: input.isActive ?? true,
          eventTypes: input.eventTypes,
          secretPresent: false,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        };
      },
      async update(_c, id, input) {
        return {
          id,
          url: input.url ?? "https://example.com/hook",
          isActive: input.isActive ?? true,
          eventTypes: input.eventTypes ?? ["issue"],
          secretPresent: true,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-02T00:00:00.000Z",
        };
      },
      async delete() {},
      validateConfiguration(input) {
        if ("url" in input && input.url === "bad") {
          return { ok: false, issues: ["url_invalid"] };
        }
        return { ok: true, issues: [] };
      },
      supportedOperations() {
        return ["list", "get", "create", "update", "delete", "validate"];
      },
    };

    const manager: WebhookManager = asWebhookManager(service, {
      integrationId: "int",
      providerId: "prov",
    });

    expect(manager.supportedOperations()).toContain("enable");
    expect(manager.supportedOperations()).toContain("disable");

    const listed = await manager.list(ctx);
    expect(listed).toHaveLength(1);
    expect(listed[0]?.status).toBe("active");

    const created = await manager.create(ctx, {
      callbackUrl: "https://example.com/new",
      eventTypes: ["issue"],
    });
    expect(created.ok).toBe(true);

    const invalid = await manager.create(ctx, {
      callbackUrl: "bad",
      eventTypes: ["issue"],
    });
    expect(invalid.ok).toBe(false);

    const enabled = await manager.enable(ctx, "wh_1");
    expect(enabled.status).toBe("active");
    const disabled = await manager.disable(ctx, "wh_1");
    expect(disabled.status).toBe("disabled");

    const validation = await manager.validate(ctx, {
      callbackUrl: "https://example.com/x",
      eventTypes: ["issue"],
    });
    expect(validation.ok).toBe(true);

    await manager.delete(ctx, "wh_1");
  });

  it("validates webhook endpoints", () => {
    expect(
      validateWebhookEndpoint({
        callbackUrl: "https://example.com/hook",
        requireHttps: true,
      }).ok,
    ).toBe(true);
    expect(
      validateWebhookEndpoint({
        callbackUrl: "http://example.com/hook",
        requireHttps: true,
      }).ok,
    ).toBe(false);
    expect(isHttpsCallbackUrl("https://a.com")).toBe(true);
    expect(isHttpsCallbackUrl("not-a-url")).toBe(false);

    const endpoint = createWebhookEndpoint({
      id: "ep1",
      integrationId: "i",
      providerId: "p",
      callbackUrl: "https://example.com/hook",
      secretRef: { credentialRef: "secret://x" },
    });
    expect(endpoint.active).toBe(true);
  });
});

describe("webhook verification + replay + dedup", () => {
  it("verifies HMAC signatures and rejects mismatches", async () => {
    const harness = createMockEventTestHarness();
    const body = JSON.stringify({ event: "issue", action: "create" });
    const signature = harness.computeSignature(body);

    const ok = await harness.verifier.verify({
      rawBody: body,
      headers: { "x-webhook-signature": signature },
      secretRef: { credentialRef: harness.credentialRef },
      correlationId: "c",
      tenantId: "t",
    });
    expect(ok.ok).toBe(true);

    const bad = await harness.verifier.verify({
      rawBody: body,
      headers: { "x-webhook-signature": "deadbeef" },
      secretRef: { credentialRef: harness.credentialRef },
      correlationId: "c",
      tenantId: "t",
    });
    expect(bad.ok).toBe(false);
    expect(bad.status).toBe("failed");

    const missing = await harness.verifier.verify({
      rawBody: body,
      headers: {},
      secretRef: { credentialRef: harness.credentialRef },
      correlationId: "c",
      tenantId: "t",
    });
    expect(missing.status).toBe("missing_signature");
  });

  it("protects against replay and clock skew", async () => {
    const now = 1_700_000_000_000;
    const store = createInMemoryReplayStore({ now: () => now });
    const replay = createReplayProtection({
      store,
      maxAgeMs: 60_000,
      now: () => now,
    });

    const first = await replay.check({
      deliveryId: "d1",
      timestamp: now - 1000,
      correlationId: "c",
    });
    expect(first.ok).toBe(true);
    await replay.commit("d1");

    const dup = await replay.check({
      deliveryId: "d1",
      correlationId: "c",
    });
    expect(dup.decision).toBe("reject_replay");

    const skew = await replay.check({
      deliveryId: "d2",
      timestamp: now - 120_000,
      correlationId: "c",
    });
    expect(skew.decision).toBe("reject_skew");

    expect(await replay.check({ deliveryId: "", correlationId: "c" })).toMatchObject({
      decision: "reject_missing",
    });
  });

  it("deduplicates events in memory", async () => {
    const store = createInMemoryEventDeduplicationStore({
      defaultTtlMs: 1000,
      now: () => 1000,
    });
    expect(await store.has("k1")).toBe(false);
    await store.remember("k1");
    expect(await store.has("k1")).toBe(true);
    expect(store.size()).toBe(1);
    await store.forget("k1");
    expect(await store.has("k1")).toBe(false);
  });
});

describe("webhook processing pipeline", () => {
  it("accepts verified translated events", async () => {
    const harness = createMockEventTestHarness();
    const body = JSON.stringify({ hello: "world" });
    const signature = harness.computeSignature(body);
    const pipeline = harness.createWebhookPipeline(
      createMockWebhookTranslator({
        eventFactory: () =>
          createMockSourceEvent({ providerEventId: "unique-1", resourceId: "r1" }),
      }),
      createMockJsonWebhookDecoder({ deliveryId: "del-1" }),
    );

    const result = await pipeline.process({
      rawBody: body,
      headers: {
        "x-webhook-signature": signature,
        "x-delivery-id": "del-1",
      },
      context: {
        correlationId: "c1",
        tenantId: "t1",
        integrationId: "i1",
        providerId: "p1",
        deliveryId: "del-1",
      },
      verification: {
        secretRef: { credentialRef: harness.credentialRef },
      },
    });

    expect(result.ok).toBe(true);
    expect(result.outcome).toBe("accepted");
    expect(result.event?.sourceEventId).toBe("unique-1");
    expect(result.stages).toContain("verify");
    expect(result.stages).toContain("deduplicate");
  });

  it("rejects verification failures", async () => {
    const harness = createMockEventTestHarness();
    const pipeline = harness.createWebhookPipeline();
    const result = await pipeline.process({
      rawBody: "{}",
      headers: { "x-webhook-signature": "nope" },
      context: {
        correlationId: "c1",
        tenantId: "t1",
        integrationId: "i1",
        providerId: "p1",
      },
      verification: {
        secretRef: { credentialRef: harness.credentialRef },
      },
    });
    expect(result.outcome).toBe("verification_failed");
    expect(result.ok).toBe(false);
  });

  it("ignores translator ignore results", async () => {
    const harness = createMockEventTestHarness();
    const pipeline = createWebhookProcessingPipeline({
      decoder: createMockJsonWebhookDecoder(),
      translator: createMockWebhookTranslator({ ignore: true }),
      metrics: harness.metrics,
    });
    const result = await pipeline.process({
      rawBody: "{}",
      headers: {},
      context: {
        correlationId: "c1",
        tenantId: "t1",
        integrationId: "i1",
        providerId: "p1",
      },
      skipVerification: true,
      skipReplayProtection: true,
      skipDeduplication: true,
    });
    expect(result.outcome).toBe("ignored");
    expect(result.ok).toBe(true);
  });

  it("detects duplicates on second process", async () => {
    const harness = createMockEventTestHarness();
    const translator = createMockWebhookTranslator({
      eventFactory: () =>
        createMockSourceEvent({ providerEventId: "same-id", resourceId: "r1" }),
    });
    const pipeline = harness.createWebhookPipeline(translator);
    const input = {
      rawBody: "{}",
      headers: {},
      context: {
        correlationId: "c1",
        tenantId: "t1",
        integrationId: "i1",
        providerId: "p1",
        deliveryId: "d-a",
      },
      skipVerification: true,
    };

    const first = await pipeline.process(input);
    expect(first.outcome).toBe("accepted");

    const second = await pipeline.process({
      ...input,
      context: { ...input.context, deliveryId: "d-b" },
    });
    expect(second.outcome).toBe("duplicate");
  });

  it("handles decode failures", async () => {
    const pipeline = createWebhookProcessingPipeline({
      decoder: createMockJsonWebhookDecoder({ fail: true }),
      translator: createMockWebhookTranslator(),
    });
    const result = await pipeline.process({
      rawBody: "nope",
      headers: {},
      context: {
        correlationId: "c1",
        tenantId: "t1",
        integrationId: "i1",
        providerId: "p1",
      },
      skipVerification: true,
    });
    expect(result.outcome).toBe("error");
  });
});

describe("polling cursors and checkpoints", () => {
  it("creates cursor kinds and sync bridges", () => {
    expect(createOpaqueCursor("x").kind).toBe("opaque");
    expect(createTimestampCursor("2024-01-01T00:00:00.000Z").kind).toBe("timestamp");
    expect(createOffsetCursor(10).value).toBe("10");
    expect(createPageCursor(2).value).toBe("2");
    expect(createProviderCursor("p").kind).toBe("provider");
    const composite = createCompositeCursor({ a: "1", b: "2" });
    expect(composite.kind).toBe("composite");

    const fromLegacy = fromSyncCursor({
      lastSyncAt: "2024-01-01T00:00:00.000Z",
      resumeToken: "tok",
      resourceCursors: { projects: "c1" },
    });
    expect(fromLegacy.resumeToken).toBe("tok");
    expect(toSyncCursor(fromLegacy).resumeToken).toBe("tok");
    expect(cursorsEqual(fromLegacy, fromLegacy)).toBe(true);
    expect(cursorsEqual(undefined, createOpaqueCursor("x"))).toBe(false);
    expect(isPollingMode("incremental")).toBe(true);
  });

  it("supports propose/commit/abandon without auto-commit", async () => {
    const store = createInMemoryPollingCheckpointStore();
    const proposed = await store.propose({
      sourceId: "src-1",
      cursor: createOpaqueCursor("c1"),
      recordsProcessed: 5,
      correlationId: "c",
    });
    expect(proposed.state).toBe("proposed");
    expect(await store.getLatest("src-1")).toBeUndefined();

    const committed = await store.commit(proposed.id, "c");
    expect(committed.state).toBe("committed");
    expect((await store.getLatest("src-1"))?.id).toBe(proposed.id);

    const proposed2 = await store.propose({
      sourceId: "src-1",
      cursor: createOpaqueCursor("c2"),
      correlationId: "c",
    });
    const abandoned = await store.abandon(proposed2.id, "c");
    expect(abandoned.state).toBe("abandoned");

    await expect(store.commit(proposed2.id, "c")).rejects.toBeTruthy();
    await expect(store.abandon(committed.id, "c")).rejects.toBeTruthy();
  });
});

describe("polling execution pipeline", () => {
  it("completes multi-page polls and proposes checkpoints", async () => {
    const harness = createMockEventTestHarness();
    const pipeline = harness.createPollingPipeline();
    const result = await pipeline.execute(ctx, { mode: "full" });

    expect(result.ok).toBe(true);
    expect(result.outcome).toBe("completed");
    expect(result.records.length).toBe(3);
    expect(result.proposedCheckpoint?.state).toBe("proposed");
    expect(result.diagnostics.pagesProcessed).toBe(2);

    // Must not auto-commit
    expect(await harness.checkpoints.getLatest("mock-polling-source")).toBeUndefined();
    await harness.checkpoints.commit(result.proposedCheckpoint!.id, ctx.correlationId);
    expect(await harness.checkpoints.getLatest("mock-polling-source")).toBeTruthy();
  });

  it("detects duplicate pages / stalls", async () => {
    const stallPages: PollingPageResult[] = [
      {
        records: [{ id: "1" }],
        nextCursor: createOpaqueCursor("same"),
        exhausted: false,
        pageToken: "dup",
        recordsProcessed: 1,
      },
      {
        records: [{ id: "2" }],
        nextCursor: createOpaqueCursor("same"),
        exhausted: false,
        pageToken: "dup",
        recordsProcessed: 1,
      },
      {
        records: [{ id: "3" }],
        nextCursor: createOpaqueCursor("same"),
        exhausted: false,
        pageToken: "dup",
        recordsProcessed: 1,
      },
    ];
    const source = createMockPollingSource({ pages: stallPages });
    const pipeline = createPollingExecutionPipeline({
      source,
      defaultPolicy: {
        limits: { maxDuplicatePages: 2, maxPages: 10 },
        requireCheckpointAck: true,
      },
    });
    const result = await pipeline.execute(ctx, { mode: "incremental" });
    expect(result.outcome).toBe("stalled");
    expect(result.ok).toBe(false);
  });

  it("respects max records and cancellation", async () => {
    const source = createMockPollingSource({
      pages: [
        {
          records: [{ id: "1" }, { id: "2" }, { id: "3" }],
          nextCursor: createOpaqueCursor("p2"),
          exhausted: false,
          pageToken: "p1",
          recordsProcessed: 3,
        },
        {
          records: [{ id: "4" }],
          exhausted: true,
          pageToken: "p2",
          recordsProcessed: 1,
        },
      ],
    });
    const limited = createPollingExecutionPipeline({
      source,
      defaultPolicy: {
        limits: { maxRecords: 2 },
        requireCheckpointAck: false,
      },
    });
    const limitedResult = await limited.execute(ctx, { mode: "full" });
    expect(limitedResult.outcome).toBe("limit_exceeded");
    expect(limitedResult.records).toHaveLength(2);

    const controller = new AbortController();
    controller.abort();
    const cancelled = createPollingExecutionPipeline({
      source: createMockPollingSource(),
    });
    const cancelledResult = await cancelled.execute(ctx, {
      mode: "full",
      signal: controller.signal,
    });
    expect(cancelledResult.outcome).toBe("cancelled");
  });

  it("delegates to sync-like services", async () => {
    const syncService = {
      getSyncState: () => ({ cursor: { lastSyncAt: "2024-01-01T00:00:00.000Z" } }),
      runFullSync: async () => ({
        recordsProcessed: 4,
        status: {
          cursor: {
            lastSyncAt: "2024-01-02T00:00:00.000Z",
            resourceCursors: { projects: "p1" },
          },
        },
      }),
      runIncrementalSync: async () => ({
        recordsProcessed: 1,
        status: { cursor: { lastSyncAt: "2024-01-03T00:00:00.000Z" } },
      }),
    };
    const source = createPollingSourceFromSync({
      definition: {
        id: "sync-src",
        integrationId: "i",
        providerId: "p",
        resourceTypes: ["task"],
        supportedModes: ["full", "incremental", "resume"],
      },
      syncService,
    });
    const page = await source.poll(ctx, { mode: "incremental" });
    expect(page.recordsProcessed).toBe(1);
    expect(page.exhausted).toBe(true);
  });
});

describe("diagnostics, metrics, capabilities, bridge", () => {
  it("collects diagnostics and metrics safely", () => {
    const diagnostics = createEventDiagnosticsCollector();
    const metrics = createEventMetrics();
    diagnostics.recordWebhook("accepted");
    diagnostics.recordWebhook("verification_failed");
    diagnostics.recordPolling("completed", 3);
    diagnostics.recordPolling("stalled", 0);
    metrics.recordWebhookProcessing({
      outcome: "accepted",
      success: true,
      durationMs: 10,
    });
    metrics.recordPollingExecution({
      outcome: "completed",
      success: true,
      durationMs: 20,
      recordsProcessed: 3,
    });

    const snapshot = diagnostics.getSnapshot(metrics.getSnapshot());
    expect(snapshot.health).toBe("degraded");
    expect(snapshot.recommendations.length).toBeGreaterThan(0);
    expect(snapshot.metrics?.webhookAcceptedTotal).toBe(1);
    expect(
      buildSafeEventLogFields({ correlationId: "c", eventType: "t" }).eventType,
    ).toBe("t");
  });

  it("declares additive event capabilities", () => {
    const caps = declareEventCapabilities();
    expect(caps).toHaveLength(2);
    expect(declareWebhookCapability().id).toBe("webhooks");
    expect(declarePollingCapability().supportsIncremental).toBe(true);
    expect(listKnownEventCapabilityIds()).toContain("webhooks");
    expect(
      resolveRegisteredEventCapabilityIds(["webhooks", "polling", "nope"]),
    ).toEqual(["webhooks", "polling"]);
  });

  it("bridges IntegrationSourceEvent ↔ IntegrationEventEnvelope", () => {
    const source = createMockSourceEvent({
      eventType: "task.created",
      action: "created",
      resourceType: "task",
      resourceId: "task_1",
    });
    const envelope = toIntegrationEventEnvelope(source);
    expect(envelope.type).toBe("task.created");
    expect(envelope.resource).toBe("task");

    const roundTrip = fromIntegrationEventEnvelope(envelope, {
      providerId: "mock",
      integrationId: "mock-int",
      deliveryMechanism: "webhook",
      tenantId: "t1",
    });
    expect(roundTrip.eventType).toBe(envelope.type);
    expect(roundTrip.resourceType).toBe(envelope.resource);
    expect(roundTrip.deliveryMechanism).toBe("webhook");
  });
});

describe("coverage edge cases — pipelines, stores, diagnostics", () => {
  it("rejects webhook replay and translation failures", async () => {
    const harness = createMockEventTestHarness();
    const body = "{}";
    const signature = harness.computeSignature(body);

    // Seed replay store so next delivery is rejected
    await harness.replay.commit("replay-del");

    const replayRejected = await harness.createWebhookPipeline().process({
      rawBody: body,
      headers: { "x-webhook-signature": signature },
      context: {
        correlationId: "c1",
        tenantId: "t1",
        integrationId: "i1",
        providerId: "p1",
        deliveryId: "replay-del",
      },
      verification: { secretRef: { credentialRef: harness.credentialRef } },
    });
    expect(replayRejected.outcome).toBe("replay_rejected");

    const translateFail = await createWebhookProcessingPipeline({
      decoder: createMockJsonWebhookDecoder({ deliveryId: "d-x" }),
      translator: createMockWebhookTranslator({ fail: true }),
    }).process({
      rawBody: "{}",
      headers: {},
      context: {
        correlationId: "c1",
        tenantId: "t1",
        integrationId: "i1",
        providerId: "p1",
      },
      skipVerification: true,
      skipReplayProtection: true,
      skipDeduplication: true,
    });
    expect(translateFail.outcome).toBe("translation_failed");

    const emptyEvents = await createWebhookProcessingPipeline({
      decoder: createMockJsonWebhookDecoder(),
      translator: {
        translate: () => ({ ok: true, events: [] }),
      },
    }).process({
      rawBody: "{}",
      headers: {},
      context: {
        correlationId: "c1",
        tenantId: "t1",
        integrationId: "i1",
        providerId: "p1",
      },
      skipVerification: true,
      skipReplayProtection: true,
      skipDeduplication: true,
    });
    expect(emptyEvents.outcome).toBe("translation_failed");

    const throwing = await createWebhookProcessingPipeline({
      decoder: {
        decode: () => {
          throw new Error("boom");
        },
      },
      translator: createMockWebhookTranslator(),
    }).process({
      rawBody: "{}",
      headers: {},
      context: {
        correlationId: "c1",
        tenantId: "t1",
        integrationId: "i1",
        providerId: "p1",
      },
      skipVerification: true,
    });
    expect(throwing.outcome).toBe("error");
  });

  it("covers polling duration limit, failure, and cursor fallbacks", async () => {
    let tick = 0;
    const source = createMockPollingSource({
      pages: [
        {
          records: [{ id: "1" }],
          nextCursor: createOpaqueCursor("n"),
          exhausted: false,
          pageToken: "p1",
          recordsProcessed: 1,
        },
        {
          records: [{ id: "2" }],
          exhausted: true,
          pageToken: "p2",
          recordsProcessed: 1,
        },
      ],
    });
    const durationLimited = createPollingExecutionPipeline({
      source,
      now: () => {
        tick += 1000;
        return tick;
      },
      defaultPolicy: {
        limits: { maxDurationMs: 500, maxPages: 10 },
        requireCheckpointAck: false,
      },
    });
    const durationResult = await durationLimited.execute(ctx, { mode: "full" });
    expect(durationResult.outcome).toBe("limit_exceeded");
    expect(durationResult.diagnostics.limitHit).toBe("duration");

    const failing = createPollingExecutionPipeline({
      source: createMockPollingSource({ failOnPage: 0 }),
    });
    const failed = await failing.execute(ctx, { mode: "full" });
    expect(failed.outcome).toBe("failed");

    const pagesLimited = createPollingExecutionPipeline({
      source: createMockPollingSource(),
      defaultPolicy: {
        limits: { maxPages: 0 },
        requireCheckpointAck: false,
      },
    });
    expect(
      (await pagesLimited.execute(ctx, { mode: "full" })).diagnostics.limitHit,
    ).toBe("pages");

    // Cursor bridges without resume token
    const tsOnly = fromSyncCursor({ lastSyncAt: "2024-01-01T00:00:00.000Z" });
    expect(tsOnly.kind).toBe("timestamp");
    const resourcesOnly = fromSyncCursor({ resourceCursors: { a: "1" } });
    expect(resourcesOnly.kind).toBe("composite");
    const empty = fromSyncCursor({});
    expect(empty.kind).toBe("opaque");
  });

  it("covers checkpoint clear/not-found and dedup clear/expiry", async () => {
    const store = createInMemoryPollingCheckpointStore({
      idFactory: () => "fixed-id",
    });
    await expect(store.commit("missing", "c")).rejects.toBeTruthy();
    await expect(store.abandon("missing", "c")).rejects.toBeTruthy();

    const proposed = await store.propose({
      sourceId: "s",
      cursor: createOpaqueCursor("x"),
      correlationId: "c",
    });
    await store.clear("s");
    await store.clear();
    expect(await store.getLatest("s")).toBeUndefined();
    expect(proposed.id).toBe("fixed-id");

    let now = 1000;
    const dedup = createInMemoryEventDeduplicationStore({
      defaultTtlMs: 10,
      now: () => now,
    });
    await dedup.remember("k");
    now = 2000;
    expect(await dedup.has("k")).toBe(false);
    await dedup.remember("k2");
    await dedup.clear();
    expect(dedup.size()).toBe(0);
  });

  it("covers replay store helpers and invalid timestamp", async () => {
    const store = createInMemoryReplayStore();
    await store.remember("x", Date.now() + 10_000);
    expect(store.size()).toBe(1);
    await store.clear();
    expect(store.size()).toBe(0);

    const replay = createReplayProtection({ store: createInMemoryReplayStore() });
    const invalidTs = await replay.check({
      deliveryId: "d",
      timestamp: "not-a-date",
      correlationId: "c",
    });
    expect(invalidTs.decision).toBe("reject_missing");

    const acceptNoTs = await replay.check({
      deliveryId: "d2",
      correlationId: "c",
    });
    expect(acceptNoTs.ok).toBe(true);
  });

  it("covers diagnostics reset and healthy path", () => {
    const diagnostics = createEventDiagnosticsCollector();
    const metrics = createEventMetrics();
    diagnostics.recordWebhook("accepted");
    diagnostics.recordPolling("completed", 1);
    expect(diagnostics.getSnapshot().health).toBe("healthy");
    diagnostics.reset();
    metrics.reset();
    expect(diagnostics.getSnapshot().health).toBe("unknown");
    expect(metrics.getSnapshot().webhookProcessedTotal).toBe(0);
    expect(
      buildSafeEventLogFields({
        correlationId: "c",
        integrationId: "i",
        providerId: "p",
        outcome: "ok",
        deliveryMechanism: "webhook",
        sourceEventId: "s",
      }).providerId,
    ).toBe("p");
  });

  it("covers webhook manager list filter, get, update paths", async () => {
    const service: LegacyWebhookServiceLike = {
      async list() {
        return [
          {
            id: "a",
            url: "https://example.com/a",
            isActive: true,
            eventTypes: ["x"],
            secretPresent: false,
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
          },
          {
            id: "b",
            url: "https://example.com/b",
            isActive: false,
            eventTypes: ["y"],
            secretPresent: true,
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
          },
        ];
      },
      async get(_c, id) {
        return {
          id,
          url: "https://example.com/g",
          isActive: true,
          eventTypes: ["x"],
          secretPresent: false,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        };
      },
      async create() {
        throw new Error("unused");
      },
      async update(_c, id, input) {
        return {
          id,
          url: input.url ?? "https://example.com/u",
          isActive: input.isActive ?? true,
          eventTypes: input.eventTypes ?? ["x"],
          secretPresent: false,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        };
      },
      async delete() {},
      validateConfiguration(input) {
        if (input.url === "bad") return { ok: false, issues: ["bad"] };
        return { ok: true, issues: [] };
      },
      supportedOperations() {
        return ["list", "get", "update", "validate"];
      },
    };
    const manager = asWebhookManager(service, {
      integrationId: "i",
      providerId: "p",
    });
    const active = await manager.list(ctx, { status: "active" });
    expect(active).toHaveLength(1);
    expect((await manager.get(ctx, "g1")).id).toBe("g1");
    const updated = await manager.update(ctx, "g1", {
      callbackUrl: "https://example.com/u2",
      eventTypes: ["z"],
    });
    expect(updated.ok).toBe(true);
    const invalidUpdate = await manager.update(ctx, "g1", { callbackUrl: "bad" });
    expect(invalidUpdate.ok).toBe(false);

    const sync = createPollingSourceFromSync({
      definition: {
        id: "s",
        integrationId: "i",
        providerId: "p",
        resourceTypes: ["t"],
        supportedModes: ["full", "incremental", "resume"],
      },
      syncService: {
        getSyncState: () => ({ cursor: {} }),
        runFullSync: async () => ({
          recordsProcessed: 2,
          status: { cursor: { lastSyncAt: "2024-01-01T00:00:00.000Z" } },
        }),
        runIncrementalSync: async () => ({
          recordsProcessed: 0,
          status: { cursor: {} },
        }),
      },
    });
    expect((await sync.poll(ctx, { mode: "full" })).recordsProcessed).toBe(2);
    expect((await sync.poll(ctx, { mode: "resume" })).exhausted).toBe(true);

    const wrapped = wrapSyncCursorAsPollingCursor({ resumeToken: "r" });
    expect(unwrapPollingCursorAsSyncCursor(wrapped).resumeToken).toBe("r");

    expect(
      isPollingCheckpointError({
        category: "polling",
        code: "integration.events.polling.checkpoint_error",
        message: "x",
        retryable: false,
        correlationId: "c",
      }),
    ).toBe(true);

    await expect(
      assertWebhookOperationSupported(manager, "delete", "c"),
    ).rejects.toBeTruthy();

    expect(() =>
      createWebhookEndpoint({
        id: "bad",
        integrationId: "i",
        providerId: "p",
        callbackUrl: "",
      }),
    ).toThrow();

    const verifierMissing = createMockHmacWebhookVerifier({
      resolveSecret: async () => undefined,
    });
    expect(
      (
        await verifierMissing.verify({
          rawBody: "{}",
          headers: {},
          secretRef: { credentialRef: "x" },
          correlationId: "c",
          tenantId: "t",
        })
      ).status,
    ).toBe("missing_secret");

    // Same cursor + empty records => stall
    const stallSource = createMockPollingSource({
      pages: [
        {
          records: [],
          nextCursor: createOpaqueCursor("same"),
          exhausted: false,
          pageToken: "a",
          recordsProcessed: 0,
        },
      ],
    });
    // First page returns nextCursor same as request cursor
    const stallPipeline = createPollingExecutionPipeline({
      source: {
        definition: stallSource.definition,
        async poll(_c, request) {
          return {
            records: [],
            nextCursor: request.cursor ?? createOpaqueCursor("same"),
            exhausted: false,
            pageToken: "a",
            recordsProcessed: 0,
          };
        },
      },
    });
    const stalled = await stallPipeline.execute(ctx, {
      mode: "full",
      cursor: createOpaqueCursor("same"),
    });
    expect(stalled.outcome).toBe("stalled");
  });

  it("covers remaining pipeline branches for ≥95% lines", async () => {
    const verifierNoError = {
      verify: async () => ({ status: "failed" as const, ok: false }),
    };
    const verifyFallback = await createWebhookProcessingPipeline({
      decoder: createMockJsonWebhookDecoder(),
      translator: createMockWebhookTranslator(),
      verifier: verifierNoError,
    }).process({
      rawBody: "{}",
      headers: {},
      context: {
        correlationId: "c1",
        tenantId: "t1",
        integrationId: "i1",
        providerId: "p1",
      },
      verification: { secretRef: { credentialRef: "x" } },
    });
    expect(verifyFallback.outcome).toBe("verification_failed");

    const sparseEvents = await createWebhookProcessingPipeline({
      decoder: createMockJsonWebhookDecoder(),
      translator: {
        translate: () => ({
          ok: true,
          events: [undefined as unknown as ReturnType<typeof createMockSourceEvent>],
        }),
      },
    }).process({
      rawBody: "{}",
      headers: {},
      context: {
        correlationId: "c1",
        tenantId: "t1",
        integrationId: "i1",
        providerId: "p1",
      },
      skipVerification: true,
      skipReplayProtection: true,
      skipDeduplication: true,
    });
    expect(sparseEvents.outcome).toBe("translation_failed");

    const eventErr = unsupportedWebhookOperationError({ correlationId: "c1" }, "x");
    const thrownEventError = await createWebhookProcessingPipeline({
      decoder: {
        decode: () => {
          throw eventErr;
        },
      },
      translator: createMockWebhookTranslator(),
    }).process({
      rawBody: "{}",
      headers: {},
      context: {
        correlationId: "c1",
        tenantId: "t1",
        integrationId: "i1",
        providerId: "p1",
      },
      skipVerification: true,
    });
    expect(thrownEventError.error?.code).toBe(eventErr.code);

    const recordsAtStart = createPollingExecutionPipeline({
      source: createMockPollingSource(),
      defaultPolicy: {
        limits: { maxRecords: 0 },
        requireCheckpointAck: false,
      },
    });
    expect(
      (await recordsAtStart.execute(ctx, { mode: "full" })).diagnostics.limitHit,
    ).toBe("records");

    const withEvents = createPollingExecutionPipeline({
      source: {
        definition: {
          id: "ev",
          integrationId: "i",
          providerId: "p",
          resourceTypes: ["t"],
          supportedModes: ["full"],
        },
        async poll() {
          return {
            records: [{ id: "1" }],
            events: [createMockSourceEvent()],
            exhausted: true,
            recordsProcessed: 1,
          };
        },
      },
      defaultPolicy: { limits: {}, requireCheckpointAck: false },
    });
    expect((await withEvents.execute(ctx, { mode: "full" })).events).toHaveLength(1);

    const diag = createEventDiagnosticsCollector();
    diag.recordWebhook("replay_rejected");
    diag.recordPolling("failed", 0);
    const snap = diag.getSnapshot();
    expect(snap.recommendations.some((r) => r.includes("replay"))).toBe(true);
    expect(snap.recommendations.some((r) => r.includes("failures"))).toBe(true);
  });
});
