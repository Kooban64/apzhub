import type { WebhookProcessingOutcome } from "./webhook/results";
import type { PollingExecutionOutcome } from "./polling/results";
import type { EventMetricsSnapshot } from "./metrics";

export type EventDiagnosticsHealth = "healthy" | "degraded" | "unhealthy" | "unknown";

export interface WebhookDiagnosticsSnapshot {
  readonly processedTotal: number;
  readonly acceptedTotal: number;
  readonly ignoredTotal: number;
  readonly failedTotal: number;
  readonly duplicateTotal: number;
  readonly verificationFailures: number;
  readonly replayRejections: number;
  readonly lastOutcome?: WebhookProcessingOutcome;
  readonly lastProcessedAt?: string;
}

export interface PollingDiagnosticsSnapshot {
  readonly executionsTotal: number;
  readonly completedTotal: number;
  readonly failedTotal: number;
  readonly stalledTotal: number;
  readonly cancelledTotal: number;
  readonly recordsProcessedTotal: number;
  readonly lastOutcome?: PollingExecutionOutcome;
  readonly lastExecutedAt?: string;
}

export interface EventDiagnosticsSnapshot {
  readonly health: EventDiagnosticsHealth;
  readonly webhook: WebhookDiagnosticsSnapshot;
  readonly polling: PollingDiagnosticsSnapshot;
  readonly metrics?: EventMetricsSnapshot;
  readonly recommendations: readonly string[];
}

export interface EventDiagnosticsCollector {
  recordWebhook(outcome: WebhookProcessingOutcome): void;
  recordPolling(outcome: PollingExecutionOutcome, recordsProcessed?: number): void;
  getSnapshot(metrics?: EventMetricsSnapshot): EventDiagnosticsSnapshot;
  reset(): void;
}

export class DefaultEventDiagnosticsCollector implements EventDiagnosticsCollector {
  private webhook: WebhookDiagnosticsSnapshot = emptyWebhook();
  private polling: PollingDiagnosticsSnapshot = emptyPolling();

  recordWebhook(outcome: WebhookProcessingOutcome): void {
    this.webhook = {
      ...this.webhook,
      processedTotal: this.webhook.processedTotal + 1,
      acceptedTotal: this.webhook.acceptedTotal + (outcome === "accepted" ? 1 : 0),
      ignoredTotal: this.webhook.ignoredTotal + (outcome === "ignored" ? 1 : 0),
      failedTotal:
        this.webhook.failedTotal +
        (outcome === "error" ||
        outcome === "verification_failed" ||
        outcome === "translation_failed"
          ? 1
          : 0),
      duplicateTotal: this.webhook.duplicateTotal + (outcome === "duplicate" ? 1 : 0),
      verificationFailures:
        this.webhook.verificationFailures + (outcome === "verification_failed" ? 1 : 0),
      replayRejections:
        this.webhook.replayRejections + (outcome === "replay_rejected" ? 1 : 0),
      lastOutcome: outcome,
      lastProcessedAt: new Date().toISOString(),
    };
  }

  recordPolling(outcome: PollingExecutionOutcome, recordsProcessed = 0): void {
    this.polling = {
      ...this.polling,
      executionsTotal: this.polling.executionsTotal + 1,
      completedTotal:
        this.polling.completedTotal +
        (outcome === "completed" || outcome === "partial" ? 1 : 0),
      failedTotal: this.polling.failedTotal + (outcome === "failed" ? 1 : 0),
      stalledTotal: this.polling.stalledTotal + (outcome === "stalled" ? 1 : 0),
      cancelledTotal: this.polling.cancelledTotal + (outcome === "cancelled" ? 1 : 0),
      recordsProcessedTotal: this.polling.recordsProcessedTotal + recordsProcessed,
      lastOutcome: outcome,
      lastExecutedAt: new Date().toISOString(),
    };
  }

  getSnapshot(metrics?: EventMetricsSnapshot): EventDiagnosticsSnapshot {
    const recommendations: string[] = [];
    if (this.webhook.verificationFailures > 0) {
      recommendations.push("Investigate webhook signature verification failures");
    }
    if (this.webhook.replayRejections > 0) {
      recommendations.push("Review webhook replay rejections and clock skew");
    }
    if (this.polling.stalledTotal > 0) {
      recommendations.push("Investigate polling stalls / duplicate pages");
    }
    if (this.polling.failedTotal > 0) {
      recommendations.push("Review polling execution failures");
    }

    return {
      health: deriveHealth(this.webhook, this.polling),
      webhook: { ...this.webhook },
      polling: { ...this.polling },
      metrics,
      recommendations,
    };
  }

  reset(): void {
    this.webhook = emptyWebhook();
    this.polling = emptyPolling();
  }
}

export function createEventDiagnosticsCollector(): DefaultEventDiagnosticsCollector {
  return new DefaultEventDiagnosticsCollector();
}

function emptyWebhook(): WebhookDiagnosticsSnapshot {
  return {
    processedTotal: 0,
    acceptedTotal: 0,
    ignoredTotal: 0,
    failedTotal: 0,
    duplicateTotal: 0,
    verificationFailures: 0,
    replayRejections: 0,
  };
}

function emptyPolling(): PollingDiagnosticsSnapshot {
  return {
    executionsTotal: 0,
    completedTotal: 0,
    failedTotal: 0,
    stalledTotal: 0,
    cancelledTotal: 0,
    recordsProcessedTotal: 0,
  };
}

function deriveHealth(
  webhook: WebhookDiagnosticsSnapshot,
  polling: PollingDiagnosticsSnapshot,
): EventDiagnosticsHealth {
  if (
    webhook.verificationFailures > 0 ||
    polling.failedTotal > 0 ||
    polling.stalledTotal > 0
  ) {
    return "degraded";
  }
  if (webhook.processedTotal === 0 && polling.executionsTotal === 0) {
    return "unknown";
  }
  return "healthy";
}

/** Safe fields only — never include secrets or raw payloads. */
export function buildSafeEventLogFields(input: {
  readonly correlationId: string;
  readonly integrationId?: string;
  readonly providerId?: string;
  readonly outcome?: string;
  readonly deliveryMechanism?: string;
  readonly eventType?: string;
  readonly sourceEventId?: string;
}): Readonly<Record<string, string>> {
  const fields: Record<string, string> = {
    correlationId: input.correlationId,
  };
  if (input.integrationId) fields.integrationId = input.integrationId;
  if (input.providerId) fields.providerId = input.providerId;
  if (input.outcome) fields.outcome = input.outcome;
  if (input.deliveryMechanism) fields.deliveryMechanism = input.deliveryMechanism;
  if (input.eventType) fields.eventType = input.eventType;
  if (input.sourceEventId) fields.sourceEventId = input.sourceEventId;
  return fields;
}
