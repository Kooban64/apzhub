/**
 * APZQEP-120-S07 — Application Services publish platform events on mutations.
 */

import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import type { EvidenceRequestContext } from "../context";
import { createEvidenceApplicationServices } from "../services/create-application-services";
import {
  createInMemoryAuditPort,
  createInMemoryClockPort,
  createInMemoryIdPort,
  createInMemoryStoragePort,
  createInMemoryUnitOfWork,
} from "../testing/in-memory-ports";
import { createInMemoryQepEvidenceEventPublisher } from "./publisher";
import { resetQepEvidenceEnvelopeCounter } from "./envelope";

const PAYLOAD = new Uint8Array([1, 2, 3, 4, 5]);
const HASH = createHash("sha256").update(PAYLOAD).digest("hex");

function ctx(): EvidenceRequestContext {
  return {
    tenantId: "tenant-s07",
    userId: "user-owner",
    correlationId: "corr-s07",
    permissions: ["qep.evidence.admin"],
  };
}

function createApp(bus: ReturnType<typeof createInMemoryQepEvidenceEventPublisher>) {
  return createEvidenceApplicationServices({
    uow: createInMemoryUnitOfWork(),
    storage: createInMemoryStoragePort(),
    clock: createInMemoryClockPort("2026-08-02T12:30:00.000Z"),
    ids: createInMemoryIdPort(),
    audit: createInMemoryAuditPort(),
    platformEvents: bus,
    secure: true,
  });
}

async function capture(app: ReturnType<typeof createApp>) {
  return app.commands.captureEvidence(ctx(), {
    kind: "captureEvidence",
    projectId: "proj-1",
    source: { kind: "manual_upload" },
    content: {
      mediaType: "text/plain",
      bytes: PAYLOAD,
      contentHash: HASH,
    },
    metadata: { title: "S07 item" },
  });
}

describe("APZQEP-120-S07 application publish integration", () => {
  it("publishes created + integrity_established from Application Services", async () => {
    resetQepEvidenceEnvelopeCounter();
    const bus = createInMemoryQepEvidenceEventPublisher();
    const app = createApp(bus);

    const captured = await capture(app);
    expect(bus.published.some((e) => e.eventId === "qep.evidence.created")).toBe(true);

    await app.integrity.establishIntegrity(ctx(), {
      evidenceId: captured.data.id,
      expectedRevision: captured.data.revision,
    });

    expect(
      bus.published.some((e) => e.eventId === "qep.evidence.integrity_established"),
    ).toBe(true);

    for (const envelope of bus.published) {
      expect(envelope.publisher).toBe("qep-evidence");
      expect(envelope.sourceService).toBe("qep-evidence");
      expect(envelope.tenantId).toBe("tenant-s07");
      expect(envelope.eventVersion).toBe("1.0.0");
    }
  });

  it("publishes lifecycle_changed and archived from lifecycle service", async () => {
    resetQepEvidenceEnvelopeCounter();
    const bus = createInMemoryQepEvidenceEventPublisher();
    const app = createApp(bus);

    const captured = await capture(app);
    const eligible = await app.lifecycle.markArchiveEligible(ctx(), {
      evidenceId: captured.data.id,
      expectedRevision: captured.data.revision,
    });
    await app.lifecycle.markArchived(ctx(), {
      evidenceId: captured.data.id,
      expectedRevision: eligible.revision,
      reason: "s07-archive",
    });

    expect(
      bus.published.some((e) => e.eventId === "qep.evidence.lifecycle_changed"),
    ).toBe(true);
    expect(bus.published.some((e) => e.eventId === "qep.evidence.archived")).toBe(true);
  });
});
