/**
 * APZQEP-120-S08 — Evidence publish → outbox → null transport drain.
 */
import { describe, expect, it } from "vitest";

import {
  createInMemoryDeliveryAudit,
  createInMemoryOutboxStore,
  createNullTransportAdapter,
  createReliableDeliveryPlatform,
  toDeliveryLifecycleState,
} from "@apzhub/platform-outbox";

import { buildQepEvidenceEventEnvelope } from "./envelope";
import { createOutboxQepEvidenceEventPublisher } from "./outbox-publisher";
import { publishQepEvidenceEventFailSoft } from "./publisher";

describe("APZQEP-120-S08 Evidence outbox reliable delivery", () => {
  it("persists catalogue events and drains via null transport", async () => {
    const store = createInMemoryOutboxStore();
    const audit = createInMemoryDeliveryAudit();
    const publisher = createOutboxQepEvidenceEventPublisher({
      store,
      now: () => "2026-08-02T15:00:00.000Z",
      createId: (() => {
        let n = 0;
        return () => {
          n += 1;
          return `ev-ob-${n}`;
        };
      })(),
    });

    const envelope = buildQepEvidenceEventEnvelope({
      eventId: "qep.evidence.created",
      evidenceId: "ev-1",
      tenantId: "tenant-a",
      actorId: "user-1",
      correlationId: "corr-s08",
      revision: 1,
      timestamp: "2026-08-02T15:00:00.000Z",
      envelopeId: "env-1",
    });

    const published = publishQepEvidenceEventFailSoft(publisher, envelope);
    expect(published.ok).toBe(true);
    expect(store.list()).toHaveLength(1);
    expect(store.list()[0]?.status).toBe("pending");
    expect(toDeliveryLifecycleState("pending")).toBe("Pending");

    const dup = publishQepEvidenceEventFailSoft(publisher, envelope);
    expect(dup.ok).toBe(true);
    expect(dup.errorCode).toBe("DUPLICATE");
    expect(store.list()).toHaveLength(1);

    const platform = createReliableDeliveryPlatform({
      store,
      transport: createNullTransportAdapter(),
      observability: audit.hooks,
      onDeadLetterReady: audit.onDeadLetterReady,
      now: () => "2026-08-02T15:00:01.000Z",
    });

    const result = await platform.processBatch();
    expect(result.claimed).toBe(1);
    expect(result.published).toBe(1);
    expect(store.get("ev-ob-1")?.status).toBe("published");
    expect(audit.attempts.some((a) => a.outcome === "delivered")).toBe(true);
    expect(audit.terminals.some((t) => t.state === "Delivered")).toBe(true);
  });

  it("recovers after crash mid-delivery (restart reclaim)", async () => {
    const store = createInMemoryOutboxStore();
    const publisher = createOutboxQepEvidenceEventPublisher({
      store,
      now: () => "2026-08-02T15:10:00.000Z",
      createId: () => "ev-ob-crash",
    });

    const envelope = buildQepEvidenceEventEnvelope({
      eventId: "qep.evidence.updated",
      evidenceId: "ev-2",
      tenantId: "tenant-a",
      correlationId: "corr-crash",
      revision: 1,
      timestamp: "2026-08-02T15:10:00.000Z",
      envelopeId: "env-2",
    });
    expect(publisher.publish(envelope).ok).toBe(true);

    const claimed = await store.claimBatch({
      limit: 1,
      now: "2026-08-02T15:10:01.000Z",
    });
    expect(claimed).toHaveLength(1);
    expect(claimed[0]?.status).toBe("processing");

    await store.markFailed({
      outboxEventId: "ev-ob-crash",
      now: "2026-08-02T15:10:02.000Z",
      lastError: "CRASH_RECOVERY",
      nextAttemptAt: "2026-08-02T15:10:02.000Z",
      to: "retrying",
      attemptCount: claimed[0]!.attemptCount,
    });

    const platform = createReliableDeliveryPlatform({
      store,
      transport: createNullTransportAdapter(),
      now: () => "2026-08-02T15:10:03.000Z",
    });
    const result = await platform.processBatch();
    expect(result.published).toBe(1);
    expect(store.get("ev-ob-crash")?.status).toBe("published");
  });

  it("preserves FIFO order by createdAt within a batch", async () => {
    const store = createInMemoryOutboxStore();
    let clock = 0;
    const publisher = createOutboxQepEvidenceEventPublisher({
      store,
      now: () => {
        clock += 1;
        return `2026-08-02T15:20:0${clock}.000Z`;
      },
      createId: (() => {
        let n = 0;
        return () => `ord-${++n}`;
      })(),
    });

    for (const id of ["a", "b", "c"]) {
      publisher.publish(
        buildQepEvidenceEventEnvelope({
          eventId: "qep.evidence.created",
          evidenceId: id,
          tenantId: "t",
          revision: 1,
          timestamp: "2026-08-02T15:20:00.000Z",
          envelopeId: `env-${id}`,
        }),
      );
    }

    const rows = store.list();
    expect(rows.map((r) => r.outboxEventId)).toEqual(["ord-1", "ord-2", "ord-3"]);

    const delivered: string[] = [];
    const platform = createReliableDeliveryPlatform({
      store,
      transport: {
        name: "order-probe",
        async deliver(event) {
          delivered.push(event.outboxEventId);
          return { ok: true };
        },
      },
      batchPolicy: { batchSize: 10 },
      now: () => "2026-08-02T15:21:00.000Z",
    });
    await platform.processBatch();
    expect(delivered).toEqual(["ord-1", "ord-2", "ord-3"]);
  });
});
