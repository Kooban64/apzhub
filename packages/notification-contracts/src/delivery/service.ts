/**
 * Notification Delivery Platform Service surface (ENG-004 Phase A).
 */

import type { NotificationPlatformServiceContext } from "../services/platform-gateway";
import type {
  CreateNotificationIntentCommand,
  NotificationDeliveryRecord,
  NotificationDeliveryTry,
  NotificationInAppItem,
  NotificationIntent,
  NotificationProviderDescriptor,
} from "./domain";

export type NotificationDeliveryHealth = {
  readonly status: "healthy" | "degraded" | "unhealthy" | "disabled" | "unknown";
  readonly enabled: boolean;
  readonly inAppEnabled: boolean;
  readonly eventIntakeEnabled: boolean;
  readonly commandIntakeEnabled: boolean;
  readonly workerEnabled: boolean;
  readonly workerRunning: boolean;
  /** False when SMTP is configured and email delivery is active. */
  readonly smtpDeferred: boolean;
  readonly message?: string;
  readonly checkedAt: string;
};

export type NotificationDeliveryReadiness = {
  readonly ready: boolean;
  readonly enabled: boolean;
  readonly reason?: string;
  readonly checks: Readonly<Record<string, boolean | string>>;
};

export type NotificationDeliveryDiagnostics = {
  readonly intentsCreated: number;
  readonly intentsValidated: number;
  readonly intentsSuppressed: number;
  readonly deliveriesQueued: number;
  readonly deliveriesProcessing: number;
  readonly deliveriesDelivered: number;
  readonly deliveriesRetrying: number;
  readonly permanentFailures: number;
  readonly cancelled: number;
  readonly expired: number;
  readonly inAppUnreadAggregate: number;
  readonly idempotencyDeduplications: number;
  readonly recipientResolutionFailures: number;
  readonly preferenceSuppressions: number;
  readonly policyFailures: number;
  readonly templateFailures: number;
  readonly eventIntakeFailures: number;
  readonly commandIntakeFailures: number;
  readonly retryCount: number;
  readonly terminalFailureCount: number;
  readonly oldestQueuedAgeMs: number | null;
  readonly workerState: "running" | "stopped" | "disabled";
  readonly adapterState: "healthy" | "degraded" | "unhealthy" | "disabled";
  readonly configurationState: "valid" | "invalid" | "disabled";
  readonly lastSuccessfulProcessingAt?: string;
  readonly lastFailureCategory?: string;
  readonly smtpDeliveryStatus:
    "deferred" | "active" | "unconfigured" | "misconfigured" | "unhealthy";
};

export type NotificationDeliveryMetricsSnapshot = {
  readonly intents_total: number;
  readonly intents_suppressed_total: number;
  readonly deliveries_queued_total: number;
  readonly delivery_attempts_total: number;
  readonly deliveries_delivered_total: number;
  readonly deliveries_failed_total: number;
  readonly retries_scheduled_total: number;
  readonly permanent_failures_total: number;
  readonly idempotency_deduplications_total: number;
  readonly recipient_resolution_failures_total: number;
  readonly policy_failures_total: number;
  readonly preference_suppressions_total: number;
  readonly event_intake_failures_total: number;
  readonly processing_latency_ms_last: number | null;
  readonly queue_depth: number;
  readonly oldest_queue_age_ms: number | null;
  readonly worker_health: 0 | 1;
};

export type NotificationDeliveryService = {
  createIntent(
    ctx: NotificationPlatformServiceContext,
    input: CreateNotificationIntentCommand,
  ): Promise<NotificationIntent>;
  getIntent(
    ctx: NotificationPlatformServiceContext,
    intentId: string,
  ): Promise<NotificationIntent>;
  listIntents(
    ctx: NotificationPlatformServiceContext,
  ): Promise<readonly NotificationIntent[]>;
  cancelIntent(
    ctx: NotificationPlatformServiceContext,
    intentId: string,
  ): Promise<NotificationIntent>;
  listDeliveries(
    ctx: NotificationPlatformServiceContext,
  ): Promise<readonly NotificationDeliveryRecord[]>;
  getDelivery(
    ctx: NotificationPlatformServiceContext,
    deliveryId: string,
  ): Promise<NotificationDeliveryRecord>;
  listDeliveryAttempts(
    ctx: NotificationPlatformServiceContext,
    deliveryId: string,
  ): Promise<readonly NotificationDeliveryTry[]>;
  retryDelivery(
    ctx: NotificationPlatformServiceContext,
    deliveryId: string,
  ): Promise<NotificationDeliveryRecord>;
  replayTerminalFailure(
    ctx: NotificationPlatformServiceContext,
    deliveryId: string,
  ): Promise<NotificationDeliveryRecord>;
  getInAppNotifications(
    ctx: NotificationPlatformServiceContext,
    options?: { readonly unreadOnly?: boolean },
  ): Promise<readonly NotificationInAppItem[]>;
  markInAppRead(
    ctx: NotificationPlatformServiceContext,
    notificationId: string,
  ): Promise<NotificationInAppItem>;
  markInAppUnread(
    ctx: NotificationPlatformServiceContext,
    notificationId: string,
  ): Promise<NotificationInAppItem>;
  markAllInAppRead(
    ctx: NotificationPlatformServiceContext,
  ): Promise<{ readonly updated: number }>;
  getProviders(
    ctx: NotificationPlatformServiceContext,
  ): Promise<readonly NotificationProviderDescriptor[]>;
  getHealth(
    ctx: NotificationPlatformServiceContext,
  ): Promise<NotificationDeliveryHealth>;
  getReadiness(
    ctx: NotificationPlatformServiceContext,
  ): Promise<NotificationDeliveryReadiness>;
  getDiagnostics(
    ctx: NotificationPlatformServiceContext,
  ): Promise<NotificationDeliveryDiagnostics>;
  getMetricsSnapshot(
    ctx: NotificationPlatformServiceContext,
  ): Promise<NotificationDeliveryMetricsSnapshot>;
  /** Process due deliveries once (worker tick / test). */
  processQueue(limit?: number): Promise<{ readonly processed: number }>;
  startWorker(): void;
  stopWorker(): void;
};
