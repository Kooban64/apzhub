import { describe, expect, it } from "vitest";

import {
  createInMemoryProcessingStore,
  createProcessingWorker,
  createProcessorRegistry,
  enqueueProcessingWork,
} from "@apzhub/platform-processing";
import {
  buildQepEvidenceEventEnvelope,
  createEvidenceProcessorRegistry,
  createInMemoryEvidenceBusinessActionPort,
} from "@apzhub/qep-evidence/application";

import { QEP_KNOWLEDGE_INDEX_VERSION, createQualityKnowledgeIndex } from "./index";

describe("APZQEP-120-S11 Quality Knowledge Index", () => {
  it("exports version 0.1.0", () => {
    expect(QEP_KNOWLEDGE_INDEX_VERSION).toBe("0.1.0");
  });

  it("builds Evidence projections from events without querying business services", async () => {
    const qki = createQualityKnowledgeIndex();
    const envelope = buildQepEvidenceEventEnvelope({
      eventId: "qep.evidence.created",
      evidenceId: "ev-qki-1",
      tenantId: "tenant-a",
      revision: 1,
      timestamp: "2026-08-02T20:00:00.000Z",
      payload: {
        title: "Safety Report",
        tags: ["safety"],
        classification: "controlled",
        ownerId: "user-1",
        keywords: ["hazard"],
      },
    });

    const applied = await qki.engine.applyEvent({
      eventType: envelope.eventId,
      tenantId: envelope.tenantId,
      payload: envelope.payload,
      envelope,
      now: "2026-08-02T20:00:00.000Z",
    });
    expect(applied.ok).toBe(true);

    const hit = await qki.search.search({
      tenantId: "tenant-a",
      query: "Safety",
    });
    expect(hit.projectionOnly).toBe(true);
    expect(hit.total).toBe(1);
    expect(hit.hits[0]?.document.entityId).toBe("ev-qki-1");
    expect(hit.hits[0]?.document.classification).toBe("controlled");
    expect(hit.hits[0]?.highlights.length).toBeGreaterThan(0);
  });

  it("applies incremental updates and integrity state from events", async () => {
    const qki = createQualityKnowledgeIndex();
    const created = buildQepEvidenceEventEnvelope({
      eventId: "qep.evidence.created",
      evidenceId: "ev-2",
      tenantId: "t",
      revision: 1,
      timestamp: "2026-08-02T20:10:00.000Z",
      payload: { title: "Doc A" },
    });
    await qki.engine.applyEvent({
      eventType: created.eventId,
      tenantId: "t",
      payload: created.payload,
      envelope: created,
      now: "2026-08-02T20:10:00.000Z",
    });

    const integrity = buildQepEvidenceEventEnvelope({
      eventId: "qep.evidence.integrity_established",
      evidenceId: "ev-2",
      tenantId: "t",
      revision: 2,
      timestamp: "2026-08-02T20:10:01.000Z",
    });
    await qki.engine.applyEvent({
      eventType: integrity.eventId,
      tenantId: "t",
      payload: integrity.payload,
      envelope: integrity,
      now: "2026-08-02T20:10:01.000Z",
    });

    const doc = await qki.repository.get({
      tenantId: "t",
      entityKind: "evidence",
      entityId: "ev-2",
    });
    expect(doc?.integrityState).toBe("established");
    expect(doc?.title).toBe("Doc A");
  });

  it("removes projections on deleted events", async () => {
    const qki = createQualityKnowledgeIndex();
    await qki.engine.applyEvent({
      eventType: "qep.evidence.created",
      tenantId: "t",
      payload: { evidenceId: "ev-del", title: "X" },
      now: "2026-08-02T20:20:00.000Z",
    });
    await qki.engine.applyEvent({
      eventType: "qep.evidence.deleted",
      tenantId: "t",
      payload: { evidenceId: "ev-del" },
      now: "2026-08-02T20:20:01.000Z",
    });
    expect(
      await qki.repository.get({
        tenantId: "t",
        entityKind: "evidence",
        entityId: "ev-del",
      }),
    ).toBeUndefined();
  });

  it("rebuilds the index from event history (replay)", async () => {
    const qki = createQualityKnowledgeIndex();
    await qki.engine.applyEvent({
      eventType: "qep.evidence.created",
      tenantId: "t",
      payload: { evidenceId: "ev-r", title: "Old" },
      now: "2026-08-02T20:30:00.000Z",
    });

    const rebuilt = await qki.engine.rebuildFromEvents([
      {
        eventType: "qep.evidence.created",
        tenantId: "t",
        payload: { evidenceId: "ev-r", title: "New Title" },
        occurredAt: "2026-08-02T20:30:00.000Z",
      },
      {
        eventType: "qep.evidence.updated",
        tenantId: "t",
        payload: { evidenceId: "ev-r", title: "Rebuilt Title" },
        occurredAt: "2026-08-02T20:30:01.000Z",
      },
    ]);
    expect(rebuilt.failed).toBe(0);
    const doc = await qki.repository.get({
      tenantId: "t",
      entityKind: "evidence",
      entityId: "ev-r",
    });
    expect(doc?.title).toBe("Rebuilt Title");
  });

  it("fans out with Evidence business processors via platform processing", async () => {
    const qki = createQualityKnowledgeIndex();
    const business = createInMemoryEvidenceBusinessActionPort();
    const evidenceRegistry = createEvidenceProcessorRegistry({ business });
    const platformRegistry = createProcessorRegistry();
    evidenceRegistry.registerOnto(platformRegistry);
    qki.registerProcessors(platformRegistry);

    expect(
      platformRegistry.resolveAll("qep.evidence.created").length,
    ).toBeGreaterThanOrEqual(2);

    const store = createInMemoryProcessingStore();
    const envelope = buildQepEvidenceEventEnvelope({
      eventId: "qep.evidence.created",
      evidenceId: "ev-fan",
      tenantId: "tenant-b",
      revision: 1,
      timestamp: "2026-08-02T20:40:00.000Z",
      payload: { title: "Fanout Evidence", tags: ["qki"] },
    });

    await enqueueProcessingWork(store, {
      workItemId: "pw-qki-1",
      tenantId: envelope.tenantId,
      eventType: envelope.eventId,
      payload: { envelope },
      idempotencyKey: envelope.idempotencyKey,
      createdAt: "2026-08-02T20:40:00.000Z",
    });

    const result = await createProcessingWorker({
      store,
      registry: platformRegistry,
      workerId: "qki-worker",
      now: () => "2026-08-02T20:40:01.000Z",
      leasePolicy: { leaseTtlMs: 60_000, processingTimeoutMs: 30_000 },
    }).runOnce();

    expect(result.acknowledged).toBe(1);
    expect(business.applied).toHaveLength(1);
    const search = await qki.search.search({
      tenantId: "tenant-b",
      query: "Fanout",
      tags: ["qki"],
    });
    expect(search.total).toBe(1);
  });

  it("supports filter, sort, and paging against projections only", async () => {
    const qki = createQualityKnowledgeIndex();
    for (const [i, title] of ["Alpha", "Beta", "Gamma"].entries()) {
      await qki.engine.applyEvent({
        eventType: "qep.evidence.created",
        tenantId: "t",
        payload: {
          evidenceId: `ev-${i}`,
          title,
          classification: i === 1 ? "secret" : "public",
        },
        now: `2026-08-02T20:50:0${i}.000Z`,
      });
    }

    const page1 = await qki.search.search({
      tenantId: "t",
      sortBy: "title",
      sortDirection: "asc",
      page: 1,
      pageSize: 2,
    });
    expect(page1.hits.map((h) => h.document.title)).toEqual(["Alpha", "Beta"]);
    expect(page1.total).toBe(3);

    const filtered = await qki.search.search({
      tenantId: "t",
      classification: "secret",
    });
    expect(filtered.total).toBe(1);
    expect(filtered.hits[0]?.document.title).toBe("Beta");
  });

  it("exposes projection diagnostics", async () => {
    const qki = createQualityKnowledgeIndex();
    await qki.engine.applyEvent({
      eventType: "qep.evidence.created",
      tenantId: "t",
      payload: { evidenceId: "ev-d", title: "D" },
      now: "2026-08-02T21:00:00.000Z",
    });
    const diag = await qki.engine.diagnostics();
    expect(diag.evidenceCount).toBe(1);
    expect(diag.health).toBe("healthy");
    expect(diag.registeredProjections).toBe(3);
  });
});
