import { describe, expect, it } from "vitest";

import {
  createAcknowledgingHandler,
  createFailingHandler,
  createInMemoryOutboxStore,
  createOutboxWorker,
  createRecordingHandler,
  PLATFORM_OUTBOX_VERSION,
  shouldRetry,
} from "./index";
import type { OutboxEvent } from "./types";

function event(
  partial: Partial<OutboxEvent> & Pick<OutboxEvent, "outboxEventId">,
): OutboxEvent {
  return {
    tenantId: "t1",
    aggregateType: "matter",
    aggregateId: "m1",
    eventType: "legal.matter.created",
    payload: { id: "m1" },
    status: "pending",
    attemptCount: 0,
    maxAttempts: 5,
    createdAt: "2026-07-18T10:00:00.000Z",
    updatedAt: "2026-07-18T10:00:00.000Z",
    ...partial,
  };
}

describe("@apzhub/platform-outbox (PCv2-02)", () => {
  it("exports version 0.1.0", () => {
    expect(PLATFORM_OUTBOX_VERSION).toBe("0.1.0");
  });

  it("drains pending events through acknowledging handler", async () => {
    const store = createInMemoryOutboxStore([
      event({ outboxEventId: "ob_1" }),
      event({
        outboxEventId: "ob_2",
        aggregateType: "trust",
        eventType: "legal.trust.account.created",
      }),
    ]);
    const sink: OutboxEvent[] = [];
    const worker = createOutboxWorker({
      store,
      handlers: [createRecordingHandler(sink), createAcknowledgingHandler()],
      now: () => "2026-07-18T12:00:00.000Z",
    });

    const result = await worker.processBatch();
    expect(result).toEqual({
      claimed: 2,
      published: 2,
      failed: 0,
      deadLetter: 0,
    });
    expect(sink).toHaveLength(2);
    const diag = await worker.diagnostics();
    expect(diag.published).toBe(2);
    expect(diag.pending).toBe(0);
  });

  it("retries transient failures then publishes", async () => {
    const store = createInMemoryOutboxStore([event({ outboxEventId: "ob_r" })]);
    const worker = createOutboxWorker({
      store,
      handlers: [
        createFailingHandler({
          message: "temporary glitch",
          failUntilAttempt: 2,
        }),
      ],
      retryPolicy: {
        maxAttempts: 5,
        initialDelayMs: 0,
        maxDelayMs: 0,
        multiplier: 1,
      },
      now: () => "2026-07-18T12:00:00.000Z",
    });

    const first = await worker.processBatch();
    expect(first.failed).toBe(1);
    expect(first.published).toBe(0);

    const second = await worker.processBatch();
    expect(second.published).toBe(1);
  });

  it("dead-letters permanent failures", async () => {
    const store = createInMemoryOutboxStore([event({ outboxEventId: "ob_p" })]);
    const worker = createOutboxWorker({
      store,
      handlers: [
        createFailingHandler({
          message: "permanent validation error",
          permanent: true,
        }),
      ],
      now: () => "2026-07-18T12:00:00.000Z",
    });

    const result = await worker.processBatch();
    expect(result.deadLetter).toBe(1);
    const diag = await worker.diagnostics();
    expect(diag.deadLetter).toBe(1);
  });

  it("replays dead-letter events to pending", async () => {
    const store = createInMemoryOutboxStore([
      event({
        outboxEventId: "ob_d",
        status: "dead-letter",
        attemptCount: 5,
        lastError: "poison",
      }),
    ]);
    const worker = createOutboxWorker({
      store,
      handlers: [createAcknowledgingHandler()],
      now: () => "2026-07-18T13:00:00.000Z",
    });

    const replayed = await worker.replay({ status: "dead-letter" });
    expect(replayed).toBe(1);
    const result = await worker.processBatch();
    expect(result.published).toBe(1);
  });

  it("shouldRetry respects maxAttempts", () => {
    expect(
      shouldRetry(4, false, {
        maxAttempts: 5,
        initialDelayMs: 1,
        maxDelayMs: 1,
        multiplier: 2,
      }),
    ).toBe(true);
    expect(
      shouldRetry(5, false, {
        maxAttempts: 5,
        initialDelayMs: 1,
        maxDelayMs: 1,
        multiplier: 2,
      }),
    ).toBe(false);
    expect(
      shouldRetry(1, true, {
        maxAttempts: 5,
        initialDelayMs: 1,
        maxDelayMs: 1,
        multiplier: 2,
      }),
    ).toBe(false);
  });

  it("requires at least one handler", () => {
    expect(() =>
      createOutboxWorker({
        store: createInMemoryOutboxStore(),
        handlers: [],
      }),
    ).toThrow(/at least one handler/);
  });
});
