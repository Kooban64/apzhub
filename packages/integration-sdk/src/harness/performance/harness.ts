import type { MockAdapter } from "../../adapter/mock-adapter";
import type { IntegrationRequestContext } from "../../types";
import { createAdapterMockHarness } from "../mock/mock-harness";
import { createAdapterHarness } from "../adapter-harness";

export interface PerformanceTiming {
  readonly name: string;
  readonly durationMs: number;
  readonly ok: boolean;
  readonly detail?: string;
}

export interface AdapterPerformanceReport {
  readonly timings: readonly PerformanceTiming[];
  readonly totalMs: number;
  readonly measuredAt: string;
}

export interface AdapterPerformanceHarnessOptions {
  readonly context?: IntegrationRequestContext;
}

async function measure(
  name: string,
  work: () => Promise<void>,
): Promise<PerformanceTiming> {
  const started = Date.now();
  try {
    await work();
    return { name, durationMs: Date.now() - started, ok: true };
  } catch (error) {
    return {
      name,
      durationMs: Date.now() - started,
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Measure-only performance harness — returns timings, no optimisation advice.
 */
export class AdapterPerformanceHarness {
  constructor(private readonly options: AdapterPerformanceHarnessOptions = {}) {}

  async measureMockAdapter(): Promise<AdapterPerformanceReport> {
    const context: IntegrationRequestContext = this.options.context ?? {
      correlationId: "corr-perf",
      tenantId: "tenant-perf",
    };

    const timings: PerformanceTiming[] = [];
    const harness = createAdapterHarness();
    const mock = createAdapterMockHarness();

    timings.push(
      await measure("startup", async () => {
        await harness.boot();
      }),
    );

    const adapter = harness.adapter;

    timings.push(
      await measure("health", async () => {
        await adapter.health(context);
      }),
    );

    timings.push(
      await measure("diagnostics", async () => {
        await adapter.diagnostics(context);
      }),
    );

    timings.push(
      await measure("transport", async () => {
        mock.scriptHttp("/perf", { status: 200, body: { ok: true }, latencyMs: 1 });
        await mock.simulateHttp("/perf");
      }),
    );

    timings.push(
      await measure("mapping", async () => {
        // Mapping is measured as a no-op placeholder timing slot for adapters
        // that inject mapping pipelines later — keeps category stable.
        await Promise.resolve();
      }),
    );

    timings.push(
      await measure("polling", async () => {
        const source = mock.createPollingPages([2, 1]);
        await source.poll(context, { mode: "full", pageSize: 10 });
      }),
    );

    timings.push(
      await measure("webhooks", async () => {
        void mock.createWebhookPayload();
        void mock.createWebhookPipelinePieces();
      }),
    );

    timings.push(
      await measure("operation_latency", async () => {
        await adapter.simulateOperation(context, {
          operation: "perf.ping",
          succeed: true,
          durationMs: 1,
        });
      }),
    );

    await harness.cleanup();
    await mock.cleanup();

    const totalMs = timings.reduce((sum, t) => sum + t.durationMs, 0);
    return {
      timings,
      totalMs,
      measuredAt: new Date().toISOString(),
    };
  }

  async measureSubject(
    adapter: MockAdapter,
    context: IntegrationRequestContext = this.options.context ?? {
      correlationId: "corr-perf",
      tenantId: "tenant-perf",
    },
  ): Promise<AdapterPerformanceReport> {
    const timings: PerformanceTiming[] = [];
    timings.push(
      await measure("health", async () => {
        await adapter.health(context);
      }),
    );
    timings.push(
      await measure("diagnostics", async () => {
        await adapter.diagnostics(context);
      }),
    );
    timings.push(
      await measure("operation_latency", async () => {
        await adapter.simulateOperation(context, {
          operation: "perf.ping",
          succeed: true,
        });
      }),
    );
    return {
      timings,
      totalMs: timings.reduce((sum, t) => sum + t.durationMs, 0),
      measuredAt: new Date().toISOString(),
    };
  }
}

export function createAdapterPerformanceHarness(
  options?: AdapterPerformanceHarnessOptions,
): AdapterPerformanceHarness {
  return new AdapterPerformanceHarness(options);
}
