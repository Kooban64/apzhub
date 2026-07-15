import type { PollingExecutionOutcome } from "./polling/results";
import type { WebhookProcessingOutcome } from "./webhook/results";

export interface EventMetricsSnapshot {
  readonly webhookProcessedTotal: number;
  readonly webhookAcceptedTotal: number;
  readonly webhookFailedTotal: number;
  readonly webhookDurationMsTotal: number;
  readonly pollingExecutionsTotal: number;
  readonly pollingRecordsTotal: number;
  readonly pollingFailedTotal: number;
  readonly pollingDurationMsTotal: number;
  readonly averageWebhookDurationMs: number;
  readonly averagePollingDurationMs: number;
}

export interface EventMetrics {
  recordWebhookProcessing(input: {
    readonly outcome: WebhookProcessingOutcome;
    readonly success: boolean;
    readonly durationMs: number;
  }): void;
  recordPollingExecution(input: {
    readonly outcome: PollingExecutionOutcome;
    readonly success: boolean;
    readonly durationMs: number;
    readonly recordsProcessed: number;
  }): void;
  getSnapshot(): EventMetricsSnapshot;
  reset(): void;
}

/** Local counters — transport-style, safe for adapter diagnostics. */
export class DefaultEventMetrics implements EventMetrics {
  private webhookProcessedTotal = 0;
  private webhookAcceptedTotal = 0;
  private webhookFailedTotal = 0;
  private webhookDurationMsTotal = 0;
  private pollingExecutionsTotal = 0;
  private pollingRecordsTotal = 0;
  private pollingFailedTotal = 0;
  private pollingDurationMsTotal = 0;

  recordWebhookProcessing(input: {
    readonly outcome: WebhookProcessingOutcome;
    readonly success: boolean;
    readonly durationMs: number;
  }): void {
    this.webhookProcessedTotal += 1;
    this.webhookDurationMsTotal += input.durationMs;
    if (input.success && input.outcome === "accepted") {
      this.webhookAcceptedTotal += 1;
    }
    if (!input.success) {
      this.webhookFailedTotal += 1;
    }
  }

  recordPollingExecution(input: {
    readonly outcome: PollingExecutionOutcome;
    readonly success: boolean;
    readonly durationMs: number;
    readonly recordsProcessed: number;
  }): void {
    this.pollingExecutionsTotal += 1;
    this.pollingDurationMsTotal += input.durationMs;
    this.pollingRecordsTotal += input.recordsProcessed;
    if (!input.success) {
      this.pollingFailedTotal += 1;
    }
  }

  getSnapshot(): EventMetricsSnapshot {
    return {
      webhookProcessedTotal: this.webhookProcessedTotal,
      webhookAcceptedTotal: this.webhookAcceptedTotal,
      webhookFailedTotal: this.webhookFailedTotal,
      webhookDurationMsTotal: this.webhookDurationMsTotal,
      pollingExecutionsTotal: this.pollingExecutionsTotal,
      pollingRecordsTotal: this.pollingRecordsTotal,
      pollingFailedTotal: this.pollingFailedTotal,
      pollingDurationMsTotal: this.pollingDurationMsTotal,
      averageWebhookDurationMs:
        this.webhookProcessedTotal === 0
          ? 0
          : this.webhookDurationMsTotal / this.webhookProcessedTotal,
      averagePollingDurationMs:
        this.pollingExecutionsTotal === 0
          ? 0
          : this.pollingDurationMsTotal / this.pollingExecutionsTotal,
    };
  }

  reset(): void {
    this.webhookProcessedTotal = 0;
    this.webhookAcceptedTotal = 0;
    this.webhookFailedTotal = 0;
    this.webhookDurationMsTotal = 0;
    this.pollingExecutionsTotal = 0;
    this.pollingRecordsTotal = 0;
    this.pollingFailedTotal = 0;
    this.pollingDurationMsTotal = 0;
  }
}

export function createEventMetrics(): DefaultEventMetrics {
  return new DefaultEventMetrics();
}

export const STANDARD_EVENT_METRIC_NAMES = {
  webhookProcessed: "integration.events.webhook.processed",
  webhookAccepted: "integration.events.webhook.accepted",
  webhookFailed: "integration.events.webhook.failed",
  webhookDurationMs: "integration.events.webhook.duration_ms",
  pollingExecutions: "integration.events.polling.executions",
  pollingRecords: "integration.events.polling.records",
  pollingFailed: "integration.events.polling.failed",
  pollingDurationMs: "integration.events.polling.duration_ms",
} as const;
