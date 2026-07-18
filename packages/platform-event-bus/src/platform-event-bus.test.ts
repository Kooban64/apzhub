import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  buildIntegrationSourceEvent,
  createSdkEventId,
  SOURCE_EVENT_ENVELOPE_SCHEMA_VERSION,
  SOURCE_EVENT_PAYLOAD_SCHEMA_VERSION,
} from "@apzhub/integration-sdk/events";
import { createInMemoryOutboxStore } from "@apzhub/platform-outbox";

import {
  createPlatformEventBus,
  OUTBOX_EVENT_TYPE_INTEGRATION_SOURCE,
  PLATFORM_EVENT_BUS_VERSION,
  PLATFORM_INTEGRATION_SOURCE_EVENT_ID,
  PLATFORM_WEBHOOK_SIGNATURE_HEADER,
  validateIntegrationSourceEvent,
} from "./index";

function sampleSourceEvent(overrides: Record<string, unknown> = {}) {
  return buildIntegrationSourceEvent({
    eventId: createSdkEventId(),
    sourceEventId: "src_abc",
    eventType: "task.created",
    action: "created",
    resourceType: "task",
    providerId: "plane",
    integrationId: "projects",
    correlationId: "corr-test-1",
    tenantId: "tenant-1",
    deliveryMechanism: "webhook",
    ...overrides,
  });
}

function signBody(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body, "utf8").digest("hex");
}

