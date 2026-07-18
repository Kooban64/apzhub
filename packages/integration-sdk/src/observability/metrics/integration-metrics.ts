import type { IntegrationErrorCategory } from "../../errors/types";
import type { IntegrationErrorSummary } from "../../diagnostics/runtime-types";
import type { CircuitBreakerState } from "../../resilience/types";
import type {
  Counter,
  Gauge,
  Histogram,
  HistogramSnapshot,
  IntegrationMetrics,
  IntegrationMetricsSummary,
  MetricLabels,
  MetricsProvider,
  RequestMetricOptions,
  Timer,
  TimerHandle,
} from "./types";
import { STANDARD_INTEGRATION_METRIC_NAMES } from "./types";

function metricKey(name: string, labels?: MetricLabels): string {
  if (!labels || Object.keys(labels).length === 0) {
    return name;
  }

  const labelPart = Object.entries(labels)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join(",");

  return `${name}{${labelPart}}`;
}

function percentile(values: readonly number[], p: number): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, index)] ?? 0;
}

class InMemoryCounter implements Counter {
  private value = 0;

  inc(amount = 1): void {
    this.value += amount;
  }

  get(): number {
    return this.value;
  }
}

class InMemoryGauge implements Gauge {
  private value = 0;

  set(value: number): void {
    this.value = value;
  }

  get(): number {
    return this.value;
  }
}

class InMemoryHistogram implements Histogram {
  private values: number[] = [];

  observe(value: number): void {
    this.values.push(value);
  }

  getSnapshot(): HistogramSnapshot {
    if (this.values.length === 0) {
      return { count: 0, sum: 0, min: 0, max: 0, p95: 0 };
    }

    const sum = this.values.reduce((total, value) => total + value, 0);
    return {
      count: this.values.length,
      sum,
      min: Math.min(...this.values),
      max: Math.max(...this.values),
      p95: percentile(this.values, 95),
    };
  }
}

class InMemoryTimer implements Timer {
  constructor(private readonly histogram: Histogram) {}

  start(): TimerHandle {
    const startedAt = Date.now();
    return {
      stop: () => {
        const durationMs = Date.now() - startedAt;
        this.histogram.observe(durationMs);
        return durationMs;
      },
    };
  }
}

export class InMemoryMetricsProvider implements MetricsProvider {
  private readonly counters = new Map<string, InMemoryCounter>();
  private readonly gauges = new Map<string, InMemoryGauge>();
  private readonly histograms = new Map<string, InMemoryHistogram>();

  counter(name: string, labels?: MetricLabels): Counter {
    const key = metricKey(name, labels);
    const existing = this.counters.get(key);
    if (existing) {
      return existing;
    }

    const created = new InMemoryCounter();
    this.counters.set(key, created);
    return created;
  }

  gauge(name: string, labels?: MetricLabels): Gauge {
    const key = metricKey(name, labels);
    const existing = this.gauges.get(key);
    if (existing) {
      return existing;
    }

    const created = new InMemoryGauge();
    this.gauges.set(key, created);
    return created;
  }

  histogram(name: string, labels?: MetricLabels): Histogram {
    const key = metricKey(name, labels);
    const existing = this.histograms.get(key);
    if (existing) {
      return existing;
    }

    const created = new InMemoryHistogram();
    this.histograms.set(key, created);
    return created;
  }

  timer(name: string, labels?: MetricLabels): Timer {
    return new InMemoryTimer(this.histogram(name, labels));
  }
}

export class NoopMetricsProvider implements MetricsProvider {
  counter(): Counter {
    return { inc: () => undefined, get: () => 0 };
  }

  gauge(): Gauge {
    return { set: () => undefined, get: () => 0 };
  }

  histogram(): Histogram {
    return {
      observe: () => undefined,
      getSnapshot: () => ({ count: 0, sum: 0, min: 0, max: 0, p95: 0 }),
    };
  }

  timer(): Timer {
    return { start: () => ({ stop: () => 0 }) };
  }
}

export interface DefaultIntegrationMetricsOptions {
  readonly provider: MetricsProvider;
  readonly integrationId: string;
  readonly adapterId?: string;
  readonly clock?: { now(): string };
}

export class DefaultIntegrationMetrics implements IntegrationMetrics {
  private readonly provider: MetricsProvider;
  private readonly integrationId: string;
  private readonly adapterId?: string;
  private readonly clock: { now(): string };
  private lastRequestAt?: string;

  constructor(options: DefaultIntegrationMetricsOptions) {
    this.provider = options.provider;
    this.integrationId = options.integrationId;
    this.adapterId = options.adapterId;
    this.clock = options.clock ?? { now: () => new Date().toISOString() };
  }

