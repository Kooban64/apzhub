/**
 * OSS-102-08 — Wave 2 performance baseline (mocked). Measurement only — no optimisation.
 * Timings are not production Zammad latency.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  createZammadAdapter,
  disposeZammadAdapter,
  createMockZammadFetch,
  DEFAULT_TEST_ZAMMAD_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
} from "@apzhub/integration-zammad";

const CORR = "corr-wave2-perf-001";
const TENANT = TEST_TENANT_ID;
const ctx = { correlationId: CORR, tenantId: TENANT };

async function timed(
  label: string,
  fn: () => Promise<unknown>,
): Promise<{ label: string; ms: number }> {
  const start = performance.now();
  await fn();
  return { label, ms: Number((performance.now() - start).toFixed(3)) };
}

describe("OSS-102-08 Wave 2 performance baseline (mocked)", () => {
  let adapter: Awaited<ReturnType<typeof createZammadAdapter>>["adapter"];
  let factory: Awaited<ReturnType<typeof createZammadAdapter>>["factory"];

  beforeEach(async () => {
    const created = await createZammadAdapter({
      zammad: DEFAULT_TEST_ZAMMAD_CONFIG,
      tenantId: TENANT,
      apiToken: "wave2-perf-token",
      adapterOptions: { fetchFn: createMockZammadFetch() },
    });
    adapter = created.adapter;
    factory = created.factory;
  });

  afterEach(async () => {
    if (adapter && factory) {
      await disposeZammadAdapter(adapter, factory);
    }
  });

  it("records baseline timings for representative adapter operations", async () => {
    const baselines: { label: string; ms: number }[] = [];

    baselines.push(
      await timed("adapter.initialise_already_done", async () => {
        expect(adapter.isInitialised).toBe(true);
      }),
    );

    baselines.push(
      await timed("adapter.connect", async () => {
        await adapter.testConnection(ctx);
      }),
    );

    baselines.push(
      await timed("support.list", async () => {
        await adapter.core.support.list(ctx);
      }),
    );

    baselines.push(
      await timed("support.get", async () => {
        await adapter.core.support.get(ctx, "sreq_zammad_100");
      }),
    );

    baselines.push(
      await timed("support.create", async () => {
        await adapter.core.support.create(ctx, {
          title: "Perf ticket",
          groupId: "sgrp_zammad_1",
          requesterId: "suser_zammad_5",
        });
      }),
    );

    baselines.push(
      await timed("articles.list", async () => {
        await adapter.core.articles.list(ctx, "sreq_zammad_100");
      }),
    );

    baselines.push(
      await timed("articles.createNote", async () => {
        await adapter.core.articles.createNote(ctx, {
          supportTicketId: "sreq_zammad_100",
          body: "perf note",
          bodyFormat: "text/plain",
        });
      }),
    );

    baselines.push(
      await timed("search.supportRequests", async () => {
        await adapter.core.search.searchSupportRequests(ctx, "password");
      }),
    );

    baselines.push(
      await timed("history.timeline", async () => {
        await adapter.core.history.getTimeline(ctx, "sreq_zammad_100");
      }),
    );

    baselines.push(
      await timed("analytics.snapshot", async () => {
        await adapter.core.analytics.getSupportIntelligence(ctx);
      }),
    );

    baselines.push(
      await timed("sync.incremental", async () => {
        await adapter.core.synchronisation.runIncrementalSync(ctx);
      }),
    );

    baselines.push(
      await timed("events.translate", async () => {
        adapter.core.events.translate(ctx, {
          event: "ticket",
          action: "create",
          ticket: { id: 100 },
        });
      }),
    );

    baselines.push(
      await timed("operations.certifyCapabilities", async () => {
        adapter.operations.certifyCapabilities();
      }),
    );

    baselines.push(
      await timed("operations.evaluateReadiness", async () => {
        await adapter.evaluateReadiness(ctx);
      }),
    );

    baselines.push(
      await timed("operations.buildOperationalReport", async () => {
        await adapter.buildOperationalReport(ctx);
      }),
    );

    expect(baselines.length).toBeGreaterThanOrEqual(14);
    for (const row of baselines) {
      expect(row.ms).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(row.ms)).toBe(true);
    }

    // Surface for certification report capture (not an assertion target).
    // eslint-disable-next-line no-console
    console.log(
      "WAVE2_PERF_BASELINE",
      JSON.stringify({
        environment: "mocked-vitest",
        note: "Not production Zammad latency",
        operations: baselines,
        count: baselines.length,
        min: Math.min(...baselines.map((b) => b.ms)),
        max: Math.max(...baselines.map((b) => b.ms)),
        average: Number(
          (
            baselines.reduce((sum, b) => sum + b.ms, 0) / baselines.length
          ).toFixed(3),
        ),
      }),
    );
  });
});
