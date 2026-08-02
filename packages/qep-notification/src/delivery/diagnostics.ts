import type { ChannelRegistry } from "../channel/registry";
import type { DeliveryStore } from "./status";
import type { NotificationMetrics } from "./metrics";
import type { SubscriptionRegistry } from "../subscription/registry";
import type { TemplateRegistry } from "../template/registry";

export type NotificationDiagnostics = {
  readonly health: "healthy" | "degraded" | "unhealthy";
  readonly subscriptionCount: number;
  readonly enabledSubscriptionCount: number;
  readonly templateCount: number;
  readonly implementedChannelCount: number;
  readonly pendingDeliveries: number;
  readonly failedDeliveries: number;
  readonly metrics: ReturnType<NotificationMetrics["snapshot"]>;
};

export function collectNotificationDiagnostics(input: {
  readonly subscriptions: SubscriptionRegistry;
  readonly templates: TemplateRegistry;
  readonly channels: ChannelRegistry;
  readonly deliveries: DeliveryStore;
  readonly metrics: NotificationMetrics;
}): NotificationDiagnostics {
  const all = input.deliveries.list();
  const pending = all.filter((d) =>
    ["pending", "routed", "delivering", "retrying"].includes(d.status),
  ).length;
  const failed = all.filter((d) => ["failed", "dead_letter"].includes(d.status)).length;
  const metrics = input.metrics.snapshot();
  let health: NotificationDiagnostics["health"] = "healthy";
  if (failed > 0 && metrics.deliverySuccessRate < 0.5) health = "unhealthy";
  else if (failed > 0 || pending > 10) health = "degraded";

  return {
    health,
    subscriptionCount: input.subscriptions.list().length,
    enabledSubscriptionCount: input.subscriptions.listEnabled().length,
    templateCount: input.templates.list().length,
    implementedChannelCount: input.channels.listImplemented().length,
    pendingDeliveries: pending,
    failedDeliveries: failed,
    metrics,
  };
}