  recordRequest(options: RequestMetricOptions): void {
    const summaryLabels = { integrationId: this.integrationId };
    const labels = {
      integrationId: this.integrationId,
      ...(this.adapterId ? { adapterId: this.adapterId } : {}),
      ...(options.operation ? { operation: options.operation } : {}),
      ...options.labels,
    };

    this.provider
      .counter(STANDARD_INTEGRATION_METRIC_NAMES.requestsTotal, summaryLabels)
      .inc();
    this.provider
      .counter(STANDARD_INTEGRATION_METRIC_NAMES.requestsTotal, labels)
      .inc();
    this.provider
      .histogram(STANDARD_INTEGRATION_METRIC_NAMES.requestDurationMs, summaryLabels)
      .observe(options.durationMs);
    this.provider
      .histogram(STANDARD_INTEGRATION_METRIC_NAMES.requestDurationMs, labels)
      .observe(options.durationMs);

    if (!options.success) {
      this.provider
        .counter(STANDARD_INTEGRATION_METRIC_NAMES.errorsTotal, summaryLabels)
        .inc();
      this.provider
        .counter(STANDARD_INTEGRATION_METRIC_NAMES.errorsTotal, labels)
        .inc();
    }

    this.lastRequestAt = this.clock.now();
  }

  recordError(error: import("../../errors/types").IntegrationError): void {
    this.provider
      .counter(STANDARD_INTEGRATION_METRIC_NAMES.errorsTotal, {
        integrationId: this.integrationId,
      })
      .inc();
    this.provider
      .counter(STANDARD_INTEGRATION_METRIC_NAMES.errorsTotal, {
        integrationId: this.integrationId,
        category: error.category,
      })
      .inc();
  }

  recordCircuitBreakerTransition(state: CircuitBreakerState): void {
    const numericState = state === "closed" ? 0 : state === "half_open" ? 1 : 2;
    this.provider
      .gauge(STANDARD_INTEGRATION_METRIC_NAMES.circuitBreakerState, {
        integrationId: this.integrationId,
      })
      .set(numericState);
  }

  getSummary(): IntegrationMetricsSummary {
    const requestsTotal = this.provider
      .counter(STANDARD_INTEGRATION_METRIC_NAMES.requestsTotal, {
        integrationId: this.integrationId,
      })
      .get();
    const errorsTotal = this.provider
      .counter(STANDARD_INTEGRATION_METRIC_NAMES.errorsTotal, {
        integrationId: this.integrationId,
      })
      .get();
    const durationSnapshot = this.provider
      .histogram(STANDARD_INTEGRATION_METRIC_NAMES.requestDurationMs, {
        integrationId: this.integrationId,
      })
      .getSnapshot();

    return {
      requestsTotal,
      errorsTotal,
      errorRate5m:
        requestsTotal > 0
          ? Number((errorsTotal / requestsTotal).toFixed(4))
          : undefined,
      latencyP95Ms: durationSnapshot.count > 0 ? durationSnapshot.p95 : undefined,
      lastRequestAt: this.lastRequestAt,
    };
  }
}

export function createInMemoryMetricsProvider(): InMemoryMetricsProvider {
  return new InMemoryMetricsProvider();
}

export function createNoopMetricsProvider(): NoopMetricsProvider {
  return new NoopMetricsProvider();
}

export function createDefaultIntegrationMetrics(
  options: DefaultIntegrationMetricsOptions,
): IntegrationMetrics {
  return new DefaultIntegrationMetrics(options);
}

export interface ErrorSummaryTracker {
  record(error: import("../../errors/types").IntegrationError): void;
  getSummary(): IntegrationErrorSummary;
}

export class InMemoryErrorSummaryTracker implements ErrorSummaryTracker {
  private totalErrors = 0;
  private readonly errorsByCategory = new Map<IntegrationErrorCategory, number>();
  private lastErrorAt?: string;
  private lastErrorCode?: string;
  private lastErrorCategory?: IntegrationErrorCategory;
  private readonly clock: { now(): string };

  constructor(clock: { now(): string } = { now: () => new Date().toISOString() }) {
    this.clock = clock;
  }

  record(error: import("../../errors/types").IntegrationError): void {
    this.totalErrors += 1;
    this.errorsByCategory.set(
      error.category,
      (this.errorsByCategory.get(error.category) ?? 0) + 1,
    );
    this.lastErrorAt = this.clock.now();
    this.lastErrorCode = error.code;
    this.lastErrorCategory = error.category;
  }

  getSummary(): IntegrationErrorSummary {
    return {
      totalErrors: this.totalErrors,
      errorsByCategory: Object.fromEntries(this.errorsByCategory),
      lastErrorAt: this.lastErrorAt,
      lastErrorCode: this.lastErrorCode,
      lastErrorCategory: this.lastErrorCategory,
    };
  }
}

export function createInMemoryErrorSummaryTracker(clock?: {
  now(): string;
}): InMemoryErrorSummaryTracker {
  return new InMemoryErrorSummaryTracker(clock);
}