describe("@apzhub/platform-event-bus", () => {
  it("exposes package version 0.1.0", () => {
    expect(PLATFORM_EVENT_BUS_VERSION).toBe("0.1.0");
  });

  it("validates SDK IntegrationSourceEvent envelopes", () => {
    const event = sampleSourceEvent();
    const ok = validateIntegrationSourceEvent(event);
    expect(ok.ok).toBe(true);

    const bad = validateIntegrationSourceEvent({ eventId: "x" });
    expect(bad.ok).toBe(false);
  });

  it("rejects wrong envelope schema version", () => {
    const event = sampleSourceEvent({
      envelopeSchemaVersion: "9.9.9",
    });
    const result = validateIntegrationSourceEvent(event);
    expect(result.ok).toBe(false);
  });

  it("ingests a source-event JSON body, routes, and dispatches to the Event Bus", async () => {
    const runtime = createPlatformEventBus({ allowUnsignedIngress: true });
    const received: string[] = [];
    runtime.bus.subscribe({
      eventPattern: PLATFORM_INTEGRATION_SOURCE_EVENT_ID,
      handler: (envelope) => {
        received.push(envelope.eventId);
      },
    });

    const body = JSON.stringify(sampleSourceEvent());
    const result = await runtime.ingress.ingest({
      rawBody: body,
      headers: { "content-type": "application/json" },
      correlationId: "corr-test-1",
      tenantId: "tenant-1",
      integrationId: "projects",
      providerId: "plane",
      skipVerification: true,
      skipReplayProtection: true,
      skipDeduplication: true,
      dispatchMode: "bus",
    });

    expect(result.ok).toBe(true);
    expect(result.outcome).toBe("accepted");
    expect(result.route?.platformEventId).toBe(PLATFORM_INTEGRATION_SOURCE_EVENT_ID);
    expect(result.envelopes).toHaveLength(1);
    expect(received).toEqual([PLATFORM_INTEGRATION_SOURCE_EVENT_ID]);
    expect(runtime.metrics.snapshot().dispatched).toBe(1);
    expect(runtime.health().status).toBe("healthy");
  });

  it("wraps opaque JSON when body is not a full source event", async () => {
    const runtime = createPlatformEventBus({ allowUnsignedIngress: true });
    const body = JSON.stringify({ id: "42", action: "updated", resourceType: "issue" });
    const result = await runtime.ingress.ingest({
      rawBody: body,
      headers: { "content-type": "application/json" },
      correlationId: "corr-opaque",
      tenantId: "tenant-1",
      integrationId: "projects",
      providerId: "plane",
      skipVerification: true,
      skipReplayProtection: true,
      skipDeduplication: true,
      dispatchMode: "bus",
    });

    expect(result.ok).toBe(true);
    expect(result.envelopes[0]?.payload.eventType).toBe("issue.updated");
  });

  it("verifies HMAC signatures when a webhook secret is configured", async () => {
    const secret = "test-secret";
    const runtime = createPlatformEventBus({ webhookSecret: secret });
    const body = JSON.stringify(sampleSourceEvent());
    const signature = signBody(body, secret);

    const rejected = await runtime.ingress.ingest({
      rawBody: body,
      headers: { "content-type": "application/json" },
      correlationId: "corr-sig-1",
      tenantId: "tenant-1",
      integrationId: "projects",
      providerId: "plane",
      secretRef: { credentialRef: "platform.webhook.ingress" },
      skipReplayProtection: true,
      skipDeduplication: true,
      dispatchMode: "bus",
    });
    expect(rejected.ok).toBe(false);
    expect(rejected.outcome).toBe("verification_failed");

    const accepted = await runtime.ingress.ingest({
      rawBody: body,
      headers: {
        "content-type": "application/json",
        [PLATFORM_WEBHOOK_SIGNATURE_HEADER]: signature,
      },
      correlationId: "corr-sig-2",
      tenantId: "tenant-1",
      integrationId: "projects",
      providerId: "plane",
      secretRef: { credentialRef: "platform.webhook.ingress" },
      skipReplayProtection: true,
      skipDeduplication: true,
      dispatchMode: "bus",
    });
    expect(accepted.ok).toBe(true);
  });

  it("enqueues to outbox and relays via Event Bus outbox handler", async () => {
    const store = createInMemoryOutboxStore();
    const runtime = createPlatformEventBus({
      outboxStore: store,
      allowUnsignedIngress: true,
      defaultDispatchMode: "outbox",
    });

    const received: string[] = [];
    runtime.bus.subscribe({
      eventPattern: "platform.integration.*",
      handler: (envelope) => {
        received.push(envelope.envelopeId);
      },
    });

    const body = JSON.stringify(sampleSourceEvent());
    const ingest = await runtime.ingress.ingest({
      rawBody: body,
      headers: { "content-type": "application/json", "x-delivery-id": "d-1" },
      correlationId: "corr-outbox",
      tenantId: "tenant-1",
      integrationId: "projects",
      providerId: "plane",
      skipVerification: true,
      skipReplayProtection: true,
      skipDeduplication: true,
    });

    expect(ingest.ok).toBe(true);
    expect(ingest.outboxEventIds).toHaveLength(1);
    expect(received).toHaveLength(0);

    const worker = runtime.createRelayWorker();
    expect(worker).toBeDefined();
    const drain = await worker!.processBatch();
    expect(drain.published).toBe(1);
    expect(received).toHaveLength(1);
    expect(runtime.metrics.snapshot().outboxRelayOk).toBe(1);

    const counts = await store.countByStatus();
    expect(counts.published).toBe(1);

    const replayed = await runtime.replay({
      outboxEventId: ingest.outboxEventIds[0],
      status: "published",
    });
    expect(replayed).toBe(1);
    const drain2 = await worker!.processBatch();
    expect(drain2.published).toBe(1);
    expect(received).toHaveLength(2);
  });

  it("records structured diagnostics and audit entries", async () => {
    const runtime = createPlatformEventBus({ allowUnsignedIngress: true });
    await runtime.ingress.ingest({
      rawBody: JSON.stringify({
        ...sampleSourceEvent(),
        envelopeSchemaVersion: SOURCE_EVENT_ENVELOPE_SCHEMA_VERSION,
        payloadSchemaVersion: SOURCE_EVENT_PAYLOAD_SCHEMA_VERSION,
      }),
      headers: {},
      correlationId: "corr-diag",
      tenantId: "t1",
      integrationId: "i1",
      providerId: "p1",
      skipVerification: true,
      skipReplayProtection: true,
      skipDeduplication: true,
      dispatchMode: "bus",
    });

    const diag = runtime.diagnostics();
    expect(diag.version).toBe("0.1.0");
    expect(diag.metrics.ingressAccepted).toBe(1);
    expect(diag.recentAudit.some((a) => a.action === "ingress.accepted")).toBe(true);
    expect(diag.recentAudit.some((a) => a.action === "dispatch.ok")).toBe(true);
  });

  it("bus_and_outbox mode publishes immediately and enqueues durable copy", async () => {
    const store = createInMemoryOutboxStore();
    const runtime = createPlatformEventBus({
      outboxStore: store,
      allowUnsignedIngress: true,
      defaultDispatchMode: "bus_and_outbox",
    });
    let count = 0;
    runtime.bus.subscribe({
      eventPattern: PLATFORM_INTEGRATION_SOURCE_EVENT_ID,
      handler: () => {
        count += 1;
      },
    });

    const result = await runtime.ingress.ingest({
      rawBody: JSON.stringify(sampleSourceEvent()),
      headers: {},
      correlationId: "corr-both",
      tenantId: "t1",
      integrationId: "i1",
      providerId: "p1",
      skipVerification: true,
      skipReplayProtection: true,
      skipDeduplication: true,
    });

    expect(result.ok).toBe(true);
    expect(count).toBe(1);
    expect(result.outboxEventIds).toHaveLength(1);

    const worker = runtime.createRelayWorker();
    await worker!.processBatch();
    expect(count).toBe(2);
    expect(OUTBOX_EVENT_TYPE_INTEGRATION_SOURCE).toBe(
      PLATFORM_INTEGRATION_SOURCE_EVENT_ID,
    );
  });
});
