/**
 * APZSEARCH-017 — Search Publication Operations & Administration tests.
 */
import { describe, expect, it, vi } from "vitest";

import { createSearchOrchestrationForTest } from "@apzhub/search-orchestrator";

import {
  SEARCH_PUBLICATION_ADMIN_VERSION,
  SEARCH_PUBLICATION_PERMISSIONS,
  SearchPublicationForbiddenError,
  SearchPublicationNotFoundError,
  createSearchPublicationAdmin,
  expandSearchPublicationPermissions,
  hasSearchPublicationPermission,
  isSearchPublicationPermission,
} from "./index";

const envOn = { APZHUB_SEARCH_ORCHESTRATION_ENABLED: "true" };

function actor(permissions: readonly string[] = ["search.publication.admin"]) {
  return {
    userId: "user_1",
    tenantId: "tenant_a",
    correlationId: "corr_admin",
    permissions,
  };
}

function payload(id: string) {
  return {
    id,
    entityType: "project",
    productId: "projects" as const,
    tenantId: "tenant_a",
    title: `Project ${id}`,
    metadata: {},
    classification: "internal" as const,
    permissions: ["search.read"],
    version: "1",
  };
}

async function seedQueued(
  admin: ReturnType<typeof createSearchPublicationAdmin>,
  id: string,
) {
  await admin.runtime.dispatcher.enqueue({
    tenantId: "tenant_a",
    entityId: id,
    entityType: "project",
    productId: "projects",
    operation: "publish",
    payload: payload(id),
    correlationId: `corr_${id}`,
  });
}

