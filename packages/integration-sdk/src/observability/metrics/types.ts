import type { IntegrationError } from "../../errors/types";
import type { CircuitBreakerState } from "../../resilience/types";

export type MetricLabels = Readonly<Record<string, string>>;

export interface HistogramSnapshot {
  readonly count: number;
  readonly sum: number;
  readonly min: number;
  readonly max: number;
  readonly p95: number;
}

export interface Counter {
  inc(value?: number): void;
  get(): number;
}

export interface Gauge {
  set(value: number): void;
  get(): number;
}

export interface Histogram {
  observe(value: number): void;
  getSnapshot(): HistogramSnapshot;
}

export interface TimerHandle {
  stop(): number;
}

export interface Timer {
  start(): TimerHandle;
}

export interface MetricsProvider {
  counter(name: string, labels?: MetricLabels): Counter;
  gauge(name: string, labels?: MetricLabels): Gauge;
  histogram(name: string, labels?: MetricLabels): Histogram;
  timer(name: string, labels?: MetricLabels): Timer;
}

export interface RequestMetricOptions {
  readonly durationMs: number;
  readonly success: boolean;
  readonly operation?: string;
  readonly labels?: MetricLabels;
}

export interface IntegrationMetricsSummary {
  readonly requestsTotal: number;
  readonly errorsTotal: number;
  readonly errorRate5m?: number;
  readonly latencyP95Ms?: number;
  readonly lastRequestAt?: string;
}

export interface IntegrationMetrics {
  recordRequest(options: RequestMetricOptions): void;
  recordError(error: IntegrationError): void;
  recordCircuitBreakerTransition(state: CircuitBreakerState): void;
  getSummary(): IntegrationMetricsSummary;
}

export const STANDARD_INTEGRATION_METRIC_NAMES = {
  requestsTotal: "integration.requests.total",
  requestDurationMs: "integration.requests.duration_ms",
  errorsTotal: "integration.errors.total",
  circuitBreakerState: "integration.circuit_breaker.state",
  healthStatus: "integration.health.status",
} as const;
