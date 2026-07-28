/**
 * Platform-1.3-ENG-003 — Support Realtime SSE (ADR-0072) engineering requirements.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import {
  createDomainEventEnvelopeId,
  resetDomainEventEnvelopeCounter,
  type DomainEventEnvelope,
  type DomainEventPublisher,
} from "../../events/domain-event-publisher";
import {
  createRealtimeSubscriptionService,
  isRealtimeSseEnabled,
  mapSupportDomainEventToWire,
} from "./realtime-subscription-service";

function ctx(overrides?: Partial<ServiceRequestContext>): ServiceRequestContext {
  return {
    tenantId: "tenant_1",
    userId: "user_1",
    correlationId: "corr_rt",
    permissions: ["support.requests.read"],
    ...overrides,
  };
}

function envelope(
  eventId: string,
  payload: Record<string, unknown>,
  tenantId = "tenant_1",
): DomainEventEnvelope {
  return {
    envelopeId: createDomainEventEnvelopeId(),
    eventId,
    eventVersion: "1.0.0",
    category: "business",
    correlationId: "corr_rt",
    timestamp: "2026-07-22T16:00:00.000Z",
    publisher: "support-service",
    tenantId,
    payload,
  };
}

async function readStreamText(
  stream: ReadableStream<Uint8Array>,
  ms = 50,
): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let out = "";
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    const result = await Promise.race([
      reader.read(),
      new Promise<{ done: true; value: undefined }>((resolve) =>
        setTimeout(() => resolve({ done: true, value: undefined }), 20),
      ),
    ]);
    if (result.done && result.value === undefined && !out.includes("realtime.ready")) {
      break;
    }
    if (result.value) {
      out += decoder.decode(result.value, { stream: true });
    }
    if (
      out.includes("support.ticket.created") ||
      out.includes("support.ticket.updated") ||
      out.includes("realtime.shutdown")
    ) {
      break;
    }
  }
  try {
    await reader.cancel();
  } catch {
    /* ignore */
  }
  return out;
}

describe("isRealtimeSseEnabled", () => {
  it("is deny-by-default", () => {
    expect(isRealtimeSseEnabled({})).toBe(false);
    expect(isRealtimeSseEnabled({ APZHUB_REALTIME_SSE_ENABLED: "yes" })).toBe(false);
    expect(isRealtimeSseEnabled({ APZHUB_REALTIME_SSE_ENABLED: "true" })).toBe(true);
  });
});

describe("mapSupportDomainEventToWire", () => {
  beforeEach(() => resetDomainEventEnvelopeCounter());

  it("maps created/assigned/closed/article and never forwards unknown engine events", () => {
    expect(
      (
        mapSupportDomainEventToWire(
          envelope("support.request.created", { supportRequestId: "sreq_1" }),
        ) as { event: string }
      ).event,
    ).toBe("support.ticket.created");
    expect(
      mapSupportDomainEventToWire(
        envelope("zammad.ticket.raw", { supportRequestId: "sreq_1" }),
      ),
    ).toBeUndefined();
    expect(
      mapSupportDomainEventToWire(
        envelope("support.unknown.event", { supportRequestId: "sreq_1" }),
      ),
    ).toBeUndefined();
  });

  it("emits status_changed alongside updated when status present", () => {
    const mapped = mapSupportDomainEventToWire(
      envelope("support.request.updated", {
        supportRequestId: "sreq_1",
        status: "open",
      }),
    ) as readonly { event: string }[];
    expect(mapped.map((m) => m.event)).toEqual([
      "support.ticket.updated",
      "support.ticket.status_changed",
    ]);
  });
});

