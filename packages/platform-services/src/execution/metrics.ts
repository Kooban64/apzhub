/** Metric kinds emitted by the platform execution pipeline. */
export type PipelineMetricKind = "operation_started" | "operation_succeeded" | "operation_failed";

export interface PipelineMetricEvent {
  readonly kind: PipelineMetricKind;
  readonly service: string;
  readonly operation: string;
  readonly correlationId: string;
  readonly requestId: string;
  readonly durationMs?: number;
  readonly errorCode?: string;
}

/** Metrics hook — replaceable; no Prometheus/OTel exporters in this milestone. */
export interface PipelineMetrics {
  record(event: PipelineMetricEvent): void;
}

/** In-memory metrics sink for development and tests. */
export class InMemoryPipelineMetrics implements PipelineMetrics {
  readonly events: PipelineMetricEvent[] = [];

  record(event: PipelineMetricEvent): void {
    this.events.push(event);
  }

  clear(): void {
    this.events.length = 0;
  }
}

export const noopPipelineMetrics: PipelineMetrics = {
  record() {
    // intentionally empty
  },
};
