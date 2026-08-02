export type NotificationMetricsSnapshot = {
  readonly notificationsCreated: number;
  readonly notificationsSent: number;
  readonly notificationsFailed: number;
  readonly notificationsSuppressed: number;
  readonly retryCount: number;
  readonly deadLetterCount: number;
  readonly subscriptionMatches: number;
  readonly templateRenders: number;
  readonly channelUsage: Readonly<Record<string, number>>;
  readonly deliverySuccessRate: number;
  readonly averageDeliveryLatencyMs: number;
};

export type NotificationMetrics = {
  increment(metric: string, by?: number): void;
  recordChannel(channelId: string): void;
  recordLatency(ms: number): void;
  snapshot(): NotificationMetricsSnapshot;
};

export function createNotificationMetrics(): NotificationMetrics {
  const counters = new Map<string, number>();
  const channelUsage = new Map<string, number>();
  const latencies: number[] = [];

  const get = (k: string): number => counters.get(k) ?? 0;

  return {
    increment(metric, by = 1) {
      counters.set(metric, get(metric) + by);
    },
    recordChannel(channelId) {
      channelUsage.set(channelId, (channelUsage.get(channelId) ?? 0) + 1);
    },
    recordLatency(ms) {
      latencies.push(ms);
    },
    snapshot() {
      const sent = get("notifications_sent");
      const failed = get("notifications_failed");
      const denom = sent + failed;
      const avg =
        latencies.length === 0
          ? 0
          : latencies.reduce((a, b) => a + b, 0) / latencies.length;
      return {
        notificationsCreated: get("notifications_created"),
        notificationsSent: sent,
        notificationsFailed: failed,
        notificationsSuppressed: get("notifications_suppressed"),
        retryCount: get("retry_count"),
        deadLetterCount: get("dead_letter_count"),
        subscriptionMatches: get("subscription_matches"),
        templateRenders: get("template_renders"),
        channelUsage: Object.fromEntries(channelUsage),
        deliverySuccessRate: denom === 0 ? 1 : sent / denom,
        averageDeliveryLatencyMs: avg,
      };
    },
  };
}