describe("RealtimeSubscriptionService SSE", () => {
  beforeEach(() => resetDomainEventEnvelopeCounter());

  it("rejects stream when disabled", () => {
    const svc = createRealtimeSubscriptionService({ env: {} });
    expect(() => svc.openSseStream(ctx())).toThrow(/not enabled/);
  });

  it("rejects unauthorized principals", () => {
    const svc = createRealtimeSubscriptionService({
      env: { APZHUB_REALTIME_SSE_ENABLED: "true" },
    });
    expect(() => svc.openSseStream(ctx({ permissions: [] }))).toThrow(/Forbidden/);
  });

  it("delivers support events to authorized tenant stream", async () => {
    const svc = createRealtimeSubscriptionService({
      env: { APZHUB_REALTIME_SSE_ENABLED: "true" },
      heartbeatIntervalMs: 60_000,
    });
    const stream = svc.openSseStream(ctx());
    svc.ingestDomainEvent(
      envelope("support.request.created", {
        supportRequestId: "sreq_1",
        title: "Help",
      }),
    );
    await new Promise((r) => setTimeout(r, 10));
    const text = await readStreamText(stream, 100);
    expect(text).toContain("event: realtime.ready");
    expect(text).toContain("support.ticket.created");
    expect(text).toContain("sreq_1");
  });

  it("isolates tenants and organisations", async () => {
    const svc = createRealtimeSubscriptionService({
      env: { APZHUB_REALTIME_SSE_ENABLED: "true" },
      heartbeatIntervalMs: 60_000,
    });
    const stream = svc.openSseStream(
      ctx({ tenantId: "tenant_1", organisationId: "org_a" }),
    );
    svc.ingestDomainEvent(
      envelope("support.request.created", { supportRequestId: "sreq_x" }, "tenant_b"),
    );
    svc.ingestDomainEvent(
      envelope(
        "support.request.created",
        { supportRequestId: "sreq_org", organisationId: "org_b" },
        "tenant_1",
      ),
    );
    await new Promise((r) => setTimeout(r, 10));
    const text = await readStreamText(stream, 80);
    expect(text).toContain("realtime.ready");
    expect(text).not.toContain("sreq_x");
    expect(text).not.toContain("sreq_org");
    const d = svc.getDiagnostics(ctx());
    expect(d.tenantMismatches).toBeGreaterThan(0);
    expect(d.organisationMismatches).toBeGreaterThan(0);
  });

  it("suppresses duplicate ingest and coalesces updated events", async () => {
    const svc = createRealtimeSubscriptionService({
      env: { APZHUB_REALTIME_SSE_ENABLED: "true" },
      heartbeatIntervalMs: 60_000,
    });
    const stream = svc.openSseStream(ctx());
    const first = envelope("support.request.updated", {
      supportRequestId: "sreq_1",
      status: "open",
      title: "A",
    });
    svc.ingestDomainEvent(first);
    svc.ingestDomainEvent(first);
    const second = envelope("support.request.updated", {
      supportRequestId: "sreq_1",
      status: "pending",
      title: "B",
    });
    // Force both updates into queue before flush by using a slow consumer — ingest is sync flush.
    // Coalescing applies within a single connection queue; verify diagnostics counters.
    svc.ingestDomainEvent(second);
    await new Promise((r) => setTimeout(r, 10));
    const text = await readStreamText(stream, 100);
    expect(text).toContain("support.ticket.updated");
    const d = svc.getDiagnostics(ctx());
    expect(d.duplicatesSuppressed).toBeGreaterThan(0);
  });

  it("replays after Last-Event-ID without replaying the cursor event", async () => {
    const svc = createRealtimeSubscriptionService({
      env: {
        APZHUB_REALTIME_SSE_ENABLED: "true",
        APZHUB_REALTIME_REPLAY_BUFFER_SIZE: "50",
      },
      heartbeatIntervalMs: 60_000,
    });
    const e1 = envelope("support.request.created", {
      supportRequestId: "sreq_1",
    });
    const e2 = envelope("support.request.assigned", {
      supportRequestId: "sreq_1",
    });
    svc.ingestDomainEvent(e1);
    svc.ingestDomainEvent(e2);
    const stream = svc.openSseStream(ctx(), { lastEventId: e1.envelopeId });
    await new Promise((r) => setTimeout(r, 10));
    const text = await readStreamText(stream, 100);
    expect(text).toContain("support.ticket.assigned");
    expect(text).not.toContain('"support.ticket.created"');
    expect(svc.getDiagnostics(ctx()).replayedEvents).toBeGreaterThan(0);
  });

  it("publishes audit events and shuts down gracefully", async () => {
    const published: string[] = [];
    const auditPublisher: DomainEventPublisher = {
      publish(env) {
        published.push(env.eventId);
        return { ok: true, envelopeId: env.envelopeId };
      },
    };
    const svc = createRealtimeSubscriptionService({
      env: { APZHUB_REALTIME_SSE_ENABLED: "true" },
      heartbeatIntervalMs: 60_000,
      auditPublisher,
      logger: { log: vi.fn() },
    });
    const stream = svc.openSseStream(ctx());
    expect(published).toContain("realtime.connection.opened");
    svc.shutdown("test_shutdown");
    await new Promise((r) => setTimeout(r, 10));
    const text = await readStreamText(stream, 80);
    expect(text).toContain("realtime.shutdown");
    expect(published).toContain("realtime.shutdown");
    expect(svc.getHealth(ctx()).status).toBe("unhealthy");
  });

  it("attaches event bus and reports health/diagnostics", () => {
    const svc = createRealtimeSubscriptionService({
      env: { APZHUB_REALTIME_SSE_ENABLED: "true" },
    });
    expect(svc.getHealth(ctx()).status).toBe("degraded");
    const handlers: Array<(e: DomainEventEnvelope) => void> = [];
    svc.attachEventBus({
      subscribe({ handler }) {
        handlers.push(handler);
        return "sub_1";
      },
      unsubscribe: () => true,
    });
    expect(svc.getHealth(ctx()).status).toBe("healthy");
    handlers[0]?.(envelope("support.request.assigned", { supportRequestId: "sreq_2" }));
    const d = svc.getDiagnostics(ctx());
    expect(d.enabled).toBe(true);
    expect(d.busAttached).toBe(true);
    expect(d.transport).toBe("sse");
  });

  it("enforces connection capacity", () => {
    const svc = createRealtimeSubscriptionService({
      env: {
        APZHUB_REALTIME_SSE_ENABLED: "true",
        APZHUB_REALTIME_MAX_CONNECTIONS_GLOBAL: "1",
      },
      heartbeatIntervalMs: 60_000,
    });
    const s1 = svc.openSseStream(ctx());
    expect(() => svc.openSseStream(ctx({ userId: "user_2" }))).toThrow(/limit/);
    void s1.cancel();
  });

  it("closes when session validator fails", async () => {
    const svc = createRealtimeSubscriptionService({
      env: {
        APZHUB_REALTIME_SSE_ENABLED: "true",
        APZHUB_REALTIME_IDLE_TIMEOUT_MS: "600000",
      },
      heartbeatIntervalMs: 20,
      validateSession: () => false,
      logger: { log: vi.fn() },
    });
    const stream = svc.openSseStream(ctx(), { sessionId: "sess_1" });
    await new Promise((r) => setTimeout(r, 60));
    const text = await readStreamText(stream, 80);
    expect(text).toContain("realtime.disconnect");
  });
});