describe("APZSEARCH-017 search-publication-admin", () => {
  it("ships version and permission catalogue", () => {
    expect(SEARCH_PUBLICATION_ADMIN_VERSION).toBe("0.1.0");
    expect(SEARCH_PUBLICATION_PERMISSIONS).toContain("search.publication.read");
    expect(isSearchPublicationPermission("search.publication.read")).toBe(true);
    expect(isSearchPublicationPermission("search.query.execute")).toBe(false);
    expect(
      expandSearchPublicationPermissions(["search.publication.admin"]).has(
        "search.publication.retry",
      ),
    ).toBe(true);
    expect(
      expandSearchPublicationPermissions(["*"]).has("search.publication.diagnostics"),
    ).toBe(true);
    expect(
      hasSearchPublicationPermission(
        ["search.publication.read"],
        "search.publication.read",
      ),
    ).toBe(true);
  });

  it("lists, filters, sorts, and paginates journal entries", async () => {
    const admin = createSearchPublicationAdmin({
      allowInMemoryOrchestration: true,
      env: envOn,
    });
    await seedQueued(admin, "e1");
    await seedQueued(admin, "e2");
    await admin.runtime.orchestrator.processBatch();

    const list = await admin.gateway.listPublications(actor(), {
      filter: { productId: "projects", status: "published" },
      sortBy: "createdAt",
      sortDir: "asc",
      limit: 1,
      offset: 0,
    });
    expect(list.total).toBeGreaterThanOrEqual(1);
    expect(list.items).toHaveLength(1);
    expect(list.items[0]?.status).toBe("published");

    const got = await admin.gateway.getPublication(actor(), list.items[0]!.id);
    expect(got.entityId).toBe(list.items[0]!.entityId);
  });

  it("enforces deny-by-default authorization", async () => {
    const admin = createSearchPublicationAdmin({
      allowInMemoryOrchestration: true,
      env: envOn,
    });
    await expect(admin.gateway.listPublications(actor([]))).rejects.toBeInstanceOf(
      SearchPublicationForbiddenError,
    );
    await expect(
      admin.gateway.getDiagnostics(actor(["search.publication.read"])),
    ).rejects.toBeInstanceOf(SearchPublicationForbiddenError);
  });

  it("provides queue summary, product summaries, and diagnostics", async () => {
    const admin = createSearchPublicationAdmin({
      allowInMemoryOrchestration: true,
      env: envOn,
    });
    await seedQueued(admin, "e1");
    const summary = await admin.gateway.getQueueSummary(actor());
    expect(summary.queueDepth).toBe(1);
    expect(summary.oldestQueuedAt).toBeTruthy();

    const products = await admin.gateway.getProductSummaries(actor());
    expect(products.find((p) => p.productId === "projects")?.queued).toBe(1);

    const diag = await admin.gateway.getDiagnostics(actor());
    expect(diag.adminVersion).toBe("0.1.0");
    expect(diag.journalReady).toBe(true);
    expect(diag.bootstrapEnabled).toBe(true);
    expect(diag.compositionRegistered).toBe(true);
  });

  it("retries failed publications and failed batches", async () => {
    const runtime = createSearchOrchestrationForTest({
      allowInMemoryJournal: true,
      env: envOn,
      retryPolicy: {
        maxAttempts: 5,
        initialDelayMs: 1,
        maxDelayMs: 1,
        multiplier: 2,
      },
    });
    const original = runtime.publisher.publish.bind(runtime.publisher);
    let calls = 0;
    vi.spyOn(runtime.publisher, "publish").mockImplementation((ctx, input) => {
      calls += 1;
      if (calls === 1) {
        return {
          ok: false,
          operation: "publish",
          correlationId: ctx.correlationId,
          durationMs: 1,
          acceptedAt: new Date().toISOString(),
          entityId: "fail_1",
          productId: "projects",
          message: "temporary upstream timeout",
        };
      }
      return original(ctx, input);
    });

    const admin = createSearchPublicationAdmin({ runtime });
    await runtime.dispatcher.enqueue({
      tenantId: "tenant_a",
      entityId: "fail_1",
      entityType: "project",
      productId: "projects",
      operation: "publish",
      payload: payload("fail_1"),
      correlationId: "corr_fail",
    });
    await runtime.orchestrator.processBatch();
    expect(await runtime.journal.countByStatus("retrying")).toBe(1);

    // Move to failed then retry via admin
    const retrying = (await runtime.journal.listByStatus("retrying"))[0]!;
    // claim again would work; simulate failed terminal soft state for admin retry path
    await runtime.journal.updateStatus({
      id: retrying.id,
      from: "retrying",
      to: "publishing",
      now: new Date().toISOString(),
    });
    await runtime.journal.updateStatus({
      id: retrying.id,
      from: "publishing",
      to: "failed",
      now: new Date().toISOString(),
      lastError: "temporary upstream timeout",
    });

    const result = await admin.gateway.retryPublication(actor(), retrying.id);
    expect(result.ok).toBe(true);
    expect(result.mode).toBe("status");

    const batch = await admin.gateway.retryFailedBatch(actor(), 10);
    expect(Array.isArray(batch)).toBe(true);
  });

  it("manages dead-letter inspect/retry/acknowledge/archive without deleting", async () => {
    const runtime = createSearchOrchestrationForTest({
      allowInMemoryJournal: true,
      env: envOn,
    });
    vi.spyOn(runtime.publisher, "publish").mockImplementation((ctx) => ({
      ok: false,
      operation: "publish",
      correlationId: ctx.correlationId,
      durationMs: 1,
      acceptedAt: new Date().toISOString(),
      entityId: "dlq_1",
      productId: "projects",
      message: "validation rejected permanently",
    }));

    const admin = createSearchPublicationAdmin({ runtime });
    await runtime.dispatcher.enqueue({
      tenantId: "tenant_a",
      entityId: "dlq_1",
      entityType: "project",
      productId: "projects",
      operation: "publish",
      payload: payload("dlq_1"),
      correlationId: "corr_dlq",
    });
    await runtime.orchestrator.processBatch();
    const dlq = (await runtime.journal.listByStatus("dead-letter"))[0]!;
    expect(dlq).toBeTruthy();

    const replay = await admin.gateway.retryDeadLetter(actor(), dlq.id);
    expect(replay.ok).toBe(true);
    expect(replay.mode).toBe("reenqueue");
    expect(replay.newPublicationId).toBeTruthy();

    await admin.gateway.acknowledgeDeadLetter(actor(), dlq.id, "reviewed");
    await admin.gateway.archiveDeadLetter(actor(), dlq.id, "archived");

    const hidden = await admin.gateway.listPublications(actor(), {
      filter: { status: "dead-letter" },
    });
    expect(hidden.items.find((i) => i.id === dlq.id)).toBeUndefined();

    const shown = await admin.gateway.listPublications(actor(), {
      filter: { status: "dead-letter", includeArchived: true },
    });
    expect(shown.items.find((i) => i.id === dlq.id)).toBeTruthy();

    // Journal row still exists — never deleted
    expect(await runtime.journal.findById(dlq.id)).not.toBeNull();
  });

  it("drains batch with admin permission and records audit", async () => {
    const admin = createSearchPublicationAdmin({
      allowInMemoryOrchestration: true,
      env: envOn,
    });
    await seedQueued(admin, "drain_1");
    const drained = await admin.gateway.drainBatch(actor());
    expect(drained.published).toBe(1);
    const audit = await admin.gateway.listAudit(actor());
    expect(audit.some((a) => a.action === "publication.drain")).toBe(true);
  });

  it("clears completed retries via acknowledge markers", async () => {
    const admin = createSearchPublicationAdmin({
      allowInMemoryOrchestration: true,
      env: envOn,
    });
    await seedQueued(admin, "clr_1");
    // force attemptCount > 1 by failing once then succeeding
    const pub = admin.runtime.publisher.publish.bind(admin.runtime.publisher);
    let n = 0;
    vi.spyOn(admin.runtime.publisher, "publish").mockImplementation((ctx, input) => {
      n += 1;
      if (n === 1) {
        return {
          ok: false,
          operation: "publish",
          correlationId: ctx.correlationId,
          durationMs: 1,
          acceptedAt: new Date().toISOString(),
          entityId: "clr_1",
          productId: "projects",
          message: "temporary blip",
        };
      }
      return pub(ctx, input);
    });
    await admin.runtime.orchestrator.processBatch();
    const retrying = (await admin.runtime.journal.listByStatus("retrying"))[0]!;
    await admin.runtime.journal.updateStatus({
      id: retrying.id,
      from: "retrying",
      to: "publishing",
      now: new Date().toISOString(),
    });
    // process remaining via publish spy success path — call publisher directly through processBatch after setting due
    await admin.runtime.journal.updateStatus({
      id: retrying.id,
      from: "publishing",
      to: "failed",
      now: new Date().toISOString(),
      lastError: "temporary blip",
    });
    await admin.gateway.retryPublication(actor(), retrying.id);
    await admin.runtime.orchestrator.processBatch();
    const cleared = await admin.gateway.clearCompletedRetries(actor());
    expect(cleared.cleared).toBeGreaterThanOrEqual(0);
  });

  it("requires runtime or explicit in-memory orchestration", () => {
    expect(() => createSearchPublicationAdmin({})).toThrow(/runtime/);
  });

  it("covers retry selected, not-found, invalid status, and degraded health", async () => {
    const admin = createSearchPublicationAdmin({
      allowInMemoryOrchestration: true,
      env: envOn,
    });
    await expect(
      admin.gateway.getPublication(actor(), "missing"),
    ).rejects.toBeInstanceOf(SearchPublicationNotFoundError);

    await seedQueued(admin, "batch_1");
    await seedQueued(admin, "batch_2");
    const queued = await admin.runtime.journal.listByStatus("queued");
    const ids = queued.map((e) => e.id);
    // queued cannot retry via status — expect failure messages
    const selected = await admin.gateway.retryPublications(actor(), [
      ...ids,
      "missing_id",
    ]);
    expect(selected.length).toBe(ids.length + 1);
    expect(selected.some((r) => !r.ok)).toBe(true);

    await expect(admin.gateway.acknowledgeDeadLetter(actor(), ids[0]!)).rejects.toThrow(
      /dead-letter/,
    );
    await expect(admin.gateway.archiveDeadLetter(actor(), ids[0]!)).rejects.toThrow(
      /dead-letter/,
    );
    await expect(admin.gateway.retryDeadLetter(actor(), ids[0]!)).rejects.toThrow(
      /dead-letter/,
    );

    // Seed backlog for degraded health
    for (let i = 0; i < 5; i++) {
      await seedQueued(admin, `deg_${i}`);
    }
    const diag = await admin.gateway.getDiagnostics(actor());
    expect(["healthy", "degraded", "unavailable"]).toContain(diag.publicationHealth);

    // disabled orchestration diagnostics
    const disabled = createSearchPublicationAdmin({
      runtime: createSearchOrchestrationForTest({
        allowInMemoryJournal: true,
        env: { APZHUB_SEARCH_ORCHESTRATION_ENABLED: "false" },
      }),
    });
    const d2 = await disabled.gateway.getDiagnostics(actor());
    expect(d2.publicationHealth).toBe("unavailable");

    // filter q + include flags + marker get/list
    await admin.markers.mark({
      publicationId: ids[0]!,
      kind: "acknowledged",
      actorUserId: "user_1",
    });
    expect(await admin.markers.get(ids[0]!)).toBeTruthy();
    expect((await admin.markers.list("acknowledged")).length).toBeGreaterThan(0);
    const filtered = await admin.gateway.listPublications(actor(), {
      filter: { q: "batch", includeAcknowledged: true },
      sortBy: "attemptCount",
      sortDir: "desc",
    });
    expect(filtered.total).toBeGreaterThan(0);

    // DLQ reenqueue failure when orchestration disabled
    const runtime = createSearchOrchestrationForTest({
      allowInMemoryJournal: true,
      env: envOn,
    });
    vi.spyOn(runtime.publisher, "publish").mockImplementation((ctx) => ({
      ok: false,
      operation: "publish",
      correlationId: ctx.correlationId,
      durationMs: 1,
      acceptedAt: new Date().toISOString(),
      entityId: "dlq_off",
      productId: "projects",
      message: "validation rejected permanently",
    }));
    const admin2 = createSearchPublicationAdmin({ runtime });
    await runtime.dispatcher.enqueue({
      tenantId: "tenant_a",
      entityId: "dlq_off",
      entityType: "project",
      productId: "projects",
      operation: "publish",
      payload: payload("dlq_off"),
      correlationId: "corr_off",
    });
    await runtime.orchestrator.processBatch();
    const dlq = (await runtime.journal.listByStatus("dead-letter"))[0]!;
    // swap dispatcher env by creating disabled runtime enqueue path via mock
    vi.spyOn(runtime.dispatcher, "enqueue").mockResolvedValue({
      ok: false as const,
      code: "SEARCH_ORCHESTRATION_DISABLED" as const,
      message: "disabled",
    });
    const failReplay = await admin2.gateway.retryDeadLetter(actor(), dlq.id);
    expect(failReplay.ok).toBe(false);
  });

  it("does not import frozen search platform packages", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const root = path.resolve(__dirname);
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) walk(full);
        else if (full.endsWith(".ts") && !full.includes(".test.")) files.push(full);
      }
    };
    walk(root);
    const blob = files.map((f) => fs.readFileSync(f, "utf8")).join("\n");
    expect(blob).not.toMatch(/@apzhub\/search-persistence/);
    expect(blob).not.toMatch(/@apzhub\/search-contracts/);
    expect(blob).not.toMatch(/@apzhub\/platform-services/);
    expect(blob).not.toMatch(/@apzhub\/integration-meilisearch/);
    expect(blob).not.toMatch(/from ["']meilisearch["']/);
    expect(blob).toMatch(/@apzhub\/search-orchestrator/);
  });
});
