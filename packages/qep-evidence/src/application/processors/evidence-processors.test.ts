/**
 * APZQEP-120-S10 — Evidence business processor integration tests.
 */
import { describe, expect, it } from "vitest";

import {
  createInMemoryProcessingStore,
  createProcessingWorker,
  createProcessorRegistry,
  enqueueProcessingWork,
} from "@apzhub/platform-processing";

import { QEP_EVIDENCE_PLATFORM_EVENTS } from "../events/catalogue";
import { buildQepEvidenceEventEnvelope } from "../events/envelope";
import {
  createEvidenceProcessorRegistry,
  createInMemoryEvidenceBusinessActionPort,
  registerProductProcessorBundles,
} from "./index";

describe("APZQEP-120-S10 Evidence business processors", () => {
  it("registers seven processors covering all catalogue events without hard-coding in engine", () => {
    const business = createInMemoryEvidenceBusinessActionPort();
    const evidenceRegistry = createEvidenceProcessorRegistry({ business });
    const diag = evidenceRegistry.diagnostics();

    expect(diag.registeredCount).toBe(7);
    expect(diag.healthyCount).toBe(7);
    expect(diag.eventCoverage).toEqual(
      [...Object.values(QEP_EVIDENCE_PLATFORM_EVENTS)].sort(),
    );

    const platformRegistry = createProcessorRegistry();
    evidenceRegistry.registerOnto(platformRegistry);
    expect(platformRegistry.list()).toHaveLength(7);
    expect(
      platformRegistry.resolve(QEP_EVIDENCE_PLATFORM_EVENTS.created)?.descriptor
        .processorId,
    ).toBe("qep.evidence.processor.created");
  });

  it("discovers processors by event type", () => {
    const registry = createEvidenceProcessorRegistry({
      business: createInMemoryEvidenceBusinessActionPort(),
    });
    expect(
      registry.discover(QEP_EVIDENCE_PLATFORM_EVENTS.archived)?.metadata.processorId,
    ).toBe("qep.evidence.processor.archive");
    expect(registry.discover("unknown.event")).toBeUndefined();
  });

  it("executes created processor via platform engine (business action only in processor)", async () => {
    const business = createInMemoryEvidenceBusinessActionPort(
      () => "2026-08-02T15:00:00.000Z",
    );
    const evidenceRegistry = createEvidenceProcessorRegistry({ business });
    const platformRegistry = createProcessorRegistry();
    registerProductProcessorBundles(platformRegistry, [evidenceRegistry]);

    const store = createInMemoryProcessingStore();
    const envelope = buildQepEvidenceEventEnvelope({
      eventId: "qep.evidence.created",
      evidenceId: "ev-s10-1",
      tenantId: "tenant-a",
      revision: 1,
      timestamp: "2026-08-02T15:00:00.000Z",
      envelopeId: "env-s10-1",
    });

    await enqueueProcessingWork(store, {
      workItemId: "pw-s10-1",
      tenantId: envelope.tenantId,
      eventType: envelope.eventId,
      payload: { envelope, evidenceId: "ev-s10-1" },
      idempotencyKey: envelope.idempotencyKey,
      createdAt: "2026-08-02T15:00:00.000Z",
    });

    const worker = createProcessingWorker({
      store,
      registry: platformRegistry,
      workerId: "s10-worker",
      now: () => "2026-08-02T15:00:01.000Z",
      leasePolicy: { leaseTtlMs: 60_000, processingTimeoutMs: 30_000 },
    });

    const result = await worker.runOnce();
    expect(result.acknowledged).toBe(1);
    expect(business.applied).toHaveLength(1);
    expect(business.applied[0]?.action).toBe("evidence.created.handle");
    expect(business.applied[0]?.evidenceId).toBe("ev-s10-1");
  });

  it("routes integrity established and verified to the integrity processor", async () => {
    const business = createInMemoryEvidenceBusinessActionPort();
    const evidenceRegistry = createEvidenceProcessorRegistry({ business });
    const platformRegistry = createProcessorRegistry();
    evidenceRegistry.registerOnto(platformRegistry);
    const store = createInMemoryProcessingStore();

    for (const [i, eventId] of [
      QEP_EVIDENCE_PLATFORM_EVENTS.integrityEstablished,
      QEP_EVIDENCE_PLATFORM_EVENTS.integrityVerified,
    ].entries()) {
      const envelope = buildQepEvidenceEventEnvelope({
        eventId,
        evidenceId: `ev-int-${i}`,
        tenantId: "t",
        revision: 1,
        timestamp: "2026-08-02T15:10:00.000Z",
      });
      await enqueueProcessingWork(store, {
        workItemId: `pw-int-${i}`,
        tenantId: "t",
        eventType: eventId,
        payload: { envelope },
        idempotencyKey: envelope.idempotencyKey,
        createdAt: `2026-08-02T15:10:0${i}.000Z`,
      });
    }

    const worker = createProcessingWorker({
      store,
      registry: platformRegistry,
      workerId: "s10-int",
      now: () => "2026-08-02T15:10:10.000Z",
      leasePolicy: { leaseTtlMs: 60_000, processingTimeoutMs: 30_000 },
      schedulerPolicy: { batchSize: 10 },
    });
    const result = await worker.runOnce();
    expect(result.acknowledged).toBe(2);
    expect(
      business.applied.every(
        (a) => a.processorId === "qep.evidence.processor.integrity",
      ),
    ).toBe(true);
  });

  it("terminal-fails permanent invalid payloads without engine business logic", async () => {
    const business = createInMemoryEvidenceBusinessActionPort();
    const evidenceRegistry = createEvidenceProcessorRegistry({ business });
    const platformRegistry = createProcessorRegistry();
    evidenceRegistry.registerOnto(platformRegistry);
    const store = createInMemoryProcessingStore();

    await enqueueProcessingWork(store, {
      workItemId: "pw-bad",
      tenantId: "t",
      eventType: QEP_EVIDENCE_PLATFORM_EVENTS.updated,
      payload: { notAnEnvelope: true },
      idempotencyKey: "bad-key",
      createdAt: "2026-08-02T15:20:00.000Z",
    });

    const worker = createProcessingWorker({
      store,
      registry: platformRegistry,
      workerId: "s10-bad",
      now: () => "2026-08-02T15:20:01.000Z",
      leasePolicy: { leaseTtlMs: 60_000, processingTimeoutMs: 30_000 },
    });
    const result = await worker.runOnce();
    expect(result.deadLetter).toBe(1);
    expect(business.applied).toHaveLength(0);
  });

  it("is idempotent on business action for the same idempotency key", async () => {
    const business = createInMemoryEvidenceBusinessActionPort();
    const evidenceRegistry = createEvidenceProcessorRegistry({ business });
    const platformRegistry = createProcessorRegistry();
    evidenceRegistry.registerOnto(platformRegistry);

    const envelope = buildQepEvidenceEventEnvelope({
      eventId: "qep.evidence.deleted",
      evidenceId: "ev-del",
      tenantId: "t",
      revision: 2,
      timestamp: "2026-08-02T15:30:00.000Z",
    });

    const store = createInMemoryProcessingStore();
    await enqueueProcessingWork(store, {
      workItemId: "pw-del-1",
      tenantId: "t",
      eventType: envelope.eventId,
      payload: { envelope },
      idempotencyKey: envelope.idempotencyKey,
      createdAt: "2026-08-02T15:30:00.000Z",
    });

    const worker = createProcessingWorker({
      store,
      registry: platformRegistry,
      workerId: "s10-del",
      now: () => "2026-08-02T15:30:01.000Z",
      leasePolicy: { leaseTtlMs: 60_000, processingTimeoutMs: 30_000 },
    });
    await worker.runOnce();
    expect(business.applied).toHaveLength(1);

    // Replay then process again — business sink dedupes by processor+idempotencyKey
    await worker.replay({ status: "acknowledged" });
    await worker.runOnce();
    expect(business.applied).toHaveLength(1);
  });

  it("exposes version and compatibility metadata for discovery", () => {
    const registry = createEvidenceProcessorRegistry({
      business: createInMemoryEvidenceBusinessActionPort(),
      bundleVersion: "1.0.0",
    });
    const created = registry.getById("qep.evidence.processor.created");
    expect(created?.metadata.version).toBe("1.0.0");
    expect(created?.metadata.ownership).toBe("qep-evidence");
    expect(created?.metadata.introducedIn).toBe("APZQEP-120-S10");
    expect(created?.processor.descriptor.replayCompatible).toBe(true);
  });
});
